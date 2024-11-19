// DOM Elements
let authModal = null;
let currentForm = null;

// Create Modal
function createModal() {
    if (authModal) return;

    authModal = document.createElement('div');
    authModal.className = 'auth-modal';
    authModal.innerHTML = `
        <div class="auth-modal-content">
            <button class="auth-modal-close" onclick="closeAuthModal()">×</button>
            <div id="auth-form-container"></div>
        </div>
    `;

    document.body.appendChild(authModal);
}

// Close Modal
window.closeAuthModal = function() {
    if (authModal) {
        authModal.classList.remove('show');
        setTimeout(() => {
            if (authModal.parentNode) {
                authModal.parentNode.removeChild(authModal);
            }
            authModal = null;
        }, 300);
    }
};

// Show Sign In Form
window.showSignIn = function() {
    createModal();
    currentForm = 'signin';
    
    const container = document.getElementById('auth-form-container');
    container.innerHTML = `
        <div id="login-form" class="auth-form">
            <h2>Welcome Back</h2>
            <div class="social-buttons">
                <button class="social-btn google">
                    <img src="/assets/images/google-icon.svg" alt="Google">
                    Continue with Google
                </button>
                <button class="social-btn facebook">
                    <img src="/assets/images/facebook-icon.svg" alt="Facebook">
                    Continue with Facebook
                </button>
                <button class="social-btn twitter">
                    <img src="/assets/images/twitter-icon.svg" alt="Twitter">
                    Continue with Twitter
                </button>
            </div>
            <div class="divider">
                <span>or continue with email</span>
            </div>
            <form onsubmit="handleSignIn(event)">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-input">
                        <input type="password" id="password" required>
                        <button type="button" class="toggle-password" onclick="togglePassword(this)">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="form-group checkbox">
                    <input type="checkbox" id="remember">
                    <label for="remember">Remember me</label>
                    <a href="#" class="forgot-password" onclick="showForgotPassword()">Forgot password?</a>
                </div>
                <button type="submit" class="btn-submit">Sign In</button>
            </form>
            <p class="switch-form">
                Don't have an account? 
                <a href="#" onclick="showSignUp()">Create Account</a>
            </p>
        </div>
    `;
    
    setTimeout(() => {
        authModal.classList.add('show');
    }, 10);
};

// Show Sign Up Form
window.showSignUp = function() {
    createModal();
    currentForm = 'signup';
    
    const container = document.getElementById('auth-form-container');
    container.innerHTML = `
        <div id="register-form" class="auth-form">
            <h2>Create Account</h2>
            <div class="social-buttons">
                <button class="social-btn google">
                    <img src="/assets/images/google-icon.svg" alt="Google">
                    Continue with Google
                </button>
                <button class="social-btn facebook">
                    <img src="/assets/images/facebook-icon.svg" alt="Facebook">
                    Continue with Facebook
                </button>
                <button class="social-btn twitter">
                    <img src="/assets/images/twitter-icon.svg" alt="Twitter">
                    Continue with Twitter
                </button>
            </div>
            <div class="divider">
                <span>or continue with email</span>
            </div>
            <form onsubmit="handleSignUp(event)">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" required>
                </div>
                <div class="form-group">
                    <label for="signup-email">Email</label>
                    <input type="email" id="signup-email" required>
                </div>
                <div class="form-group">
                    <label for="signup-password">Password</label>
                    <div class="password-input">
                        <input type="password" id="signup-password" required>
                        <button type="button" class="toggle-password" onclick="togglePassword(this)">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <div class="password-strength"></div>
                </div>
                <div class="form-group">
                    <label for="confirm-password">Confirm Password</label>
                    <div class="password-input">
                        <input type="password" id="confirm-password" required>
                        <button type="button" class="toggle-password" onclick="togglePassword(this)">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="form-group checkbox">
                    <input type="checkbox" id="terms" required>
                    <label for="terms">
                        I accept the <a href="/terms">terms and conditions</a>
                    </label>
                </div>
                <button type="submit" class="btn-submit">Create Account</button>
            </form>
            <p class="switch-form">
                Already have an account? 
                <a href="#" onclick="showSignIn()">Sign In</a>
            </p>
        </div>
    `;
    
    setTimeout(() => {
        authModal.classList.add('show');
    }, 10);
};

// Show Forgot Password Form
window.showForgotPassword = function() {
    const container = document.getElementById('auth-form-container');
    container.innerHTML = `
        <div id="forgot-password-form" class="auth-form">
            <h2>Reset Password</h2>
            <p class="form-description">
                Enter your email address and we'll send you instructions to reset your password.
            </p>
            <form onsubmit="handleForgotPassword(event)">
                <div class="form-group">
                    <label for="reset-email">Email</label>
                    <input type="email" id="reset-email" required>
                </div>
                <button type="submit" class="btn-submit">Send Reset Instructions</button>
            </form>
            <p class="switch-form">
                Remember your password? 
                <a href="#" onclick="showSignIn()">Sign In</a>
            </p>
        </div>
    `;
};

// Toggle Password Visibility
window.togglePassword = function(button) {
    const input = button.parentElement.querySelector('input');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
};

// Handle Form Submissions
window.handleSignIn = async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    try {
        // Add your sign in logic here
        console.log('Sign in:', { email, password, remember });
    } catch (error) {
        console.error('Sign in error:', error);
    }
};

window.handleSignUp = async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const terms = document.getElementById('terms').checked;

    if (password !== confirmPassword) {
        alert("Passwords don't match");
        return;
    }

    try {
        // Add your sign up logic here
        console.log('Sign up:', { username, email, password, terms });
    } catch (error) {
        console.error('Sign up error:', error);
    }
};

window.handleForgotPassword = async function(event) {
    event.preventDefault();
    const email = document.getElementById('reset-email').value;

    try {
        // Add your password reset logic here
        console.log('Password reset:', { email });
    } catch (error) {
        console.error('Password reset error:', error);
    }
};
