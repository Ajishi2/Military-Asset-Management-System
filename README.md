# Military Asset Management System

A comprehensive web application for managing military assets, equipment, and personnel assignments across multiple bases. Built with React, Node.js, and PostgreSQL.

## 🎯 Features

### Core Functionality
- **Dashboard**: Real-time overview of asset distribution and key metrics
- **Asset Purchases**: Track new equipment acquisitions with detailed records
- **Asset Transfers**: Manage equipment transfers between bases
- **Personnel Assignments**: Assign and track personnel to different bases and roles
- **User Authentication**: Secure login/registration system with role-based access

### Key Capabilities
- Real-time asset tracking across multiple military bases
- Comprehensive reporting and analytics
- Role-based user permissions
- Responsive design for desktop and mobile use
- Secure API with JWT authentication
- PostgreSQL database for reliable data storage

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Vite** - Fast build tool

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Nodemon** - Development server
- **Concurrently** - Run multiple commands

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd military-asset-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_NAME=your-database-name
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   JWT_SECRET=your-jwt-secret-key
   PORT=3000
   ```

4. **Database Setup**
   - Ensure PostgreSQL is running
   - Create a database for the application
   - The application will automatically create required tables on first run

### Running the Application

#### Development Mode
```bash
# Run both frontend and backend concurrently
npm run dev:full

# Or run them separately:
npm run dev          # Frontend only (Vite dev server)
npm run server       # Backend only (Express server)
```

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

### Available Scripts
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start Express server
- `npm run dev:full` - Run both frontend and backend
- `npm run lint` - Run ESLint
- `npm start` - Start production server

## 📊 Database Schema

The application uses the following main tables:
- `users` - User accounts and authentication
- `equipment_types` - Categories of military equipment
- `bases` - Military base information
- `purchases` - Asset acquisition records
- `transfers` - Asset transfer records
- `assignments` - Personnel assignments
- `asset_balances` - Current asset quantities per base

## 🔐 Authentication

The system uses JWT-based authentication with the following features:
- Secure password hashing with bcrypt
- Token-based session management
- Role-based access control
- Automatic token verification on protected routes

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/verify` - Verify JWT token

### Assets
- `GET /api/assets` - Get asset balances
- `POST /api/purchases` - Create purchase record
- `GET /api/purchases` - Get purchase history
- `POST /api/transfers` - Create transfer record
- `GET /api/transfers` - Get transfer history

### Personnel
- `POST /api/assignments` - Create assignment
- `GET /api/assignments` - Get assignment history

### Configuration
- `GET /api/bases` - Get base information
- `GET /api/equipment-types` - Get equipment categories

## 🎨 UI Components

The application features a modern, responsive interface with:
- Clean dashboard with key metrics
- Data tables with sorting and filtering
- Form components with validation
- Interactive charts and graphs
- Mobile-responsive design

## 🚀 Deployment

### Render Deployment
The application is configured for deployment on Render with:
- Automatic build process
- Environment variable configuration
- PostgreSQL database integration
- SSL certificate management

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=your-production-db-name
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
JWT_SECRET=your-production-jwt-secret
PORT=10000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

## 🔄 Version History

- **v0.1.0** - Initial release with core asset management features
  - User authentication system
  - Asset purchase tracking
  - Transfer management
  - Personnel assignments
  - Dashboard with analytics
