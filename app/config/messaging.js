const connectionDetails = {
  host: process.env.MESSAGE_QUEUE_HOST,
  password: process.env.MESSAGE_QUEUE_PASSWORD,
  username: process.env.MESSAGE_QUEUE_USER
}

module.exports = {
  applicationTopic: {
    address: process.env.APPLICATION_TOPIC_ADDRESS,
    subscription: process.env.APPLICATION_TOPIC_SUBSCRIPTION,
    type: 'subscription',
    ...connectionDetails
  },
  contactTopic: {
    address: process.env.CONTACT_TOPIC_ADDRESS,
    subscription: process.env.CONTACT_TOPIC_SUBSCRIPTION,
    type: 'subscription',
    ...connectionDetails
  }
}
