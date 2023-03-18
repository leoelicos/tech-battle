const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const express = require('express')
const http = require('http')
const cors = require('cors')
const bodyParser = require('body-parser')
const { typeDefs, resolvers } = require('./schemas')
const connection = require('./config/connection.js')
const path = require('path')

const PORT = process.env.PORT || 3001
const app = express()
const httpServer = http.createServer(app)

const server = new ApolloServer({
  typeDefs,
  resolvers
})
const main = async () => {
  try {
    await server.start()

    await connection

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'))
    })

    app.use(
      '/graphql',
      cors(),
      bodyParser.json(),
      express.urlencoded({ extended: false }),
      expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token })
      })
    )
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/build')))
    }

    await new Promise((resolve) => {
      httpServer.listen({ port: PORT }, resolve)
    })
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
  } catch (error) {
    console.log(error)
  }
}

main()
