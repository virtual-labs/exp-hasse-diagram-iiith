class HasseDiagram {
    constructor() {
        this.canvas = document.getElementById('hasseCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.elementCount = 6;
        this.relationType = 'easy';
        this.elements = [];
        this.relations = [];
        this.userEdges = [];
        this.userEdgeHistory = []; // Track edge history for undo
        this.selectedVertex = null;
        this.targetRelations = [];
        this.hintTimeout = null; // For auto-hiding hints
        
        // Visual constants
        this.vertexRadius = 25;
        this.colors = {
            vertex: '#e5e7eb',
            edge: '#6b7280',
            userEdge: '#3b82f6',
            targetEdge: '#22c55e',
            background: '#ffffff',
            selected: '#f59e0b',
            minimal: '#ef4444',
            maximal: '#8b5cf6'
        };
        
        this.setupCanvas();
        this.generatePartialOrder();
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerStyle = window.getComputedStyle(container);
        const containerWidth = container.clientWidth - 
            parseFloat(containerStyle.paddingLeft) - 
            parseFloat(containerStyle.paddingRight);
        
        // Use more screen real estate - make canvas taller
        const containerHeight = Math.min(containerWidth * 0.75, window.innerHeight * 0.6);
        
        this.canvas.style.width = containerWidth + 'px';
        this.canvas.style.height = containerHeight + 'px';
        
        const scale = window.devicePixelRatio || 1;
        this.canvas.width = containerWidth * scale;
        this.canvas.height = containerHeight * scale;
        
        this.ctx.scale(scale, scale);
        this.draw();
    }
    
    generatePartialOrder() {
        this.elements = [];
        this.relations = [];
        this.userEdges = [];
        this.userEdgeHistory = [];
        this.selectedVertex = null;
        this.hideFeedback();
        
        switch (this.relationType) {
            case 'easy':
                this.generateEasySubsetPoset();
                break;
            case 'hard':
                this.generateHardSubsetPoset();
                break;
            case 'divisors':
                this.generateDivisorPoset();
                break;
        }
        
        this.computeHasseLayout();
        this.updatePosetInfo();
        this.draw();
    }
    
    generateEasySubsetPoset() {
        // Generate subsets of {1, 2, 3} - Easy Mode
        const baseSet = [1, 2, 3];
        const subsets = [];
        
        for (let i = 0; i < (1 << baseSet.length); i++) {
            const subset = [];
            for (let j = 0; j < baseSet.length; j++) {
                if (i & (1 << j)) {
                    subset.push(baseSet[j]);
                }
            }
            subsets.push(subset);
        }
        
        // Take first elementCount subsets
        this.elements = subsets.slice(0, this.elementCount).map((subset, index) => ({
            id: index,
            value: subset,
            label: '{' + subset.join(',') + '}',
            x: 0, y: 0
        }));
        
        this.generateSubsetRelations();
    }
    
    generateHardSubsetPoset() {
        // Generate subsets of {1, 2, 3, 4} - Hard Mode
        const baseSet = [1, 2, 3, 4];
        const subsets = [];
        
        for (let i = 0; i < (1 << baseSet.length); i++) {
            const subset = [];
            for (let j = 0; j < baseSet.length; j++) {
                if (i & (1 << j)) {
                    subset.push(baseSet[j]);
                }
            }
            subsets.push(subset);
        }
        
        // Take first elementCount subsets, but prioritize interesting ones
        // Ensure we get a good mix of different sized subsets
        const sortedSubsets = subsets.sort((a, b) => {
            if (a.length !== b.length) return a.length - b.length;
            return a.toString().localeCompare(b.toString());
        });
        
        this.elements = sortedSubsets.slice(0, this.elementCount).map((subset, index) => ({
            id: index,
            value: subset,
            label: '{' + subset.join(',') + '}',
            x: 0, y: 0
        }));
        
        this.generateSubsetRelations();
    }
    
    generateSubsetRelations() {
        // Generate subset relations
        this.relations = [];
        this.targetRelations = [];
        
        // First, generate all subset relations
        for (let i = 0; i < this.elements.length; i++) {
            for (let j = 0; j < this.elements.length; j++) {
                if (i !== j && this.isSubset(this.elements[i].value, this.elements[j].value)) {
                    this.relations.push({ from: i, to: j });
                }
            }
        }
        
        // Then, identify covering relations (only direct connections, no transitive edges)
        for (let i = 0; i < this.elements.length; i++) {
            for (let j = 0; j < this.elements.length; j++) {
                if (i !== j && this.isSubset(this.elements[i].value, this.elements[j].value)) {
                    if (this.isCoveringRelation(i, j)) {
                        this.targetRelations.push({ from: i, to: j });
                    }
                }
            }
        }
    }
    
    generateDivisorPoset() {
        const numbers = [1, 2, 3, 4, 6, 8, 12, 16, 24];
        this.elements = numbers.slice(0, this.elementCount).map((num, index) => ({
            id: index,
            value: num,
            label: num.toString(),
            x: 0, y: 0
        }));
        
        // Generate divisibility relations
        this.relations = [];
        this.targetRelations = [];
        
        // First, generate all divisibility relations
        for (let i = 0; i < this.elements.length; i++) {
            for (let j = 0; j < this.elements.length; j++) {
                if (i !== j && this.elements[j].value % this.elements[i].value === 0) {
                    this.relations.push({ from: i, to: j });
                }
            }
        }
        
        // Then, identify covering relations (only direct connections, no transitive edges)
        for (let i = 0; i < this.elements.length; i++) {
            for (let j = 0; j < this.elements.length; j++) {
                if (i !== j && this.elements[j].value % this.elements[i].value === 0) {
                    if (this.isCoveringRelation(i, j)) {
                        this.targetRelations.push({ from: i, to: j });
                    }
                }
            }
        }
    }
    
    isSubset(set1, set2) {
        return set1.every(element => set2.includes(element));
    }
    
    isCoveringRelation(fromIndex, toIndex) {
        // Check if there's any intermediate element
        for (let k = 0; k < this.elements.length; k++) {
            if (k !== fromIndex && k !== toIndex) {
                const hasFromToK = this.relations.some(r => r.from === fromIndex && r.to === k);
                const hasKToTo = this.relations.some(r => r.from === k && r.to === toIndex);
                if (hasFromToK && hasKToTo) {
                    return false;
                }
            }
        }
        return true;
    }
    
    computeHasseLayout() {
        // Assign levels based on the partial order
        const levels = new Array(this.elementCount).fill(0);
        
        // Compute levels (topological ordering consideration)
        let changed = true;
        while (changed) {
            changed = false;
            this.relations.forEach(rel => {
                if (levels[rel.to] <= levels[rel.from]) {
                    levels[rel.to] = levels[rel.from] + 1;
                    changed = true;
                }
            });
        }
        
        // Group elements by level
        const levelGroups = {};
        levels.forEach((level, index) => {
            if (!levelGroups[level]) levelGroups[level] = [];
            levelGroups[level].push(index);
        });
        
        // Position elements with better spacing
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        const maxLevel = Math.max(...levels);
        
        // Add padding to use more space effectively and expand horizontally
        const padding = 40;
        const usableWidth = canvasWidth - (2 * padding);
        const usableHeight = canvasHeight - (2 * padding);
        
        Object.keys(levelGroups).forEach(level => {
            const levelNum = parseInt(level);
            const group = levelGroups[level];
            const y = canvasHeight - padding - (levelNum * (usableHeight / (maxLevel + 1)));
            
            // Expand horizontally by using more of the available width
            const horizontalPadding = Math.min(padding * 0.5, usableWidth * 0.05);
            const availableWidth = usableWidth - (2 * horizontalPadding);
            
            group.forEach((elementIndex, groupIndex) => {
                const x = padding + horizontalPadding + (groupIndex + 1) * (availableWidth / (group.length + 1));
                this.elements[elementIndex].x = x;
                this.elements[elementIndex].y = y;
            });
        });
    }
    
    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Find clicked vertex
        for (let element of this.elements) {
            const dx = x - element.x;
            const dy = y - element.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.vertexRadius) {
                this.handleVertexClick(element.id);
                break;
            }
        }
    }
    
    handleVertexClick(vertexId) {
        if (this.selectedVertex === null) {
            this.selectedVertex = vertexId;
        } else if (this.selectedVertex === vertexId) {
            this.selectedVertex = null;
        } else {
            // Try to add edge
            this.addUserEdge(this.selectedVertex, vertexId);
            this.selectedVertex = null;
        }
        this.draw();
    }
    
    addUserEdge(from, to) {
        // Check if edge already exists
        const exists = this.userEdges.some(edge => edge.from === from && edge.to === to);
        if (!exists) {
            const newEdge = { from, to };
            this.userEdges.push(newEdge);
            this.userEdgeHistory.push(newEdge); // Track for undo
        }
    }
    
    undoLastEdge() {
        if (this.userEdgeHistory.length > 0) {
            const lastEdge = this.userEdgeHistory.pop();
            this.userEdges = this.userEdges.filter(edge => 
                !(edge.from === lastEdge.from && edge.to === lastEdge.to));
            this.selectedVertex = null;
            this.draw();
            this.hideFeedback();
        }
    }
    
    draw() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Clear canvas
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw user edges
        this.drawEdges(this.userEdges, this.colors.userEdge, 3);
        
        // Draw vertices
        this.drawVertices();
        
        // Draw edge direction indicators
        this.drawEdgeArrows(this.userEdges, this.colors.userEdge);
    }
    
    drawEdges(edges, color, lineWidth = 2) {
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = color;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        edges.forEach(edge => {
            const from = this.elements[edge.from];
            const to = this.elements[edge.to];
            
            // Calculate edge direction and distance
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check for overlaps with other vertices and edges
            let needsCurve = this.shouldCurveEdge(edge, edges);
            
            this.ctx.beginPath();
            
            if (needsCurve && distance > this.vertexRadius * 2) {
                this.drawCurvedEdge(from, to, edge, edges);
            } else {
                // Draw straight line
                this.ctx.moveTo(from.x, from.y);
                this.ctx.lineTo(to.x, to.y);
            }
            
            this.ctx.stroke();
        });
    }
    
    shouldCurveEdge(currentEdge, allEdges) {
        const from = this.elements[currentEdge.from];
        const to = this.elements[currentEdge.to];
        
        // Check for vertex overlaps
        for (let element of this.elements) {
            if (element.id !== currentEdge.from && element.id !== currentEdge.to) {
                const distToLine = this.distanceToLine(from.x, from.y, to.x, to.y, element.x, element.y);
                if (distToLine < this.vertexRadius * 1.2) {
                    return true;
                }
            }
        }
        
        // Check for edge crossings
        for (let otherEdge of allEdges) {
            if (otherEdge === currentEdge) continue;
            
            const otherFrom = this.elements[otherEdge.from];
            const otherTo = this.elements[otherEdge.to];
            
            if (this.doLinesIntersect(from.x, from.y, to.x, to.y, 
                                   otherFrom.x, otherFrom.y, otherTo.x, otherTo.y)) {
                return true;
            }
        }
        
        return false;
    }
    
    drawCurvedEdge(from, to, edge, allEdges) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate curve parameters
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        
        // Determine curve direction and intensity
        let curveIntensity = Math.min(distance * 0.3, 80);
        let curveDirection = 1;
        
        // Check which side to curve based on other elements
        const perpX = -dy / distance;
        const perpY = dx / distance;
        
        // Test both sides and choose the one with less interference
        const testOffset = curveIntensity;
        const leftControlX = midX + perpX * testOffset;
        const leftControlY = midY + perpY * testOffset;
        const rightControlX = midX - perpX * testOffset;
        const rightControlY = midY - perpY * testOffset;
        
        let leftInterference = this.calculateInterference(leftControlX, leftControlY, edge);
        let rightInterference = this.calculateInterference(rightControlX, rightControlY, edge);
        
        if (rightInterference < leftInterference) {
            curveDirection = -1;
        }
        
        // Apply some randomness for visual variety
        const edgeHash = (edge.from * 17 + edge.to * 31) % 100;
        curveIntensity *= (0.8 + (edgeHash / 100) * 0.4);
        
        const controlX = midX + perpX * curveIntensity * curveDirection;
        const controlY = midY + perpY * curveIntensity * curveDirection;
        
        // Draw smooth Bézier curve
        this.ctx.moveTo(from.x, from.y);
        this.ctx.quadraticCurveTo(controlX, controlY, to.x, to.y);
    }
    
    calculateInterference(x, y, currentEdge) {
        let interference = 0;
        
        // Check distance to vertices
        for (let element of this.elements) {
            if (element.id !== currentEdge.from && element.id !== currentEdge.to) {
                const dist = Math.sqrt((x - element.x) ** 2 + (y - element.y) ** 2);
                if (dist < this.vertexRadius * 3) {
                    interference += (this.vertexRadius * 3 - dist);
                }
            }
        }
        
        return interference;
    }
    
    doLinesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 1e-10) return false;
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        
        return t > 0.1 && t < 0.9 && u > 0.1 && u < 0.9;
    }
    
    distanceToLine(x1, y1, x2, y2, px, py) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) return Math.sqrt(A * A + B * B);
        
        const param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    drawEdgeArrows(edges, color) {
        this.ctx.fillStyle = color;
        
        edges.forEach(edge => {
            const from = this.elements[edge.from];
            const to = this.elements[edge.to];
            
            // Calculate if this edge was curved
            const needsCurve = this.shouldCurveEdge(edge, edges);
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            let arrowX, arrowY, unitX, unitY;
            
            if (needsCurve && distance > this.vertexRadius * 2) {
                // For curved lines, calculate arrow direction from curve end point
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                
                let curveIntensity = Math.min(distance * 0.3, 80);
                let curveDirection = 1;
                
                const perpX = -dy / distance;
                const perpY = dx / distance;
                
                // Determine curve direction (same logic as drawCurvedEdge)
                const testOffset = curveIntensity;
                const leftControlX = midX + perpX * testOffset;
                const leftControlY = midY + perpY * testOffset;
                const rightControlX = midX - perpX * testOffset;
                const rightControlY = midY - perpY * testOffset;
                
                let leftInterference = this.calculateInterference(leftControlX, leftControlY, edge);
                let rightInterference = this.calculateInterference(rightControlX, rightControlY, edge);
                
                if (rightInterference < leftInterference) {
                    curveDirection = -1;
                }
                
                // Apply same randomness
                const edgeHash = (edge.from * 17 + edge.to * 31) % 100;
                curveIntensity *= (0.8 + (edgeHash / 100) * 0.4);
                
                const controlX = midX + perpX * curveIntensity * curveDirection;
                const controlY = midY + perpY * curveIntensity * curveDirection;
                
                // Calculate tangent at end point of quadratic curve
                // For quadratic curve P(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
                // P'(t) = 2(1-t)(P1-P0) + 2t(P2-P1)
                // At t=1: P'(1) = 2(P2-P1)
                const tangentX = 2 * (to.x - controlX);
                const tangentY = 2 * (to.y - controlY);
                const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
                
                if (tangentLength > 0) {
                    unitX = tangentX / tangentLength;
                    unitY = tangentY / tangentLength;
                    // Position arrow closer to destination for curved lines too
                    const arrowOffset = this.vertexRadius + 3;
                    arrowX = to.x - unitX * arrowOffset;
                    arrowY = to.y - unitY * arrowOffset;
                }
            } else {
                // Straight line arrow
                if (distance > 0) {
                    unitX = dx / distance;
                    unitY = dy / distance;
                    // Position arrow closer to destination
                    const arrowOffset = this.vertexRadius + 3;
                    arrowX = to.x - unitX * arrowOffset;
                    arrowY = to.y - unitY * arrowOffset;
                }
            }
            
            if (unitX !== undefined && unitY !== undefined) {
                // Draw larger, more visible triangle arrow closer to destination
                const arrowSize = 12;
                const arrowOffset = this.vertexRadius + 3; // Closer to the vertex
                arrowX = to.x - unitX * arrowOffset;
                arrowY = to.y - unitY * arrowOffset;
                
                this.ctx.beginPath();
                this.ctx.moveTo(arrowX, arrowY);
                this.ctx.lineTo(
                    arrowX - unitX * arrowSize + unitY * (arrowSize * 0.6), 
                    arrowY - unitY * arrowSize - unitX * (arrowSize * 0.6)
                );
                this.ctx.lineTo(
                    arrowX - unitX * arrowSize - unitY * (arrowSize * 0.6), 
                    arrowY - unitY * arrowSize + unitX * (arrowSize * 0.6)
                );
                this.ctx.closePath();
                this.ctx.fill();
            }
        });
    }
    
    drawVertices() {
        // Find minimal and maximal elements
        const minimalElements = this.findMinimalElements();
        const maximalElements = this.findMaximalElements();
        
        this.elements.forEach(element => {
            let fillColor = this.colors.vertex;
            
            if (minimalElements.includes(element.id)) {
                fillColor = this.colors.minimal;
            } else if (maximalElements.includes(element.id)) {
                fillColor = this.colors.maximal;
            }
            
            if (this.selectedVertex === element.id) {
                fillColor = this.colors.selected;
            }
            
            // Draw vertex shadow with better effect
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            this.ctx.beginPath();
            this.ctx.arc(element.x + 3, element.y + 3, this.vertexRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw vertex with gradient effect
            const gradient = this.ctx.createRadialGradient(
                element.x - this.vertexRadius * 0.3, 
                element.y - this.vertexRadius * 0.3, 
                0, 
                element.x, 
                element.y, 
                this.vertexRadius
            );
            gradient.addColorStop(0, this.lightenColor(fillColor, 20));
            gradient.addColorStop(1, fillColor);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(element.x, element.y, this.vertexRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw border
            this.ctx.strokeStyle = '#374151';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw vertex label with better contrast based on background color
            const textColor = this.getTextColor(fillColor);
            this.ctx.fillStyle = textColor;
            this.ctx.font = 'bold 11px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Add text shadow for better readability
            if (textColor === '#ffffff') {
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            } else {
                this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            }
            this.ctx.shadowBlur = 2;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
            
            this.ctx.fillText(element.label, element.x, element.y);
            
            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
        });
    }
    
    getTextColor(backgroundColor) {
        // Convert hex color to RGB values for luminance calculation
        let hex = backgroundColor.replace('#', '');
        
        // Handle rgb() format
        if (backgroundColor.startsWith('rgb')) {
            const rgbMatch = backgroundColor.match(/\d+/g);
            if (rgbMatch) {
                const r = parseInt(rgbMatch[0]);
                const g = parseInt(rgbMatch[1]);
                const b = parseInt(rgbMatch[2]);
                return this.calculateTextColor(r, g, b);
            }
        }
        
        // Handle hex format
        if (hex.length === 6) {
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return this.calculateTextColor(r, g, b);
        }
        
        // Default to white if can't parse
        return '#ffffff';
    }
    
    calculateTextColor(r, g, b) {
        // Calculate relative luminance using WCAG formula
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return dark text for light backgrounds, light text for dark backgrounds
        return luminance > 0.5 ? '#1f2937' : '#ffffff';
    }
    
    lightenColor(color, percent) {
        // Simple color lightening function
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + percent);
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + percent);
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + percent);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    findMinimalElements() {
        const minimal = [];
        this.elements.forEach(element => {
            const hasIncoming = this.relations.some(rel => rel.to === element.id);
            if (!hasIncoming) {
                minimal.push(element.id);
            }
        });
        return minimal;
    }
    
    findMaximalElements() {
        const maximal = [];
        this.elements.forEach(element => {
            const hasOutgoing = this.relations.some(rel => rel.from === element.id);
            if (!hasOutgoing) {
                maximal.push(element.id);
            }
        });
        return maximal;
    }
    
    checkDiagram() {
        // Check if user has drawn all covering relations
        const missing = [];
        const extra = [];
        
        this.targetRelations.forEach(target => {
            const exists = this.userEdges.some(edge => edge.from === target.from && edge.to === target.to);
            if (!exists) {
                missing.push(target);
            }
        });
        
        this.userEdges.forEach(userEdge => {
            const isCorrect = this.targetRelations.some(target => 
                target.from === userEdge.from && target.to === userEdge.to);
            if (!isCorrect) {
                extra.push(userEdge);
            }
        });
        
        if (missing.length === 0 && extra.length === 0) {
            this.showFeedback(true, 'Perfect! You have correctly constructed the Hasse diagram.');
        } else {
            let message = '';
            if (missing.length > 0) {
                message += `Missing ${missing.length} edge(s). `;
            }
            if (extra.length > 0) {
                message += `${extra.length} incorrect edge(s). `;
            }
            this.showFeedback(false, message + 'Keep trying!');
        }
    }
    
    showHint() {
        // Clear any existing timeout
        if (this.hintTimeout) {
            clearTimeout(this.hintTimeout);
        }
        
        const hintBtn = document.getElementById('hintBtn');
        
        if (this.userEdges.length === 0) {
            this.showFeedback(true, 'Start by identifying minimal nodes (red vertices) and their immediate successors.');
        } else {
            const missing = this.targetRelations.filter(target => 
                !this.userEdges.some(edge => edge.from === target.from && edge.to === target.to));
            
            if (missing.length > 0) {
                const hint = missing[0];
                const fromLabel = this.elements[hint.from].label;
                const toLabel = this.elements[hint.to].label;
                this.showFeedback(true, `Hint: Try adding an edge from ${fromLabel} to ${toLabel}.`);
            } else {
                this.showFeedback(true, 'You have all the correct edges! Check for any extra edges.');
            }
        }
        
        // Change button text and set auto-hide
        if (hintBtn) {
            hintBtn.textContent = 'Close Hint';
            hintBtn.onclick = () => this.closeHint();
        }
        
        // Auto-hide hint after 5 seconds
        this.hintTimeout = setTimeout(() => {
            this.closeHint();
        }, 5000);
    }
    
    closeHint() {
        this.hideFeedback();
        const hintBtn = document.getElementById('hintBtn');
        if (hintBtn) {
            hintBtn.textContent = 'Hint';
            hintBtn.onclick = () => this.showHint();
        }
        if (this.hintTimeout) {
            clearTimeout(this.hintTimeout);
            this.hintTimeout = null;
        }
    }
    
    clearDiagram() {
        this.userEdges = [];
        this.userEdgeHistory = [];
        this.selectedVertex = null;
        this.hideFeedback();
        this.closeHint(); // Reset hint button if it was showing close hint
        this.draw();
    }
    
    showFeedback(isCorrect, message) {
        const feedbackElement = document.getElementById('feedback');
        if (!feedbackElement) return;
        
        feedbackElement.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'text-green-800', 'text-red-800');
        
        if (isCorrect) {
            feedbackElement.classList.add('bg-green-100', 'text-green-800');
        } else {
            feedbackElement.classList.add('bg-red-100', 'text-red-800');
        }
        
        feedbackElement.textContent = message;
    }
    
    hideFeedback() {
        const feedbackElement = document.getElementById('feedback');
        if (feedbackElement) {
            feedbackElement.classList.add('hidden');
        }
    }
    
    updatePosetInfo() {
        const totalElementsElement = document.getElementById('totalElements');
        const relationCountElement = document.getElementById('relationCount');
        const minimalElementsElement = document.getElementById('minimalElements');
        const maximalElementsElement = document.getElementById('maximalElements');
        const elementCountElement = document.getElementById('elementCount');
        
        if (totalElementsElement) {
            totalElementsElement.textContent = this.elementCount;
        }
        if (elementCountElement) {
            elementCountElement.textContent = this.elementCount;
        }
        if (relationCountElement) {
            relationCountElement.textContent = this.targetRelations.length;
        }
        
        const minimalElements = this.findMinimalElements();
        const maximalElements = this.findMaximalElements();
        
        if (minimalElementsElement) {
            const minimalLabels = minimalElements.map(id => this.elements[id].label);
            minimalElementsElement.textContent = minimalLabels.length > 0 ? minimalLabels.join(', ') : 'None';
        }
        if (maximalElementsElement) {
            const maximalLabels = maximalElements.map(id => this.elements[id].label);
            maximalElementsElement.textContent = maximalLabels.length > 0 ? maximalLabels.join(', ') : 'None';
        }
        
        // Update relation display
        this.updateRelationDisplay();
    }
    
    updateRelationDisplay() {
        const relationDisplay = document.getElementById('relationDisplay');
        if (!relationDisplay) return;
        
        const relationStrings = this.relations.map(rel => 
            `(${this.elements[rel.from].label}, ${this.elements[rel.to].label})`);
        
        relationDisplay.textContent = relationStrings.join(', ');
        
        // Keep the relation display hidden as requested
        const relationContainer = relationDisplay.parentElement;
        if (relationContainer) {
            relationContainer.style.display = 'none';
        }
    }
    
    updateElementCount() {
        const slider = document.getElementById('elementCountSlider');
        if (!slider) return;
        
        this.elementCount = parseInt(slider.value);
        const valueElement = document.getElementById('elementCountValue');
        if (valueElement) {
            valueElement.textContent = this.elementCount;
        }
        this.generatePartialOrder();
    }
    
    updateRelationType() {
        const select = document.getElementById('relationTypeSelect');
        if (!select) return;
        
        this.relationType = select.value;
        const valueElement = document.getElementById('relationTypeValue');
        if (valueElement) {
            const labels = {
                'easy': 'Easy Mode',
                'hard': 'Hard Mode', 
                'divisors': 'Divisors Mode'
            };
            valueElement.textContent = labels[this.relationType];
        }
        this.generatePartialOrder();
    }
}

