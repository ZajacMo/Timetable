# Timetable Application

A timetable application developed based on Vue 3 and Cordova, supporting course management, schedule planning, and reminder settings. It can run on both web browsers and mobile devices.

## Features

- 📅 **Course Management** - Add, edit, and delete course information
- 📝 **Schedule Planning** - Manage personal schedules and activities
- ⚙️ **Personalized Settings** - Theme switching, semester settings, display options, etc.
- 🔔 **Notification Reminders** - Advance reminder function for courses and schedules
- 📱 **Responsive Design** - Adapt to different screen sizes
- 🌙 **Dark Mode** - Eye protection mode support

## Technology Stack

- **Frontend Framework**: Vue 3
- **State Management**: Pinia
- **Routing**: Vue Router
- **Build Tool**: Vite
- **Packaging Tool**: Cordova
- **Development Language**: TypeScript

## Project Structure

```
src/
├── components/        # Components
│   ├── CourseDialog.vue      # Course add/edit dialog
│   ├── ScheduleDialog.vue    # Schedule add/edit dialog
│   └── TimetableView.vue     # Timetable view component
├── core/              # Core functions
├── router/            # Routing configuration
├── stores/            # State management
│   ├── courses.ts     # Course data
│   ├── schedules.ts   # Schedule data
│   └── settings.ts    # Application settings
├── types/             # Type definitions
├── utils/             # Utility functions
│   └── cordovaLoader.js      # Cordova environment loader
├── views/             # Page views
│   ├── HomeView.vue       # Home page/Timetable
│   ├── ScheduleView.vue   # Schedule page
│   └── SettingsView.vue   # Settings page
├── App.vue            # Main component
├── main.ts            # Application entry
└── style.css          # Global styles
```

## Installation and Development

### Prerequisites

- Node.js (recommended v16.0 or higher)
- npm (recommended v7.0 or higher)
- Cordova CLI (optional, for mobile application building)

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

This command will start a local development server, usually running at http://localhost:5173/.

### Build Web Application

```bash
npm run build
```

The built files will be output to the `dist` directory.

### Cordova Related Commands

Add platforms:

```bash
npm run cordova:add-android  # Add Android platform
npm run cordova:add-ios      # Add iOS platform
```

Build and run on device:

```bash
npm run cordova:run-android  # Build and run on Android device
npm run cordova:run-ios      # Build and run on iOS device
```

## 🔧 Development Guide

### Core Module Development
Core modules are located in the `src/core/` directory. This code is shared across platforms, so ensure you follow these principles:
- Do not rely on any platform-specific APIs
- Use TypeScript to ensure type safety
- Implement business logic and data processing functions

### Component Development
- Components are located in the `src/components/` directory
- Ensure components are reusable and independent
- Follow Vue 3's Composition API style

### View Development
- Page views are located in the `src/views/` directory
- Implement the main pages and layouts of the application
- Use Vue Router for page navigation

## 📝 User Guide

### Add Semester
1. Click the "Add Semester" button on the semester page
2. Fill in semester name, start date, total weeks, etc.
3. Click "Save" to complete the addition
4. You can set a semester as the current semester

### Add Course
1. Click the "Add Course" button on the course page
2. Fill in course name, teacher, location, time, etc.
3. Select course color and week settings
4. Click "Save" to complete the addition

### View Timetable
1. You can view the current semester's course schedule on the timetable page
2. Use the "Previous Week" and "Next Week" buttons to switch weeks
3. Click "Show Calendar" to select a date through the calendar

### Add Schedule
1. Click the "Add Schedule" button on the schedule page
2. Fill in schedule title, description, time, etc.
3. Set whether it's a full-day schedule and reminder
4. Click "Save" to complete the addition

### Data Import and Export
1. You can find the "Data Management" option on the settings page
2. Click "Export Data" to export all data as a JSON file
3. Click "Import Data" to restore data from a JSON file

## 🤝 Contribution

Contributions are welcome! Please follow these steps:
1. Fork the project repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License

## 📧 Contact Us

If you have any questions or suggestions, please contact: trae.ai@example.com
