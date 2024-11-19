// Audio feedback for interactions
const hoverSound = new Audio('/sounds/hover.mp3');

// Authentication UI functions
window.showSignUp = function() {
    window.location.href = '/src/pages/signup.html';
};

window.showSignIn = function() {
    window.location.href = '/src/pages/login.html';
};

// Add hover sound effects to buttons
document.querySelectorAll('.btn-auth').forEach(button => {
    button.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.play().catch(err => {
            // Silently handle audio play errors
            console.log('Audio play prevented:', err);
        });
    });
});
