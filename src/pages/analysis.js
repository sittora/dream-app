// Jungian Analysis Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Archetype cards animation
    const archetypeCards = document.querySelectorAll('.archetype-card');
    
    archetypeCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Create glowing effect
            card.style.boxShadow = '0 0 20px #00ffff';
            card.style.transform = 'translateY(-10px)';
            
            // Animate icon
            const icon = card.querySelector('i');
            icon.style.transform = 'rotate(360deg) scale(1.2)';
            icon.style.color = '#00ffff';
        });

        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = '';
            card.style.transform = '';
            
            const icon = card.querySelector('i');
            icon.style.transform = '';
            icon.style.color = '';
        });
    });

    // Tool cards functionality
    const toolCards = document.querySelectorAll('.tool-card');
    
    // Symbol Dictionary
    const symbolDictionary = {
        water: {
            meaning: 'Emotions, unconscious mind, purification',
            associations: ['feelings', 'intuition', 'depth'],
            archetype: 'The Great Mother'
        },
        fire: {
            meaning: 'Transformation, passion, spiritual energy',
            associations: ['rebirth', 'destruction', 'purification'],
            archetype: 'The Creator'
        },
        // Add more symbols as needed
    };

    toolCards.forEach(card => {
        const button = card.querySelector('.btn-feature');
        
        button.addEventListener('click', () => {
            const toolType = card.querySelector('h3').textContent;
            
            switch(toolType) {
                case 'Symbol Dictionary':
                    openSymbolDictionary();
                    break;
                case 'Pattern Recognition':
                    analyzePatterns();
                    break;
                case 'Archetype Analysis':
                    startArchetypeAnalysis();
                    break;
                case 'Personal Journey':
                    viewPersonalJourney();
                    break;
            }
        });
    });

    // Mandala meditation functionality
    const mandalaCircle = document.querySelector('.mandala-circle');
    const meditationButton = document.querySelector('.mandala-meditation button');
    let meditationActive = false;
    let rotationInterval;

    meditationButton.addEventListener('click', () => {
        if (!meditationActive) {
            startMeditation();
        } else {
            stopMeditation();
        }
    });

    function startMeditation() {
        meditationActive = true;
        meditationButton.textContent = 'End Meditation';
        mandalaCircle.classList.add('active');
        
        // Start rotating animation
        let rotation = 0;
        rotationInterval = setInterval(() => {
            rotation += 0.5;
            mandalaCircle.style.transform = `rotate(${rotation}deg)`;
        }, 50);

        // Add ambient sound
        playMeditationSound();
    }

    function stopMeditation() {
        meditationActive = false;
        meditationButton.textContent = 'Begin Meditation';
        mandalaCircle.classList.remove('active');
        clearInterval(rotationInterval);
        stopMeditationSound();
    }

    // Tool-specific functions
    function openSymbolDictionary() {
        const modal = createModal('Symbol Dictionary');
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search for a symbol...';
        modal.content.appendChild(searchInput);

        const resultsList = document.createElement('div');
        resultsList.className = 'symbol-results';
        modal.content.appendChild(resultsList);

        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            resultsList.innerHTML = '';

            Object.entries(symbolDictionary)
                .filter(([symbol]) => symbol.includes(searchTerm))
                .forEach(([symbol, data]) => {
                    const symbolEntry = document.createElement('div');
                    symbolEntry.className = 'symbol-entry';
                    symbolEntry.innerHTML = `
                        <h4>${symbol.charAt(0).toUpperCase() + symbol.slice(1)}</h4>
                        <p><strong>Meaning:</strong> ${data.meaning}</p>
                        <p><strong>Associations:</strong> ${data.associations.join(', ')}</p>
                        <p><strong>Archetype:</strong> ${data.archetype}</p>
                    `;
                    resultsList.appendChild(symbolEntry);
                });
        });
    }

    function analyzePatterns() {
        const dreams = JSON.parse(localStorage.getItem('dreams') || '[]');
        const modal = createModal('Pattern Analysis');

        if (dreams.length === 0) {
            modal.content.innerHTML = '<p>No dreams recorded yet. Start journaling to analyze patterns.</p>';
            return;
        }

        // Analyze symbols frequency
        const symbolFrequency = {};
        dreams.forEach(dream => {
            dream.symbols.forEach(symbol => {
                symbolFrequency[symbol] = (symbolFrequency[symbol] || 0) + 1;
            });
        });

        // Create visualization
        const chartContainer = document.createElement('div');
        chartContainer.className = 'pattern-chart';
        Object.entries(symbolFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([symbol, count]) => {
                const bar = document.createElement('div');
                bar.className = 'frequency-bar';
                bar.style.width = `${count * 50}px`;
                bar.innerHTML = `<span>${symbol}: ${count}</span>`;
                chartContainer.appendChild(bar);
            });

        modal.content.appendChild(chartContainer);
    }

    function startArchetypeAnalysis() {
        const modal = createModal('Archetype Analysis');
        const archetypes = ['Shadow', 'Anima', 'Animus', 'Self', 'Wise Old Man/Woman', 'Trickster'];
        
        const form = document.createElement('form');
        form.innerHTML = `
            <p>Select the archetypes that appear in your recent dreams:</p>
            ${archetypes.map(archetype => `
                <label class="archetype-checkbox">
                    <input type="checkbox" name="archetype" value="${archetype}">
                    ${archetype}
                </label>
            `).join('')}
            <button type="submit">Analyze</button>
        `;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const selectedArchetypes = Array.from(form.querySelectorAll('input:checked'))
                .map(input => input.value);
            
            if (selectedArchetypes.length === 0) {
                showNotification('Please select at least one archetype');
                return;
            }

            // Generate analysis
            const analysis = generateArchetypeAnalysis(selectedArchetypes);
            modal.content.innerHTML = analysis;
        });

        modal.content.appendChild(form);
    }

    function viewPersonalJourney() {
        const dreams = JSON.parse(localStorage.getItem('dreams') || '[]');
        const modal = createModal('Personal Journey');

        if (dreams.length === 0) {
            modal.content.innerHTML = '<p>Begin your journey by recording your dreams.</p>';
            return;
        }

        const timeline = document.createElement('div');
        timeline.className = 'journey-timeline';

        dreams.forEach(dream => {
            const entry = document.createElement('div');
            entry.className = 'journey-entry';
            entry.innerHTML = `
                <div class="journey-date">${new Date(dream.date).toLocaleDateString()}</div>
                <div class="journey-content">
                    <h4>${dream.title}</h4>
                    <p>${dream.content.substring(0, 100)}...</p>
                    <div class="journey-symbols">${dream.symbols.join(', ')}</div>
                </div>
            `;
            timeline.appendChild(entry);
        });

        modal.content.appendChild(timeline);
    }

    // Utility functions
    function createModal(title) {
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-content"></div>
        `;

        modalContainer.appendChild(modal);
        document.body.appendChild(modalContainer);

        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modalContainer.remove();
        });

        return {
            container: modalContainer,
            content: modal.querySelector('.modal-content')
        };
    }

    function generateArchetypeAnalysis(archetypes) {
        const analysisTemplate = {
            Shadow: {
                description: 'The Shadow represents the aspects of yourself that you tend to reject or deny.',
                suggestion: 'Pay attention to characters or situations in your dreams that provoke strong negative emotions.'
            },
            Anima: {
                description: 'The Anima represents the feminine aspects within the masculine psyche.',
                suggestion: 'Notice how feminine figures or qualities appear in your dreams and what they might represent.'
            },
            Animus: {
                description: 'The Animus represents the masculine aspects within the feminine psyche.',
                suggestion: 'Observe how masculine figures or qualities manifest in your dreams and their significance.'
            },
            Self: {
                description: 'The Self represents the unity of the conscious and unconscious, often appearing as a divine child, mandala, or wise figure.',
                suggestion: 'Look for symbols of wholeness or completion in your dreams.'
            }
        };

        return `
            <div class="archetype-analysis">
                ${archetypes.map(archetype => `
                    <div class="archetype-section">
                        <h4>${archetype}</h4>
                        <p>${analysisTemplate[archetype]?.description || 'Analysis coming soon.'}</p>
                        <p><strong>Suggestion:</strong> ${analysisTemplate[archetype]?.suggestion || 'Keep recording your dreams to reveal patterns.'}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});
