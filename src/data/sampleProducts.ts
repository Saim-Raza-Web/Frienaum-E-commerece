import { Product } from '@/types';

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    price: 129.99,
    originalPrice: 159.99,
    images: ['/images/headphones.jpg'],
    category: 'Electronics',
    rating: 4.5,
    reviewCount: 128,
    inStock: true,
    tags: ['wireless', 'bluetooth', 'noise-cancelling']
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and eco-friendly t-shirt made from 100% organic cotton.',
    price: 29.99,
    images: ['/images/tshirt.jpg'],
    category: 'Clothing',
    rating: 4.2,
    reviewCount: 56,
    inStock: true,
    tags: ['organic', 'cotton', 'sustainable']
  },
  {
    id: '3',
    name: 'Stainless Steel Water Bottle',
    description: 'Keep your drinks hot or cold for hours with this durable stainless steel bottle.',
    price: 24.99,
    originalPrice: 34.99,
    images: ['/images/water-bottle.jpg'],
    category: 'Accessories',
    rating: 4.7,
    reviewCount: 89,
    inStock: true,
    tags: ['eco-friendly', 'insulated', 'bpa-free']
  },
  {
    id: '4',
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
    price: 39.99,
    images: ['/images/charging-pad.jpg'],
    category: 'Electronics',
    rating: 4.3,
    reviewCount: 42,
    inStock: false,
    tags: ['wireless', 'charging', 'qi']
  },
  {
    id: '5',
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat with carrying strap, perfect for all types of yoga.',
    price: 49.99,
    originalPrice: 69.99,
    images: ['/images/yoga-mat.jpg'],
    category: 'Fitness',
    rating: 4.6,
    reviewCount: 73,
    inStock: true,
    tags: ['yoga', 'fitness', 'exercise']
  },
  {
    id: '6',
    name: 'Ceramic Coffee Mug',
    description: 'Handcrafted ceramic mug with a comfortable handle and modern design.',
    price: 19.99,
    images: ['/images/coffee-mug.jpg'],
    category: 'Home',
    rating: 4.4,
    reviewCount: 37,
    inStock: true,
    tags: ['kitchen', 'ceramic', 'dishwasher-safe']
  },
];

export const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'fitness', name: 'Fitness' },
  { id: 'home', name: 'Home' },
];
