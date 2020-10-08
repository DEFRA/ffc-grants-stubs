const init = async () => {
  console.log('# Starting messageService')
  await require('./services/message-service')

  const server = require('./server')
  await server.start()
  console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()
