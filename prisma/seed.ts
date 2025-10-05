import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash("Admin@12345", 10);
  const merchantPass = await bcrypt.hash("Merchant@12345", 10);
  const customerPass = await bcrypt.hash("Customer@12345", 10);

  // Seed categories first
  const categories = [
    { name: 'Electronics', description: 'Electronic devices and gadgets' },
    { name: 'Fashion', description: 'Clothing, accessories, and fashion items' },
    { name: 'Home & Garden', description: 'Home improvement and garden supplies' },
    { name: 'Sports', description: 'Sports equipment and fitness gear' },
    { name: 'Books', description: 'Books and educational materials' },
    { name: 'Beauty & Personal Care', description: 'Beauty products and personal care items' },
    { name: 'Toys & Games', description: 'Toys, games, and entertainment' }
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
    createdCategories.push(created);
  }

  await prisma.user.upsert({
    where: { email: "admin@store.com" },
    update: {},
    create: {
      email: "admin@store.com",
      password: adminPass,
      name: "Admin",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "merchant@store.com" },
    update: {},
    create: {
      email: "merchant@store.com",
      password: merchantPass,
      name: "Merchant",
      role: "MERCHANT",
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@store.com" },
    update: {},
    create: {
      email: "customer@store.com",
      password: customerPass,
      name: "Customer",
      role: "CUSTOMER",
    },
  });

  // Seed products
  const products = [
    {
      slug: 'wireless-bluetooth-headphones',
      title_en: 'Wireless Bluetooth Headphones',
      title_de: 'Kabellose Bluetooth-Kopfhörer',
      desc_en: 'High-quality wireless headphones with noise cancellation and long battery life.',
      desc_de: 'Hochwertige kabellose Kopfhörer mit Geräuschunterdrückung und langer Akkulaufzeit.',
      price: 89.99,
      stock: 15,
      imageUrl: '/images/headphones-1.jpg',
      categoryName: 'Electronics'
    },
    {
      slug: 'smart-fitness-watch',
      title_en: 'Smart Fitness Watch',
      title_de: 'Intelligente Fitness-Uhr',
      desc_en: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring.',
      desc_de: 'Verfolgen Sie Ihre Fitnessziele mit dieser fortschrittlichen Smartwatch mit Herzfrequenzüberwachung.',
      price: 199.99,
      stock: 8,
      imageUrl: '/images/watch-1.jpg',
      categoryName: 'Electronics'
    },
    {
      slug: 'portable-bluetooth-speaker',
      title_en: 'Portable Bluetooth Speaker',
      title_de: 'Tragbarer Bluetooth-Lautsprecher',
      desc_en: 'Waterproof portable speaker with 360-degree sound and 20-hour battery life.',
      desc_de: 'Wasserdichter tragbarer Lautsprecher mit 360-Grad-Sound und 20-Stunden-Akkulaufzeit.',
      price: 79.99,
      stock: 0,
      imageUrl: '/images/speaker-1.jpg',
      categoryName: 'Electronics'
    },
    {
      slug: 'organic-cotton-t-shirt',
      title_en: 'Organic Cotton T-Shirt',
      title_de: 'Bio-Baumwoll-T-Shirt',
      desc_en: 'Comfortable and eco-friendly cotton t-shirt available in multiple colors.',
      desc_de: 'Bequemes und umweltfreundliches Baumwoll-T-Shirt in verschiedenen Farben erhältlich.',
      price: 24.99,
      stock: 25,
      imageUrl: '/images/tshirt-1.jpg',
      categoryName: 'Fashion'
    },
    {
      slug: 'designer-sunglasses',
      title_en: 'Designer Sunglasses',
      title_de: 'Designer-Sonnenbrille',
      desc_en: 'Stylish designer sunglasses with UV protection and polarized lenses.',
      desc_de: 'Stilvolle Designer-Sonnenbrille mit UV-Schutz und polarisierten Gläsern.',
      price: 149.99,
      stock: 5,
      imageUrl: '/images/sunglasses-1.jpg',
      categoryName: 'Fashion'
    },
    {
      slug: 'ceramic-coffee-mug-set',
      title_en: 'Ceramic Coffee Mug Set',
      title_de: 'Keramik-Kaffeebecher-Set',
      desc_en: 'Beautiful handcrafted ceramic coffee mugs, perfect for your morning brew.',
      desc_de: 'Schöne handgefertigte Keramik-Kaffeebecher, perfekt für Ihren Morgenkaffee.',
      price: 34.99,
      stock: 12,
      imageUrl: '/images/mugs-1.jpg',
      categoryName: 'Home & Garden'
    },
    {
      slug: 'yoga-mat-premium',
      title_en: 'Yoga Mat Premium',
      title_de: 'Yoga-Matte Premium',
      desc_en: 'Non-slip yoga mat with alignment lines, perfect for home workouts.',
      desc_de: 'Rutschfeste Yoga-Matte mit Ausrichtungslinien, perfekt für Heimtrainings.',
      price: 49.99,
      stock: 20,
      imageUrl: '/images/yoga-mat-1.jpg',
      categoryName: 'Sports'
    },
    {
      slug: 'bestseller-novel-collection',
      title_en: 'Bestseller Novel Collection',
      title_de: 'Bestseller-Roman-Sammlung',
      desc_en: 'Set of 3 bestselling novels from top authors.',
      desc_de: 'Set mit 3 Bestsellern von Top-Autoren.',
      price: 39.99,
      stock: 10,
      imageUrl: '/images/books-1.jpg',
      categoryName: 'Books'
    },
    {
      slug: 'leather-wallet',
      title_en: 'Genuine Leather Wallet',
      title_de: 'Echtes Leder-Portemonnaie',
      desc_en: 'Premium genuine leather wallet with multiple card slots and RFID protection.',
      desc_de: 'Premium Echteder-Portemonnaie mit mehreren Kartenfächern und RFID-Schutz.',
      price: 45.99,
      stock: 18,
      imageUrl: '/images/wallet-1.jpg',
      categoryName: 'Fashion'
    },
    {
      slug: 'kitchen-blender',
      title_en: 'Professional Kitchen Blender',
      title_de: 'Professioneller Küchenmixer',
      desc_en: 'High-powered blender perfect for smoothies, soups, and food processing.',
      desc_de: 'Hochleistungs-Mixer perfekt für Smoothies, Suppen und Lebensmittelverarbeitung.',
      price: 129.99,
      stock: 12,
      imageUrl: '/images/blender-1.jpg',
      categoryName: 'Home & Garden'
    },
    {
      slug: 'resistance-bands-set',
      title_en: 'Resistance Bands Set',
      title_de: 'Widerstandsband-Set',
      desc_en: 'Complete set of resistance bands for full-body workouts at home.',
      desc_de: 'Vollständiges Set von Widerstandsbändern für Ganzkörper-Workouts zu Hause.',
      price: 29.99,
      stock: 25,
      imageUrl: '/images/bands-1.jpg',
      categoryName: 'Sports'
    },
    {
      slug: 'wireless-earbuds',
      title_en: 'True Wireless Earbuds',
      title_de: 'Echte Wireless-Ohrhörer',
      desc_en: 'Premium wireless earbuds with active noise cancellation and premium sound quality.',
      desc_de: 'Premium Wireless-Ohrhörer mit aktiver Geräuschunterdrückung und erstklassiger Klangqualität.',
      price: 159.99,
      stock: 15,
      imageUrl: '/images/earbuds-1.jpg',
      categoryName: 'Electronics'
    },
    {
      slug: 'coffee-maker',
      title_en: 'Programmable Coffee Maker',
      title_de: 'Programmierbare Kaffeemaschine',
      desc_en: '12-cup programmable coffee maker with thermal carafe and auto shut-off.',
      desc_de: '12-Tassen programmierbare Kaffeemaschine mit Thermokanne und automatischer Abschaltung.',
      price: 89.99,
      stock: 8,
      imageUrl: '/images/coffee-maker-1.jpg',
      categoryName: 'Home & Garden'
    },
    {
      slug: 'running-shoes',
      title_en: 'Professional Running Shoes',
      title_de: 'Professionelle Laufschuhe',
      desc_en: 'Lightweight running shoes with advanced cushioning and breathable mesh.',
      desc_de: 'Leichte Laufschuhe mit fortschrittlicher Dämpfung und atmungsaktivem Mesh.',
      price: 119.99,
      stock: 20,
      imageUrl: '/images/running-shoes-1.jpg',
      categoryName: 'Sports'
    },
    {
      slug: 'smartphone-case',
      title_en: 'Protective Smartphone Case',
      title_de: 'Schützende Smartphone-Hülle',
      desc_en: 'Military-grade protection case with screen protector and card holder.',
      desc_de: 'Militärische Schutz-Hülle mit Bildschirmschutz und Kartenhalter.',
      price: 24.99,
      stock: 30,
      imageUrl: '/images/phone-case-1.jpg',
      categoryName: 'Electronics'
    }
  ];

  // Ensure a Merchant profile exists for the merchant user and set it ACTIVE
  const merchantUser = await prisma.user.findUnique({
    where: { email: 'merchant@store.com' },
    select: { id: true }
  });

  if (!merchantUser) {
    throw new Error('Merchant user not found. Please make sure to create it first.');
  }

  const merchantProfile = await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: { status: 'ACTIVE' },
    create: {
      userId: merchantUser.id,
      storeName: 'Default Merchant Store',
      status: 'ACTIVE'
    }
  });

  // Seed products owned by the Merchant profile (use Merchant.id)
  for (const product of products) {
    const { categoryName, ...productData } = product;
    const category = createdCategories.find(c => c.name === categoryName);
    
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        merchantId: merchantProfile.id,
        categoryId: category?.id
      },
      create: {
        ...productData,
        merchantId: merchantProfile.id,
        categoryId: category?.id
      },
    });
  }

  console.log("Seeded admin, merchant, customer & products.");
}

main().finally(() => prisma.$disconnect());