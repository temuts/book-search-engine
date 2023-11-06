const express = require('express');
const { ApolloServer } = require('@apollo/server');
const path = require('path');
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth');
const { typeDefs, resolvers } = require('./schemas'); 

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => authMiddleware({ req }),
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' }); 

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`🚀 GraphQL server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
}

startServer();
