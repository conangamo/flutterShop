# ShoeStore E-Commerce Platform

A full-stack, multi-tenant e-commerce platform built with React Native (Expo), FastAPI, and PostgreSQL. This application supports multiple store types (jewelry and shoes) with a comprehensive admin panel, user authentication, cart management, and order processing.

## 🏗️ Project Structure

```
.
├── native-e-commerce/          # React Native mobile app (Expo)
├── native-e-commerce-be/       # FastAPI backend API
└── database/                   # Database schemas, migrations, and seed data
```

## ✨ Features

### Customer Features
- 🔐 **User Authentication** - Register, login, logout with JWT tokens
- 🛍️ **Product Catalog** - Browse products by category with filtering and search
- 🛒 **Shopping Cart** - Add, update, and remove items
- 📦 **Order Management** - Place orders, track status, view order history
- 📍 **Address Management** - Save multiple shipping addresses
- 👤 **User Profile** - Update personal information and avatar
- 🎯 **Product Details** - View detailed product information with variants (size, color)
- ⭐ **Product Reviews** - Rating and review system
- 🎨 **Dark/Light Mode** - Automatic theme switching

### Admin Features
- 📊 **Dashboard** - Overview of sales, orders, and key metrics
- 📦 **Inventory Management** - Manage products, variants, and stock levels
- 🏷️ **Category Management** - Create and organize product categories
- 📋 **Order Management** - View and update order status
- 👥 **User Management** - Manage customer accounts and roles
- 🎁 **Promotions** - Create and manage discount vouchers
- 📈 **Analytics** - Sales reports and performance metrics

### Technical Features
- 🏢 **Multi-tenant Architecture** - Support for multiple store types (jewelry, shoes)
- 🔒 **Role-based Access Control** - User, Staff, and Admin roles
- 💳 **Multiple Payment Methods** - Credit card, COD, E-wallet support
- 📱 **Cross-platform** - iOS, Android, and Web support
- 🎨 **Modern UI** - Built with NativeWind (Tailwind CSS for React Native)
- 🔄 **State Management** - Zustand for efficient state handling
- 🚀 **Type-safe Routing** - Expo Router with TypeScript

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Routing**: Expo Router v6
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: Zustand
- **Storage**: AsyncStorage, SecureStore
- **UI Components**: Custom components with Expo Vector Icons
- **Image Handling**: Expo Image Picker
- **Location**: Expo Location

### Backend (API)
- **Framework**: FastAPI 0.109.2
- **Language**: Python 3.x
- **Database**: PostgreSQL with SQLAlchemy 2.0
- **Authentication**: JWT with python-jose
- **Password Hashing**: bcrypt + passlib
- **Validation**: Pydantic v2
- **CORS**: Enabled for cross-origin requests
- **File Upload**: python-multipart

### Database
- **RDBMS**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Manual SQL migrations
- **Schema**: Multi-tenant with store isolation

## 📋 Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.9+
- **PostgreSQL** 14+
- **Docker & Docker Compose** (recommended)
- **Expo CLI** (for mobile development)

## 🚀 Getting Started

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Set up environment variables**
   
   Create `.env` files in the following locations:
   
   **`native-e-commerce-be/.env`**:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=ecommerce
   DATABASE_URL=postgresql://postgres:your_password@db:5432/ecommerce
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```
   
   **`native-e-commerce/.env`**:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

3. **Start the backend with Docker**
   ```bash
   cd native-e-commerce-be
   docker compose up -d --build
   ```
   
   This will:
   - Start PostgreSQL on `localhost:5432`
   - Start FastAPI on `http://localhost:8000`
   - Auto-run database initialization and seed data

4. **Start the mobile app**
   ```bash
   cd native-e-commerce
   npm install
   npm start
   ```
   
   Then:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your phone

### Option 2: Local Development

#### Backend Setup

1. **Create Python virtual environment**
   ```bash
   cd native-e-commerce-be
   python -m venv .venv
   
   # Windows
   .venv\Scripts\Activate.ps1
   
   # macOS/Linux
   source .venv/bin/activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb ecommerce
   
   # Run initialization script
   psql -d ecommerce -f ../database/init_database.sql
   
   # Run seed data
   psql -d ecommerce -f ../database/seed_dev.sql
   ```

4. **Start the API server**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd native-e-commerce
   npm install
   ```

2. **Start Expo development server**
   ```bash
   npm start
   ```

## 🗄️ Database Schema

The application uses a multi-tenant architecture with the following key tables:

- **stores** - Store definitions (jewelry, shoes)
- **users** - User accounts with role-based access
- **products** - Product catalog with store-specific attributes
- **product_variants** - Size, color, and SKU variants
- **categories** - Product categorization
- **carts** & **cart_items** - Shopping cart management
- **orders** & **order_items** - Order processing
- **addresses** - User shipping addresses
- **payment_methods** - Payment options per store
- **order_timelines** - Order status tracking

### Database Migrations

Migrations are located in `database/migrations/`. To apply all migrations:

```bash
# Using psql
psql "$DATABASE_URL" -f database/migrations/apply_auth_migrations.sql

