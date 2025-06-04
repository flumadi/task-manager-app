# task-manager-app  
A beautiful and dynamic task management application with user authentication.  

Features  
User registration and login  
Add, view, and delete tasks  
Beautiful UI with blue, white, and green theme  
Smooth animations and transitions  
Creative fonts and icons  
Responsive design  
Project Structure  
├── backend/  
│   ├── database/  
│   │   ├── migrations.ts    # Database schema setup  
│   │   └── queries.ts       # Database query functions  
│   ├── routes/  
│   │   ├── auth.ts         # Authentication routes  
│   │   └── tasks.ts        # Task management routes  
│   └── index.ts            # Main backend entry point  
├── frontend/  
│   ├── components/  
│   │   ├── App.tsx         # Main app component  
│   │   ├── Auth.tsx        # Login/signup forms  
│   │   └── TaskManager.tsx # Task management interface  
│   ├── index.html          # Main HTML template  
│   ├── index.tsx           # Frontend entry point  
│   └── style.css           # Custom styles  
└── shared/  
    └── types.ts            # Shared TypeScript types  
Color Theme  
Blue: Primary color for headers and accents  
White: Background and text  
Green: Action buttons (add, save, etc.)  
Red: Delete buttons  
Light variants: Hover effects with 0.03s transitions  
Tech Stack  
Backend: Hono + SQLite  
Frontend: React + TypeScript  
Styling: TailwindCSS + Custom CSS  
Icons: Emoji icons for creative appeal  
Fonts: Google Fonts (Poppins, Inter)  
Features in Detail  
Authentication System  
User registration with username, email, and password  
Secure login system with session management
Password hashing for security
Automatic session validation
Beautiful login/signup forms with validation
Task Management
Create tasks with title, description, and priority levels
Mark tasks as completed/pending
Delete tasks with confirmation
Priority system (Low 🟢, Medium 🟡, High 🔴)
Task statistics dashboard
Real-time updates
Beautiful UI/UX
Color Theme: Blue (#2563eb), White (#ffffff), Green (#16a34a), Red (#dc2626)
Hover Effects: 0.03s transition duration with lighter color variants
Creative Fonts: Poppins for headings, Inter for body text
Icons: Emoji-based icons throughout the interface
Animations: Fade-in and slide-in effects for smooth interactions
Responsive Design: Mobile-friendly layout
Technical Features
SQLite database with proper schema design
RESTful API endpoints
Session-based authentication
Error handling and user feedback
Loading states and empty states
Form validation
Real-time task updates
API Endpoints
Authentication
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/logout - User logout
GET /api/auth/me - Get current user
Tasks
GET /api/tasks - Get user's tasks
POST /api/tasks - Create new task
PATCH /api/tasks/:id/complete - Toggle task completion
DELETE /api/tasks/:id - Delete task
Getting Started
The app is ready to use at the provided URL
Register a new account or login with existing credentials
Start creating and managing your tasks!
Design Philosophy
The app follows a modern, clean design with:

Intuitive user interface
Smooth animations and transitions
Clear visual hierarchy
Accessible color contrasts
Mobile-first responsive design
Creative use of emojis for visual appeal
