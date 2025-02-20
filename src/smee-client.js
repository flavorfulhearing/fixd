import SmeeClient from 'smee-client'

const smee = new SmeeClient({
  source: 'https://smee.io/0a9oM0wDxcMl1QmA',
  target: 'http://localhost:3000/webhook',
  logger: console
})

const events = smee.start()

// Add more detailed logging
events.on('message', (message) => {
  console.log('Received message:', message)
})

events.on('error', (error) => {
  console.error('Error:', error)
})

events.on('close', () => {
  console.log('Connection closed')
})
