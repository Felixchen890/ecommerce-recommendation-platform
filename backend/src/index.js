const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");

const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "E-commerce recommendation backend is running!",
  },
};

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}/graphql`);
  });
}

startServer();