# 🗓️ Plannr

> An intelligent task scheduling and productivity application that helps you optimize your daily workflow through AI-powered planning and analytics.

[![React Native](https://img.shields.io/badge/React%20Native-0.72-blue.svg)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📱 About Plannr

Plannr is a comprehensive productivity application that combines intelligent task scheduling with powerful analytics to help users optimize their time management. The application uses AI to automatically suggest optimal scheduling strategies based on user preferences, deadlines, and productivity patterns.

### ✨ Key Features

- **🤖 AI-Powered Scheduling**: Intelligent task placement based on your preferences and patterns
- **📊 Productivity Analytics**: Track and analyze your productivity trends over time
- **🎯 Multiple Scheduling Strategies**: 
  - Balanced Work approach
  - Deadline-Oriented planning
  - Earliest Fit optimization
- **📅 Co-Planning**: Collaborative scheduling with team members
- **🔔 Smart Notifications**: Context-aware reminders and updates
- **🌙 Dark/Light Mode**: Beautiful UI that adapts to your preference
- **📱 Cross-Platform**: Available on iOS and Android

## 🏗️ Architecture

This is a monorepo containing:

```
Plannr/
├── frontend/          # React Native mobile application
├── backend/           # Node.js/Express API server
└── docs/             # Project documentation
```

### Frontend (React Native)
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: Context API with custom hooks
- **UI Components**: Custom design system with SVG icons
- **Animations**: Smooth transitions and micro-interactions
- **Persistence**: AsyncStorage for local data caching

### Backend (Node.js/Express)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite with Drizzle ORM
- **Authentication**: JWT-based auth system
- **AI Integration**: OpenAI API for intelligent scheduling
- **Task Scheduling**: Custom cron jobs for automated tasks
- **API**: RESTful API with comprehensive error handling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- React Native development environment
- iOS Simulator (macOS) or Android Studio
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xshauryaa/Plannr.git
   cd Plannr
   ```

2. **Install dependencies for both frontend and backend**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   **Backend** - Create `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   OPENAI_API_KEY=your_openai_api_key
   DATABASE_URL=./db/plannr.db
   ```
   
   **Frontend** - Create `frontend/.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed  # Optional: seed with sample data
   ```

5. **Start the Development Servers**
   
   **Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm start
   ```

## 📚 Project Structure

### Frontend Structure
```
frontend/
├── src/
│   ├── auth/                 # Authentication logic
│   ├── components/           # Reusable UI components
│   ├── context/             # React Context providers
│   ├── design/              # Design system and theme
│   ├── modals/              # Modal components
│   ├── navigation/          # Navigation configuration
│   ├── notifications/       # Push notification handling
│   ├── persistence/         # Local storage utilities
│   ├── screens/             # Screen components
│   ├── scheduling-logic-views/ # Scheduling algorithm views
│   └── utils/               # Utility functions
├── assets/                  # Images, fonts, animations
├── ios/                     # iOS-specific files
└── android/                 # Android-specific files
```

### Backend Structure
```
backend/
├── src/
│   ├── config/              # Configuration files
│   ├── db/                  # Database schema and migrations
│   ├── middleware/          # Express middleware
│   ├── modules/             # Feature modules
│   │   ├── ai/              # AI integration
│   │   ├── co-plan/         # Collaborative planning
│   │   ├── preferences/     # User preferences
│   │   ├── productivity-analytics/ # Analytics
│   │   ├── schedules/       # Schedule management
│   │   └── users/           # User management
│   └── routes/              # API route definitions
└── docs/                    # API documentation
```

## 🛠️ Development

### Available Scripts

**Backend**:
```bash
npm run dev          # Start development server with hot reload
npm run start        # Start production server
npm run test         # Run tests
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run lint         # Run ESLint
```

**Frontend**:
```bash
npm start            # Start Expo development server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run web          # Run on web browser
npm test             # Run tests
npm run lint         # Run ESLint
```

### API Documentation

The backend API documentation is available at:
- Development: `http://localhost:3000/api/docs`
- See `backend/docs/` for detailed API specifications

### Key API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/users/profile` - Get user profile
- `POST /api/schedules` - Create new schedule
- `GET /api/schedules` - Get user schedules
- `POST /api/ai/suggest-schedule` - Get AI scheduling suggestions
- `GET /api/analytics/productivity` - Get productivity analytics

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## 📱 Deployment

### Backend Deployment
1. Set up your production environment variables
2. Build the application: `npm run build`
3. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment
```bash
# Build for production
expo build:ios     # iOS App Store
expo build:android # Google Play Store

# Or use EAS Build
eas build --platform all
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Web application version
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Team collaboration features
- [ ] Advanced AI scheduling algorithms
- [ ] Habit tracking integration
- [ ] Voice commands and natural language processing
- [ ] Wearable device integration

## 🐛 Known Issues

See our [Issues](https://github.com/xshauryaa/Plannr/issues) page for current known issues and feature requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Shaurya Thareja** - *Lead Developer* - [@xshauryaa](https://github.com/xshauryaa)

## 🙏 Acknowledgments

- OpenAI for AI-powered scheduling capabilities
- React Native community for excellent mobile development tools
- All contributors and beta testers

## 📞 Support

If you have any questions or need help, please:
- Open an [issue](https://github.com/xshauryaa/Plannr/issues)
- Email us at support@plannr.app
- Check our [documentation](docs/)

---

**Made with ❤️ by the Plannr Team**
