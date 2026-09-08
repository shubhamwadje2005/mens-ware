const mongoose = require("mongoose");
const Product = require("./modal/Product");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/menswear";

const products = [
  {
    name: "Midnight Oversized Tee",
    price: 89,
    originalPrice: 120,
    category: "Oversized T-Shirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=750&fit=crop",
    badge: "NEW",
    colors: ["#000000", "#1a1a2e", "#d4af37"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    slug: "midnight-oversized-tee",
    description: "The Midnight Oversized Tee redefines casual luxury with its premium heavyweight cotton blend.",
    stock: 50,
  },
  {
    name: "Noir Silk Shirt",
    price: 245,
    category: "Premium Shirts",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=750&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop",
    colors: ["#000000", "#ffffff"],
    sizes: ["S", "M", "L", "XL"],
    slug: "noir-silk-shirt",
    description: "Crafted from 100% mulberry silk, the Noir Silk Shirt is the epitome of refined elegance.",
    stock: 30,
  },
  {
    name: "Obsidian Cargo",
    price: 189,
    originalPrice: 240,
    category: "Cargo Pants",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop",
    badge: "SALE",
    colors: ["#000000", "#2d2d2d", "#4a4a4a"],
    sizes: ["28", "30", "32", "34", "36"],
    slug: "obsidian-cargo",
    description: "The Obsidian Cargo blends utility with luxury.",
    stock: 40,
  },
  {
    name: "Shadow Hoodie",
    price: 175,
    category: "Hoodies",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1578768079470-68b3e5735287?w=600&h=750&fit=crop",
    colors: ["#000000", "#111111", "#d4af37"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    slug: "shadow-hoodie",
    description: "The Shadow Hoodie is crafted from 400gsm French terry cotton.",
    stock: 60,
  },
  {
    name: "Eclipse Denim",
    price: 159,
    category: "Jeans",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop",
    colors: ["#0a0a0a", "#1a1a2e"],
    sizes: ["28", "30", "32", "34", "36"],
    slug: "eclipse-denim",
    description: "The Eclipse Denim is constructed from premium selvedge denim.",
    stock: 35,
  },
  {
    name: "Formal Noir Blazer",
    price: 445,
    originalPrice: 550,
    category: "Formal Shirts",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop",
    badge: "PREMIUM",
    colors: ["#000000", "#1a1a2e"],
    sizes: ["S", "M", "L", "XL"],
    slug: "formal-noir-blazer",
    description: "The Formal Noir Blazer is a masterpiece of tailoring.",
    stock: 20,
  },
  {
    name: "Stealth Bomber",
    price: 389,
    category: "Jackets",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=750&fit=crop",
    colors: ["#000000", "#2d2d2d"],
    sizes: ["S", "M", "L", "XL"],
    slug: "stealth-bomber",
    description: "The Stealth Bomber jacket is a modern take on the classic MA-1 silhouette.",
    stock: 25,
  },
  {
    name: "Carbon Luxe Sneakers",
    price: 320,
    category: "Sneakers",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=750&fit=crop",
    badge: "LIMITED",
    colors: ["#000000", "#ffffff", "#d4af37"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    slug: "carbon-luxe-sneakers",
    description: "The Carbon Luxe Sneakers combine cutting-edge design with handcrafted luxury.",
    stock: 15,
  },
  {
    name: "Onyx Formal Trouser",
    price: 195,
    category: "Formal Pants",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=750&fit=crop",
    colors: ["#000000", "#1a1a1a"],
    sizes: ["28", "30", "32", "34", "36"],
    slug: "onyx-formal-trouser",
    description: "The Onyx Formal Trouser is tailored from premium tropical wool.",
    stock: 45,
  },
  {
    name: "Void Chain Accessory",
    price: 125,
    originalPrice: 160,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=750&fit=crop",
    badge: "NEW",
    colors: ["#d4af37", "#c0c0c0"],
    sizes: [],
    slug: "void-chain-accessory",
    description: "The Void Chain is a bold statement piece.",
    stock: 100,
  },
  {
    name: "Ethereal Mesh Tee",
    price: 99,
    category: "Oversized T-Shirts",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop",
    colors: ["#000000", "#ffffff"],
    sizes: ["S", "M", "L", "XL"],
    slug: "ethereal-mesh-tee",
    description: "The Ethereal Mesh Tee pushes boundaries.",
    stock: 55,
  },
  {
    name: "Phantom Windbreaker",
    price: 299,
    category: "Jackets",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=750&fit=crop",
    colors: ["#000000", "#1a1a2e", "#2d2d2d"],
    sizes: ["S", "M", "L", "XL"],
    slug: "phantom-windbreaker",
    description: "The Phantom Windbreaker is engineered for the modern urban explorer.",
    stock: 30,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected for seeding");

    await Product.deleteMany({});
    console.log("Cleared existing products");

    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
