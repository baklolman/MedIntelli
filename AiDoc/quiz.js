// =============================================
// DIAGNOSIS QUIZ — LOGIC
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    initCategoryPicker();
});

// Renders the Category Picker (Phase 1)
function initCategoryPicker() {
    const container = document.getElementById('quiz-container');

    // Auth context (if needed later)
    const cachedUser = JSON.parse(localStorage.getItem('medintelli_user') || 'null');
    const nameStr = cachedUser && cachedUser.displayName ? `, ${cachedUser.displayName.split(' ')[0]}` : '';

    let html = `
        <div class="tracker-hero" style="margin-bottom: 3rem; animation: fade-in-up 0.5s ease 0.1s both;">
            <h1><i class="ri-clipboard-pulse-line"></i> AIR Triage Quiz</h1>
            <p>Welcome${nameStr}. Select a symptom category below. Our clinical AI will analyse your answers to provide immediate guidance and triage.</p>
        </div>
        <div class="quiz-category-grid" style="animation: fade-in-up 0.6s ease 0.2s both;">
    `;

    quizCategories.forEach(cat => {
        // Only hook up click event for implemented categories
        const isImplemented = quizQuestions[cat.id] && quizQuestions[cat.id].length > 0;
        const clickHandler = isImplemented ? `startQuiz('${cat.id}')` : `alert('This category is coming soon!')`;
        const opacity = isImplemented ? '1' : '0.5';

        html += `
            <div class="quiz-category-card glass-panel" onclick="${clickHandler}" style="opacity: ${opacity};">
                <div class="quiz-cat-icon" style="background-color: ${cat.color}15; color: ${cat.color};">
                    <i class="${cat.icon}"></i>
                </div>
                <h3>${cat.title}</h3>
            </div>
        `;
    });

    html += `
        </div>
        
        <section class="how-it-works-section glass-panel" style="margin-top: 3.5rem; text-align: left; padding: 2.5rem; animation: fade-in-up 0.7s ease 0.3s both;">
            <h2 style="margin-bottom: 2rem; text-align: center;"><i class="ri-lightbulb-flash-line" style="color:var(--primary-color)"></i> How it Works</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem;">
                <div style="text-align: center;">
                    <div class="quiz-cat-icon" style="background: rgba(11,209,187,0.1); color: var(--primary-color); margin: 0 auto 1.5rem;"><i class="ri-list-check"></i></div>
                    <h4 style="margin-bottom: 0.5rem; font-size:1.1rem; color:var(--text-primary)">1. Answer Questions</h4>
                    <p style="font-size: 0.95rem; color: var(--text-secondary); line-height:1.5;">Respond to 8 quick questions about your specific symptoms.</p>
                </div>
                <div style="text-align: center;">
                    <div class="quiz-cat-icon" style="background: rgba(147,51,234,0.1); color: #9333ea; margin: 0 auto 1.5rem;"><i class="ri-brain-line"></i></div>
                    <h4 style="margin-bottom: 0.5rem; font-size:1.1rem; color:var(--text-primary)">2. AI Analysis</h4>
                    <p style="font-size: 0.95rem; color: var(--text-secondary); line-height:1.5;">Our medical AI evaluates your responses and checks for critical red flags.</p>
                </div>
                <div style="text-align: center;">
                    <div class="quiz-cat-icon" style="background: rgba(59,130,246,0.1); color: #3b82f6; margin: 0 auto 1.5rem;"><i class="ri-file-chart-line"></i></div>
                    <h4 style="margin-bottom: 0.5rem; font-size:1.1rem; color:var(--text-primary)">3. Instant Results</h4>
                    <p style="font-size: 0.95rem; color: var(--text-secondary); line-height:1.5;">Get the top possible conditions, confidence matches, and recommended next steps.</p>
                </div>
            </div>
        </section>
    `;

    container.innerHTML = html;
}

let quizState = {
    category: null,
    questions: [],
    currentIndex: 0,
    answers: [],
    scores: {}
};

// Start the quiz flow
function startQuiz(categoryId) {
    const catConfig = quizCategories.find(c => c.id === categoryId);
    quizState = {
        category: catConfig,
        questions: quizQuestions[categoryId],
        currentIndex: 0,
        answers: [],
        scores: {}
    };

    renderQuestion('quiz-slide-in-right');
}

