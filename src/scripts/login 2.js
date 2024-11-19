// Login Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

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
        if (!form.password.value) {
            errors.password = 'Password is required';
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
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password'),
                    remember: formData.get('remember') === 'on'
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            // Successful login
            const result = await response.json();
            localStorage.setItem('token', result.token);
            
            // Redirect to dashboard or last visited page
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/src/pages/dashboard.html';
            window.location.href = redirectUrl;
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
