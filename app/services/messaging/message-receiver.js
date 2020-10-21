const { ReceiveMode } = require('@azure/service-bus')
const MessageBase = require('./message-base')

class MessageReceiver extends MessageBase {
  constructor (name, config, credentials, action) {
    super(name, config, credentials)
    this.receiverHandler = this.receiverHandler.bind(this)
    this.action = action
    this.receiver = this.entityClient.createReceiver(ReceiveMode.peekLock)
    this.receiver.registerMessageHandler(this.receiverHandler, this.receiverError)
  }

  receiverError (error) {
    console.log(error)
  }

  async receiverHandler (message) {
    try {
      await this.action(message.body)
    } catch (ex) {
      console.error(`${this.name} error with message`, ex)
    }
  }

  async closeConnection () {
    await this.receiver.close()
    console.log(`${this.name} receiver closed`)
    await super.closeConnection()
  }
}

module.exports = MessageReceiver
