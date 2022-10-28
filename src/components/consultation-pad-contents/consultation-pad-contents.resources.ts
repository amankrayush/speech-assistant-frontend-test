import {postApiCall, getApiCall} from '../../utils/api-utils'
import {
  saveNotesUrl,
  customVisitUrl,
  consultationEncounterTypeUrl,
  encounterUrl,
  unknownEncounterRoleUrl,
  consultationNotesConceptUrl,
} from '../../utils/constants'

interface ObsType {
  person: string
  concept: string
  obsDatetime: string
  value: string
  location: string
  encounter: string
}

interface EncounterProvidersType {
  provider: string
  encounterRole: string
}

interface EncounterObsType {
  concept: string
  value: string
}

interface EncounterType {
  encounterDatetime: string
  patient: string
  encounterType: string
  location: string
  encounterProviders: EncounterProvidersType[]
  obs: EncounterObsType[]
  visit: string
}

const requestbody = (
  person,
  concept,
  obsDatetime,
  value,
  location,
  encounter,
): ObsType => {
  return {
    person: person,
    concept: concept,
    obsDatetime: obsDatetime,
    value: value,
    location: location,
    encounter: encounter,
  }
}

const encounterRequestBody = (
  encounterDatetime,
  visitUuid,
  encounterTypeUuid,
  encounterRoleUuid,
  conceptuuid,
  value,
  patientDetails,
): EncounterType => {
  return {
    encounterDatetime: encounterDatetime,
    patient: patientDetails.patientUuid,
    encounterType: encounterTypeUuid,
    location: patientDetails.locationUuid,
    encounterProviders: [
      {
        provider: patientDetails.providerUuid,
        encounterRole: encounterRoleUuid,
      },
    ],
    obs: [
      {
        concept: conceptuuid,
        value: value,
      },
    ],
    visit: visitUuid,
  }
}

const MILLISECOND_TO_MINUTE_CONVERSION_FACTOR = 60000
const SIXTY_MINUTES = 60

const isConsultationEncounterActive = consultationEncounter => {
  const consultationEncounterDateTime = new Date(
    consultationEncounter.encounterDatetime,
  )
  const currentDatetime = new Date()

  const timeDifferenceInMinutes =
    (currentDatetime.getTime() - consultationEncounterDateTime.getTime()) /
    MILLISECOND_TO_MINUTE_CONVERSION_FACTOR

  return timeDifferenceInMinutes < SIXTY_MINUTES
}

export const saveObsData = async (
  encounterDatetime,
  consultationNotesConceptUuid,
  consultationText,
  patientUuid,
  location,
  encounterUuid,
) => {
  const body = requestbody(
    patientUuid,
    consultationNotesConceptUuid,
    encounterDatetime,
    consultationText,
    location,
    encounterUuid,
  )

  await postApiCall(saveNotesUrl, body).then(response => response.json())
}

const getEncounterTypeUuid = async () => {
  const response = await getApiCall(consultationEncounterTypeUrl)
  return response?.results[0]?.uuid
}
const getEncounterRoleUuid = async () => {
  const response = await getApiCall(unknownEncounterRoleUrl)
  return response?.results[0]?.uuid
}

const getconsultationNotesConceptUuid = async () => {
  const response = await getApiCall(consultationNotesConceptUrl)
  return response?.results[0]?.uuid
}

async function createEncounterWithObs(
  encounterDatetime,
  visitUuid,
  consultationNotesConceptUuid,
  consultationText,
  patientDetails,
) {
  const encounterTypeUuid = await getEncounterTypeUuid()
  const encounterRoleUuid = await getEncounterRoleUuid()
  const requestbody = encounterRequestBody(
    encounterDatetime,
    visitUuid,
    encounterTypeUuid,
    encounterRoleUuid,
    consultationNotesConceptUuid,
    consultationText,
    patientDetails,
  )
  postApiCall(encounterUrl, requestbody).then(response => response.json())
}

export const saveConsultationNotes = async (
  consultationText,
  patientDetails,
) => {
  const visitResponse = await getApiCall(
    customVisitUrl(patientDetails.patientUuid, patientDetails.locationUuid),
  )
  const visitUuid = visitResponse?.results[0]?.uuid
  const encounters = visitResponse?.results[0]?.encounters
  const consultationActiveEncounter = encounters?.find(
    encounter =>
      encounter.encounterType.display == 'Consultation' &&
      isConsultationEncounterActive(encounter),
  )
  const consultationNotesConceptUuid = await getconsultationNotesConceptUuid()

  const encounterDatetime = new Date().toISOString()

  if (consultationActiveEncounter)
    saveObsData(
      encounterDatetime,
      consultationNotesConceptUuid,
      consultationText,
      patientDetails.patientUuid,
      patientDetails.location,
      consultationActiveEncounter.uuid,
    )
  else
    createEncounterWithObs(
      encounterDatetime,
      visitUuid,
      consultationNotesConceptUuid,
      consultationText,
      patientDetails,
    )
}
