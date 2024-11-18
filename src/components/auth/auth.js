// Authentication Controller
// Modal state management
let currentModal = null;

// Show modal function
function showModal(modalId) {
    if (currentModal) {
        currentModal.remove();
    }
    const modal = document.querySelector(modalId);
    if (modal) {
        modal.style.display = 'flex';
        currentModal = modal;
    }
}

// Close modal function
function closeModal() {
    if (currentModal) {
        currentModal.remove();
        currentModal = null;
    }
}

// Initialize reCAPTCHA
function initCaptcha(containerId) {
    try {
        // Replace with your reCAPTCHA site key
        grecaptcha.render(containerId, {
            'sitekey': 'YOUR_RECAPTCHA_SITE_KEY',
            'theme': 'dark'
        });
    } catch (error) {
        console.error('reCAPTCHA initialization failed:', error);
    }
}

// Show sign up modal
window.showSignUp = async () => {
    const response = await fetch('/src/components/auth/SignUpForm.js');
    const template = await response.text();
    document.body.insertAdjacentHTML('beforeend', template);
    showModal('#signUpModal');
    try {
        initCaptcha('signUpCaptcha');
    } catch (error) {
        console.warn('CAPTCHA not initialized:', error);
    }
};

// Show sign in modal
window.showSignIn = async () => {
    const response = await fetch('/src/components/auth/SignInForm.js');
    const template = await response.text();
    document.body.insertAdjacentHTML('beforeend', template);
    showModal('#signInModal');
    try {
        initCaptcha('signInCaptcha');
    } catch (error) {
        console.warn('CAPTCHA not initialized:', error);
    }
};

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (currentModal && e.target.classList.contains('auth-modal')) {
        closeModal();
    }
});

// Close modal when pressing escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentModal) {
        closeModal();
    }
});

// Close button handler
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-modal')) {
        closeModal();
    }
});

// Social authentication configuration
const socialAuthConfig = {
    google: {
        client_id: 'YOUR_GOOGLE_CLIENT_ID',
        scope: 'email profile'
    },
    apple: {
        client_id: 'YOUR_APPLE_CLIENT_ID',
        scope: 'email name'
    }
};

// Initialize social authentication
function initSocialAuth() {
    // Google Sign-In
    if (window.gapi) {
        window.gapi.load('auth2', () => {
            window.gapi.auth2.init(socialAuthConfig.google);
        });
    }

    // Apple Sign-In (if available)
    if (window.AppleID) {
        window.AppleID.auth.init(socialAuthConfig.apple);
    }
}

// Load social auth SDKs
function loadSocialSDKs() {
    // Load Google SDK
    const googleScript = document.createElement('script');
    googleScript.src = 'https://apis.google.com/js/platform.js';
    googleScript.async = true;
    document.head.appendChild(googleScript);

    // Load Apple SDK (if needed)
    const appleScript = document.createElement('script');
    appleScript.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    appleScript.async = true;
    document.head.appendChild(appleScript);
}

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadSocialSDKs();
    setTimeout(initSocialAuth, 1000); // Give SDKs time to load
});
