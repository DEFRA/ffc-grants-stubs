const auth = require('@azure/ms-rest-nodeauth')
const MessageReceiver = require('./messaging/message-receiver')
const config = require('../config').messaging

process.on('SIGTERM', async () => {
  await messageService.closeConnections()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await messageService.closeConnections()
  process.exit(0)
})

class MessageService {
  constructor (credentials) {
    this.closeConnections = this.closeConnections.bind(this)

    const receiveEligibilityAction = async message => {
      const messageObj = JSON.parse(message)

      if (messageObj.messageType === 'email') {
        console.log('\n#####\nSend email message received:')
        console.log(`Email address: ${messageObj.payload.emailAddress}`)
        console.log(`Magic link: ${messageObj.payload.magicLink}\n`)
      } else if (messageObj.messageType === 'eoiSubmitted') {
        console.log('\n#####\nEOI submitted message received:')
        console.log(`Confirmation ID: ${messageObj.payload.confirmationId}\n`)
      } else {
        console.log('\n#####\nUnknown message type received')
        console.log(message)
      }
    }

    this.eligibilityReceiver = new MessageReceiver('eligibility-queue-receiver', config, credentials, receiveEligibilityAction)
  }

  async closeConnections () {
    await this.eligibilityReceiver.closeConnection()
  }
}

let messageService

config.isProd = process.env.NODE_ENV === 'production'

module.exports = (async function createConnections () {
  const credentials = config.isProd ? await auth.loginWithVmMSI({ resource: 'https://servicebus.azure.net' }) : undefined
  messageService = new MessageService(credentials)
  return messageService
}())
