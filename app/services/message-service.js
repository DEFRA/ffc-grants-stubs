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

    const receiveApplicationAction = async message => {
      const messageObj = JSON.parse(message)

      console.log('\n#####\nEOI submitted message received:')
      console.log(`Confirmation ID: ${messageObj.payload.confirmationId}\n`)
    }

    const receiveContactAction = async message => {
      const messageObj = JSON.parse(message)

      console.log('\n#####\nSend email message received:')
      console.log(`Email address: ${messageObj.payload.emailAddress}`)
      console.log(`Magic link: ${messageObj.payload.magicLink}\n`)
    }

    this.applicationReceiver = new MessageReceiver('application-topic-receiver', config.applicationTopic, credentials, receiveApplicationAction)
    this.contactReceiver = new MessageReceiver('contact-topic-receiver', config.contactTopic, credentials, receiveContactAction)
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
