// Sign In Form Component
document.addEventListener('DOMContentLoaded', () => {
    const template = `
        <div class="auth-modal" id="signInModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="font-cinzel text-2xl text-burgundy mb-4">Welcome Back</h2>
                    <button class="close-modal">×</button>
                </div>
                <form id="signInForm" class="space-y-4">
                    <div class="form-group">
                        <div class="input-group">
                            <input type="email" id="signInEmail" name="email" required
                                class="auth-input" placeholder=" ">
                            <label for="signInEmail" class="floating-label">Email</label>
                            <div class="input-error"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="input-group">
                            <input type="password" id="signInPassword" name="password" required
                                class="auth-input" placeholder=" ">
                            <label for="signInPassword" class="floating-label">Password</label>
                            <button type="button" class="password-toggle">
                                <i class="fas fa-eye"></i>
                            </button>
                            <div class="input-error"></div>
                        </div>
                        <a href="/forgot-password" class="text-sm text-burgundy hover:text-burgundy/80 transition-colors">
                            Forgot Password?
                        </a>
                    </div>

                    <div class="captcha-container" id="signInCaptcha"></div>
                    
                    <button type="submit" class="btn-primary w-full">
                        <span>Sign In</span>
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
                        Don't have an account? 
                        <button type="button" class="text-burgundy hover:text-burgundy/80 transition-colors" 
                            onclick="showSignUp()">Sign Up</button>
                    </p>
                </form>
            </div>
        </div>
    `;

    // Insert template into DOM
    document.body.insertAdjacentHTML('beforeend', template);

    // Form handling
    const form = document.getElementById('signInForm');
    
    // Password visibility toggle
    document.querySelector('.password-toggle').addEventListener('click', () => {
        const input = document.getElementById('signInPassword');
        const icon = document.querySelector('.password-toggle i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset previous errors
        form.querySelectorAll('.input-error').forEach(error => {
            error.textContent = '';
        });

        try {
            const formData = new FormData(form);
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData)),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Invalid email or password');
            }

            // Successful login
            const result = await response.json();
            localStorage.setItem('token', result.token);
            window.location.href = '/dashboard';
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
