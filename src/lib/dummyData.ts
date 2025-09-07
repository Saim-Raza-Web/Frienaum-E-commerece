import { Product, Category } from '@/types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    description: 'Latest gadgets and electronic devices',
    image: '/images/electronics.jpg',
    productCount: 24
  },
  {
    id: '2',
    name: 'Fashion',
    description: 'Trendy clothing and accessories',
    image: '/images/fashion.jpg',
    productCount: 18
  },
  {
    id: '3',
    name: 'Home & Garden',
    description: 'Everything for your home',
    image: '/images/home.jpg',
    productCount: 15
  },
  {
    id: '4',
    name: 'Sports',
    description: 'Sports equipment and activewear',
    image: '/images/sports.jpg',
    productCount: 12
  },
  {
    id: '5',
    name: 'Books',
    description: 'Books for all ages and interests',
    image: '/images/books.jpg',
    productCount: 30
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and long battery life.',
    price: 89.99,
    originalPrice: 129.99,
    images: ['/images/headphones-1.jpg', '/images/headphones-2.jpg'],
    category: 'Electronics',
    rating: 4.5,
    reviewCount: 128,
    inStock: true,
    tags: ['wireless', 'bluetooth', 'noise-cancelling']
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring.',
    price: 199.99,
    images: ['/images/watch-1.jpg', '/images/watch-2.jpg'],
    category: 'Electronics',
    rating: 4.3,
    reviewCount: 89,
    inStock: true,
    tags: ['fitness', 'smartwatch', 'health']
  },
  {
    id: '3',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and eco-friendly cotton t-shirt available in multiple colors.',
    price: 24.99,
    images: ['/images/tshirt-1.jpg', '/images/tshirt-2.jpg'],
    category: 'Fashion',
    rating: 4.7,
    reviewCount: 256,
    inStock: true,
    tags: ['organic', 'cotton', 'comfortable']
  },
  {
    id: '4',
    name: 'Ceramic Coffee Mug Set',
    description: 'Beautiful handcrafted ceramic coffee mugs, perfect for your morning brew.',
    price: 34.99,
    originalPrice: 44.99,
    images: ['/images/mugs-1.jpg', '/images/mugs-2.jpg'],
    category: 'Home & Garden',
    rating: 4.6,
    reviewCount: 67,
    inStock: true,
    tags: ['ceramic', 'coffee', 'handcrafted']
  },
  {
    id: '5',
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat with alignment lines, perfect for home workouts.',
    price: 49.99,
    images: ['/images/yoga-mat-1.jpg', '/images/yoga-mat-2.jpg'],
    category: 'Sports',
    rating: 4.4,
    reviewCount: 143,
    inStock: true,
    tags: ['yoga', 'non-slip', 'workout']
  },
  {
    id: '6',
    name: 'Bestseller Novel Collection',
    description: 'Set of 3 bestselling novels from top authors.',
    price: 39.99,
    originalPrice: 59.99,
    images: ['/images/books-1.jpg', '/images/books-2.jpg'],
    category: 'Books',
    rating: 4.8,
    reviewCount: 89,
    inStock: true,
    tags: ['bestseller', 'novels', 'collection']
  },
  {
    id: '7',
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof portable speaker with 360-degree sound and 20-hour battery life.',
    price: 79.99,
    images: ['/images/speaker-1.jpg', '/images/speaker-2.jpg'],
    category: 'Electronics',
    rating: 4.2,
    reviewCount: 156,
    inStock: false,
    tags: ['portable', 'bluetooth', 'waterproof']
  },
  {
    id: '8',
    name: 'Designer Sunglasses',
    description: 'Stylish designer sunglasses with UV protection and polarized lenses.',
    price: 149.99,
    images: ['/images/sunglasses-1.jpg', '/images/sunglasses-2.jpg'],
    category: 'Fashion',
    rating: 4.6,
    reviewCount: 78,
    inStock: true,
    tags: ['designer', 'UV-protection', 'polarized']
  }
];

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return products;
  return products.filter(product => product.category === category);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
}; 