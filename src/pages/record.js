// Record Dreams Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const dreamForm = document.getElementById('dreamRecordForm');
    const dreams = JSON.parse(localStorage.getItem('dreams') || '[]');

    // Initialize date input with current date
    const dreamDate = document.getElementById('dreamDate');
    const today = new Date().toISOString().split('T')[0];
    dreamDate.value = today;

    // Form submission handler
    dreamForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            title: document.getElementById('dreamTitle').value,
            date: document.getElementById('dreamDate').value,
            content: document.getElementById('dreamContent').value,
            mood: document.getElementById('dreamMood').value,
            symbols: document.getElementById('dreamSymbols').value
                .split(',')
                .map(symbol => symbol.trim())
                .filter(symbol => symbol.length > 0),
            dreamType: document.querySelector('input[name="dreamType"]:checked')?.value || 'unspecified',
            timestamp: new Date().toISOString()
        };

        // Save to local storage
        dreams.push(formData);
        localStorage.setItem('dreams', JSON.stringify(dreams));

        // Visual feedback
        showNotification('Dream recorded successfully!');
        dreamForm.reset();
        dreamDate.value = today;
    });

    // Add animation effects
    const icons = document.querySelectorAll('.header-icon i');
    icons.forEach(icon => {
        icon.addEventListener('mouseover', () => {
            icon.style.transform = 'scale(1.2) rotate(10deg)';
            icon.style.color = '#00ffff';
        });

        icon.addEventListener('mouseout', () => {
            icon.style.transform = 'scale(1) rotate(0deg)';
            icon.style.color = '';
        });
    });

    // Character counter for dream description
    const dreamContent = document.getElementById('dreamContent');
    dreamContent.addEventListener('input', () => {
        const remaining = 2000 - dreamContent.value.length;
        const counter = document.querySelector('.character-counter');
        if (!counter) {
            const counterElem = document.createElement('div');
            counterElem.className = 'character-counter';
            dreamContent.parentNode.appendChild(counterElem);
        }
        document.querySelector('.character-counter').textContent = 
            `${remaining} characters remaining`;
    });

    // Symbol suggestions
    const commonSymbols = [
        'Water', 'Fire', 'Earth', 'Air',
        'Snake', 'Bird', 'Wolf', 'Dragon',
        'Moon', 'Sun', 'Stars', 'Mountain',
        'Forest', 'Ocean', 'Cave', 'Bridge',
        'Door', 'Key', 'Mirror', 'Clock'
    ];

    const symbolsInput = document.getElementById('dreamSymbols');
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'symbol-suggestions';
    symbolsInput.parentNode.appendChild(suggestionsContainer);

    symbolsInput.addEventListener('input', () => {
        const currentSymbols = symbolsInput.value.split(',');
        const currentSymbol = currentSymbols[currentSymbols.length - 1].trim().toLowerCase();
        
        if (currentSymbol) {
            const matches = commonSymbols.filter(symbol => 
                symbol.toLowerCase().startsWith(currentSymbol)
            );
            
            showSuggestions(matches, currentSymbol);
        } else {
            suggestionsContainer.innerHTML = '';
        }
    });

    function showSuggestions(matches, currentInput) {
        suggestionsContainer.innerHTML = '';
        if (matches.length > 0) {
            matches.forEach(match => {
                const suggestion = document.createElement('div');
                suggestion.className = 'symbol-suggestion';
                suggestion.textContent = match;
                suggestion.addEventListener('click', () => {
                    const symbols = symbolsInput.value.split(',');
                    symbols.pop();
                    symbols.push(match);
                    symbolsInput.value = symbols.join(', ');
                    suggestionsContainer.innerHTML = '';
                });
                suggestionsContainer.appendChild(suggestion);
            });
        }
    }

    // Notification system
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});
