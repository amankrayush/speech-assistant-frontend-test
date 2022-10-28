import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {
  ConsultationContext,
  PatientDetails,
} from '../../context/consultation-context'
import SocketConnection from '../../utils/socket-connection/socket-connection'
import {mockConceptResponse} from '../../__mocks__/conceptResponse.mock'
import {mockObsResponse} from '../../__mocks__/obsResponse.mock'
import {
  consultationEncounterTypeUrl,
  consultationNotesConceptUrl,
  customVisitUrl,
  encounterUrl,
  saveNotesUrl,
  unknownEncounterRoleUrl,
} from '../../utils/constants'
import {mockVisitResponseWithActiveEncounter} from '../../__mocks__/activeVisitWithActiveEncounters.mock'
import {mockVisitResponseWithInactiveEncounter} from '../../__mocks__/activeVisitWithInactiveEncounters.mock'
import {ConsultationPadContents} from './consultation-pad-contents'
import {mockVisitResponseWithNoEncounter} from '../../__mocks__/activeVisitWithNoEncounter.mock'
import {mockConsultationEncounterTypeResponse} from '../../__mocks__/encounterTypeResponse.mock'
import {mockConsultationEncounterRoleResopnse} from '../../__mocks__/encounterRoleResponse.mock'

jest.mock('../../utils/socket-connection/socket-connection')

