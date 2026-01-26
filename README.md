# CodeConnect 🚀

A **Real-Time Collaborative Coding Platform** with integrated AI assistance, problem-solving tools, and advanced debugging features. Built with React, Node.js, Firebase, and powered by Google Gemini AI.

![CodeConnect](https://img.shields.io/badge/version-3.2.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![Firebase](https://img.shields.io/badge/firebase-11.2.0-orange.svg)

## ✨ Features

### 🎯 Core Functionality
- **Real-Time Collaborative Editing**: Experience low-latency, conflict-free pair programming with the powerful Monaco Editor (VS Code core).
- **Multi-Language Support**: Complete support for JavaScript, Python, Java, C++, and C with intelligent syntax highlighting and reliable linting.
- **Room Management**: Create frictionless, secure coding sessions instantly with unique 6-digit room IDs—no cleanup required.
- **Session Persistence**: Never lose work with robust Firestore-backed auto-saving that keeps state consistent across all devices.
- **Cloud Code Execution**: Execute code safely in high-performance, sandboxed backend environments with instant output.

### 🤖 AI-Powered Advanced Tools
- **AI Code Generator**: Transform natural language prompts into production-ready code
- **Intelligent Debugger**: Automated code analysis with detailed issue detection and suggested fixes
- **AI Test Runner**: Generate, execute, and validate test cases with AI-powered evaluation
- **AI Chat Assistant**: Context-aware coding help integrated directly into the editor
- **Code Explanation**: Get instant, detailed explanations of complex code snippets

### 💬 Communication & Collaboration
- **Real-Time Chat System**: Text messaging with AI mode toggle for intelligent assistance
- **Typing Indicators**: Live visibility of collaborators actively coding
- **Presence System**: Real-time tracking of online users and room participants
- **Google Meet Integration**: One-click video conferencing for remote pair programming
- **Google Drive Export**: Seamlessly save and share code to Google Drive cloud storage
- **File Sharing**: Share code snippets and files within chat conversations

### 📚 Learning & Practice
- **Comprehensive Problem Library**: 20+ curated coding challenges organized by difficulty
  - **Beginner**: Arrays, strings, basic algorithms (Two Sum, Palindrome, etc.)
  - **Intermediate**: Linked lists, trees, dynamic programming (LRU Cache, Word Break)
  - **Advanced**: Complex algorithms, system design (Median of Two Sorted Arrays, N-Queens)
- **Problem Solver Mode**: Dedicated coding interface with integrated problem descriptions
- **Team Challenges**: Create and join teams, compete in coding challenges, and track global rankings
- **Real-Time Leaderboard**: Gamified learning with points, rankings, and progress tracking
- **Progress Dashboard**: Monitor sessions, active projects, languages used, and achievements

### 🔥 Firebase & Google Cloud Integration
- **Firebase Authentication**: Secure Google OAuth login with session management
- **Cloud Firestore**: Real-time NoSQL database for instant data synchronization
- **Firebase Analytics**: Track user engagement and platform usage
- **Google Meet**: Integrated video conferencing
- **Google Drive**: Cloud storage and code export functionality

### 🎨 User Experience
- **Modern 3D UI**: Stunning glassmorphic design with Three.js 3D elements
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Dark Theme**: Eye-friendly dark mode for extended coding sessions
- **Smooth Animations**: Framer Motion for fluid transitions and interactions
- **Toast Notifications**: Non-intrusive feedback system

### 🔐 Security & Reliability
- **Firebase Authentication**: Secure Google OAuth login
- **Firestore Real-Time Database**: Scalable, real-time data synchronization
- **Protected Routes**: Authentication-based access control
- **Error Boundaries**: Graceful error handling prevents app crashes

## 🏗️ Architecture

```
codeconnect/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── Editor.js    # Monaco editor with real-time sync
│   │   │   ├── ChatPanel.js # Chat with AI integration
│   │   │   ├── ProblemPanel.js # Problem descriptions
│   │   │   ├── Landing.js   # 3D landing page
│   │   │   └── Three/       # 3D components (React Three Fiber)
│   │   ├── contexts/        # React contexts (Auth, Toast)
│   │   ├── pages/           # Main pages
│   │   │   ├── Dashboard.js # User dashboard
│   │   │   ├── Problems.js  # Problem library
│   │   │   ├── CodeGen.js   # AI code generator
│   │   │   ├── Debugging.js # AI debugger
│   │   │   └── Testing.js   # AI test runner
│   │   ├── services/        # API services
│   │   │   ├── firestoreService.js # Firestore operations
│   │   │   └── problemService.js   # Problem API
│   │   └── firebase.js      # Firebase configuration
│   └── package.json
│
├── backend/                  # Node.js backend
│   ├── routes/              # API routes
│   │   ├── ai.js            # Groq AI integration
│   │   ├── execute.js       # Code execution
│   │   └── problems.js      # Problem management
│   ├── server.js            # Express server
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or yarn
- **Firebase Project** (for authentication and database)
- **Google Gemini API Key** (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/thatrasunil/code-connect.git
   cd code-connect
   ```

2. **Backend Setup (Node.js)**
   ```bash
   cd backend
   
   # Install dependencies
   npm install
   
   # Create .env file
   cat > .env << EOF
   GOOGLE_API_KEY=your_google_gemini_api_key_here
   FRONTEND_URL=http://localhost:3000
   PORT=3001
   EOF
   
   # Start backend server
   npm run dev
   ```

3. **Frontend Setup (React)**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Configure Firebase
   # Update src/firebase.js with your Firebase config
   
   # Start development server
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🔧 Configuration

### Environment Variables

**Backend (.env in backend/)**
```env
GOOGLE_API_KEY=your_google_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
PORT=3001
```

**Frontend (src/firebase.js)**
```javascript
const firebaseConfig = {
  apiKey: "your_firebase_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id",
  measurementId: "your_measurement_id"
};
```

**Frontend (src/config.js)**
```javascript
const config = {
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001',
};
```

### Development Scripts

**Frontend**
- `npm start` - Start development server (port 3000)
- `npm run build` - Build production bundle
- `npm test` - Run tests

**Backend**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 📚 Tech Stack

### Frontend Technologies
- **React** 18.2.0 - UI framework with hooks
- **React Router DOM** 7.9.2 - Client-side routing
- **Monaco Editor** 4.7.0 - VS Code's code editor
- **React Three Fiber** 8.18.7 - 3D graphics with Three.js
- **@react-three/drei** 9.122.7 - 3D helpers and components
- **Framer Motion** 12.24.12 - Animation library
- **Firebase** 11.2.0 - Authentication and real-time database
- **React Icons** 5.5.0 - Icon library
- **React Markdown** 9.0.5 - Markdown rendering

### Backend Technologies
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Google Generative AI SDK** - AI integration for code generation and analysis
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### 🔥 Powered by Google Cloud & Firebase
- **Firebase Authentication**: Secure, seamless sign-in with Google OAuth and email/password, managing user sessions and security context.
- **Cloud Firestore**: A flexible, scalable NoSQL cloud database that keeps data in sync across client apps in real-time.
- **Firebase Hosting**: Fast and secure hosting for the web app, backed by Google's global CDN.
- **Google Cloud Platform**: Underlying infrastructure ensuring high availability and low latency for global collaboration.
- **Firebase Analytics**: Provides insight into user behavior and engagement to drive product improvements.

### 🤖 Advanced AI Integration
- **Google Gemini AI**: The core intelligence engine powering:
  - **Code Generation**: Translates natural language prompts into syntactically correct code snippets in real-time.
  - **Smart Debugging**: Analyzes code context to identify errors and suggest optimized fixes.
  - **AI Chat Assistant**: A context-aware coding companion that answers questions and explains logic.
- **Antigravity Engine**: An advanced agentic AI framework developed by Google DeepMind that orchestrates complex coding tasks, plans implementation strategies, and executes verifying steps to ensure high-quality code delivery.

### AI Integration


## 🎮 Usage

### Creating a Room
1. Navigate to the Dashboard
2. Click "New Session" to create a room
3. Share the 6-digit room ID with collaborators

### Solving Problems
1. Go to the "Problems" page
2. Browse problems by difficulty (Beginner, Intermediate, Advanced)
3. Click "Solve Now" to open the problem in the editor
4. The problem description appears automatically in the left panel

### Using AI Tools

**Code Generator**
1. Navigate to `/codegen`
2. Enter a natural language prompt
3. Click "Generate" to create code

**Debugger**
1. Navigate to `/debugging`
2. Paste your code
3. Click "Analyze Code" for AI-powered debugging

**Test Runner**
1. Navigate to `/testing`
2. Write your implementation and test cases
3. Click "Run All Tests" for AI validation

### AI Chat in Editor
1. Toggle "AI ON" in the chat panel
2. Ask questions or request explanations
3. Use "Explain" button for selected code analysis

## 🆕 Recent Updates (v3.2.0)

### Major Features ✅
- ✅ **Collaborative Whiteboard**: Real-time shared canvas with drawing tools (pen, shapes), color picker, and instant sync across all users.
- ✅ **Advanced Voice Chat**: Integrated voice messaging with record, pause, resume, and cancel capabilities.
- ✅ **Session Management**: "End Session" functionality to securely wipe room data and improved connection persistence.
- ✅ **Team Challenges**: Collaborative team-based coding competitions with global leaderboards
- ✅ **C Language Support**: Native compilation and execution support for C programming
- ✅ **Google Gemini AI Integration**: Real AI-powered code generation, debugging, and testing
- ✅ **Firebase Migration**: Complete transition from backend API to Firestore
- ✅ **Problem Solver Mode**: Conditional problem panel display
- ✅ **3D Landing Page**: Stunning Three.js 3D elements and animations
- ✅ **Fully Responsive**: Mobile-optimized across all pages

### Advanced Tools ✅
- ✅ AI Code Generator with prompt-to-code conversion
- ✅ Intelligent Debugger with structured issue detection
- ✅ AI Test Runner with automated validation
- ✅ Problem Library with beginner to advanced challenges

### UI/UX Improvements ✅
- ✅ **Enhanced Editor Toolbar**: Improved layout and visibility for all screen sizes
- ✅ Responsive layouts for Dashboard, Problems, and all Advanced Tools
- ✅ Responsive Landing page with adaptive 3D elements
- ✅ Glassmorphic design system
- ✅ Smooth animations and transitions

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Sunil T**
- GitHub: [@thatrasunil](https://github.com/thatrasunil)

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced AI capabilities
- **Google Firebase** for real-time database and authentication
- **Monaco Editor** by Microsoft for the powerful code editor
- **Three.js** and **React Three Fiber** for 3D graphics
- **Framer Motion** for beautiful animations
- React community for excellent tools and libraries

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Made with ❤️ by Sunil T**
