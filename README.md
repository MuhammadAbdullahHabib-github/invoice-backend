# Invoice Management System Backend

A TypeScript-based backend for managing invoices, customers, and authentication.

## Features

- User authentication with JWT
- Customer management
- Invoice management
- API documentation with Swagger
- TypeScript support
- SQLite database
- Rate limiting
- Security headers
- Error handling
- Input validation

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd invoice-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration.

5. Build the project:
```bash
npm run build
```

## Development

Start the development server:
```bash
npm run dev
```

## Production

Start the production server:
```bash
npm start
```

## API Documentation

Once the server is running, you can access the API documentation at:
```
http://localhost:3000/api-docs
```

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot reload
- `npm run build`: Build the TypeScript code
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues
- `npm test`: Run tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage report

## Project Structure

```
invoice-backend/
├─ src/
│  ├─ app.ts                 # Main application file
│  ├─ config/               # Configuration files
│  ├─ controllers/          # Route controllers
│  ├─ middlewares/          # Custom middlewares
│  ├─ models/              # Database models
│  ├─ routes/              # API routes
│  ├─ types/               # TypeScript types
│  └─ utils/               # Utility functions
├─ .env.example            # Example environment variables
├─ .eslintrc.json         # ESLint configuration
├─ jest.config.js         # Jest configuration
├─ nodemon.json           # Nodemon configuration
├─ package.json           # Project dependencies
├─ README.md              # Project documentation
├─ swagger.yaml           # API documentation
└─ tsconfig.json          # TypeScript configuration
```

## API Endpoints

### Authentication
- POST /api/auth/login - Login user
- POST /api/auth/logout - Logout user
- POST /api/auth/refresh - Refresh access token

### Customers
- GET /api/customers - Get all customers
- GET /api/customers/search - Search customers
- GET /api/customers/:id - Get customer by ID
- POST /api/customers - Create customer
- PATCH /api/customers/:id - Update customer
- DELETE /api/customers/:id - Delete customer

### Invoices
- GET /api/invoices - Get all invoices
- GET /api/invoices/:id - Get invoice by ID
- POST /api/invoices - Create invoice
- PATCH /api/invoices/:id - Update invoice
- DELETE /api/invoices/:id - Delete invoice
- POST /api/invoices/:id/send - Send invoice
- POST /api/invoices/:id/mark-paid - Mark invoice as paid

## Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Security headers with helmet
- CORS configuration
- Input validation
- Error handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License. 