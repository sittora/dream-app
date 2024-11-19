// Button Ripple Effect
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn-ripple');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.offsetLeft;
            const y = e.clientY - e.target.offsetTop;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Loading State Management
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('btn-loading');
        button.setAttribute('disabled', 'disabled');
        // Store original text
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '';
    } else {
        button.classList.remove('btn-loading');
        button.removeAttribute('disabled');
        // Restore original text
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        }
    }
}

// Button hover and click effects with sound
class SoundManager {
    constructor() {
        this.initialized = false;
        this.context = null;
        this.gainNode = null;
        this.oscillator = null;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            // Create audio context
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain node for volume control
            this.gainNode = this.context.createGain();
            this.gainNode.gain.value = 0.05; // Very quiet
            this.gainNode.connect(this.context.destination);
            
            this.initialized = true;
        } catch (error) {
            console.log('Sound system initialization failed:', error.message);
        }
    }

    async playClick() {
        if (!this.initialized || !this.context) return;

        try {
            // Create and configure oscillator
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.context.currentTime);
            
            // Connect to gain node
            osc.connect(this.gainNode);
            
            // Schedule the click sound
            osc.start(this.context.currentTime);
            osc.stop(this.context.currentTime + 0.05); // Very short duration
            
            // Cleanup
            osc.onended = () => {
                osc.disconnect();
            };
        } catch (error) {
            console.log('Click sound playback failed:', error.message);
        }
    }
}

// Create a single instance of SoundManager
const soundManager = new SoundManager();

// Add hover effect and sound to buttons
function addButtonEffects(button) {
    let isInitialized = false;

    const initializeAudio = async (event) => {
        if (!isInitialized && event.isTrusted) {
            isInitialized = true;
            await soundManager.initialize();
        }
    };

    // Handle hover effects
    button.addEventListener('mouseenter', async (event) => {
        await initializeAudio(event);
        button.style.transform = 'scale(1.05)';
        soundManager.playClick();
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });

    // Handle click effects
    button.addEventListener('click', async (event) => {
        await initializeAudio(event);
        button.style.transform = 'scale(0.95)';
        soundManager.playClick();
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Add effects to all buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(addButtonEffects);

        // Add effects to other clickable elements
        const clickableElements = document.querySelectorAll('.clickable');
        clickableElements.forEach(addButtonEffects);
    } catch (error) {
        console.log('Initialization error:', error.message);
    }
});
