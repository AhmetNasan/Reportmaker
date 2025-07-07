# Engineering Platform - Contract Management System

A comprehensive full-stack engineering project management platform built with React, Express.js, and PostgreSQL. This system provides contract-driven engineering management with advanced features for project tracking, GIS mapping, AI-powered inspections, file management, and detailed reporting.

## 🚀 Features

### Core Functionality
- **Contract Management**: Create, edit, and track engineering contracts with detailed client information
- **Project Tracking**: Manage projects linked to contracts with progress monitoring and status updates
- **File Management**: Secure file upload and organization with contract-based folder structure
- **GIS Integration**: Interactive mapping with coordinate storage and site visualization
- **AI Inspections**: Upload images for AI-powered defect detection and analysis
- **Comprehensive Reporting**: Generate detailed reports across all project data
- **Cross-Page Data Flow**: Seamless data sharing between all platform sections

### Technical Features
- **Real-time Updates**: Live data synchronization across all pages
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Type-Safe Development**: Full TypeScript implementation for reliability
- **Database Integration**: PostgreSQL with Drizzle ORM for robust data management
- **Authentication Ready**: Built-in user context system for multi-user support
- **Error Handling**: Comprehensive error management with user-friendly messages

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Tailwind CSS with shadcn/ui components for professional design
- **State Management**: TanStack Query for server state, React Context for global state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **File Handling**: Multer for file uploads (20MB limit)
- **API Design**: RESTful API with comprehensive error handling
- **Development**: Hot reload with Vite integration

### Database Schema
```sql
-- Contracts: Main contract entities
contracts (id, contract_number, client_name, project_name, start_date, end_date, contract_value, status, description, created_at, updated_at)

-- Contract Files: File attachments linked to contracts
contract_files (id, contract_id, file_name, file_path, file_size, file_type, created_at)

-- Projects: Project entities linked to contracts
projects (id, contract_id, name, description, status, progress, start_date, end_date, coordinates, created_at, updated_at)

-- Inspections: AI inspection records
inspections (id, contract_id, project_id, image_path, analysis_results, defects_found, confidence, notes, created_at, updated_at)
```

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn package manager

### Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
NODE_ENV=development
PORT=5000
```

### Database Setup (Supabase)
1. Create a new Supabase project
2. Go to Settings → Database
3. Copy the connection string from "Connection pooling"
4. Replace `[YOUR-PASSWORD]` with your database password
5. Use this as your `DATABASE_URL`

### Installation Steps
```bash
# Clone the repository
git clone <repository-url>
cd engineering-platform

# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Build for Production
```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

## 🎯 Usage Guide

### Getting Started
1. **Dashboard**: Overview of all contracts, projects, and key metrics
2. **Contracts**: Create and manage engineering contracts
3. **Projects**: Track project progress and manage tasks
4. **GIS Mapping**: Interactive maps with coordinate tracking
5. **AI Inspections**: Upload images for automated defect detection
6. **File Manager**: Organize and share project files
7. **Reports**: Generate comprehensive project reports

### Contract Workflow
1. Create a new contract with client details and project information
2. Set contract value, dates, and status
3. Add projects under the contract
4. Upload relevant files and documents
5. Conduct AI inspections with image analysis
6. Track progress and generate reports

### File Management
- Drag and drop files for easy upload
- Automatic organization by contract
- Support for PDF, DOC, and image files
- File sharing with external stakeholders
- Version control and access logging

## 🔧 Development

### Code Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utility libraries
├── server/                 # Backend Express application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   └── index.ts            # Server entry point
├── shared/                 # Shared TypeScript types
│   └── schema.ts           # Database schema and types
└── uploads/                # File upload directory
```

### Key Components
- **ContractContext**: Global state management for active contracts
- **Storage Interface**: Abstraction layer for database operations
- **API Routes**: RESTful endpoints for all operations
- **UI Components**: Professional shadcn/ui component library
- **File Upload**: Drag-and-drop file handling with progress tracking

### Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Update database schema
npm run db:studio    # Open database studio
```

## 🔐 Security Features

- Input validation with Zod schemas
- File type and size restrictions
- SQL injection prevention with parameterized queries
- CORS protection for API endpoints
- Environment variable security
- Error handling without sensitive data exposure

## 📊 Performance

- Optimized database queries with proper indexing
- Lazy loading for large datasets
- Image optimization for inspections
- Caching strategies for frequently accessed data
- Minimal bundle size with tree shaking

## 🚀 Deployment

### Replit Deployment
1. Connect your repository to Replit
2. Set environment variables in Replit Secrets
3. Deploy using Replit's one-click deployment

### Manual Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred hosting platform
4. Ensure PostgreSQL database is accessible

## 📈 Monitoring & Analytics

- Error logging and monitoring
- Performance metrics tracking
- User activity analytics
- Database query optimization
- File upload statistics

## 🛠️ Troubleshooting

### Common Issues
1. **Database Connection**: Verify DATABASE_URL format and credentials
2. **File Uploads**: Check upload directory permissions and file size limits
3. **Build Errors**: Ensure all dependencies are installed correctly
4. **Port Conflicts**: Change PORT environment variable if needed

### Support
For technical support or feature requests, please refer to the project documentation or contact the development team.

---

Built with ❤️ for professional engineering project management.