// Global instance
let hasseGame;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    hasseGame = new HasseDiagram();
    
    // Update the initial slider values
    const elementCountSlider = document.getElementById('elementCountSlider');
    const relationTypeSelect = document.getElementById('relationTypeSelect');
    
    if (elementCountSlider) {
        elementCountSlider.value = hasseGame.elementCount;
        const valueElement = document.getElementById('elementCountValue');
        if (valueElement) {
            valueElement.textContent = hasseGame.elementCount;
        }
    }
    
    if (relationTypeSelect) {
        relationTypeSelect.value = hasseGame.relationType;
    }
});

// Control functions
function updateElementCount() {
    if (hasseGame) {
        hasseGame.updateElementCount();
    }
}

function updateRelationType() {
    if (hasseGame) {
        hasseGame.updateRelationType();
    }
}

function generateNewRelation() {
    if (hasseGame) {
        hasseGame.generatePartialOrder();
    }
}

function clearDiagram() {
    if (hasseGame) {
        hasseGame.clearDiagram();
    }
}

function checkDiagram() {
    if (hasseGame) {
        hasseGame.checkDiagram();
    }
}

function showHint() {
    if (hasseGame) {
        hasseGame.showHint();
    }
}

function undoLastEdge() {
    if (hasseGame) {
        hasseGame.undoLastEdge();
    }
}

