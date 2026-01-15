// Global variables
let currentStep = 1;
const totalSteps = 4;
let formData = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupFormValidation();
    setupFileUpload();
    setupMobileMenu();
    updateProgressBar();
    updateNavigationButtons();
}

// Navigation functionality
function setupNavigation() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Mobile menu toggle
function setupMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// Form step management
function changeStep(direction) {
    if (direction === 1 && !validateCurrentStep()) {
        return;
    }
    
    // Save current step data
    saveStepData(currentStep);
    
    // Hide current step
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (currentStepElement) {
        currentStepElement.classList.remove('active');
    }
    
    // Update current step
    currentStep += direction;
    
    // Show new step
    const newStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (newStepElement) {
        newStepElement.classList.add('active');
        newStepElement.classList.add('fade-in');
    }
    
    // Update progress bar and navigation
    updateProgressBar();
    updateNavigationButtons();
    
    // If moving to review step, populate review data
    if (currentStep === 4) {
        populateReviewData();
    }
}

function updateProgressBar() {
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber === currentStep) {
            step.classList.add('active');
        } else if (stepNumber < currentStep) {
            step.classList.add('completed');
        }
    });
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Hide previous button on first step
    if (prevBtn) {
        prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
    }
    
    // Show/hide next and submit buttons
    if (nextBtn && submitBtn) {
        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }
}

// Form validation
function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showError(field, 'This field is required');
            isValid = false;
        } else {
            clearError(field);
        }
        
        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                showError(field, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && field.value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(field.value)) {
                showError(field, 'Please enter a valid phone number');
                isValid = false;
            }
        }
        
        // Date validation for passport expiry
        if (field.id === 'passportExpiry' && field.value) {
            const expiryDate = new Date(field.value);
            const today = new Date();
            if (expiryDate <= today) {
                showError(field, 'Passport must be valid for at least 6 months');
                isValid = false;
            }
        }
        
        // Date validation for travel dates
        if (field.id === 'departureDate' && field.value) {
            const departureDate = new Date(field.value);
            const today = new Date();
            if (departureDate <= today) {
                showError(field, 'Departure date must be in the future');
                isValid = false;
            }
        }
        
        if (field.id === 'returnDate' && field.value) {
            const returnDate = new Date(field.value);
            const departureDate = new Date(document.getElementById('departureDate').value);
            if (returnDate <= departureDate) {
                showError(field, 'Return date must be after departure date');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

function showError(field, message) {
    clearError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#dc3545';
}

function clearError(field) {
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '#e9ecef';
}

function setupFormValidation() {
    const form = document.getElementById('visaForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateCurrentStep()) {
                return;
            }
            
            // Check terms and conditions
            const termsCheckbox = document.getElementById('terms');
            if (!termsCheckbox.checked) {
                showError(termsCheckbox, 'You must agree to the terms and conditions');
                return;
            }
            
            // Submit form
            submitApplication();
        });
    }
}

// File upload functionality
function setupFileUpload() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            const label = this.nextElementSibling;
            
            if (file) {
                const fileName = file.name;
                const fileSize = (file.size / 1024 / 1024).toFixed(2);
                
                label.innerHTML = `
                    <i class="fas fa-check-circle" style="color: #28a745;"></i>
                    <span>${fileName} (${fileSize} MB)</span>
                `;
                
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showError(this, 'File size must be less than 5MB');
                    this.value = '';
                    label.innerHTML = `
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span>Click to upload or drag and drop</span>
                    `;
                }
            }
        });
    });
}

// Data management
function saveStepData(step) {
    const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
    const inputs = stepElement.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            formData[input.name] = input.checked;
        } else {
            formData[input.name] = input.value;
        }
    });
}

