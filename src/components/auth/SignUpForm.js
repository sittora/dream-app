// Sign Up Form Component
document.addEventListener('DOMContentLoaded', () => {
    const template = `
        <div class="auth-modal" id="signUpModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="font-cinzel text-2xl text-burgundy mb-4">Begin Your Journey</h2>
                    <button class="close-modal">×</button>
                </div>
                <form id="signUpForm" class="space-y-4">
                    <div class="form-group">
                        <div class="input-group">
                            <input type="text" id="firstName" name="firstName" required
                                class="auth-input" placeholder=" ">
                            <label for="firstName" class="floating-label">First Name</label>
                            <div class="input-error"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="input-group">
                            <input type="text" id="lastName" name="lastName" required
                                class="auth-input" placeholder=" ">
                            <label for="lastName" class="floating-label">Last Name</label>
                            <div class="input-error"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="input-group">
                            <input type="email" id="email" name="email" required
                                class="auth-input" placeholder=" ">
                            <label for="email" class="floating-label">Email</label>
                            <div class="input-error"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="input-group">
                            <input type="password" id="password" name="password" required
                                class="auth-input" placeholder=" ">
                            <label for="password" class="floating-label">Password</label>
                            <button type="button" class="password-toggle">
                                <i class="fas fa-eye"></i>
                            </button>
                            <div class="input-error"></div>
                        </div>
                        <div class="password-strength-meter mt-2">
                            <div class="strength-bar"></div>
                            <p class="strength-text text-xs text-gray-400"></p>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="input-group">
                            <input type="password" id="confirmPassword" name="confirmPassword" required
                                class="auth-input" placeholder=" ">
                            <label for="confirmPassword" class="floating-label">Confirm Password</label>
                            <button type="button" class="password-toggle">
                                <i class="fas fa-eye"></i>
                            </button>
                            <div class="input-error"></div>
                        </div>
                    </div>

                    <div class="captcha-container" id="signUpCaptcha"></div>
                    
                    <button type="submit" class="btn-primary w-full">
                        <span>Create Account</span>
                        <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                    
                    <div class="divider">
                        <span>or</span>
                    </div>
                    
                    <div class="social-auth">
                        <button type="button" class="btn-social google">
                            <i class="fab fa-google"></i>
                            <span>Continue with Google</span>
                        </button>
                        <button type="button" class="btn-social apple">
                            <i class="fab fa-apple"></i>
                            <span>Continue with Apple</span>
                        </button>
                    </div>
                    
                    <p class="text-center text-gray-400 mt-4">
                        Already have an account? 
                        <button type="button" class="text-burgundy hover:text-burgundy/80 transition-colors" 
                            onclick="showSignIn()">Sign In</button>
                    </p>
                </form>
            </div>
        </div>
    `;

    // Insert template into DOM
    document.body.insertAdjacentHTML('beforeend', template);

    // Form validation and submission
    const form = document.getElementById('signUpForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    // Password strength checker
    function checkPasswordStrength(password) {
        let strength = 0;
        const feedback = [];

        if (password.length >= 8) {
            strength += 25;
            feedback.push('Length');
        }
        if (/[A-Z]/.test(password)) {
            strength += 25;
            feedback.push('Uppercase');
        }
        if (/[a-z]/.test(password)) {
            strength += 25;
            feedback.push('Lowercase');
        }
        if (/[0-9!@#$%^&*]/.test(password)) {
            strength += 25;
            feedback.push('Number/Special');
        }

        strengthBar.style.width = `${strength}%`;
        strengthBar.className = 'strength-bar';
        
        if (strength <= 25) {
            strengthBar.classList.add('weak');
            strengthText.textContent = 'Weak password';
        } else if (strength <= 50) {
            strengthBar.classList.add('fair');
            strengthText.textContent = 'Fair password';
        } else if (strength <= 75) {
            strengthBar.classList.add('good');
            strengthText.textContent = 'Good password';
        } else {
            strengthBar.classList.add('strong');
            strengthText.textContent = 'Strong password';
        }

        return strength;
    }

    // Password visibility toggle
    document.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Real-time password strength check
    passwordInput.addEventListener('input', (e) => {
        checkPasswordStrength(e.target.value);
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset previous errors
        form.querySelectorAll('.input-error').forEach(error => {
            error.textContent = '';
        });

        // Validate form
        let isValid = true;
        const errors = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email.value)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Password validation
        if (checkPasswordStrength(form.password.value) < 75) {
            errors.password = 'Password is not strong enough';
            isValid = false;
        }

        // Confirm password
        if (form.password.value !== form.confirmPassword.value) {
            errors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        // Display errors if any
        if (!isValid) {
            Object.keys(errors).forEach(field => {
                const errorDiv = form.querySelector(`#${field}`).nextElementSibling;
                errorDiv.textContent = errors[field];
            });
            return;
        }

        try {
            const formData = new FormData(form);
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData)),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            // Successful signup
            const result = await response.json();
            localStorage.setItem('token', result.token);
            window.location.href = '/profile'; // Redirect to profile completion
        } catch (error) {
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = error.message;
            form.insertBefore(errorDiv, form.firstChild);
        }
    });
});