// Floating Panel Controls (reuse from existing structure)
document.addEventListener('DOMContentLoaded', function() {
    // Controls panel
    const controlsButton = document.getElementById('controlsButton');
    const controlsPanel = document.getElementById('controlsPanel');
    const controlsPanelClose = document.getElementById('controlsPanelClose');
    
    // Info panel
    const infoButton = document.getElementById('infoButton');
    const infoPanel = document.getElementById('infoPanel');
    const infoPanelClose = document.getElementById('infoPanelClose');
    
    // Panel toggle functions
    function togglePanel(panel, button, otherPanel) {
        if (!panel) return;
        
        const isActive = panel.classList.contains('active');
        // Close other panel if active
        if (otherPanel && otherPanel.classList.contains('active')) {
            otherPanel.classList.remove('active');
        }
        // Toggle current panel
        if (isActive) {
            panel.classList.remove('active');
        } else {
            panel.classList.add('active');
        }
    }
    
    // Control panel events
    if (controlsButton) {
        controlsButton.addEventListener('click', function() {
            togglePanel(controlsPanel, controlsButton, infoPanel);
        });
    }
    
    if (controlsPanelClose) {
        controlsPanelClose.addEventListener('click', function() {
            if (controlsPanel) {
                controlsPanel.classList.remove('active');
            }
        });
    }
    
    // Info panel events
    if (infoButton) {
        infoButton.addEventListener('click', function() {
            togglePanel(infoPanel, infoButton, controlsPanel);
        });
    }
    
    if (infoPanelClose) {
        infoPanelClose.addEventListener('click', function() {
            if (infoPanel) {
                infoPanel.classList.remove('active');
            }
        });
    }
    
    // Close panels when clicking outside
    document.addEventListener('click', function(event) {
        if (controlsPanel && !controlsPanel.contains(event.target) && 
            controlsButton && !controlsButton.contains(event.target) && 
            controlsPanel.classList.contains('active')) {
            controlsPanel.classList.remove('active');
        }
        if (infoPanel && !infoPanel.contains(event.target) && 
            infoButton && !infoButton.contains(event.target) && 
            infoPanel.classList.contains('active')) {
            infoPanel.classList.remove('active');
        }
    });
});