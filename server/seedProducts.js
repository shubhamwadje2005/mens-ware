const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./modal/Product");

const productsData = [
  {
    name: "Italian Super 150s Tailored Wool Blazer",
    slug: "italian-super-150s-tailored-wool-blazer",
    brand: "NOIR STUDIO",
    category: "Suits & Blazers",
    subcategory: "Blazers",
    productType: "Blazer",
    sku: "NS-BLZ-150S",
    gender: "Men",
    status: "Active",
    badge: "PREMIUM",
    price: 12499,
    originalPrice: 18999,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    images: [
      {
        url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
        type: "url",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
        type: "url",
        isPrimary: false,
        sortOrder: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=1200&q=80",
        type: "url",
        isPrimary: false,
        sortOrder: 2,
      },
      {
        url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=80",
        type: "url",
        isPrimary: false,
        sortOrder: 3,
      }
    ],
    colorOptions: [
      {
        name: "Midnight Black",
        hex: "#111111",
        skuCode: "BLK",
        images: [
          { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 },
          { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 1 }
        ]
      },
      {
        name: "Charcoal Navy",
        hex: "#1B263B",
        skuCode: "NVY",
        images: [
          { url: "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 },
          { url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 1 }
        ]
      }
    ],
    colors: ["Midnight Black", "Charcoal Navy"],
    sizes: ["38", "40", "42", "44"],
    shortDescription: "Hand-tailored from pure Italian Super 150s wool with full canvas construction for drape and breathability.",
    description: "Experience sartorial perfection with our Italian Super 150s Wool Blazer. Crafted by master artisans in Biella, Italy, this jacket combines timeless elegance with contemporary tailoring. Features notch lapels, horn buttons, dual vents, and breathable cupro lining.",
    tags: ["Blazer", "Luxury", "Italian Wool", "Formal", "Evening Wear"],
    attributes: {
      fabric: "100% Super 150s Italian Merino Wool",
      fit: "Tailored Slim Fit",
      pattern: "Solid Weave",
      sleeve: "Full Sleeve with Functional 4-Button Cuffs",
      collar: "Classic Notch Lapel",
      occasion: "Formal / Black Tie / Gala",
      washCare: "Dry Clean Only",
      countryOfOrigin: "Italy",
      material: "Virgin Wool & Bemberg Cupro",
      closure: "Single-Breasted 2-Button Closure"
    },
    variants: [
      { color: "Midnight Black", colorCode: "#111111", size: "38", sku: "NS-BLZ-150S-BLK-38", mrp: 18999, sellingPrice: 12499, stock: 8 },
      { color: "Midnight Black", colorCode: "#111111", size: "40", sku: "NS-BLZ-150S-BLK-40", mrp: 18999, sellingPrice: 12499, stock: 12 },
      { color: "Midnight Black", colorCode: "#111111", size: "42", sku: "NS-BLZ-150S-BLK-42", mrp: 18999, sellingPrice: 12499, stock: 10 },
      { color: "Midnight Black", colorCode: "#111111", size: "44", sku: "NS-BLZ-150S-BLK-44", mrp: 18999, sellingPrice: 12499, stock: 6 },
      { color: "Charcoal Navy", colorCode: "#1B263B", size: "38", sku: "NS-BLZ-150S-NVY-38", mrp: 18999, sellingPrice: 12499, stock: 7 },
      { color: "Charcoal Navy", colorCode: "#1B263B", size: "40", sku: "NS-BLZ-150S-NVY-40", mrp: 18999, sellingPrice: 12499, stock: 15 },
      { color: "Charcoal Navy", colorCode: "#1B263B", size: "42", sku: "NS-BLZ-150S-NVY-42", mrp: 18999, sellingPrice: 12499, stock: 9 },
      { color: "Charcoal Navy", colorCode: "#1B263B", size: "44", sku: "NS-BLZ-150S-NVY-44", mrp: 18999, sellingPrice: 12499, stock: 5 },
    ],
    stock: 72,
    isAvailable: true,
    isActive: true,
  },
  {
    name: "Supima Giza Silk-Blend Formal Shirt",
    slug: "supima-giza-silk-blend-formal-shirt",
    brand: "NOIR STUDIO",
    category: "Formal Shirts",
    subcategory: "Dress Shirts",
    productType: "Shirt",
    sku: "NS-SHT-GIZA",
    gender: "Men",
    status: "Active",
    badge: "BESTSELLER",
    price: 3499,
    originalPrice: 4999,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 },
      { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 1 },
      { url: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 2 }
    ],
    colorOptions: [
      {
        name: "Crisp White",
        hex: "#FFFFFF",
        skuCode: "WHT",
        images: [
          { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 },
          { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 1 }
        ]
      },
      {
        name: "Sky Blue",
        hex: "#779ECB",
        skuCode: "BLU",
        images: [
          { url: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 }
        ]
      }
    ],
    colors: ["Crisp White", "Sky Blue"],
    sizes: ["38", "39", "40", "42", "44"],
    shortDescription: "Woven with extra-long staple Egyptian Giza cotton blended with mulberry silk for a luminous sheen and crease resistance.",
    description: "An essential centerpiece for the modern gentleman. Woven from 120/2 two-ply yarn with real mother-of-pearl buttons and removable collar stays.",
    tags: ["Shirt", "Formal", "Giza Cotton", "Silk", "Workwear"],
    attributes: {
      fabric: "85% Egyptian Giza Cotton, 15% Mulberry Silk",
      fit: "Contemporary Regular Fit",
      pattern: "Fine Twill",
      sleeve: "Full Sleeve with Convertible Cuffs",
      collar: "Semi-Spread Cutaway Collar",
      occasion: "Executive / Business / Wedding",
      washCare: "Machine Wash Cold or Dry Clean",
      countryOfOrigin: "India",
      material: "Cotton-Silk Blend",
      closure: "Front Placket with Mother-of-Pearl Buttons"
    },
    variants: [
      { color: "Crisp White", colorCode: "#FFFFFF", size: "38", sku: "NS-SHT-GIZA-WHT-38", mrp: 4999, sellingPrice: 3499, stock: 15 },
      { color: "Crisp White", colorCode: "#FFFFFF", size: "40", sku: "NS-SHT-GIZA-WHT-40", mrp: 4999, sellingPrice: 3499, stock: 20 },
      { color: "Crisp White", colorCode: "#FFFFFF", size: "42", sku: "NS-SHT-GIZA-WHT-42", mrp: 4999, sellingPrice: 3499, stock: 18 },
      { color: "Sky Blue", colorCode: "#779ECB", size: "38", sku: "NS-SHT-GIZA-BLU-38", mrp: 4999, sellingPrice: 3499, stock: 12 },
      { color: "Sky Blue", colorCode: "#779ECB", size: "40", sku: "NS-SHT-GIZA-BLU-40", mrp: 4999, sellingPrice: 3499, stock: 16 },
      { color: "Sky Blue", colorCode: "#779ECB", size: "42", sku: "NS-SHT-GIZA-BLU-42", mrp: 4999, sellingPrice: 3499, stock: 10 }
    ],
    stock: 91,
    isAvailable: true,
    isActive: true,
  },
  {
    name: "Vintage Heavyweight 480GSM French Terry Hoodie",
    slug: "vintage-heavyweight-480gsm-french-terry-hoodie",
    brand: "NOIR STUDIO",
    category: "Hoodies",
    subcategory: "Sweatshirts & Hoodies",
    productType: "Hoodie",
    sku: "NS-HD-480GSM",
    gender: "Men",
    status: "Active",
    badge: "NEW",
    price: 3999,
    originalPrice: 5999,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 },
      { url: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 1 },
      { url: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 2 }
    ],
    colorOptions: [
      {
        name: "Vintage Charcoal",
        hex: "#2B2B2B",
        skuCode: "CHR",
        images: [
          { url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 }
        ]
      },
      {
        name: "Mocha Brown",
        hex: "#5A3825",
        skuCode: "MOC",
        images: [
          { url: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 }
        ]
      }
    ],
    colors: ["Vintage Charcoal", "Mocha Brown"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    shortDescription: "Ultra-heavyweight 480 GSM loopback cotton fleece featuring drop shoulders and double-layered hood.",
    description: "Constructed without drawstrings for a clean architectural silhouette. Preshrunk and garment-dyed for depth of color with ribbed cuffs and hem.",
    tags: ["Hoodie", "Streetwear", "Heavyweight", "Minimalist", "Oversized"],
    attributes: {
      fabric: "480 GSM 100% Organic French Terry Cotton",
      fit: "Oversized Boxy Fit",
      pattern: "Garment Washed Solid",
      sleeve: "Full Sleeve with Heavy Ribbed Cuffs",
      collar: "Double-Layered Structured Hood",
      occasion: "Casual / Street / Loungewear",
      washCare: "Machine Wash Cold Inside Out",
      countryOfOrigin: "Portugal",
      material: "Organic Cotton",
      closure: "Pullover"
    },
    variants: [
      { color: "Vintage Charcoal", colorCode: "#2B2B2B", size: "S", sku: "NS-HD-CHR-S", mrp: 5999, sellingPrice: 3999, stock: 10 },
      { color: "Vintage Charcoal", colorCode: "#2B2B2B", size: "M", sku: "NS-HD-CHR-M", mrp: 5999, sellingPrice: 3999, stock: 18 },
      { color: "Vintage Charcoal", colorCode: "#2B2B2B", size: "L", sku: "NS-HD-CHR-L", mrp: 5999, sellingPrice: 3999, stock: 14 },
      { color: "Vintage Charcoal", colorCode: "#2B2B2B", size: "XL", sku: "NS-HD-CHR-XL", mrp: 5999, sellingPrice: 3999, stock: 8 },
      { color: "Mocha Brown", colorCode: "#5A3825", size: "M", sku: "NS-HD-MOC-M", mrp: 5999, sellingPrice: 3999, stock: 12 },
      { color: "Mocha Brown", colorCode: "#5A3825", size: "L", sku: "NS-HD-MOC-L", mrp: 5999, sellingPrice: 3999, stock: 10 }
    ],
    stock: 72,
    isAvailable: true,
    isActive: true,
  },
  {
    name: "Kaihara 14.5oz Raw Selvedge Slim Jeans",
    slug: "kaihara-14-5oz-raw-selvedge-slim-jeans",
    brand: "NOIR STUDIO",
    category: "Jeans",
    subcategory: "Selvedge Denim",
    productType: "Jeans",
    sku: "NS-DNM-KAIHARA",
    gender: "Men",
    status: "Active",
    badge: "LIMITED",
    price: 6999,
    originalPrice: 9999,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 },
      { url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 1 },
      { url: "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 2 }
    ],
    colorOptions: [
      {
        name: "Deep Indigo",
        hex: "#1A2A44",
        skuCode: "IND",
        images: [
          { url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 }
        ]
      },
      {
        name: "Obsidian Black",
        hex: "#141414",
        skuCode: "OBS",
        images: [
          { url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 }
        ]
      }
    ],
    colors: ["Deep Indigo", "Obsidian Black"],
    sizes: ["30", "32", "34", "36", "38"],
    shortDescription: "Loomstate raw selvedge denim woven on vintage Toyoda shuttle looms in Okayama, Japan with custom antique copper hardware.",
    description: "Built to develop personalized fading and honeycombs over time. Features a red-line selvedge ID, chain-stitched hems, and veg-tan leather back patch.",
    tags: ["Denim", "Selvedge", "Japanese Fabric", "Heritage", "Raw Denim"],
    attributes: {
      fabric: "14.5 oz Japanese Kaihara Raw Selvedge Denim",
      fit: "Slim Tapered",
      pattern: "Raw Rigid Denim",
      occasion: "Casual / Weekend / Daily",
      washCare: "Wash Cold Rarely / Hang Dry",
      countryOfOrigin: "Japan",
      material: "100% Long-Staple Cotton",
      closure: "Button Fly with Copper Donut Buttons"
    },
    variants: [
      { color: "Deep Indigo", colorCode: "#1A2A44", size: "30", sku: "NS-DNM-IND-30", mrp: 9999, sellingPrice: 6999, stock: 8 },
      { color: "Deep Indigo", colorCode: "#1A2A44", size: "32", sku: "NS-DNM-IND-32", mrp: 9999, sellingPrice: 6999, stock: 14 },
      { color: "Deep Indigo", colorCode: "#1A2A44", size: "34", sku: "NS-DNM-IND-34", mrp: 9999, sellingPrice: 6999, stock: 12 },
      { color: "Deep Indigo", colorCode: "#1A2A44", size: "36", sku: "NS-DNM-IND-36", mrp: 9999, sellingPrice: 6999, stock: 6 },
      { color: "Obsidian Black", colorCode: "#141414", size: "32", sku: "NS-DNM-OBS-32", mrp: 9999, sellingPrice: 6999, stock: 10 },
      { color: "Obsidian Black", colorCode: "#141414", size: "34", sku: "NS-DNM-OBS-34", mrp: 9999, sellingPrice: 6999, stock: 9 }
    ],
    stock: 59,
    isAvailable: true,
    isActive: true,
  },
  {
    name: "Full-Grain Nappa Leather Biker Jacket",
    slug: "full-grain-nappa-leather-biker-jacket",
    brand: "NOIR STUDIO",
    category: "Jackets",
    subcategory: "Leather Jackets",
    productType: "Jacket",
    sku: "NS-JKT-BKR",
    gender: "Men",
    status: "Active",
    badge: "PREMIUM",
    price: 16999,
    originalPrice: 24999,
    image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 },
      { url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 1 },
      { url: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 2 }
    ],
    colorOptions: [
      {
        name: "Noir Black",
        hex: "#0A0A0A",
        skuCode: "BLK",
        images: [
          { url: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 }
        ]
      },
      {
        name: "Cognac Brown",
        hex: "#6E371C",
        skuCode: "CGN",
        images: [
          { url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 }
        ]
      }
    ],
    colors: ["Noir Black", "Cognac Brown"],
    sizes: ["M", "L", "XL", "XXL"],
    shortDescription: "Supple full-grain calf nappa leather with asymmetrical gunmetal YKK Excella zippers and quilted diamond lining.",
    description: "An iconic silhouette re-engineered with luxury specifications. Hand-finished edges, heavy-gauge zippers, snap-down lapels, and interior ticket pockets.",
    tags: ["Leather", "Biker", "Jackets", "Luxury Outerwear", "Signature"],
    attributes: {
      fabric: "100% Full-Grain Calf Nappa Leather",
      fit: "Tailored Biker Fit",
      pattern: "Smooth Finished Leather",
      sleeve: "Full Sleeve with Gusseted Zippers",
      collar: "Asymmetrical Snap Lapel Collar",
      occasion: "Evening / Night Out / Statement",
      washCare: "Specialist Leather Clean Only",
      countryOfOrigin: "Italy",
      material: "Genuine Nappa Leather",
      closure: "Heavy YKK Excella Asymmetric Zip"
    },
    variants: [
      { color: "Noir Black", colorCode: "#0A0A0A", size: "M", sku: "NS-JKT-BKR-BLK-M", mrp: 24999, sellingPrice: 16999, stock: 5 },
      { color: "Noir Black", colorCode: "#0A0A0A", size: "L", sku: "NS-JKT-BKR-BLK-L", mrp: 24999, sellingPrice: 16999, stock: 7 },
      { color: "Noir Black", colorCode: "#0A0A0A", size: "XL", sku: "NS-JKT-BKR-BLK-XL", mrp: 24999, sellingPrice: 16999, stock: 4 },
      { color: "Cognac Brown", colorCode: "#6E371C", size: "M", sku: "NS-JKT-BKR-CGN-M", mrp: 24999, sellingPrice: 16999, stock: 4 },
      { color: "Cognac Brown", colorCode: "#6E371C", size: "L", sku: "NS-JKT-BKR-CGN-L", mrp: 24999, sellingPrice: 16999, stock: 6 }
    ],
    stock: 26,
    isAvailable: true,
    isActive: true,
  },
  {
    name: "Acid-Wash Heavyweight Oversized Graphic Tee",
    slug: "acid-wash-heavyweight-oversized-graphic-tee",
    brand: "NOIR STUDIO",
    category: "Oversized T-Shirts",
    subcategory: "T-Shirts",
    productType: "T-Shirt",
    sku: "NS-TEE-OVR",
    gender: "Men",
    status: "Active",
    badge: "NEW",
    price: 1999,
    originalPrice: 2999,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 },
      { url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 1 },
      { url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 2 }
    ],
    colorOptions: [
      {
        name: "Washed Mineral Grey",
        hex: "#4F4F4F",
        skuCode: "WGR",
        images: [
          { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 }
        ]
      },
      {
        name: "Forest Pine",
        hex: "#1E3A2F",
        skuCode: "PNE",
        images: [
          { url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 }
        ]
      }
    ],
    colors: ["Washed Mineral Grey", "Forest Pine"],
    sizes: ["S", "M", "L", "XL"],
    shortDescription: "260 GSM single jersey combed cotton featuring high-density archival typographic screen print and dropped shoulders.",
    description: "Designed for a structured yet fluid drape. Pre-washed with silicone enzyme treatment for exceptional softness against the skin without fading.",
    tags: ["Oversized", "T-Shirt", "Streetwear", "Graphic Tee", "Summer"],
    attributes: {
      fabric: "260 GSM 100% Compact Combed Cotton",
      fit: "Drop-Shoulder Boxy Fit",
      pattern: "Mineral Acid Wash",
      sleeve: "Half Sleeve (Elbow-Length)",
      collar: "Thick 1.25-inch Ribbed Crewneck",
      occasion: "Daily Casual / Street Style",
      washCare: "Machine Wash Cold / Do Not Iron Print",
      countryOfOrigin: "India",
      material: "Pure Combed Cotton",
      closure: "Pullover"
    },
    variants: [
      { color: "Washed Mineral Grey", colorCode: "#4F4F4F", size: "S", sku: "NS-TEE-WGR-S", mrp: 2999, sellingPrice: 1999, stock: 25 },
      { color: "Washed Mineral Grey", colorCode: "#4F4F4F", size: "M", sku: "NS-TEE-WGR-M", mrp: 2999, sellingPrice: 1999, stock: 35 },
      { color: "Washed Mineral Grey", colorCode: "#4F4F4F", size: "L", sku: "NS-TEE-WGR-L", mrp: 2999, sellingPrice: 1999, stock: 30 },
      { color: "Forest Pine", colorCode: "#1E3A2F", size: "M", sku: "NS-TEE-PNE-M", mrp: 2999, sellingPrice: 1999, stock: 20 },
      { color: "Forest Pine", colorCode: "#1E3A2F", size: "L", sku: "NS-TEE-PNE-L", mrp: 2999, sellingPrice: 1999, stock: 22 }
    ],
    stock: 132,
    isAvailable: true,
    isActive: true,
  },
  {
    name: "Pleated Relaxed Italian Wool-Blend Trousers",
    slug: "pleated-relaxed-italian-wool-blend-trousers",
    brand: "NOIR STUDIO",
    category: "Formal Pants",
    subcategory: "Trousers",
    productType: "Trousers",
    sku: "NS-TRS-PLT",
    gender: "Men",
    status: "Active",
    badge: "PREMIUM",
    price: 4499,
    originalPrice: 6499,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 },
      { url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 1 },
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 2 }
    ],
    colorOptions: [
      {
        name: "Sand Beige",
        hex: "#D8C3A5",
        skuCode: "SAN",
        images: [
          { url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 }
        ]
      },
      {
        name: "Charcoal Heather",
        hex: "#333333",
        skuCode: "CHR",
        images: [
          { url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 }
        ]
      }
    ],
    colors: ["Sand Beige", "Charcoal Heather"],
    sizes: ["30", "32", "34", "36"],
    shortDescription: "Double forward pleats with side adjusters, higher rise, and generous relaxed taper down to a clean cuff break.",
    description: "Inspired by classic bespoke 1950s Neapolitan tailoring. Cut from breathable tropical wool with slight stretch for unrestricted movement.",
    tags: ["Trousers", "Pleated", "Wool", "Old Money", "Formal"],
    attributes: {
      fabric: "70% Worsted Wool, 28% Viscose, 2% Elastane",
      fit: "Relaxed Tapered with High Rise",
      pattern: "Fine Melange Weave",
      occasion: "Smart Casual / Business / Cocktail",
      washCare: "Dry Clean Preferred",
      countryOfOrigin: "Italy",
      material: "Tropical Wool Blend",
      closure: "Extended Waistband Tab with Side Buckle Adjusters"
    },
    variants: [
      { color: "Sand Beige", colorCode: "#D8C3A5", size: "30", sku: "NS-TRS-SAN-30", mrp: 6499, sellingPrice: 4499, stock: 10 },
      { color: "Sand Beige", colorCode: "#D8C3A5", size: "32", sku: "NS-TRS-SAN-32", mrp: 6499, sellingPrice: 4499, stock: 16 },
      { color: "Sand Beige", colorCode: "#D8C3A5", size: "34", sku: "NS-TRS-SAN-34", mrp: 6499, sellingPrice: 4499, stock: 12 },
      { color: "Charcoal Heather", colorCode: "#333333", size: "32", sku: "NS-TRS-CHR-32", mrp: 6499, sellingPrice: 4499, stock: 14 },
      { color: "Charcoal Heather", colorCode: "#333333", size: "34", sku: "NS-TRS-CHR-34", mrp: 6499, sellingPrice: 4499, stock: 10 }
    ],
    stock: 62,
    isAvailable: true,
    isActive: true,
  },
  {
    name: "Minimalist Italian Calfskin Low-Top Sneakers",
    slug: "minimalist-italian-calfskin-low-top-sneakers",
    brand: "NOIR STUDIO",
    category: "Sneakers",
    subcategory: "Footwear",
    productType: "Shoes",
    sku: "NS-FTW-SNK",
    gender: "Men",
    status: "Active",
    badge: "BESTSELLER",
    price: 8999,
    originalPrice: 12999,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 },
      { url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 1 },
      { url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: false, sortOrder: 2 }
    ],
    colorOptions: [
      {
        name: "Pure Monochrome White",
        hex: "#F8F9FA",
        skuCode: "WHT",
        images: [
          { url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 }
        ]
      },
      {
        name: "Triple Noir Black",
        hex: "#151515",
        skuCode: "BLK",
        images: [
          { url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80", type: "url", isPrimary: true, sortOrder: 0 }
        ]
      }
    ],
    colors: ["Pure Monochrome White", "Triple Noir Black"],
    sizes: ["40", "41", "42", "43", "44", "45"],
    shortDescription: "Hand-stitched in Civitanova Marche, Italy using butter-soft Italian calfskin with Margom stitched rubber cupsole.",
    description: "The epitome of understated luxury footwear. Finished with calfskin leather lining, memory foam insole, waxed cotton laces, and gold foil serial numbers.",
    tags: ["Sneakers", "Leather Shoes", "Italian Footwear", "Minimalist", "Luxury"],
    attributes: {
      fabric: "Full-Grain Italian Calfskin Leather",
      fit: "True to EU Size",
      pattern: "Clean Smooth Leather",
      occasion: "Smart Casual / Travel / Daily",
      washCare: "Wipe with Damp Cloth and Leather Cream",
      countryOfOrigin: "Italy",
      material: "Calfskin Leather Upper & Margom Rubber Outsole",
      closure: "Lace-Up with Tonal Waxed Cotton Laces"
    },
    variants: [
      { color: "Pure Monochrome White", colorCode: "#F8F9FA", size: "40", sku: "NS-SNK-WHT-40", mrp: 12999, sellingPrice: 8999, stock: 6 },
      { color: "Pure Monochrome White", colorCode: "#F8F9FA", size: "41", sku: "NS-SNK-WHT-41", mrp: 12999, sellingPrice: 8999, stock: 10 },
      { color: "Pure Monochrome White", colorCode: "#F8F9FA", size: "42", sku: "NS-SNK-WHT-42", mrp: 12999, sellingPrice: 8999, stock: 14 },
      { color: "Pure Monochrome White", colorCode: "#F8F9FA", size: "43", sku: "NS-SNK-WHT-43", mrp: 12999, sellingPrice: 8999, stock: 12 },
      { color: "Pure Monochrome White", colorCode: "#F8F9FA", size: "44", sku: "NS-SNK-WHT-44", mrp: 12999, sellingPrice: 8999, stock: 8 },
      { color: "Triple Noir Black", colorCode: "#151515", size: "41", sku: "NS-SNK-BLK-41", mrp: 12999, sellingPrice: 8999, stock: 8 },
      { color: "Triple Noir Black", colorCode: "#151515", size: "42", sku: "NS-SNK-BLK-42", mrp: 12999, sellingPrice: 8999, stock: 10 },
      { color: "Triple Noir Black", colorCode: "#151515", size: "43", sku: "NS-SNK-BLK-43", mrp: 12999, sellingPrice: 8999, stock: 9 }
    ],
    stock: 77,
    isAvailable: true,
    isActive: true,
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas successfully!");

    // Upsert products based on slug
    for (const p of productsData) {
      const existing = await Product.findOne({ slug: p.slug });
      if (existing) {
        Object.assign(existing, p);
        await existing.save();
        console.log(`Updated product: ${p.name}`);
      } else {
        const newProduct = new Product(p);
        await newProduct.save();
        console.log(`Created product: ${p.name}`);
      }
    }

    const total = await Product.countDocuments({ isDeleted: false });
    console.log(`\nSeed completed! Total active products in database: ${total}`);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
}

seed();
