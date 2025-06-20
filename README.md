# Karlendaryo | Sinaing Scheduler 🍚

A Vue.js web application for scheduling names on a weekly calendar, designed for managing tasks or assignments on workdays (Monday–Friday). Built with Firebase Firestore for real-time data persistence, it allows users to add, edit, remove, and reorder names via a user-friendly interface, export schedules as CSV, and view events in a customizable calendar.

🚀 **[Live Demo](https://your-site-name.netlify.app)** | 🐙 **Click the rice cooker logo to visit GitHub!**

## ✨ Features

### 📅 Interactive Calendar
- **Multiple Views**: Month, week, and day format using FullCalendar
- **Schedule Overview**: Starting from June 2, 2025
- **Workday Focus**: Monday–Friday scheduling (perfect for office tasks!)

### 👥 Name Management
- **Add Names**: Simple modal input for new entries
- **Edit Names**: Inline editing with intuitive controls
- **Remove Names**: One-click removal with confirmation
- **Drag & Drop**: Reorder names using vuedraggable for easy prioritization

### ☁️ Real-time Data
- **Firebase Integration**: Dual environment setup (development/production)
- **Live Sync**: Changes reflect instantly across all users
- **Data Persistence**: Never lose your scheduling data

### 📊 Export & Sharing
- **CSV Export**: Download schedules with title, day, and start date
- **Structured Data**: Easy to import into other applications

### 🎨 Modern UI/UX
- **Responsive Design**: Built with Bootstrap for all device sizes
- **Custom Styling**: Mali font and clean, professional appearance
- **Bootstrap Icons**: Modern iconography throughout the interface
- **Rice Cooker Theme**: Custom favicon and branding 🍚

## 🛠️ Tech Stack

### Frontend
- **Vue.js** (Vue CLI)
- **FullCalendar** (Calendar component)
- **Bootstrap** (UI framework)
- **Bootstrap Icons** (Icon library)
- **vuedraggable** (Drag & drop functionality)

### Backend & Services
- **Firebase Firestore** (Real-time database)

### Development & Deployment
- **Node.js** (Runtime environment)
- **Netlify** (Hosting platform)
- **GitHub** (Version control)

### Styling
- **Mali Font** (Custom typography)
- **Custom CSS** (Tailored styling)

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or v18 recommended)
- **npm** package manager
- **Firebase account** for Firestore setup
- **Netlify account** for deployment
- **GitHub account** for version control

## 🚀 Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Karllouise-code/calender-scheduler.git
cd calender-scheduler
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

#### Create Firebase Projects

Create two Firebase projects for proper environment separation:

1. **Development**: `calendar-scheduler-development`
2. **Production**: `calendar-scheduler-5e1c7`

#### Environment Variables

Create environment files in your project root:

**`.env.development`**
```env
VUE_APP_FIREBASE_API_KEY=<dev-api-key>
VUE_APP_FIREBASE_AUTH_DOMAIN=calendar-scheduler-development.firebaseapp.com
VUE_APP_FIREBASE_PROJECT_ID=calendar-scheduler-development
VUE_APP_FIREBASE_STORAGE_BUCKET=calendar-scheduler-development.firebasestorage.app
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=<dev-messaging-sender-id>
VUE_APP_FIREBASE_APP_ID=<dev-app-id>
```

**`.env.production`**
```env
VUE_APP_FIREBASE_API_KEY=<prod-api-key>
VUE_APP_FIREBASE_AUTH_DOMAIN=calendar-scheduler-5e1c7.firebaseapp.com
VUE_APP_FIREBASE_PROJECT_ID=calendar-scheduler-5e1c7
VUE_APP_FIREBASE_STORAGE_BUCKET=calendar-scheduler-5e1c7.firebasestorage.app
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=<prod-messaging-sender-id>
VUE_APP_FIREBASE_APP_ID=<prod-app-id>
```

#### Update .gitignore

```bash
echo ".env*" >> .gitignore
```

#### Firestore Security Rules

