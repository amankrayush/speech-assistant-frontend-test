import React, {useEffect, useRef, useState} from 'react'
import {getApiCall} from '../utils/api-utils'
import {defaultVisitUrl, sessionUrl} from '../utils/constants'
import {
  getLocationUuid,
  getPatientUuid,
} from '../utils/patient-details/patient-details'

export interface PatientDetails {
  patientUuid: string
  locationUuid: string
  isActiveVisit: boolean
  providerUuid: string
}
async function fetchActiveVisit(patiendId, locationId) {
  const activeVisitResponse = await getApiCall(
    defaultVisitUrl(patiendId, locationId),
  )
  return activeVisitResponse?.results?.length > 0 ? true : false
}

async function getProviderUuid() {
  const response = await getApiCall(sessionUrl)
  return response?.currentProvider?.uuid
}

export const ConsultationContext = React.createContext(null)

function ConsultationContextProvider({children}) {
  const [patientDetails, setPatientDetails] = useState<PatientDetails>()
  const [patientUuid, setPatientUuid] = useState('')
  const [locationUuid, setLocationUuid] = useState('')
  const providerUuidRef = useRef('')

  useEffect(() => {
    if (patientUuid && locationUuid) {
      const activeVisitUuidResponse = fetchActiveVisit(
        patientUuid,
        locationUuid,
      )
      activeVisitUuidResponse.then(response => {
        setPatientDetails({
          patientUuid: patientUuid,
          locationUuid: locationUuid,
          isActiveVisit: response,
          providerUuid: providerUuidRef.current,
        })
      })
    } else {
      setPatientDetails({
        patientUuid: patientUuid,
        locationUuid: locationUuid,
        isActiveVisit: false,
        providerUuid: providerUuidRef.current,
      })
    }
  }, [patientUuid, locationUuid])

  const onUrlChangeCallback = () => {
    setPatientUuid(getPatientUuid)
  }

  useEffect(() => {
    setPatientUuid(getPatientUuid())
    setLocationUuid(getLocationUuid())
    const providerUuidResponse = getProviderUuid()
    providerUuidResponse.then(uuid => {
      providerUuidRef.current = uuid
    })
    window.addEventListener('hashchange', onUrlChangeCallback)
  }, [])

  return (
    <ConsultationContext.Provider value={patientDetails}>
      {children}
    </ConsultationContext.Provider>
  )
}

export default ConsultationContextProvider