// Render a single question card
function renderQuestion(animationClass = '') {
    const container = document.getElementById('quiz-container');
    const q = quizState.questions[quizState.currentIndex];
    const cat = quizState.category;

    // Progress calculation
    const progressPct = (quizState.currentIndex / quizState.questions.length) * 100;

    const letters = ['A', 'B', 'C', 'D'];
    let optionsHtml = '';

    q.options.forEach((opt, idx) => {
        optionsHtml += `
            <button class="quiz-option" onclick="handleAnswer(${idx}, this)">
                <div class="quiz-option-letter">${letters[idx]}</div>
                <div class="quiz-option-text">${opt.text}</div>
            </button>
        `;
    });

    const html = `
        <div class="quiz-card glass-panel ${animationClass}" id="quiz-card-current">
            <div class="quiz-header">
                <div class="quiz-category-badge" style="background-color: ${cat.color}15; color: ${cat.color}; border: 1px solid ${cat.color}30;">
                    <i class="${cat.icon}"></i> ${cat.title}
                </div>
                <div class="quiz-progress-bar">
                    <div class="quiz-progress-fill" style="width: ${progressPct}%"></div>
                </div>
                <div class="quiz-progress-text">Question ${quizState.currentIndex + 1} of ${quizState.questions.length}</div>
            </div>
            
            <h2 class="quiz-question">${q.text}</h2>
            
            <div class="quiz-options">
                ${optionsHtml}
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// Handle an answer selection
function handleAnswer(optionIndex, btnElement) {
    // Prevent double clicks
    if (btnElement.classList.contains('selected')) return;

    const q = quizState.questions[quizState.currentIndex];
    const selectedOption = q.options[optionIndex];

    // Visually mark selected
    btnElement.classList.add('selected');

    // 1. Save literal answer text
    quizState.answers.push({
        question: q.text,
        answer: selectedOption.text,
        redFlag: selectedOption.redFlag === true
    });

    // 2. Accumulate weight scores for the AI
    if (selectedOption.weights) {
        for (const [condition, weight] of Object.entries(selectedOption.weights)) {
            if (!quizState.scores[condition]) Object.assign(quizState.scores, { [condition]: 0 });
            quizState.scores[condition] += weight;
        }
    }

    // 3. Advance to next question with animation
    setTimeout(() => {
        const card = document.getElementById('quiz-card-current');
        card.classList.remove('quiz-slide-in-right');
        card.classList.add('quiz-slide-out-left');

        setTimeout(() => {
            quizState.currentIndex++;
            if (quizState.currentIndex < quizState.questions.length) {
                renderQuestion('quiz-slide-in-right');
            } else {
                finishQuiz();
            }
        }, 300); // Wait for slide out
    }, 400); // Brief pause to show selection
}

// Final state before AI
function finishQuiz() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
        <div class="quiz-card glass-panel quiz-loading quiz-slide-in-right">
            <div class="spinner-large"></div>
            <h3>Analyzing your symptoms...</h3>
            <p>Our clinical AI is reviewing your answers to determine the most likely conditions.</p>
        </div>
    `;

    // Log the accumulated state for debugging
    console.log("=== QUIZ COMPLETE ===");
    console.log("Scores:", quizState.scores);
    console.log("Answers:", quizState.answers);

    // Phase 3 placeholder
    setTimeout(() => {
        processResultsWithAI();
    }, 500);
}

