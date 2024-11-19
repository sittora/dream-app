// Forgot Password Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotPasswordForm');

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
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: form.email.value
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to send reset instructions');
            }

            // Show success message
            form.innerHTML = `
                <div class="success-message text-center">
                    <i class="fas fa-check-circle text-4xl text-green-500 mb-4"></i>
                    <h2 class="font-cinzel text-2xl mb-4">Reset Instructions Sent</h2>
                    <p class="text-gray-400 mb-6">
                        We've sent password reset instructions to your email address. 
                        Please check your inbox and follow the instructions to reset your password.
                    </p>
                    <p class="text-gray-400">
                        Didn't receive the email? 
                        <a href="#" class="text-purple-400 hover:text-purple-300" onclick="window.location.reload()">Try again</a>
                    </p>
                </div>
            `;
        } catch (error) {
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = error.message;
            form.insertBefore(errorDiv, form.firstChild);
        }
    });
});