function populateReviewData() {
    // Personal Information Review
    const personalReview = document.getElementById('reviewPersonal');
    if (personalReview) {
        personalReview.innerHTML = `
            <p><strong>Name:</strong> ${formData.firstName || ''} ${formData.lastName || ''}</p>
            <p><strong>Email:</strong> ${formData.email || ''}</p>
            <p><strong>Phone:</strong> ${formData.phone || ''}</p>
            <p><strong>Date of Birth:</strong> ${formatDate(formData.dateOfBirth) || ''}</p>
            <p><strong>Nationality:</strong> ${getCountryName(formData.nationality) || ''}</p>
            <p><strong>Passport Number:</strong> ${formData.passportNumber || ''}</p>
            <p><strong>Passport Expiry:</strong> ${formatDate(formData.passportExpiry) || ''}</p>
        `;
    }
    
    // Travel Details Review
    const travelReview = document.getElementById('reviewTravel');
    if (travelReview) {
        travelReview.innerHTML = `
            <p><strong>Destination Country:</strong> ${getCountryName(formData.destinationCountry) || ''}</p>
            <p><strong>Visa Type:</strong> ${getVisaTypeName(formData.visaType) || ''}</p>
            <p><strong>Departure Date:</strong> ${formatDate(formData.departureDate) || ''}</p>
            <p><strong>Return Date:</strong> ${formatDate(formData.returnDate) || ''}</p>
            <p><strong>Purpose of Visit:</strong> ${formData.purpose || ''}</p>
        `;
    }
    
    // Documents Review
    const documentsReview = document.getElementById('reviewDocuments');
    if (documentsReview) {
        const passportCopy = document.getElementById('passportCopy').files[0];
        const photo = document.getElementById('photo').files[0];
        const additionalDocs = document.getElementById('additionalDocs').files;
        
        let documentsHTML = '';
        if (passportCopy) documentsHTML += `<p><strong>Passport Copy:</strong> ${passportCopy.name}</p>`;
        if (photo) documentsHTML += `<p><strong>Passport Photo:</strong> ${photo.name}</p>`;
        if (additionalDocs.length > 0) {
            documentsHTML += `<p><strong>Additional Documents:</strong> ${additionalDocs.length} file(s)</p>`;
        }
        
        documentsReview.innerHTML = documentsHTML || '<p>No documents uploaded</p>';
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getCountryName(countryCode) {
    const countries = {
        'US': 'United States',
        'UK': 'United Kingdom',
        'CA': 'Canada',
        'AU': 'Australia',
        'IN': 'India',
        'CN': 'China',
        'JP': 'Japan',
        'DE': 'Germany',
        'FR': 'France',
        'IT': 'Italy',
        'ES': 'Spain',
        'BR': 'Brazil',
        'MX': 'Mexico',
        'RU': 'Russia',
        'SA': 'Saudi Arabia'
    };
    return countries[countryCode] || countryCode;
}

function getVisaTypeName(visaType) {
    const visaTypes = {
        'tourist': 'Tourist Visa',
        'business': 'Business Visa',
        'student': 'Student Visa',
        'work': 'Work Visa',
        'transit': 'Transit Visa',
        'medical': 'Medical Visa'
    };
    return visaTypes[visaType] || visaType;
}

// Application submission
async function submitApplication() {
    try {
        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
        submitBtn.disabled = true;

        // Create FormData for file upload
        const formData = new FormData();
        
        // Add personal information
        formData.append('firstName', document.getElementById('firstName').value);
        formData.append('lastName', document.getElementById('lastName').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('phone', document.getElementById('phone').value);
        formData.append('dateOfBirth', document.getElementById('dateOfBirth').value);
        formData.append('nationality', document.getElementById('nationality').value);
        formData.append('passportNumber', document.getElementById('passportNumber').value);
        formData.append('passportExpiry', document.getElementById('passportExpiry').value);
        
        // Add travel details
        formData.append('destinationCountry', document.getElementById('destinationCountry').value);
        formData.append('visaType', document.getElementById('visaType').value);
        formData.append('departureDate', document.getElementById('departureDate').value);
        formData.append('returnDate', document.getElementById('returnDate').value);
        formData.append('purpose', document.getElementById('purpose').value);
        
        // Add files
        const passportCopy = document.getElementById('passportCopy').files[0];
        const photo = document.getElementById('photo').files[0];
        const additionalDocs = document.getElementById('additionalDocs').files;
        
        if (passportCopy) formData.append('passportCopy', passportCopy);
        if (photo) formData.append('photo', photo);
        for (let i = 0; i < additionalDocs.length; i++) {
            formData.append('additionalDocs', additionalDocs[i]);
        }

        // Send to server
        const response = await fetch('/api/submit-application', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showSuccessMessage(result.applicationId);
        } else {
            throw new Error(result.message || 'Submission failed');
        }

    } catch (error) {
        console.error('Error submitting application:', error);
        alert('Error submitting application: ' + error.message);
        
        // Reset button state
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.innerHTML = 'Submit Application';
        submitBtn.disabled = false;
    }
}

function showSuccessMessage(applicationId) {
    const form = document.getElementById('visaForm');
    form.innerHTML = `
        <div class="success-message" style="display: block; text-align: center; padding: 2rem;">
            <i class="fas fa-check-circle" style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;"></i>
            <h2>Application Submitted Successfully!</h2>
            <p>Your application has been received and is being processed.</p>
            <p><strong>Application ID:</strong> ${applicationId}</p>
            <p>Please save this ID for tracking your application status.</p>
            <button class="btn btn-primary" onclick="window.location.reload()">Submit Another Application</button>
            <button class="btn btn-secondary" onclick="scrollToSection('track')">Track Application</button>
        </div>
    `;
}

// Application tracking
async function trackApplication() {
    const applicationId = document.getElementById('applicationId').value.trim();
    
    if (!applicationId) {
        alert('Please enter an application ID');
        return;
    }
    
    try {
        // Show loading state
        const trackBtn = document.querySelector('.track-form .btn');
        const originalText = trackBtn.innerHTML;
        trackBtn.innerHTML = '<span class="loading"></span> Tracking...';
        trackBtn.disabled = true;

        // Fetch from server
        const response = await fetch(`/api/track-application/${applicationId}`);
        const result = await response.json();

        if (result.success) {
            displayApplicationStatus(result.application);
        } else {
            throw new Error(result.message || 'Tracking failed');
        }

    } catch (error) {
        console.error('Error tracking application:', error);
        alert('Error tracking application: ' + error.message);
        
        // Reset button state
        const trackBtn = document.querySelector('.track-form .btn');
        trackBtn.innerHTML = 'Track Status';
        trackBtn.disabled = false;
    }
}

function displayApplicationStatus(data) {
    const trackResult = document.getElementById('trackResult');
    const statusId = document.getElementById('statusId');
    const statusText = document.getElementById('statusText');
    const statusDate = document.getElementById('statusDate');
    const statusProcessing = document.getElementById('statusProcessing');
    
    // Update status display
    statusId.textContent = data.id;
    statusText.textContent = getStatusText(data.status);
    statusDate.textContent = formatDate(data.submittedDate);
    statusProcessing.textContent = data.processingTime || '5-7 business days';
    
    // Show result
    trackResult.style.display = 'block';
    trackResult.classList.add('fade-in');
}

function getStatusText(status) {
    const statusMap = {
        'submitted': 'Submitted - Under Review',
        'processing': 'Processing - Verification in Progress',
        'approved': 'Approved - Visa Ready',
        'rejected': 'Rejected - Please Contact Support'
    };
    return statusMap[status] || status;
}

// Additional utility functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone);
}

function validateDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// Initialize tooltips and other interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to form elements
    const formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        element.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
});

// Export functions for global access
window.scrollToSection = scrollToSection;
window.changeStep = changeStep;
window.trackApplication = trackApplication;