describe('Consultation Pad Contents', () => {
  afterEach(() => jest.clearAllMocks())
  const handleClose = jest.fn()
  const setConsultationText = jest.fn()
  const setSavedNotes = jest.fn()

  it('should show the textbox, start mic and save button when consultation pad contents component is rendered', () => {
    render(
      <ConsultationPadContents
        closeConsultationPad={handleClose}
        consultationText={''}
        setConsultationText={setConsultationText}
        setSavedNotes={setSavedNotes}
      />,
    )

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByLabelText('Start Mic')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /Save/i,
      }),
    ).toBeDisabled()
  })

  it('should show the stop mic and focus on text area when start mic is clicked', async () => {
    const mockSocketConnection = {
      handleStart: jest.fn(),
      handleStop: jest.fn(),
    }
    ;(SocketConnection as jest.Mock).mockImplementation(
      () => mockSocketConnection,
    )
    render(
      <ConsultationPadContents
        closeConsultationPad={handleClose}
        consultationText={''}
        setConsultationText={setConsultationText}
        setSavedNotes={setSavedNotes}
      />,
    )

    const mockOnRecording = (SocketConnection as jest.Mock).mock.calls[0][2]

    expect(SocketConnection).toHaveBeenCalled()

    await userEvent.click(screen.getByLabelText('Start Mic'))

    expect(mockSocketConnection.handleStart).toHaveBeenCalled()
    await waitFor(() => {
      mockOnRecording(true)
      expect(screen.getByLabelText('Stop Mic')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveFocus()
    })
  })

  it('should show the start mic and focus on text area when stop mic is clicked', async () => {
    const mockSocketConnection = {
      handleStart: jest.fn(),
      handleStop: jest.fn(),
    }
    ;(SocketConnection as jest.Mock).mockImplementation(
      () => mockSocketConnection,
    )
    render(
      <ConsultationPadContents
        closeConsultationPad={handleClose}
        consultationText={''}
        setConsultationText={setConsultationText}
        setSavedNotes={setSavedNotes}
      />,
    )

    const mockOnRecording = (SocketConnection as jest.Mock).mock.calls[0][2]

    await userEvent.click(screen.getByLabelText('Start Mic'))
    expect(mockSocketConnection.handleStart).toHaveBeenCalled()

    await waitFor(() => {
      mockOnRecording(true)
      expect(screen.getByLabelText('Stop Mic')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByLabelText('Stop Mic'))

    expect(mockSocketConnection.handleStop).toHaveBeenCalled()
    waitFor(() => {
      mockOnRecording(false)
      expect(screen.getByLabelText('Start Mic')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveFocus()
    })
  })

  it('should update the consultation notes with the recorded text when consultation notes is empty', async () => {
    const mockSocketConnection = {
      handleStart: jest.fn(),
      handleStop: jest.fn(),
    }
    ;(SocketConnection as jest.Mock).mockImplementation(
      () => mockSocketConnection,
    )
    render(
      <ConsultationPadContents
        closeConsultationPad={handleClose}
        consultationText={''}
        setConsultationText={setConsultationText}
        setSavedNotes={setSavedNotes}
      />,
    )

    const mockOnIncomingMessage = (SocketConnection as jest.Mock).mock
      .calls[0][1]
    const mockOnRecording = (SocketConnection as jest.Mock).mock.calls[0][2]

    mockSocketConnection.handleStart.mockImplementation(() =>
      mockOnRecording(true),
    )
    mockSocketConnection.handleStop.mockImplementation(() =>
      mockOnRecording(false),
    )

    await userEvent.click(screen.getByLabelText('Start Mic'))
    waitFor(() => {
      expect(screen.getByLabelText('Stop Mic')).toBeInTheDocument()
    })

    mockOnIncomingMessage('Notes')

    await userEvent.click(screen.getByLabelText('Stop Mic'))
    waitFor(() => {
      expect(screen.getByLabelText('Start Mic')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(setConsultationText).toHaveBeenCalledWith('Notes')
    })
  })

  it('should append the consultation notes with the recorded text when consultation notes is available', async () => {
    const mockSocketConnection = {
      handleStart: jest.fn(),
      handleStop: jest.fn(),
    }
    ;(SocketConnection as jest.Mock).mockImplementation(
      () => mockSocketConnection,
    )

    render(
      <ConsultationPadContents
        closeConsultationPad={handleClose}
        consultationText={'Consultation'}
        setConsultationText={setConsultationText}
        setSavedNotes={setSavedNotes}
      />,
    )

    const mockOnIncomingMessage = (SocketConnection as jest.Mock).mock
      .calls[0][1]
    const mockOnRecording = (SocketConnection as jest.Mock).mock.calls[0][2]

    mockSocketConnection.handleStart.mockImplementation(() =>
      mockOnRecording(true),
    )
    mockSocketConnection.handleStop.mockImplementation(() =>
      mockOnRecording(false),
    )

    await userEvent.click(screen.getByLabelText('Start Mic'))
    waitFor(() => {
      expect(screen.getByLabelText('Stop Mic')).toBeInTheDocument()
    })

    mockOnIncomingMessage('Notes')

    await userEvent.click(screen.getByLabelText('Stop Mic'))
    waitFor(() => {
      expect(screen.getByLabelText('Start Mic')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(setConsultationText).toHaveBeenCalledWith('Consultation Notes')
    })
  })

  it('should enable save button when text is present in text area', () => {
    const mockSocketConnection = {
      handleStart: jest.fn(),
      handleStop: jest.fn(),
    }
    ;(SocketConnection as jest.Mock).mockImplementation(
      () => mockSocketConnection,
    )
    render(
      <ConsultationPadContents
        closeConsultationPad={handleClose}
        consultationText={'Consultation'}
        setConsultationText={setConsultationText}
        setSavedNotes={setSavedNotes}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: /Save/i,
      }),
    ).toBeEnabled()
  })

  it('should save consultation notes when clicked on save button and active consultation encounter is present', async () => {
    global.fetch = jest.fn().mockImplementation()

    const mockFetch = global.fetch as jest.Mock
    mockFetch
      .mockResolvedValueOnce({
        json: () => mockVisitResponseWithActiveEncounter,
        ok: true,
      })
      .mockResolvedValueOnce({
        json: () => mockConceptResponse,
        ok: true,
      })
      .mockResolvedValue({
        json: () => mockObsResponse,
        ok: true,
      })

    const patientDetails: PatientDetails = {
      patientUuid: 'dc9444c6-ad55-4200-b6e9-407e025eb948',
      locationUuid: 'baf7bd38-d225-11e4-9c67-080027b662ec',
      isActiveVisit: true,
      providerUuid: '',
    }
    const consultationText = 'Consultation Notes'

    render(
      <ConsultationContext.Provider value={patientDetails}>
        <ConsultationPadContents
          closeConsultationPad={handleClose}
          consultationText={consultationText}
          setConsultationText={setConsultationText}
          setSavedNotes={setSavedNotes}
        />
      </ConsultationContext.Provider>,
    )

    expect(
      screen.getByRole('button', {
        name: /Save/i,
      }),
    ).toBeEnabled()

    await userEvent.click(
      screen.getByRole('button', {
        name: /Save/i,
      }),
    )
    const visiturl = mockFetch.mock.calls[0][0]
    const conceptUrl = mockFetch.mock.calls[1][0]
    const obsUrl = mockFetch.mock.calls[2][0]
    const obsJsonBody = JSON.parse(mockFetch.mock.calls[2][1].body)

    expect(fetch).toBeCalledTimes(3)
    expect(visiturl).toBe(
      customVisitUrl(patientDetails.patientUuid, patientDetails.locationUuid),
    )
    expect(conceptUrl).toBe(consultationNotesConceptUrl)
    expect(obsUrl).toBe(saveNotesUrl)
    expect(obsJsonBody.value).toBe('Consultation Notes')
    expect(setSavedNotes).toHaveBeenCalledWith(consultationText)
  })

  it('should update the consultation notes when user is typing manually on consultation pad', () => {
    const mockSocketConnection = {
      handleStart: jest.fn(),
      handleStop: jest.fn(),
    }
    ;(SocketConnection as jest.Mock).mockImplementation(
      () => mockSocketConnection,
    )
    let consultationText = ''
    const setConsultationText = jest.fn()
    setConsultationText.mockImplementation(value => (consultationText = value))

    render(
      <ConsultationPadContents
        closeConsultationPad={handleClose}
        consultationText={consultationText}
        setConsultationText={setConsultationText}
        setSavedNotes={setSavedNotes}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: /Save Notes/i,
      }),
    ).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox'), {
      target: {value: 'Consultation'},
    })

    expect(consultationText).toBe('Consultation')
  })

  it('should create encounter with observation on click of save button when consultation encounter is not present', async () => {
    const mockSocketConnection = {
      handleStart: jest.fn(),
      handleStop: jest.fn(),
    }
    ;(SocketConnection as jest.Mock).mockImplementation(
      () => mockSocketConnection,
    )
    global.fetch = jest.fn().mockImplementation()
    const mockFetch = global.fetch as jest.Mock
    mockFetch
      .mockResolvedValueOnce({
        json: () => mockVisitResponseWithNoEncounter,
        ok: true,
      })
      .mockResolvedValueOnce({
        json: () => mockConceptResponse,
        ok: true,
      })
      .mockResolvedValueOnce({
        json: () => mockConsultationEncounterTypeResponse,
        ok: true,
      })
      .mockResolvedValueOnce({
        json: () => mockConsultationEncounterRoleResopnse,
        ok: true,
      })
      .mockResolvedValue({
        json: () => {
          // do nothing
        },
        ok: true,
      })

    const patientDetails: PatientDetails = {
      patientUuid: 'dc9444c6-ad55-4200-b6e9-407e025eb948',
      locationUuid: 'baf7bd38-d225-11e4-9c67-080027b662ec',
      isActiveVisit: true,
      providerUuid: 'c1c26908-3f10-11e4-adec-0800271c1b75',
    }

    render(
      <ConsultationContext.Provider value={patientDetails}>
        <ConsultationPadContents
          closeConsultationPad={handleClose}
          consultationText={'Consultation Notes'}
          setConsultationText={setConsultationText}
          setSavedNotes={setSavedNotes}
        />
      </ConsultationContext.Provider>,
    )

    expect(
      screen.getByRole('button', {
        name: /Save/i,
      }),
    ).toBeEnabled()

    await userEvent.click(
      screen.getByRole('button', {
        name: /Save/i,
      }),
    )
    expect(fetch).toBeCalledTimes(5)
    const mockVisitUrl = mockFetch.mock.calls[0][0]
    const mockConceptUrl = mockFetch.mock.calls[1][0]
    const mockEncounterTypeUrl = mockFetch.mock.calls[2][0]
    const mockEncounterRoleurl = mockFetch.mock.calls[3][0]
    const mockEncounterUrl = mockFetch.mock.calls[4][0]
    const mockEncounterRequestBody = JSON.parse(mockFetch.mock.calls[4][1].body)
    expect(mockVisitUrl).toBe(
      customVisitUrl(patientDetails.patientUuid, patientDetails.locationUuid),
    )
    expect(mockEncounterTypeUrl).toBe(consultationEncounterTypeUrl)
    expect(mockEncounterRoleurl).toBe(unknownEncounterRoleUrl)
    expect(mockConceptUrl).toBe(consultationNotesConceptUrl)
    expect(mockEncounterUrl).toBe(encounterUrl)
    expect(mockEncounterRequestBody.obs[0].value).toBe('Consultation Notes')
  })

  it('should create encounter with observation when clicked on save button and no active consultation encounter is present', async () => {
    const mockSocketConnection = {
      handleStart: jest.fn(),
      handleStop: jest.fn(),
    }
    ;(SocketConnection as jest.Mock).mockImplementation(
      () => mockSocketConnection,
    )
    global.fetch = jest.fn().mockImplementation()
    const mockFetch = global.fetch as jest.Mock
    mockFetch
      .mockResolvedValueOnce({
        json: () => mockVisitResponseWithInactiveEncounter,
        ok: true,
      })
      .mockResolvedValueOnce({
        json: () => mockConceptResponse,
        ok: true,
      })
      .mockResolvedValueOnce({
        json: () => mockConsultationEncounterTypeResponse,
        ok: true,
      })
      .mockResolvedValueOnce({
        json: () => mockConsultationEncounterRoleResopnse,
        ok: true,
      })
      .mockResolvedValue({
        json: () => {
          // do nothing
        },
        ok: true,
      })

    const patientDetails: PatientDetails = {
      patientUuid: 'dc9444c6-ad55-4200-b6e9-407e025eb948',
      locationUuid: 'baf7bd38-d225-11e4-9c67-080027b662ec',
      isActiveVisit: true,
      providerUuid: 'c1c26908-3f10-11e4-adec-0800271c1b75',
    }

    render(
      <ConsultationContext.Provider value={patientDetails}>
        <ConsultationPadContents
          closeConsultationPad={handleClose}
          consultationText={'Consultation Notes'}
          setConsultationText={setConsultationText}
          setSavedNotes={setSavedNotes}
        />
      </ConsultationContext.Provider>,
    )

    expect(
      screen.getByRole('button', {
        name: /Save/i,
      }),
    ).toBeEnabled()

    await userEvent.click(
      screen.getByRole('button', {
        name: /Save/i,
      }),
    )
    expect(fetch).toBeCalledTimes(5)
    const mockVisitUrl = mockFetch.mock.calls[0][0]
    const mockConceptUrl = mockFetch.mock.calls[1][0]
    const mockEncounterTypeUrl = mockFetch.mock.calls[2][0]
    const mockEncounterRoleurl = mockFetch.mock.calls[3][0]
    const mockEncounterUrl = mockFetch.mock.calls[4][0]
    const mockEncounterRequestBody = JSON.parse(mockFetch.mock.calls[4][1].body)
    expect(mockVisitUrl).toBe(
      customVisitUrl(patientDetails.patientUuid, patientDetails.locationUuid),
    )
    expect(mockEncounterTypeUrl).toBe(consultationEncounterTypeUrl)
    expect(mockEncounterRoleurl).toBe(unknownEncounterRoleUrl)
    expect(mockConceptUrl).toBe(consultationNotesConceptUrl)
    expect(mockEncounterUrl).toBe(encounterUrl)
    expect(mockEncounterRequestBody.obs[0].value).toBe('Consultation Notes')
  })
})
