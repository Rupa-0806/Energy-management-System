# Energy Management System

A fullstack web application for monitoring and managing energy consumption across devices and facilities.

## 🚀 Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router v6** for routing
- **Recharts** for data visualization
- **Socket.IO** for real-time updates
- **PWA** support with Service Worker

### Backend
- **Java 17** with Spring Boot 3.2
- **Spring Security** with JWT authentication
- **Spring Data JPA** with Hibernate
- **Spring WebSocket** for real-time communication
- **H2 Database** (dev) / PostgreSQL (prod)

## 📁 Project Structure

```
EnergyManagementSystem/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API and WebSocket services
│   │   ├── stores/          # Zustand state stores
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
│
├── backend/                  # Spring Boot backend application
│   ├── src/main/java/com/ems/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── exception/       # Exception handling
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Data repositories
│   │   ├── security/        # JWT security
│   │   └── service/         # Business logic
│   └── src/main/resources/  # Configuration files
│
└── README.md                 # This file
```

## ✨ Features

### Dashboard
- Real-time KPI cards (devices, consumption, alerts, cost savings)
- Interactive energy consumption charts
- Device status overview
- Recent alerts panel

### Device Management
- CRUD operations for devices
- Device grouping and organization
- Status monitoring (online/offline/warning/error)
- Search and filter capabilities

### Energy Monitoring
- Real-time power consumption tracking
- Historical data analysis
- Consumption breakdown by device
- Hourly and daily trends

### Alert System
- Severity-based alerts (info/warning/critical)
- Acknowledge and resolve workflows
- Real-time notifications via WebSocket
- Alert history and filtering

### Reports
- Energy consumption reports
- Cost analysis
- Device performance metrics
- Export capabilities

### User Management
- JWT-based authentication
- Role-based access control
- Secure password handling

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- Maven 3.6+

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start at `http://localhost:8080/api`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`

## 🔐 Default Login Credentials

| Email | Password | Role |
|-------|----------|------|
| demo@example.com | Demo@123 | User |
| admin@example.com | Admin@123 | Admin |

## 📚 API Documentation

Access Swagger UI at: `http://localhost:8080/api/swagger-ui.html`

### Key Endpoints

| Endpoint | Description |
|----------|-------------|
| POST /api/auth/login | User authentication |
| GET /api/devices | List all devices |
| GET /api/energy/readings | Energy consumption data |
| GET /api/alerts | List alerts |
| GET /api/dashboard | Dashboard summary |

## 🔄 Real-time Updates

WebSocket connection is established at `ws://localhost:8080/api/ws`

Topics:
- `/topic/energy` - Energy readings
- `/topic/devices` - Device updates
- `/topic/alerts` - Alert notifications
- `/topic/dashboard` - Dashboard updates

## 🗄️ Database

### Development (H2)
- Console: `http://localhost:8080/api/h2-console`
- JDBC URL: `jdbc:h2:file:./data/emsdb`
- Username: `sa`
- Password: `password`

### Production (PostgreSQL)
Update `application.properties` with PostgreSQL configuration.

## 🏗️ Production Build

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/energy-management-system-1.0.0.jar
```

## 📱 PWA Support

The application includes:
- Service Worker for offline functionality
- Installable as mobile/desktop app
- Cached API responses
- Offline indicator

## 🎨 UI Features

- Responsive design (mobile-first)
- Dark/Light theme ready
- Skeleton loaders for better UX
- Error boundaries for graceful error handling
- Toast notifications

## 📊 Data Visualization

- Real-time gauges
- Line charts for trends
- Bar charts for comparisons
- Pie charts for breakdowns
- Custom energy visualization components

## 🔧 Configuration

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080
```

### Backend Configuration
See `backend/src/main/resources/application.properties`

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
