// Oracle Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const oracleForm = document.getElementById('oracleForm');
    const responseText = document.getElementById('oracleResponse');
    const symbolsGrid = document.getElementById('dreamSymbols');
    const crystalBall = document.querySelector('.crystal-ball');
    const timelineContainer = document.querySelector('.timeline-container');

    // Load past consultations from localStorage
    const consultations = JSON.parse(localStorage.getItem('consultations') || '[]');
    updateConsultationHistory();

    // Oracle wisdom database
    const wisdomDatabase = {
        patterns: [
            'The symbols in your dreams weave a tapestry of {symbol} and {symbol}, suggesting a deep connection with {theme}.',
            'The presence of {symbol} in your dreamscape indicates a journey toward {theme}.',
            'Your unconscious mind speaks through {symbol}, revealing hidden aspects of {theme}.',
            'The recurring theme of {symbol} suggests an exploration of {theme} in your spiritual journey.',
            'The interplay between {symbol} and {symbol} points to a transformation in your relationship with {theme}.'
        ],
        symbols: [
            'water', 'fire', 'air', 'earth', 'moon', 'sun', 'stars',
            'serpent', 'dragon', 'wolf', 'owl', 'raven', 'phoenix',
            'tree', 'mountain', 'cave', 'crystal', 'mirror', 'key',
            'door', 'bridge', 'path', 'garden', 'forest', 'ocean'
        ],
        themes: [
            'self-discovery', 'transformation', 'inner wisdom',
            'spiritual growth', 'emotional healing', 'creative expression',
            'divine feminine', 'sacred masculine', 'shadow integration',
            'ancestral connection', 'soul purpose', 'karmic patterns'
        ]
    };

    // Form submission handler
    oracleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const question = document.getElementById('question').value;

        // Animate crystal ball
        crystalBall.classList.add('active');
        await generateResponse(question);
        setTimeout(() => crystalBall.classList.remove('active'), 3000);
    });

    // Generate oracle response
    async function generateResponse(question) {
        // Show loading state
        responseText.innerHTML = '<p class="loading">The Oracle is contemplating...</p>';
        symbolsGrid.innerHTML = '';

        // Simulate delay for mystical effect
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Generate response
        const response = generateWisdom();
        
        // Store consultation
        const consultation = {
            id: Date.now(),
            question,
            response: response.message,
            symbols: response.symbols,
            timestamp: new Date().toISOString()
        };
        
        consultations.unshift(consultation);
        localStorage.setItem('consultations', JSON.stringify(
            consultations.slice(0, 10) // Keep only last 10 consultations
        ));

        // Update UI
        displayResponse(response);
        updateConsultationHistory();
    }

    // Generate wisdom message
    function generateWisdom() {
        const pattern = wisdomDatabase.patterns[Math.floor(Math.random() * wisdomDatabase.patterns.length)];
        const symbols = [];
        const themes = [];

        // Get random symbols and themes
        while (symbols.length < 3) {
            const symbol = wisdomDatabase.symbols[Math.floor(Math.random() * wisdomDatabase.symbols.length)];
            if (!symbols.includes(symbol)) symbols.push(symbol);
        }

        while (themes.length < 2) {
            const theme = wisdomDatabase.themes[Math.floor(Math.random() * wisdomDatabase.themes.length)];
            if (!themes.includes(theme)) themes.push(theme);
        }

        // Replace placeholders in pattern
        let message = pattern;
        let symbolIndex = 0;
        message = message.replace(/{symbol}/g, () => symbols[symbolIndex++]);
        message = message.replace(/{theme}/g, () => themes.shift());

        return {
            message,
            symbols
        };
    }

    // Display response and symbols
    function displayResponse(response) {
        // Update response text with fade effect
        responseText.style.opacity = '0';
        setTimeout(() => {
            responseText.innerHTML = `<p class="oracle-message">${response.message}</p>`;
            responseText.style.opacity = '1';
        }, 300);

        // Display symbols
        symbolsGrid.innerHTML = '';
        response.symbols.forEach(symbol => {
            const symbolElement = document.createElement('div');
            symbolElement.className = 'symbol-item';
            symbolElement.innerHTML = `
                <i class="fas fa-${getSymbolIcon(symbol)}"></i>
                <span>${symbol}</span>
            `;
            symbolsGrid.appendChild(symbolElement);
        });
    }

    // Update consultation history
    function updateConsultationHistory() {
        timelineContainer.innerHTML = '';
        
        if (consultations.length === 0) {
            timelineContainer.innerHTML = '<p class="placeholder">Your consultation history will appear here</p>';
            return;
        }

        consultations.forEach(consultation => {
            const entry = document.createElement('div');
            entry.className = 'timeline-entry';
            entry.innerHTML = `
                <div class="timeline-date">
                    ${new Date(consultation.timestamp).toLocaleDateString()}
                </div>
                <div class="timeline-content">
                    <h4>Question</h4>
                    <p class="question">${consultation.question}</p>
                    <h4>Oracle's Response</h4>
                    <p class="response">${consultation.response}</p>
                    <div class="timeline-symbols">
                        ${consultation.symbols.map(symbol => 
                            `<span class="symbol"><i class="fas fa-${getSymbolIcon(symbol)}"></i> ${symbol}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
            timelineContainer.appendChild(entry);
        });
    }

    // Get Font Awesome icon for symbol
    function getSymbolIcon(symbol) {
        const iconMap = {
            water: 'water',
            fire: 'fire',
            air: 'wind',
            earth: 'mountain',
            moon: 'moon',
            sun: 'sun',
            stars: 'stars',
            serpent: 'dragon',
            dragon: 'dragon',
            wolf: 'paw',
            owl: 'feather-alt',
            raven: 'crow',
            phoenix: 'fire-alt',
            tree: 'tree',
            mountain: 'mountain',
            cave: 'dungeon',
            crystal: 'gem',
            mirror: 'mirror',
            key: 'key',
            door: 'door-open',
            bridge: 'archway',
            path: 'road',
            garden: 'leaf',
            forest: 'tree',
            ocean: 'water'
        };

        return iconMap[symbol] || 'question-circle';
    }

    // Crystal ball ambient animation
    function animateCrystalBall() {
        const glow = document.querySelector('.crystal-glow');
        const reflections = document.querySelector('.crystal-reflections');
        
        // Random glow animation
        setInterval(() => {
            const hue = Math.random() * 60 - 30; // Slight color variation
            const blur = 20 + Math.random() * 10; // Random blur
            glow.style.filter = `hue-rotate(${hue}deg) blur(${blur}px)`;
        }, 2000);

        // Random reflections
        setInterval(() => {
            const rotation = Math.random() * 360;
            reflections.style.transform = `rotate(${rotation}deg)`;
        }, 3000);
    }

    // Initialize crystal ball animation
    animateCrystalBall();

    // Add sound effects
    let ambientSound;
    
    function playMysticSound() {
        // Implementation would depend on having actual sound files
        // This is just a placeholder for the concept
        console.log('Playing mystic sound effect');
    }

    function playAmbientSound() {
        // Implementation would depend on having actual sound files
        console.log('Playing ambient sound');
    }

    function stopAmbientSound() {
        if (ambientSound) {
            console.log('Stopping ambient sound');
        }
    }

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        stopAmbientSound();
    });
});
