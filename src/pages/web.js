// Dream Web Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const dreams = JSON.parse(localStorage.getItem('dreams') || '[]');
    const timeRange = document.getElementById('timeRange');
    const connectionType = document.getElementById('connectionType');
    const visualizationType = document.getElementById('visualizationType');
    const dreamWeb = document.getElementById('dreamWeb');
    
    let simulation;
    let svg;

    // Initialize visualization
    function initializeVisualization() {
        // Clear previous visualization
        dreamWeb.innerHTML = '';

        // Create SVG container
        svg = d3.select('#dreamWeb')
            .append('svg')
            .attr('width', '100%')
            .attr('height', '600px');

        // Get filtered data based on time range
        const filteredDreams = filterDreamsByTimeRange(dreams, timeRange.value);
        
        // Create nodes and links based on connection type
        const { nodes, links } = createGraphData(filteredDreams, connectionType.value);

        // Create visualization based on type
        switch(visualizationType.value) {
            case 'force':
                createForceDirectedGraph(nodes, links);
                break;
            case 'radial':
                createRadialGraph(nodes, links);
                break;
            case 'cluster':
                createHierarchicalGraph(nodes, links);
                break;
        }
    }

    // Filter dreams based on time range
    function filterDreamsByTimeRange(dreams, range) {
        const now = new Date();
        const cutoff = new Date();

        switch(range) {
            case 'week':
                cutoff.setDate(now.getDate() - 7);
                break;
            case 'month':
                cutoff.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                cutoff.setFullYear(now.getFullYear() - 1);
                break;
            default:
                return dreams;
        }

        return dreams.filter(dream => new Date(dream.date) >= cutoff);
    }

    // Create graph data based on connection type
    function createGraphData(dreams, type) {
        const nodes = [];
        const links = [];
        const nodeMap = new Map();

        // Add dream nodes
        dreams.forEach(dream => {
            nodes.push({
                id: dream.id,
                type: 'dream',
                title: dream.title,
                date: dream.date
            });
            nodeMap.set(dream.id, nodes.length - 1);

            // Add connection nodes and links based on type
            switch(type) {
                case 'symbols':
                    dream.symbols.forEach(symbol => {
                        let symbolNodeIndex = nodes.findIndex(n => n.type === 'symbol' && n.title === symbol);
                        if (symbolNodeIndex === -1) {
                            nodes.push({
                                id: `symbol-${symbol}`,
                                type: 'symbol',
                                title: symbol
                            });
                            symbolNodeIndex = nodes.length - 1;
                        }
                        links.push({
                            source: nodeMap.get(dream.id),
                            target: symbolNodeIndex
                        });
                    });
                    break;
                case 'emotions':
                    if (dream.mood) {
                        let moodNodeIndex = nodes.findIndex(n => n.type === 'mood' && n.title === dream.mood);
                        if (moodNodeIndex === -1) {
                            nodes.push({
                                id: `mood-${dream.mood}`,
                                type: 'mood',
                                title: dream.mood
                            });
                            moodNodeIndex = nodes.length - 1;
                        }
                        links.push({
                            source: nodeMap.get(dream.id),
                            target: moodNodeIndex
                        });
                    }
                    break;
                // Add more connection types as needed
            }
        });

        return { nodes, links };
    }

    // Create force-directed graph
    function createForceDirectedGraph(nodes, links) {
        // Clear any existing simulation
        if (simulation) simulation.stop();

        const width = dreamWeb.clientWidth;
        const height = 600;

        // Create force simulation
        simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id))
            .force('charge', d3.forceManyBody().strength(-100))
            .force('center', d3.forceCenter(width / 2, height / 2));

        // Create links
        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('class', 'connection')
            .attr('stroke', '#00ffff')
            .attr('stroke-opacity', 0.6);

        // Create nodes
        const node = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .attr('class', d => `node ${d.type}`)
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Add circles to nodes
        node.append('circle')
            .attr('r', d => d.type === 'dream' ? 8 : 5)
            .attr('fill', d => getNodeColor(d.type));

        // Add labels to nodes
        node.append('text')
            .text(d => d.title)
            .attr('x', 12)
            .attr('y', 4)
            .attr('class', 'node-label');

        // Add hover effects
        node.on('mouseover', function(event, d) {
            d3.select(this).select('circle')
                .transition()
                .duration(200)
                .attr('r', d => (d.type === 'dream' ? 12 : 8));

            showNodeDetails(d);
        }).on('mouseout', function(event, d) {
            d3.select(this).select('circle')
                .transition()
                .duration(200)
                .attr('r', d => (d.type === 'dream' ? 8 : 5));

            hideNodeDetails();
        });

        // Update positions on each tick
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('transform', d => `translate(${d.x},${d.y})`);
        });
    }

    // Create radial graph
    function createRadialGraph(nodes, links) {
        const width = dreamWeb.clientWidth;
        const height = 600;
        const radius = Math.min(width, height) / 2 - 100;

        // Create hierarchical structure
        const dreamNodes = nodes.filter(n => n.type === 'dream');
        const angleStep = (2 * Math.PI) / dreamNodes.length;

        dreamNodes.forEach((dream, i) => {
            const angle = i * angleStep;
            dream.x = width/2 + radius * Math.cos(angle);
            dream.y = height/2 + radius * Math.sin(angle);
            dream.fx = dream.x;
            dream.fy = dream.y;
        });

        // Create force simulation with fixed dream positions
        simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id))
            .force('charge', d3.forceManyBody().strength(-50))
            .force('collision', d3.forceCollide().radius(30));

        // Create links and nodes similar to force-directed graph
        createForceDirectedGraph(nodes, links);
    }

    // Create hierarchical graph
    function createHierarchicalGraph(nodes, links) {
        const width = dreamWeb.clientWidth;
        const height = 600;

        // Create tree layout
        const treeData = {
            name: 'Dreams',
            children: nodes.filter(n => n.type === 'dream').map(dream => ({
                name: dream.title,
                children: links
                    .filter(l => l.source === dream.id)
                    .map(l => ({
                        name: nodes[l.target].title
                    }))
            }))
        };

        const tree = d3.tree().size([width - 100, height - 100]);
        const root = d3.hierarchy(treeData);
        
        tree(root);

        // Create links
        svg.selectAll('path.link')
            .data(root.links())
            .join('path')
            .attr('class', 'link')
            .attr('d', d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x));

        // Create nodes
        const node = svg.selectAll('g.node')
            .data(root.descendants())
            .join('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.y},${d.x})`);

        node.append('circle')
            .attr('r', 4.5);

        node.append('text')
            .attr('dx', d => d.children ? -8 : 8)
            .attr('dy', 3)
            .style('text-anchor', d => d.children ? 'end' : 'start')
            .text(d => d.data.name);
    }

    // Utility functions
    function getNodeColor(type) {
        switch(type) {
            case 'dream':
                return '#8a2be2';
            case 'symbol':
                return '#00ffff';
            case 'mood':
                return '#4a0080';
            default:
                return '#ffffff';
        }
    }

    function showNodeDetails(node) {
        const details = document.getElementById('nodeDetails');
        details.innerHTML = `
            <h4>${node.title}</h4>
            <p><strong>Type:</strong> ${node.type}</p>
            ${node.date ? `<p><strong>Date:</strong> ${new Date(node.date).toLocaleDateString()}</p>` : ''}
        `;
    }

    function hideNodeDetails() {
        const details = document.getElementById('nodeDetails');
        details.innerHTML = '<p class="placeholder">Click on a node to view details</p>';
    }

    // Drag functions
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    // Event listeners
    timeRange.addEventListener('change', initializeVisualization);
    connectionType.addEventListener('change', initializeVisualization);
    visualizationType.addEventListener('change', initializeVisualization);

    // Initialize visualization on load
    initializeVisualization();

    // Update pattern insights
    function updatePatternInsights() {
        const insights = document.getElementById('patternInsights');
        const filteredDreams = filterDreamsByTimeRange(dreams, timeRange.value);

        if (filteredDreams.length === 0) {
            insights.innerHTML = '<p>Record dreams to reveal patterns</p>';
            return;
        }

        // Analyze patterns
        const symbolFrequency = {};
        const moodFrequency = {};
        filteredDreams.forEach(dream => {
            dream.symbols.forEach(symbol => {
                symbolFrequency[symbol] = (symbolFrequency[symbol] || 0) + 1;
            });
            if (dream.mood) {
                moodFrequency[dream.mood] = (moodFrequency[dream.mood] || 0) + 1;
            }
        });

        // Sort and get top items
        const topSymbols = Object.entries(symbolFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        const topMoods = Object.entries(moodFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        insights.innerHTML = `
            <h4>Most Common Symbols</h4>
            <ul>
                ${topSymbols.map(([symbol, count]) => 
                    `<li>${symbol} (${count} occurrences)</li>`
                ).join('')}
            </ul>
            <h4>Prevalent Moods</h4>
            <ul>
                ${topMoods.map(([mood, count]) => 
                    `<li>${mood} (${count} dreams)</li>`
                ).join('')}
            </ul>
        `;
    }

    // Update insights when visualization changes
    timeRange.addEventListener('change', updatePatternInsights);
    updatePatternInsights();
});
