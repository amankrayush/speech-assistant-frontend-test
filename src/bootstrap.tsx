import React from 'react'
import App from './app/App'
import {createRoot} from 'react-dom/client'
import {performDOMOperations as performBahmniDOMOperations} from './bahmni'

const mfContainerAttribute = 'mf-container'
const mfContainerValue = 'sa'
const speechAssistantApp = 'sa-app'

function renderApp() {
  const appContainer = document.getElementById(speechAssistantApp)
  const root = createRoot(appContainer)
  root.render(<App />)
}

function createDOM() {
  const divContainer = document.createElement('div')
  divContainer.setAttribute(mfContainerAttribute, mfContainerValue)
  const appDivContainer = document.createElement('div')
  appDivContainer.setAttribute('id', speechAssistantApp)

  divContainer.appendChild(appDivContainer)
  document.body.appendChild(divContainer)
}

function bootstrap() {
  if (process.env.ENABLE_SA_APP) {
    const isSAPresent = document.querySelector(
      `body div[${mfContainerAttribute}='${mfContainerValue}']`,
    )
    if (!isSAPresent) {
      createDOM()
    }
    renderApp()
    performBahmniDOMOperations()
  }
}

export {bootstrap}
