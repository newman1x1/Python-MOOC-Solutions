document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('exercises-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const toast = document.getElementById('toast');
    let exercisesData = [];

    // Load data from JSON
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            exercisesData = data.exercises;
            renderExercises(exercisesData);
        })
        .catch(error => {
            container.innerHTML = '<div class="loading">Error loading solutions. Please refresh.</div>';
            console.error('Error:', error);
        });

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const part = btn.dataset.part;
            if (part === 'all') {
                renderExercises(exercisesData);
            } else {
                const filtered = exercisesData.filter(ex => ex.part === parseInt(part));
                renderExercises(filtered);
            }
        });
    });

    function renderExercises(exercises) {
        container.innerHTML = exercises.map(ex => `
            <div class="exercise-card" data-id="${ex.id}">
                <div class="card-header" onclick="toggleCard('${ex.id}')">
                    <div class="card-title">
                        <span class="exercise-id">${ex.id}</span>
                        <span class="exercise-name">${ex.name}</span>
                    </div>
                    <span class="toggle-icon">▼</span>
                </div>
                <div class="card-body">
                    <p class="description">${ex.description}</p>
                    <div class="code-container">
                        <div class="code-header">
                            <span class="code-lang">Python</span>
                            <button class="copy-btn" onclick="copyCode('${ex.id}')">
                                <span class="copy-icon">📋</span>
                                <span class="copy-text">Copy</span>
                            </button>
                        </div>
                        <pre><code id="code-${ex.id}">${highlightSyntax(escapeHtml(ex.code))}</code></pre>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Toggle card open/close
    window.toggleCard = function(id) {
        const card = document.querySelector(`.exercise-card[data-id="${id}"]`);
        card.classList.toggle('open');
    };

    // Copy code to clipboard
    window.copyCode = function(id) {
        const exercise = exercisesData.find(ex => ex.id === id);
        if (!exercise) return;

        navigator.clipboard.writeText(exercise.code).then(() => {
            const btn = document.querySelector(`.exercise-card[data-id="${id}"] .copy-btn`);
            btn.classList.add('copied');
            btn.querySelector('.copy-icon').textContent = '✓';
            btn.querySelector('.copy-text').textContent = 'Copied!';
            
            showToast();
            
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.querySelector('.copy-icon').textContent = '📋';
                btn.querySelector('.copy-text').textContent = 'Copy';
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            fallbackCopy(exercise.code);
        });
    };

    // Fallback copy for older browsers
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast();
    }

    // Show toast notification
    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Simple syntax highlighting
    function highlightSyntax(code) {
        const keywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None', 'break', 'continue', 'pass', 'lambda', 'with', 'as', 'try', 'except', 'finally', 'raise', 'yield'];
        const builtins = ['print', 'input', 'int', 'float', 'str', 'list', 'dict', 'len', 'range', 'sum', 'min', 'max', 'sorted', 'abs', 'round', 'open', 'type', 'isinstance', 'enumerate', 'zip', 'map', 'filter'];

        // Highlight strings
        code = code.replace(/(["'])((?:\\.|[^\\])*?)\1/g, '<span class="string">$&</span>');
        
        // Highlight comments
        code = code.replace(/(#.*)$/gm, '<span class="comment">$1</span>');
        
        // Highlight numbers
        code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
        
        // Highlight keywords
        keywords.forEach(kw => {
            const regex = new RegExp(`\\b(${kw})\\b`, 'g');
            code = code.replace(regex, '<span class="keyword">$1</span>');
        });
        
        // Highlight builtins
        builtins.forEach(fn => {
            const regex = new RegExp(`\\b(${fn})\\b(?=\\()`, 'g');
            code = code.replace(regex, '<span class="builtin">$1</span>');
        });
        
        // Highlight function definitions
        code = code.replace(/\b(def)\s+(\w+)/g, '<span class="keyword">$1</span> <span class="function">$2</span>');
        
        // Highlight class definitions
        code = code.replace(/\b(class)\s+(\w+)/g, '<span class="keyword">$1</span> <span class="function">$2</span>');

        return code;
    }
});
