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

  type ExperimentAnalytics {
    group: String!
    impressions: Int!
    clicks: Int!
    ctr: Float!
    views: Int!
    addToCart: Int!
    purchases: Int!
  }
  
  type AnalyticsResult {
    groups: [ExperimentAnalytics!]!
  }

  type Query {
    hello: String
    products(category: String): [Product!]!
    product(id: ID!): Product
    recommendations(userId: String!, experimentGroup: String): [Product!]!
    analytics: AnalyticsResult!
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

        recommendations: async (_, { userId, experimentGroup }) => {
            const weights = {
                view_product: 1,
                click_recommendation: 2,
                add_to_cart: 3,
                purchase: 5,
                recommendation_impression: 0,
            };

            async function getPopularityRecommendations(limit = 4, excludeIds = []) {
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
                    .map(([productId]) => productId)
                    .filter((id) => !excludeIds.includes(id));

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

                if (recommendedProducts.length < limit) {
                    const existingIds = recommendedProducts.map((product) =>
                        product._id.toString()
                    );

                    const fallbackProducts = await Product.find({
                        _id: {
                            $nin: [...existingIds, ...excludeIds],
                        },
                    })
                        .sort({ popularityScore: -1 })
                        .limit(limit - recommendedProducts.length);

                    recommendedProducts = [...recommendedProducts, ...fallbackProducts];
                }

                return recommendedProducts.slice(0, limit);
            }

            async function getPersonalizedRecommendations(limit = 4) {
                const userEvents = await Event.find({
                    userId,
                    eventType: {
                        $in: ["view_product", "click_recommendation", "add_to_cart", "purchase"],
                    },
                })
                    .sort({ createdAt: -1 })
                    .limit(20)
                    .populate("productId");

                const categoryScores = new Map();
                const tagScores = new Map();
                const seenProductIds = [];

                for (const event of userEvents) {
                    const product = event.productId;

                    if (!product) {
                        continue;
                    }

                    const eventWeight = weights[event.eventType] || 1;

                    seenProductIds.push(product._id.toString());

                    categoryScores.set(
                        product.category,
                        (categoryScores.get(product.category) || 0) + eventWeight
                    );

                    for (const tag of product.tags || []) {
                        tagScores.set(tag, (tagScores.get(tag) || 0) + eventWeight);
                    }
                }

                if (categoryScores.size === 0 && tagScores.size === 0) {
                    return getPopularityRecommendations(limit);
                }

                const products = await Product.find({});

                const scoredProducts = products.map((product) => {
                    let score = 0;

                    score += categoryScores.get(product.category) || 0;

                    for (const tag of product.tags || []) {
                        score += tagScores.get(tag) || 0;
                    }

                    score += product.popularityScore * 0.01;

                    return {
                        product,
                        score,
                    };
                });

                let recommendedProducts = scoredProducts
                    .filter((item) => item.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .map((item) => item.product)
                    .slice(0, limit);

                if (recommendedProducts.length < limit) {
                    const existingIds = recommendedProducts.map((product) =>
                        product._id.toString()
                    );

                    const fallbackProducts = await getPopularityRecommendations(
                        limit - recommendedProducts.length,
                        existingIds
                    );

                    recommendedProducts = [...recommendedProducts, ...fallbackProducts];
                }

                return recommendedProducts.slice(0, limit);
            }

            if (experimentGroup === "B") {
                return getPersonalizedRecommendations(4);
            }

            return getPopularityRecommendations(4);
        },


        analytics: async () => {
            const groups = ["A", "B"];

            const results = await Promise.all(
                groups.map(async (group) => {
                    const events = await Event.find({ experimentGroup: group });

                    const impressions = events.filter(
                        (event) => event.eventType === "recommendation_impression"
                    ).length;

                    const clicks = events.filter(
                        (event) => event.eventType === "click_recommendation"
                    ).length;

                    const views = events.filter(
                        (event) => event.eventType === "view_product"
                    ).length;

                    const addToCart = events.filter(
                        (event) => event.eventType === "add_to_cart"
                    ).length;

                    const purchases = events.filter(
                        (event) => event.eventType === "purchase"
                    ).length;

                    const ctr = impressions === 0 ? 0 : clicks / impressions;

                    return {
                        group,
                        impressions,
                        clicks,
                        ctr,
                        views,
                        addToCart,
                        purchases,
                    };
                })
            );

            return {
                groups: results,
            };
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