// Smooth scroll for navigation links
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

// Navbar background opacity on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 15, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
    }
});

// Feature card hover effects
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseover', () => {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.5)';
    });

    card.addEventListener('mouseout', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
    });
});

// Mobile menu toggle
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Add particle effect to hero background
function createParticle() {
    const particles = document.createElement('div');
    particles.className = 'particle';
    document.querySelector('.hero-background').appendChild(particles);
    
    const size = Math.random() * 3;
    const posX = Math.random() * window.innerWidth;
    const posY = Math.random() * window.innerHeight;
    const duration = 3000 + Math.random() * 4000;
    
    particles.style.width = `${size}px`;
    particles.style.height = `${size}px`;
    particles.style.left = `${posX}px`;
    particles.style.top = `${posY}px`;
    particles.style.animation = `float ${duration}ms linear infinite`;
    
    setTimeout(() => particles.remove(), duration);
}

// Create particles at intervals
setInterval(createParticle, 300);

// Button hover sound effect (optional)
const buttons = document.querySelectorAll('button');
const hoverSound = new Audio('/sounds/hover.mp3'); // Add your sound file

buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        if (hoverSound) {
            hoverSound.currentTime = 0;
            hoverSound.volume = 0.2;
            hoverSound.play().catch(() => {}); // Catch and ignore autoplay restrictions
        }
    });
});