// Phase 3 & 4: AI Processing and Results
async function processResultsWithAI() {
    const API_KEY = "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";

    // 1. Build context
    const hasRedFlags = quizState.answers.some(a => a.redFlag);

    // Sort scores
    const sortedScores = Object.entries(quizState.scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // top 5

    let answersContext = quizState.answers.map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`).join('\n\n');
    let scoresContext = sortedScores.map(s => `${s[0]} (Weight: ${s[1]})`).join(', ');

    const prompt = `You are an expert Clinical Triage AI. Analyze the following patient symptom quiz results.
    
Category: ${quizState.category.title}
Red Flags Present: ${hasRedFlags ? 'YES' : 'NO'}

=== PATIENT Q&A ===
${answersContext}

=== SYSTEM COMPILED SCORES ===
Based on specific answer weights, the system calculated these top conditions:
${scoresContext}

=== INSTRUCTIONS ===
1. Review the Q&A and system scores.
2. Provide the top 3 most likely conditions. Assign a confidence percentage (0-100) to each.
3. If red flags are present, emphasize urgent care.
4. Provide immediate logical next steps (what to do at home, when to see a doctor).

Respond STRICTLY with valid JSON formatting:
{
  "top_conditions": [
    { "name": "Condition A", "confidence_pct": 85, "reasoning": "Brief explanation" },
    { "name": "Condition B", "confidence_pct": 40, "reasoning": "Brief explanation" },
    { "name": "Condition C", "confidence_pct": 20, "reasoning": "Brief explanation" }
  ],
  "emergency_alert": "Empty string if none, otherwise a clear bold warning.",
  "recommended_actions": ["Action 1", "Action 2", "Action 3"]
}`;

    const systemPrompt = "You are a robust medical AI. Output plain valid JSON only. No markdown formatting. No preamble.";

    try {
        const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1,
                max_tokens: 1500,
                response_format: { type: "json_object" }
            })
        });

        const json = await response.json();
        if (!response.ok) throw new Error(json.error?.message);

        const aiResult = JSON.parse(json.choices[0].message.content);

        // Save to Firestore and Render
        await saveQuizResult(aiResult);
        renderResults(aiResult);

    } catch (error) {
        console.error("Groq API Error:", error);
        // Fallback to internal scoring
        const fallbackResult = generateFallbackResult();
        await saveQuizResult(fallbackResult);
        renderResults(fallbackResult);
    }
}

function generateFallbackResult() {
    const sortedScores = Object.entries(quizState.scores).sort((a, b) => b[1] - a[1]);
    const top = sortedScores.slice(0, 3);
    const hasRedFlags = quizState.answers.some(a => a.redFlag);

    return {
        top_conditions: top.map((s, idx) => ({
            name: s[0],
            confidence_pct: idx === 0 ? 75 : (idx === 1 ? 40 : 20),
            reasoning: "Generated based on symptom weighting."
        })),
        emergency_alert: hasRedFlags ? "You reported symptoms that may require urgent attention." : "",
        recommended_actions: ["Rest and monitor symptoms.", "Seek formal consultation for accurate diagnosis."]
    };
}

async function saveQuizResult(resultObj) {
    try {
        // Safe check if firebase is loaded
        if (typeof firebase === 'undefined' || !firebase.apps.length) return;
        const user = firebase.auth().currentUser;
        if (!user) return;

        const db = firebase.firestore();
        await db.collection('users').doc(user.uid).collection('quiz_results').add({
            category: quizState.category.title,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            answers: quizState.answers,
            scores: quizState.scores,
            result: resultObj
        });
        console.log("Quiz result saved to Firestore.");
    } catch (err) {
        console.warn("Failed to save quiz to Firestore:", err);
    }
}

function renderResults(resultItem) {
    const container = document.getElementById('quiz-container');

    let conditionsHtml = '';
    resultItem.top_conditions.forEach((cond, idx) => {
        const isPrimary = idx === 0 ? 'primary' : '';
        conditionsHtml += `
            <div class="condition-item ${isPrimary}">
                <div class="condition-header">
                    <div class="condition-name">
                        ${isPrimary ? '<i class="ri-shield-cross-fill" style="color:var(--primary-color)"></i>' : ''}
                        ${cond.name}
                    </div>
                    <div class="condition-match">${cond.confidence_pct}% Match</div>
                </div>
                <div class="confidence-track">
                    <div class="confidence-fill" style="width: 0%;" data-target="${cond.confidence_pct}%"></div>
                </div>
                <div class="condition-desc">${cond.reasoning}</div>
            </div>
        `;
    });

    let emergencyHtml = '';
    if (resultItem.emergency_alert) {
        emergencyHtml = `
            <div class="quiz-red-flag-alert">
                <i class="ri-alarm-warning-fill"></i>
                <div class="quiz-red-flag-content">
                    <h4>Medical Alert</h4>
                    <p>${resultItem.emergency_alert}</p>
                </div>
            </div>
        `;
    }

    let actionsHtml = resultItem.recommended_actions.map(a => `<li><i class="ri-play-list-add-line" style="color:var(--primary-color); margin-right:0.5rem;"></i> ${a}</li>`).join('');

    const html = `
        <div class="quiz-result-card glass-panel quiz-slide-in-right">
            <div class="quiz-result-header">
                <h2>Triage Complete</h2>
                <p>Based on your <strong>${quizState.category.title}</strong> symptoms, here is the AI assessment.</p>
            </div>
            
            ${emergencyHtml}
            
            <h3 style="margin-bottom:1rem; color:var(--text-primary);"><i class="ri-list-check-2"></i> Top Possibilities</h3>
            <div class="result-condition-list">
                ${conditionsHtml}
            </div>
            
            <h3 style="margin-bottom:1rem; color:var(--text-primary);"><i class="ri-direction-line"></i> Recommended Next Steps</h3>
            <ul style="list-style:none; padding:0; margin-bottom:2.5rem; display:flex; flex-direction:column; gap:0.8rem; color:var(--text-secondary);">
                ${actionsHtml}
            </ul>
            
            <div class="quiz-action-area">
                <p style="color:var(--text-secondary); margin-bottom:1.5rem; font-size:0.95rem;">This AI assessment is for guidance only. For a complete evaluation with personalized treatment advice, proceed to a full consultation.</p>
                <button class="primary-btn" onclick="bridgeToConsultation()" style="width:100%;">
                    <i class="ri-stethoscope-line"></i> Continue to Full Consultation
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Animate bars
    setTimeout(() => {
        document.querySelectorAll('.confidence-fill').forEach(el => {
            el.style.width = el.getAttribute('data-target');
        });
    }, 100);
}

// Phase 4: Bridge to Main Consultation
function bridgeToConsultation() {
    // Generate a bulleted summary of answers
    let summary = `Diagnosis Quiz Context (${quizState.category.title}):\n`;
    summary += quizState.answers.map(a => `- ${a.question}: ${a.answer}`).join('\n');

    const payload = {
        summary: summary,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('medintelli_quiz_bridge', JSON.stringify(payload));
    window.location.href = 'index.html';
}

// Initialize Auth listener to ensure firebase auth state is ready
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) console.log("User authorized for Quiz save.");
    });
}
