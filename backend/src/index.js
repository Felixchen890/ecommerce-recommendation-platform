require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");

const connectDB = require("./config/db");
const Product = require("./models/Product");

const typeDefs = `#graphql
  type Product {
    id: ID!
    name: String!
    category: String!
    brand: String!
    price: Float!
    tags: [String!]!
    imageUrl: String
    popularityScore: Float!
  }

  type Query {
    hello: String
    products(category: String): [Product!]!
    product(id: ID!): Product
  }
`;

const resolvers = {
  Query: {
    hello: () => "E-commerce recommendation backend is running!",

    products: async (_, { category }) => {
      const filter = category ? { category } : {};
      return Product.find(filter).sort({ popularityScore: -1 });
    },

    product: async (_, { id }) => {
      return Product.findById(id);
    },
  },
};

async function startServer() {
  await connectDB();

  const app = express();

  app.use(cors());
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}/graphql`);
  });
}

startServer();