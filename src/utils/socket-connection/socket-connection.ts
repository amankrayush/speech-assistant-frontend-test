import {
  SocketStatus,
  StreamingClient,
} from '@project-sunbird/open-speech-streaming-client'
import {language} from '../constants'
class SocketConnection {
  streamingURL: string
  streamingclient: any
  onIncomingMessage: (message: string) => void
  onSocketConnectionChange: (toggle: boolean) => void

  constructor(streamingURL, onIncomingMessage, onSocketConnectionChange) {
    this.streamingURL = streamingURL
    this.streamingclient = new StreamingClient()
    this.onIncomingMessage = onIncomingMessage
    this.onSocketConnectionChange = onSocketConnectionChange
  }

  onErrorMessage = () => {
    return 'Error occurred while making streaming connection'
  }

  onConnect = action => {
    const _this = this

    if (action === SocketStatus.CONNECTED) {
      _this.onSocketConnectionChange(true)
      _this.streamingclient.startStreaming(
        _this.onIncomingMessage,
        this.onErrorMessage,
      )
    } else if (action === SocketStatus.TERMINATED) {
      _this.onSocketConnectionChange(false)
      _this.handlePunctuation('How are you')
    }
  }

  handleStart = () => {
    this.streamingclient.connect(this.streamingURL, language, this.onConnect)
  }

  handleStop = () => {
    this.streamingclient.stopStreaming()
  }

  handlePunctuation(input) {
    console.log('Punctuation starts: ' + input)
    const _this = this
    if (input) {
      console.log(this.streamingURL + '/v1/punctuate/en')
      _this.streamingclient.punctuateText(
        input,
        '/v1/punctuate/en',
        (status, sample) => {
          console.log(sample)
          console.log('punctuate', status)
        },
        (status, error) => {
          console.log('Failed to punctuate', status, error)
        },
      )
    } else {
      return
    }
  }
}

export default SocketConnection
