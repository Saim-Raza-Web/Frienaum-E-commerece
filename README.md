# E-Commerce Frontend

A modern, responsive e-commerce frontend built with React, Next.js, and TailwindCSS. This project provides a complete frontend solution for an online store with all essential features and a beautiful, user-friendly interface.

## 🚀 Features

### Customer Features
- **Homepage** - Hero section, featured products, category showcase
- **Product Catalog** - Browse all products with category filters and search
- **Product Details** - Image gallery, descriptions, reviews, add to cart
- **Shopping Cart** - Manage cart items, quantity controls, order summary
- **Checkout** - Guest checkout form with validation
- **User Authentication** - Login/Register with form validation

### Merchant Features
- **Merchant Dashboard** - Overview, product management, orders, analytics
- **Product Management** - Add, edit, delete products (placeholder for Phase Two)
- **Order Management** - View and manage customer orders (placeholder for Phase Two)

### Admin Features
- **Admin Panel** - System overview, user management, system settings
- **System Monitoring** - Service status, recent activity
- **Analytics** - Business metrics and reporting (placeholder for Phase Two)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)
- **Responsive Design**: Mobile-first approach with TailwindCSS breakpoints

## 🎨 Design System

- **Color Palette**: Turquoise/Blue as primary colors with clean whites and grays
- **Typography**: Modern, readable fonts with proper hierarchy
- **Spacing**: Consistent white space using TailwindCSS spacing scale
- **Components**: Reusable UI components with consistent styling
- **Responsive**: Optimized for desktop, tablet, and mobile devices

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Adapted layouts with optimized touch interactions
- **Mobile**: Mobile-first design with collapsible navigation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-commerce-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx          # Homepage
│   ├── products/         # Products listing
│   ├── product/[id]/     # Product details
│   ├── cart/             # Shopping cart
│   ├── checkout/         # Checkout process
│   ├── login/            # Authentication
│   ├── merchant/         # Merchant dashboard
│   └── admin/            # Admin panel
├── components/            # Reusable UI components
│   ├── Navigation.tsx    # Main navigation
│   ├── Footer.tsx        # Site footer
│   └── ProductCard.tsx   # Product display card
├── lib/                   # Utility functions and data
│   └── dummyData.ts      # Sample data for development
└── types/                 # TypeScript type definitions
    └── index.ts          # Main type definitions
```

## 🎯 Key Components

### Navigation
- Responsive navigation with mobile menu
- Search functionality
- Cart indicator with item count
- User authentication links

### Product Management
- Product grid with filtering
- Category-based organization
- Search and sort functionality
- Product cards with add to cart

### Shopping Experience
- Shopping cart with quantity controls
- Checkout form with validation
- Order summary and calculations
- Responsive design for all devices

## 🔧 Configuration

### TailwindCSS
The project uses TailwindCSS with custom color schemes:
- Primary colors: Blue variants
- Accent colors: Turquoise variants
- Custom component classes for buttons, cards, and inputs

### TypeScript
Strict TypeScript configuration with:
- Proper type definitions for all data structures
- Interface definitions for products, users, orders
- Type-safe component props

## 📊 Data Structure

### Products
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  tags: string[];
}
```

### Cart Items
```typescript
interface CartItem {
  product: Product;
  quantity: number;
}
```

### User Address
```typescript
interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
```

## 🎨 Customization

### Colors
Modify the color scheme in `tailwind.config.js`:
```javascript
colors: {
  primary: { /* Blue variants */ },
  turquoise: { /* Turquoise variants */ }
}
```

### Components
All components are built with TailwindCSS classes and can be easily customized by modifying the className props.

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on push

### Deploy to Other Platforms
The built application can be deployed to any static hosting service:
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any VPS with nginx

## 🔮 Future Enhancements (Phase Two)

- **Backend Integration**: Real API endpoints and database
- **Payment Processing**: Stripe, PayPal integration
- **User Management**: User profiles, order history
- **Advanced Analytics**: Detailed business metrics
- **Inventory Management**: Real-time stock tracking
- **Email Notifications**: Order confirmations, shipping updates
- **SEO Optimization**: Meta tags, structured data
- **Performance**: Image optimization, lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- Lucide for the beautiful icons
- The React community for inspiration and best practices

---

**Built with ❤️ using modern web technologies** 