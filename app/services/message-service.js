const auth = require('@azure/ms-rest-nodeauth')
const MessageReceiver = require('./messaging/message-receiver')
const config = require('../config').messaging
const XLSX = require('xlsx')

process.on('SIGTERM', async () => {
  await messageService.closeConnections()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await messageService.closeConnections()
  process.exit(0)
})

function createSpreadsheet (message) {
  const wb = XLSX.utils.book_new()

  wb.Props = {
    Title: 'This is a test',
    Author: 'FFC EOI'
  }

  wb.SheetNames.push('First Sheet')
  const ws = XLSX.utils.json_to_sheet([message])
  wb.Sheets['First Sheet'] = ws

  XLSX.writeFile(wb, 'test123.xlsx')

  console.log(`Created spreadsheet from application ${message.confirmationId}`)
}

class MessageService {
  constructor (credentials) {
    this.closeConnections = this.closeConnections.bind(this)

    const receiveApplicationAction = async message => {
      console.log('\n#####\nEOI submitted message received:')
      const messageObj = JSON.parse(message)
      createSpreadsheet(messageObj)
    }

    const receiveContactAction = async message => {
      const messageObj = JSON.parse(message)

      console.log('\n#####\nSend email message received:')
      console.log(`Email address: ${messageObj.emailAddress}`)
      console.log(`Magic link: ${messageObj.magicLink}\n`)
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
