// Signup Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
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

        // Terms agreement
        if (!form.terms.checked) {
            errors.terms = 'You must agree to the Terms of Service';
            isValid = false;
        }

        // Display errors if any
        if (!isValid) {
            Object.keys(errors).forEach(field => {
                const errorDiv = form.querySelector(`#${field}`).nextElementSibling;
                if (errorDiv) {
                    errorDiv.textContent = errors[field];
                }
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
                throw new Error(error.message || 'Registration failed');
            }

            // Successful signup
            const result = await response.json();
            localStorage.setItem('token', result.token);
            window.location.href = '/src/pages/onboarding.html';
        } catch (error) {
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = error.message;
            form.insertBefore(errorDiv, form.firstChild);
        }
    });

    // Social authentication handlers
    document.querySelectorAll('.btn-social').forEach(button => {
        button.addEventListener('click', async () => {
            const provider = button.classList.contains('google') ? 'google' : 'apple';
            try {
                window.location.href = `/api/auth/${provider}`;
            } catch (error) {
                console.error(`${provider} authentication failed:`, error);
            }
        });
    });
});
