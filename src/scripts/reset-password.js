// Reset Password Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetPasswordForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    // Get reset token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (!token) {
        window.location.href = '/src/pages/forgot-password.html';
        return;
    }
    document.getElementById('token').value = token;

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

        // Password validation
        if (checkPasswordStrength(passwordInput.value) < 75) {
            errors.password = 'Password is not strong enough';
            isValid = false;
        }

        // Confirm password
        if (passwordInput.value !== confirmPasswordInput.value) {
            errors.confirmPassword = 'Passwords do not match';
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
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: form.token.value,
                    password: passwordInput.value
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to reset password');
            }

            // Show success message and redirect
            form.innerHTML = `
                <div class="success-message text-center">
                    <i class="fas fa-check-circle text-4xl text-green-500 mb-4"></i>
                    <h2 class="font-cinzel text-2xl mb-4">Password Reset Successful</h2>
                    <p class="text-gray-400 mb-6">
                        Your password has been successfully reset. 
                        You will be redirected to the login page in a few seconds.
                    </p>
                </div>
            `;

            // Redirect to login page after 3 seconds
            setTimeout(() => {
                window.location.href = '/src/pages/login.html';
            }, 3000);
        } catch (error) {
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = error.message;
            form.insertBefore(errorDiv, form.firstChild);
        }
    });
});