**Development Environment** (Open access for testing):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Production Environment** (Secure rules):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /names/{document=**} {
      allow read: if true;
      allow write: if request.resource.data.name is string &&
                    request.resource.data.name.size() <= 50 &&
                    request.resource.data.createdAt is timestamp;
    }
  }
}
```

## 💻 Development

### Local Development

Run the application locally with hot-reloading:

```bash
npm run serve
```

Visit [http://localhost:8080](http://localhost:8080) to view the app (connected to development Firebase).

### Production Build

Compile and minify for production:

```bash
npm run build
```

This generates the `dist/` folder using the production Firebase project.

### Code Linting

Lint and fix files:

```bash
npm run lint
```

## 🌐 Deployment

### Netlify Deployment

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Configure Netlify**:
   - Connect your GitHub repository
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Environment variables**: Copy from `.env.development`

3. **Deploy**: Use Netlify's UI to deploy

4. **Verify**: Visit your Netlify URL to see the live application

## 🔒 Security

### Important Security Notes

⚠️ **API Key Exposure**: The Firebase apiKey was previously exposed in commit `9e1c7d`. 

**To clean up**:
```bash
pip3 install git-filter-repo
git filter-repo --path .env --debug
git push origin --force --all
```

**Then**:
1. Rotate the apiKey in Firebase Console for both projects
2. Update `.env.development`, `.env.production`, and Netlify environment variables
3. Update Firestore rules before June 29, 2025, to avoid lockout

## 🎯 Usage

### Managing Your Schedule

#### Viewing the Calendar
- Navigate between **month**, **week**, and **day** views
- Check scheduled items (e.g., June 30: Lester Niel, July 1: Rio)
- Use calendar controls to browse different time periods

#### Managing Names
1. **Add Names**: Click "Add new name" to open the management modal
2. **Edit Names**: Use the pencil icon for inline editing
3. **Remove Names**: Click the trash icon to delete entries
4. **Reorder**: Drag and drop names to change priority
5. **Save Changes**: Use the check icon to confirm changes

#### Exporting Data
- Click the download button to export as `schedule.csv`
- File includes title, day, and start date information
- Perfect for importing into other scheduling tools

### Icon Reference
- ✏️ **Pencil**: Edit name
- 🗑️ **Trash**: Remove name  
- 💾 **Download**: Save/Export
- ✅ **Check**: Confirm changes
- ❌ **Cancel**: Discard changes

## 📁 Project Structure

```
calender-scheduler/
├── public/                     # Static files
│   ├── rice-cooker_1530504.png # Custom favicon
│   └── index.html              # Main HTML template
├── src/                        # Vue.js source code
│   ├── components/             # Vue components
│   ├── views/                  # Page components
│   ├── firebase/               # Firebase configuration
│   ├── App.vue                 # Root component
│   └── main.js                 # Application entry point
├── .env.development            # Development environment variables
├── .env.production             # Production environment variables
├── package.json                # Dependencies and scripts
├── vue.config.js               # Vue CLI configuration
└── README.md                   # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** Vue CLI conventions and coding standards
4. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request

### Development Guidelines
- Follow Vue.js best practices
- Use Bootstrap classes for styling consistency
- Test changes in both development and production environments
- Update documentation for new features

## 🐛 Troubleshooting

### Common Issues

**Firebase Connection Errors**
- Verify environment variables are correctly set
- Check Firestore security rules
- Ensure Firebase projects are properly configured

**Netlify Build Failures**
- Review deploy logs in Netlify dashboard
- Verify `dist/` folder is generated correctly
- Check environment variables in Netlify settings

**Security/Secrets Issues**
- Share git-filter-repo error logs for assistance
- Verify API keys are properly rotated
- Check Firestore rules expiration dates

### Getting Help
- 🐙 **GitHub Issues**: [Report bugs or request features](https://github.com/Karllouise-code/calender-scheduler/issues)
- 📧 **Email**: Contact through GitHub profile

## 🙏 Acknowledgements

Special thanks to the amazing open-source community:

- **[Vue CLI](https://cli.vuejs.org/)** - Vue.js development tooling
- **[Firebase](https://firebase.google.com/)** - Backend-as-a-Service platform
- **[FullCalendar](https://fullcalendar.io/)** - JavaScript calendar library
- **[Netlify](https://netlify.com/)** - Modern web deployment platform
- **[Bootstrap Icons](https://icons.getbootstrap.com/)** - Beautiful icon library
- **[vuedraggable](https://github.com/SortableJS/Vue.Draggable)** - Drag and drop functionality

## 📄 License

This project is unlicensed and open for personal use. Feel free to fork, modify, and use for your own scheduling needs!

---

Made with ❤️ for better scheduling and 🍚 for the love of rice!

**Happy Scheduling!** 📅✨