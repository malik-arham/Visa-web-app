# Visa Application Portal

A full-stack web application for visa applications worldwide. Built with Node.js, Express, and modern web technologies.

## Features

- **Multi-step Application Form**: Step-by-step visa application process
- **Document Upload**: Secure file upload for passport copies and photos
- **Real-time Validation**: Client-side form validation with error handling
- **Application Tracking**: Track application status with unique IDs
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Clean, professional design with smooth animations

## Technology Stack

### Frontend
- HTML5
- CSS3 with modern features
- Vanilla JavaScript (ES6+)
- Font Awesome for icons
- Google Fonts (Inter)

### Backend
- Node.js
- Express.js
- Multer for file uploads
- CORS for cross-origin requests
- Helmet for security
- Rate limiting for API protection

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd visa-application-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   # For development
   npm run dev
   
   # For production
   npm start
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Submit Application
- **POST** `/api/submit-application`
- Accepts multipart/form-data with application details and files
- Returns application ID on success

### Track Application
- **GET** `/api/track-application/:applicationId`
- Returns application status and details

### Get All Applications (Admin)
- **GET** `/api/applications`
- Returns all submitted applications

### Update Application Status (Admin)
- **PUT** `/api/applications/:applicationId/status`
- Updates application status

## File Upload

- **Supported formats**: JPEG, PNG, GIF, PDF
- **Maximum file size**: 5MB per file
- **Upload location**: `/uploads` directory

## Project Structure

```
visa-application-portal/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── index.html             # Main HTML file
├── style.css              # Stylesheets
├── app.js                 # Frontend JavaScript
├── uploads/               # File upload directory
└── README.md              # This file
```

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

### Security Features
- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- File type validation
- File size limits
- CORS configuration

## Development

### Adding New Countries
Edit the country options in `index.html` and update the `getCountryName()` function in `app.js`.

### Adding New Visa Types
Edit the visa type options in `index.html` and update the `getVisaTypeName()` function in `app.js`.

### Customizing Styles
Modify `style.css` to change the appearance of the application.

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2
3. Configure reverse proxy (nginx/Apache)
4. Set up SSL/TLS certificates
5. Configure database for persistent storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and inquiries, please contact:
- Email: support@visaportal.com
- Phone: +1 (555) 123-4567

---

**Note**: This is a demonstration application. In production, you should:
- Use a proper database (MongoDB, PostgreSQL, etc.)
- Implement user authentication
- Add email notifications
- Set up proper logging
- Use a file storage service (AWS S3, etc.)
- Implement proper error handling and monitoring
