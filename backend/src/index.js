require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");

const Event = require("./models/Event");

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
    recommendations(userId: String!): [Product!]!
  }

  type Event {
    id: ID!
    userId: String!
    productId: ID!
    eventType: String!
    sessionId: String!
    experimentGroup: String!
    createdAt: String
  }
  
  input TrackEventInput {
    userId: String!
    productId: ID!
    eventType: String!
    sessionId: String!
    experimentGroup: String
  }
  
  type Mutation {
    trackEvent(input: TrackEventInput!): Event!
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

    recommendations: async (_, { userId }) => {
        const weights = {
          view_product: 1,
          click_recommendation: 2,
          add_to_cart: 3,
          purchase: 5,
          recommendation_impression: 0,
        };
      
        const events = await Event.find({});
        const productScores = new Map();
      
        for (const event of events) {
          const score = weights[event.eventType] || 0;
      
          if (score <= 0 || !event.productId) {
            continue;
          }
      
          const productId = event.productId.toString();
      
          productScores.set(
            productId,
            (productScores.get(productId) || 0) + score
          );
        }
      
        const rankedProductIds = [...productScores.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([productId]) => productId);
      
        let recommendedProducts = [];
      
        if (rankedProductIds.length > 0) {
          const products = await Product.find({
            _id: { $in: rankedProductIds },
          });
      
          const productMap = new Map(
            products.map((product) => [product._id.toString(), product])
          );
      
          recommendedProducts = rankedProductIds
            .map((id) => productMap.get(id))
            .filter(Boolean);
        }
      
        if (recommendedProducts.length < 4) {
          const existingIds = recommendedProducts.map((product) =>
            product._id.toString()
          );
      
          const fallbackProducts = await Product.find({
            _id: { $nin: existingIds },
          })
            .sort({ popularityScore: -1 })
            .limit(4 - recommendedProducts.length);
      
          recommendedProducts = [...recommendedProducts, ...fallbackProducts];
        }
      
        return recommendedProducts.slice(0, 4);
      },
  },
  Mutation: {
    trackEvent: async (_, { input }) => {
        console.log("trackEvent input:", input);

        const event = await Event.create(input);
    
        console.log("event saved:", event._id.toString());
    
        return event;
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