require("dotenv").config();

const connectDB = require("../config/db");
const Product = require("../models/Product");
const Event = require("../models/Event");

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function createEvents({ products, group, eventType, count, userPrefix }) {
  const events = [];

  for (let i = 0; i < count; i++) {
    const product = randomItem(products);

    events.push({
      userId: `${userPrefix}-${i % 30}`,
      productId: product._id,
      eventType,
      sessionId: `${group}-session-${Math.floor(i / 4)}`,
      experimentGroup: group,
    });
  }

  return events;
}

async function seedEvents() {
  try {
    await connectDB();

    const products = await Product.find({});

    if (products.length === 0) {
      console.error("No products found. Run npm run seed first.");
      process.exit(1);
    }

    await Event.deleteMany({});
    console.log("Existing events deleted");

    const groupAEvents = [
      ...createEvents({
        products,
        group: "A",
        eventType: "recommendation_impression",
        count: 200,
        userPrefix: "user-a",
      }),
      ...createEvents({
        products,
        group: "A",
        eventType: "click_recommendation",
        count: 10,
        userPrefix: "user-a",
      }),
      ...createEvents({
        products,
        group: "A",
        eventType: "view_product",
        count: 80,
        userPrefix: "user-a",
      }),
      ...createEvents({
        products,
        group: "A",
        eventType: "add_to_cart",
        count: 8,
        userPrefix: "user-a",
      }),
      ...createEvents({
        products,
        group: "A",
        eventType: "purchase",
        count: 2,
        userPrefix: "user-a",
      }),
    ];

    const groupBEvents = [
      ...createEvents({
        products,
        group: "B",
        eventType: "recommendation_impression",
        count: 200,
        userPrefix: "user-b",
      }),
      ...createEvents({
        products,
        group: "B",
        eventType: "click_recommendation",
        count: 16,
        userPrefix: "user-b",
      }),
      ...createEvents({
        products,
        group: "B",
        eventType: "view_product",
        count: 90,
        userPrefix: "user-b",
      }),
      ...createEvents({
        products,
        group: "B",
        eventType: "add_to_cart",
        count: 12,
        userPrefix: "user-b",
      }),
      ...createEvents({
        products,
        group: "B",
        eventType: "purchase",
        count: 4,
        userPrefix: "user-b",
      }),
    ];

    const allEvents = [...groupAEvents, ...groupBEvents];

    await Event.insertMany(allEvents);

    console.log(`${allEvents.length} events inserted`);
    console.log("Group A expected CTR: 10 / 200 = 5%");
    console.log("Group B expected CTR: 16 / 200 = 8%");

    process.exit(0);
  } catch (error) {
    console.error("Seeding events failed:", error);
    process.exit(1);
  }
}

seedEvents();