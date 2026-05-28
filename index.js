/* weigh-up.com Interactive Script */
document.addEventListener('DOMContentLoaded', () => {
    // Sliders & Badges
    const proWeightInput = document.getElementById('pro-weight');
    const proBadge = document.getElementById('pro-badge');
    const conWeightInput = document.getElementById('con-weight');
    const conBadge = document.getElementById('con-badge');

    // Inputs & Buttons
    const proTextInput = document.getElementById('pro-text');
    const btnAddPro = document.getElementById('btn-add-pro');
    const conTextInput = document.getElementById('con-text');
    const btnAddCon = document.getElementById('btn-add-con');

    // Lists
    const prosList = document.getElementById('pros-list');
    const consList = document.getElementById('cons-list');

    // Scale Elements
    const tiltingBeam = document.getElementById('tilting-beam');
    const scaleMessage = document.getElementById('scale-message');

    // Data Store
    let pros = [];
    let cons = [];

    // Update Slider Badges on input
    proWeightInput.addEventListener('input', () => {
        proBadge.textContent = proWeightInput.value;
    });

    conWeightInput.addEventListener('input', () => {
        conBadge.textContent = conWeightInput.value;
    });

    // Add Pro Event
    btnAddPro.addEventListener('click', () => {
        const text = proTextInput.value.trim();
        const weight = parseInt(proWeightInput.value);

        if (text === '') return;

        const newItem = {
            id: 'pro_' + Date.now(),
            text: text,
            weight: weight
        };

        pros.push(newItem);
        proTextInput.value = '';
        proWeightInput.value = 3;
        proBadge.textContent = 3;

        renderLists();
        updateScale();
    });

    // Add Con Event
    btnAddCon.addEventListener('click', () => {
        const text = conTextInput.value.trim();
        const weight = parseInt(conWeightInput.value);

        if (text === '') return;

        const newItem = {
            id: 'con_' + Date.now(),
            text: text,
            weight: weight
        };

        cons.push(newItem);
        conTextInput.value = '';
        conWeightInput.value = 3;
        conBadge.textContent = 3;

        renderLists();
        updateScale();
    });

    // Enter Key Handlers
    proTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') btnAddPro.click();
    });

    conTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') btnAddCon.click();
    });

    // Delete item handler
    window.deleteFactor = function(id, type) {
        if (type === 'pro') {
            pros = pros.filter(item => item.id !== id);
        } else {
            cons = cons.filter(item => item.id !== id);
        }
        renderLists();
        updateScale();
    };

    // Render Lists in HTML
    function renderLists() {
        // Render Pros
        prosList.innerHTML = '';
        pros.forEach(item => {
            const li = document.createElement('li');
            li.className = 'factor-item';
            li.innerHTML = `
                <span class="factor-text">${escapeHtml(item.text)}</span>
                <span class="factor-weight-badge">Peso: ${item.weight}</span>
                <button class="btn-delete" onclick="deleteFactor('${item.id}', 'pro')" aria-label="Eliminar pro">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            `;
            prosList.appendChild(li);
        });

        // Render Cons
        consList.innerHTML = '';
        cons.forEach(item => {
            const li = document.createElement('li');
            li.className = 'factor-item';
            li.innerHTML = `
                <span class="factor-text">${escapeHtml(item.text)}</span>
                <span class="factor-weight-badge">Peso: ${item.weight}</span>
                <button class="btn-delete" onclick="deleteFactor('${item.id}', 'con')" aria-label="Eliminar contra">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            `;
            consList.appendChild(li);
        });
    }

    // Update SVG Scale tilt and message
    function updateScale() {
        const totalProWeight = pros.reduce((sum, item) => sum + item.weight, 0);
        const totalConWeight = cons.reduce((sum, item) => sum + item.weight, 0);

        if (totalProWeight === 0 && totalConWeight === 0) {
            tiltingBeam.style.transform = 'rotate(0deg)';
            scaleMessage.textContent = 'Balanza en equilibrio';
            scaleMessage.style.color = 'var(--text-secondary)';
            return;
        }

        const diff = totalProWeight - totalConWeight;
        
        // Calculate tilt: limit rotation between -15deg and +15deg
        // -15deg tilts to the right (Cons heavy), +15deg tilts to the left (Pros heavy)
        // Note: In SVG rotation, positive degrees rotate clockwise (tilting left side UP, right side DOWN -> Cons heavy)
        // So:
        // - Positive diff (Pros heavier): tilts left side DOWN, right side UP -> Counter-Clockwise (Negative degrees)
        // - Negative diff (Cons heavier): tilts left side UP, right side DOWN -> Clockwise (Positive degrees)
        const tiltUnit = 1.5; // degrees per unit difference
        let degrees = -diff * tiltUnit;
        degrees = Math.max(-15, Math.min(15, degrees));

        tiltingBeam.style.transform = `rotate(${degrees}deg)`;

        // Update visual message
        if (diff > 0) {
            scaleMessage.textContent = `La decisión se inclina hacia los Pros (+${diff})`;
            scaleMessage.style.color = 'var(--color-pro)';
        } else if (diff < 0) {
            scaleMessage.textContent = `La decisión se inclina hacia los Contras (${diff})`;
            scaleMessage.style.color = 'var(--color-con)';
        } else {
            scaleMessage.textContent = 'Pesos idénticos, decisión en equilibrio absoluto';
            scaleMessage.style.color = 'var(--color-warning)';
        }
    }

    // Helper to sanitize HTML inputs
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
});
