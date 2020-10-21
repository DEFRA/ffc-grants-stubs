const { ServiceBusClient } = require('@azure/service-bus')

class MessageBase {
  constructor (name, config, credentials) {
    this.name = name
    this.sbClient = credentials ? ServiceBusClient.createFromAadTokenCredentials(config.host, credentials) : ServiceBusClient.createFromConnectionString(`Endpoint=sb://${config.host}/;SharedAccessKeyName=${config.username};SharedAccessKey=${config.password}`)
    this.entityClient = this.createEntityClient(config)
  }

  createEntityClient (config) {
    switch (config.type) {
      case 'queue':
        return this.sbClient.createQueueClient(config.address)
      case 'topic':
        return this.sbClient.createTopicClient(config.address)
      case 'subscription':
        return this.sbClient.createSubscriptionClient(config.address, config.subscription)
    }
  }

  async closeConnection () {
    await this.entityClient.close()
    await this.sbClient.close()
    console.log(`${this.name} connection closed`)
  }
}

module.exports = MessageBase