# Using Docker Compose (Windows PowerShell)
Get-Content database\migrations\apply_auth_migrations.sql -Raw | docker compose -f native-e-commerce-be\docker-compose.yml exec -T db psql -U postgres -d ecommerce
```

See `database/migrations/README.md` for detailed migration instructions.

## 🔑 Demo Accounts

After running seed data, you can use these accounts:

**Jewelry Store (Store ID: 1)**
- Email: `demo.jewelry@gmail.com`
- Password: `demo123456`

**Shoes Store (Store ID: 2)**
- Email: `demo.shoes@gmail.com`
- Password: `demo123456`
- Role: Admin

## 📡 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `POST /api/v1/auth/logout` - Logout (revoke token)

#### Catalog
- `GET /api/v1/categories` - List categories
- `GET /api/v1/products` - List products with filters
- `GET /api/v1/products/{id}` - Get product details

#### User
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update profile

#### Addresses
- `GET /api/v1/addresses` - List user addresses
- `POST /api/v1/addresses` - Create new address
- `PUT /api/v1/addresses/{id}` - Update address
- `DELETE /api/v1/addresses/{id}` - Delete address

#### Orders
- `GET /api/v1/orders` - List user orders
- `GET /api/v1/orders/{id}` - Get order details
- `POST /api/v1/orders` - Create new order

#### Admin
- `PATCH /api/v1/admin/users/{id}/status` - Update user status (admin only)

### Authentication Headers

Protected endpoints require:
```
Authorization: Bearer <jwt_token>
X-Store-Id: 1
```

## 📱 Mobile App Structure

```
native-e-commerce/
├── app/                        # Expo Router pages
│   ├── (auth)/                # Authentication screens
│   ├── (tabs)/                # Main tab navigation
│   ├── admin/                 # Admin panel screens
│   ├── product/               # Product detail screens
│   ├── order/                 # Order screens
│   └── addresses/             # Address management
├── components/                # Reusable components
│   ├── admin/                 # Admin-specific components
│   ├── home/                  # Home screen components
│   ├── checkout/              # Checkout components
│   └── ...
├── features/                  # Feature modules
│   ├── auth/                  # Authentication logic
│   ├── admin/                 # Admin features
│   └── ...
├── hooks/                     # Custom React hooks
├── services/                  # API service layer
├── store/                     # Zustand state management
├── types/                     # TypeScript type definitions
└── utils/                     # Utility functions
```

## 🎨 Styling

The app uses **NativeWind**, which brings Tailwind CSS to React Native:

```tsx
<View className="flex-1 bg-white dark:bg-gray-900">
  <Text className="text-lg font-bold text-gray-900 dark:text-white">
    Hello World
  </Text>
</View>
```

## 🧪 Testing

### API Smoke Test
```bash
cd native-e-commerce
npm run smoke:api
```

### Linting
```bash
npm run lint
npm run format
```

## 🔧 Development Tips

### Reset Database
```bash
cd native-e-commerce-be
docker compose down -v
docker compose up -d --build
```

### View Logs
```bash
# Backend logs
docker compose logs -f api

# Database logs
docker compose logs -f db
```

### Access Database
```bash
docker compose exec db psql -U postgres -d ecommerce
```

### Clear Expo Cache
```bash
cd native-e-commerce
npx expo start -c
```

## 🏢 Multi-tenant Architecture

The application supports multiple store types through a `store_id` convention:
- **Store 1**: Jewelry & Accessories
- **Store 2**: Shoes & Footwear

Each store has:
- Separate product catalogs with store-specific attributes
- Independent categories
- Store-specific payment methods
- Isolated user bases (users belong to one store)

The `X-Store-Id` header determines which store context to use for API requests.

## 🔐 Security Features

- JWT-based authentication with token expiration
- Password hashing with bcrypt
- Token revocation on logout
- Role-based access control (User, Staff, Admin)
- Account activation/deactivation
- Secure storage for sensitive data (SecureStore)
- CORS configuration for API security

## 📦 Deployment

### Backend Deployment

1. **Build Docker image**
   ```bash
   cd native-e-commerce-be
   docker build -t ecommerce-api .
   ```

2. **Deploy to cloud provider** (AWS, GCP, Azure, etc.)
   - Set environment variables
   - Configure PostgreSQL connection
   - Set up SSL/TLS certificates
   - Configure domain and reverse proxy

### Mobile App Deployment

1. **Build for production**
   ```bash
   cd native-e-commerce
   
   # iOS
   eas build --platform ios
   
   # Android
   eas build --platform android
   ```

2. **Submit to app stores**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

See [Expo EAS documentation](https://docs.expo.dev/eas/) for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Backend Issues

**Database connection error**
- Check PostgreSQL is running: `docker compose ps`
- Verify DATABASE_URL in `.env`
- Check database exists: `docker compose exec db psql -U postgres -l`

**Migration errors**
- Apply migrations: `psql "$DATABASE_URL" -f database/migrations/apply_auth_migrations.sql`
- Or reset database: `docker compose down -v && docker compose up -d --build`

### Frontend Issues

**API connection error**
- Verify backend is running: `curl http://localhost:8000`
- Check `EXPO_PUBLIC_API_URL` in `.env`
- For physical device, use your computer's IP instead of `localhost`

**Expo build errors**
- Clear cache: `npx expo start -c`
- Delete node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation in `database/migrations/README.md` and `native-e-commerce-be/README.md`

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend powered by [FastAPI](https://fastapi.tiangolo.com/)
- UI styled with [NativeWind](https://www.nativewind.dev/)
- State management with [Zustand](https://zustand-demo.pmnd.rs/)
