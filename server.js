const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'));
        }
    }
});

// In-memory storage for applications (in production, use a database)
let applications = new Map();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Submit visa application
app.post('/api/submit-application', upload.fields([
    { name: 'passportCopy', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'additionalDocs', maxCount: 5 }
]), (req, res) => {
    try {
        const applicationId = 'VISA' + Date.now().toString().slice(-8);
        
        const applicationData = {
            id: applicationId,
            personalInfo: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                dateOfBirth: req.body.dateOfBirth,
                nationality: req.body.nationality,
                passportNumber: req.body.passportNumber,
                passportExpiry: req.body.passportExpiry
            },
            travelDetails: {
                destinationCountry: req.body.destinationCountry,
                visaType: req.body.visaType,
                departureDate: req.body.departureDate,
                returnDate: req.body.returnDate,
                purpose: req.body.purpose
            },
            documents: {
                passportCopy: req.files.passportCopy ? req.files.passportCopy[0].filename : null,
                photo: req.files.photo ? req.files.photo[0].filename : null,
                additionalDocs: req.files.additionalDocs ? req.files.additionalDocs.map(f => f.filename) : []
            },
            submittedDate: new Date().toISOString(),
            status: 'submitted',
            processingTime: '5-7 business days'
        };

        applications.set(applicationId, applicationData);

        res.json({
            success: true,
            applicationId: applicationId,
            message: 'Application submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting application'
        });
    }
});

// Track application status
app.get('/api/track-application/:applicationId', (req, res) => {
    const applicationId = req.params.applicationId;
    const application = applications.get(applicationId);

    if (application) {
        res.json({
            success: true,
            application: application
        });
    } else {
        // Return demo data for non-existent applications
        const demoData = {
            id: applicationId,
            status: 'processing',
            submittedDate: new Date().toISOString(),
            processingTime: '5-7 business days'
        };
        res.json({
            success: true,
            application: demoData
        });
    }
});

// Get all applications (admin endpoint)
app.get('/api/applications', (req, res) => {
    const allApplications = Array.from(applications.values());
    res.json({
        success: true,
        applications: allApplications
    });
});

// Update application status (admin endpoint)
app.put('/api/applications/:applicationId/status', (req, res) => {
    const applicationId = req.params.applicationId;
    const { status } = req.body;
    
    const application = applications.get(applicationId);
    if (application) {
        application.status = status;
        applications.set(applicationId, application);
        res.json({
            success: true,
            message: 'Application status updated successfully'
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Application not found'
        });
    }
});

// Serve uploaded files
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({
            success: false,
            message: 'File not found'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.'
            });
        }
    }
    
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Visa Application Portal server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to access the application`);
});

module.exports = app;
