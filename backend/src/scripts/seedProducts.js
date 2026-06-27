require("dotenv").config();

const connectDB = require("../config/db");
const Product = require("../models/Product");

const products = [
  {
    name: "Nike Air Zoom Pegasus",
    category: "Shoes",
    brand: "Nike",
    price: 129.99,
    tags: ["running", "sports", "men", "comfortable"],
    imageUrl: "https://placehold.co/300x300?text=Nike+Pegasus",
    popularityScore: 92,
  },
  {
    name: "Adidas Ultraboost",
    category: "Shoes",
    brand: "Adidas",
    price: 179.99,
    tags: ["running", "sports", "premium", "comfortable"],
    imageUrl: "https://placehold.co/300x300?text=Adidas+Ultraboost",
    popularityScore: 88,
  },
  {
    name: "Apple AirPods Pro",
    category: "Electronics",
    brand: "Apple",
    price: 249.99,
    tags: ["audio", "wireless", "noise-cancelling", "premium"],
    imageUrl: "https://placehold.co/300x300?text=AirPods+Pro",
    popularityScore: 95,
  },
  {
    name: "Sony WH-1000XM5",
    category: "Electronics",
    brand: "Sony",
    price: 399.99,
    tags: ["audio", "headphones", "noise-cancelling", "travel"],
    imageUrl: "https://placehold.co/300x300?text=Sony+XM5",
    popularityScore: 90,
  },
  {
    name: "MacBook Air M3",
    category: "Electronics",
    brand: "Apple",
    price: 1099.99,
    tags: ["laptop", "student", "portable", "premium"],
    imageUrl: "https://placehold.co/300x300?text=MacBook+Air",
    popularityScore: 97,
  },
  {
    name: "Logitech MX Master 3S",
    category: "Accessories",
    brand: "Logitech",
    price: 99.99,
    tags: ["mouse", "productivity", "office", "wireless"],
    imageUrl: "https://placehold.co/300x300?text=MX+Master+3S",
    popularityScore: 84,
  },
  {
    name: "North Face Backpack",
    category: "Bags",
    brand: "The North Face",
    price: 89.99,
    tags: ["travel", "student", "outdoor", "durable"],
    imageUrl: "https://placehold.co/300x300?text=Backpack",
    popularityScore: 76,
  },
  {
    name: "Uniqlo AIRism T-Shirt",
    category: "Clothing",
    brand: "Uniqlo",
    price: 19.99,
    tags: ["basic", "summer", "comfortable", "men"],
    imageUrl: "https://placehold.co/300x300?text=AIRism+T-Shirt",
    popularityScore: 80,
  },
  {
    name: "Levi's 501 Jeans",
    category: "Clothing",
    brand: "Levi's",
    price: 79.99,
    tags: ["denim", "casual", "classic", "men"],
    imageUrl: "https://placehold.co/300x300?text=Levis+501",
    popularityScore: 78,
  },
  {
    name: "Kindle Paperwhite",
    category: "Electronics",
    brand: "Amazon",
    price: 149.99,
    tags: ["reading", "portable", "student", "travel"],
    imageUrl: "https://placehold.co/300x300?text=Kindle",
    popularityScore: 82,
  },
];

async function seedProducts() {
  try {
    await connectDB();

    await Product.deleteMany({});
    console.log("Existing products deleted");

    await Product.insertMany(products);
    console.log(`${products.length} products inserted`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedProducts();