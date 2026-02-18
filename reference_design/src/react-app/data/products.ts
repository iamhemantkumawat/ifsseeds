export interface Product {
  id: string;
  name: string;
  variety: string;
  weight: string;
  price: number;
  originalPrice: number;
  discount: number;
  category: string;
  image: string;
  description: string;
  features: string[];
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: "chickpea-sr1",
    name: "Chickpea Seed SR-1",
    variety: "SR-1",
    weight: "1 KG",
    price: 250,
    originalPrice: 499,
    discount: 50,
    category: "Legumes",
    image: "https://ifsseeds.com/wp-content/uploads/2023/05/manish-stall10.jpg",
    description: "Premium bold-seeded chickpea variety known for high yield and disease resistance. Perfect for Rabi season cultivation in Gujarat and Rajasthan.",
    features: [
      "Bold-seeded variety",
      "High germination rate",
      "Disease resistant",
      "Suitable for Rabi season",
      "High protein content"
    ],
    inStock: true
  },
  {
    id: "mustard-sr19",
    name: "Yellow Mustard Seeds SR-19",
    variety: "SR-19",
    weight: "1 KG",
    price: 799,
    originalPrice: 1199,
    discount: 33,
    category: "Cash Crops",
    image: "https://ifsseeds.com/wp-content/uploads/2023/05/manish-stall000.jpg",
    description: "High-quality yellow mustard seeds with excellent oil content and white rust resistance. Ideal for commercial farming.",
    features: [
      "White rust resistant",
      "High oil content (42%+)",
      "Early maturing variety",
      "Drought tolerant",
      "Premium market price"
    ],
    inStock: true
  },
  {
    id: "guar-sr23",
    name: "Cluster Bean (Guar) Seeds SR-23",
    variety: "SR-23",
    weight: "2 KG",
    price: 400,
    originalPrice: 499,
    discount: 20,
    category: "Cash Crops",
    image: "https://ifsseeds.com/wp-content/uploads/2023/05/manish-stallgd.jpg",
    description: "Superior guar seeds with high gum content, perfect for industrial and food processing applications. Thrives in arid conditions.",
    features: [
      "High gum content",
      "Heat tolerant",
      "Low water requirement",
      "Multiple harvests possible",
      "Industrial grade quality"
    ],
    inStock: true
  }
];

export const categories = ["All", "Legumes", "Cash Crops"];

export const upcomingSeeds = [
  "Moong Bean (Virus-Resistant)",
  "Fenugreek Premium",
  "Wheat HD-3086",
  "Barley RD-2899",
  "Cotton Hybrid",
  "Sugarcane CO-0238"
];
