# CloudStore - Complete File Management Application

A full-stack file management application built with React Native (frontend) and Spring Boot (backend), featuring secure file storage, user authentication, and advanced file operations.

## 🚀 Features

### Frontend (React Native)
- **File Management**: Upload, download, rename, delete files
- **Folder Management**: Create, navigate, and organize folders
- **File Compression**: Compress files with customizable settings
- **Favorites System**: Mark and filter favorite files
- **Search & Filter**: Advanced search and category filtering
- **Modern UI**: Beautiful, responsive interface with animations
- **Breadcrumb Navigation**: Easy folder navigation
- **File Preview**: Support for various file types
- **Offline Support**: Basic offline functionality

### Backend (Spring Boot)
- **User Authentication**: JWT-based secure authentication
- **File Operations**: Complete CRUD operations for files
- **Folder Management**: Hierarchical folder structure
- **Email Service**: Password reset and verification emails
- **File Compression**: Server-side file compression
- **Database Integration**: PostgreSQL with Neon cloud database
- **Security**: Spring Security with CORS configuration

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **React Navigation** - Navigation between screens
- **AsyncStorage** - Local data persistence
- **Expo FileSystem** - File system operations
- **Expo DocumentPicker** - File selection
- **Expo ImagePicker** - Image capture and selection
- **Expo Sharing** - File sharing capabilities
- **Expo MediaLibrary** - Media library access

### Backend
- **Spring Boot** - Java framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **PostgreSQL** - Primary database (Neon cloud)
- **JWT** - Token-based authentication
- **JavaMail** - Email services
- **Maven** - Dependency management

## 📱 Screenshots

*[Add screenshots of your app here]*

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Java JDK 11 or higher
- Maven
- PostgreSQL database
- Expo CLI
- Android Studio / Xcode (for mobile development)

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   mvn install
   ```

2. **Configure database**
   - Set up PostgreSQL database
   - Update `application.properties` with your database credentials
   - Or use the provided `.env` file

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DB_URL=jdbc:postgresql://your-database-url:5432/your-database-name
DB_USERNAME=your-username
DB_PASSWORD=your-password

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=86400000

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### API Configuration

The backend runs on `http://localhost:8080` by default. Update the frontend API configuration in `frontend/screens/api.js` if needed.

## 📁 Project Structure

```
CloudStore-final/
├── frontend/                 # React Native application
│   ├── screens/             # Application screens
│   │   ├── assets/              # Images and static files
│   │   ├── App.js               # Main application component
│   │   └── package.json         # Frontend dependencies
│   ├── backend/                 # Spring Boot application
│   │   ├── src/main/java/       # Java source code
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── service/         # Business logic
│   │   │   ├── repository/      # Data access layer
│   │   │   ├── model/           # Entity models
│   │   │   ├── dto/             # Data transfer objects
│   │   │   ├── security/        # Security configuration
│   │   │   └── config/          # Application configuration
│   │   ├── src/main/resources/  # Configuration files
│   │   └── pom.xml              # Maven dependencies
│   ├── README.md                # This file
│   └── .env                     # Environment variables
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: BCrypt password hashing
- **CORS Configuration**: Cross-origin resource sharing setup
- **Input Validation**: Server-side validation for all inputs
- **File Type Validation**: Secure file upload restrictions

## 📧 Email Features

- **Password Reset**: Secure password reset via email
- **Email Verification**: User account verification
- **SMTP Configuration**: Gmail SMTP integration

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:
- **Users**: User accounts and authentication
- **Files**: File metadata and storage information
- **Folders**: Folder hierarchy and organization
- **Notifications**: User notifications and alerts

## 🚀 Deployment

### Frontend Deployment
- Build for production: `expo build`
- Deploy to app stores or use Expo Application Services

### Backend Deployment
- Build JAR: `mvn clean package`
- Deploy to cloud platforms (Heroku, AWS, etc.)
- Configure environment variables for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Lazarus Sakyi Sam** - *Initial work* - [lexussam77](https://github.com/lexussam77)

## 🙏 Acknowledgments

- React Native community
- Spring Boot framework
- Expo development platform
- PostgreSQL and Neon database

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact: [Your contact information]

---

**Note**: This application has full functionality but may need minor UI and authentication improvements for production use. 