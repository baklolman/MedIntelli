// =============================================
// SYMPTOM TRACKER — MySymptoms (Fixed)
// =============================================

// Firebase Config
const firebaseConfig = {
    apiKey: "AsssawdSOHE2B-A5FJA_UAuyCZFUapSWQ",
    authDomain: "medintelli-team.firebaseapp.com",
    projectId: "medintelli-team",
    storageBucket: "medintelli-team.firebasestorage.app",
    messagingSenderId: "66495074574",
    appId: "1:66495074574:web:ff77cd0345196ecac2075f",
    measurementId: "G-7BDQ95NQVN"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

let db = null;
let analytics = null;
let authResolved = false;
let resolvedAuthUser = null;

// BUG FIX #1: Remove API key from client-side JS — use env variable or backend proxy.
// For now keeping it here to match original, but flag it.
const API_KEY = "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";

if (typeof firebase !== 'undefined') {
    if (firebase.firestore) db = firebase.firestore();
    if (firebase.analytics) {
        analytics = firebase.analytics();
        analytics.logEvent('page_view', { page_title: 'Symptom Tracker', page_location: window.location.href });
    }
    if (firebase.performance) firebase.performance();

    // BUG FIX #2: Register onAuthStateChanged ONCE globally, not inside waitForAuth.
    // Original code re-registered it on every waitForAuth() call causing race conditions.
    if (firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            resolvedAuthUser = user || null;
            authResolved = true;
        });
    }
}

// Auth guard
const cachedUser = JSON.parse(localStorage.getItem('medintelli_user') || 'null');
if (!cachedUser) window.location.replace('login.html');

// =============================================
// STATE
// =============================================
let selectedSymptoms = [];
let selectedMood = 'okay';
let currentRange = 7;
let painChart = null;
let allLogs = [];
let isSubmitting = false;

// =============================================
// HELPERS
// =============================================
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

function formatDateShort(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateFull(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
}

// BUG FIX #3: waitForAuth now just waits for the already-registered listener to resolve.
// No longer re-registers onAuthStateChanged on every call.
function waitForAuth(timeoutMs = 5000) {
    return new Promise((resolve) => {
        if (authResolved) { resolve(resolvedAuthUser); return; }

        const interval = setInterval(() => {
            if (authResolved) {
                clearInterval(interval);
                resolve(resolvedAuthUser);
            }
        }, 50);

        setTimeout(() => {
            clearInterval(interval);
            resolve(resolvedAuthUser);
        }, timeoutMs);
    });
}

// =============================================
// TOAST
// =============================================
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: 'ri-checkbox-circle-fill',
        error: 'ri-error-warning-fill',
        info: 'ri-information-fill',
        warning: 'ri-alert-fill'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
}

// =============================================
// THEME
// =============================================
function applyTheme(theme) {
    if (theme === 'system') {
        const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', preferDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    updateThemeIcon();
    if (painChart) renderChart();
}

function updateThemeIcon() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.querySelector('i').className = isDark ? 'ri-sun-line' : 'ri-moon-line';
}

applyTheme(localStorage.getItem('medintelli_theme') || 'light');

// =============================================
// PAIN SLIDER
// =============================================
function updatePainDisplay() {
    const slider = document.getElementById('checkin-pain');
    const label = document.getElementById('checkin-pain-label');
    if (!slider || !label) return;

    const val = parseInt(slider.value);
    let text, cssClass;
    if (val <= 3) { text = `${val} — Mild`; cssClass = 'mild'; }
    else if (val <= 6) { text = `${val} — Moderate`; cssClass = 'moderate'; }
    else { text = `${val} — Severe`; cssClass = 'severe'; }

    label.textContent = text;
    label.className = 'pain-label ' + cssClass;

    const percent = ((val - 1) / 9) * 100;
    const color = val <= 3 ? '#10b981' : val <= 6 ? '#f59e0b' : '#ef4444';
    slider.style.setProperty('--slider-fill', `${percent}%`);
    slider.style.setProperty('--slider-color', color);
}

// =============================================
// LOCAL STORAGE
// =============================================
function saveLogLocal(date, logData) {
    const logs = JSON.parse(localStorage.getItem('medintelli_symptom_logs') || '{}');
    logs[date] = logData;
    localStorage.setItem('medintelli_symptom_logs', JSON.stringify(logs));
}

function deleteLogLocal(date) {
    const logs = JSON.parse(localStorage.getItem('medintelli_symptom_logs') || '{}');
    delete logs[date];
    localStorage.setItem('medintelli_symptom_logs', JSON.stringify(logs));
}

function getLocalLogs() {
    const logs = JSON.parse(localStorage.getItem('medintelli_symptom_logs') || '{}');
    return Object.values(logs).sort((a, b) => a.date.localeCompare(b.date));
}

// =============================================
// SUBMIT BUTTON STATE
// BUG FIX #4: Guard all querySelector calls — elements may not exist yet.
// =============================================
function setSubmitLoading(loading) {
    const btn = document.getElementById('checkin-submit');
    if (!btn) return;
    const span = btn.querySelector('span');
    const icon = btn.querySelector('i');
    const spinner = btn.querySelector('.spinner');

    if (loading) {
        if (span) span.classList.add('hidden');
        if (icon) icon.classList.add('hidden');
        if (spinner) spinner.classList.remove('hidden');
        btn.disabled = true;
    } else {
        if (span) span.classList.remove('hidden');
        if (icon) icon.classList.remove('hidden');
        if (spinner) spinner.classList.add('hidden');
        btn.disabled = false;
    }
}

function showCheckinSuccess() {
    const btn = document.getElementById('checkin-submit');
    if (!btn) return;
    const span = btn.querySelector('span');
    const icon = btn.querySelector('i');
    const banner = document.getElementById('already-logged-banner');

    if (span) span.textContent = '✓ Saved!';
    if (icon) icon.className = 'ri-checkbox-circle-fill';
    btn.classList.add('success-pulse');
    banner?.classList.remove('hidden');

    setTimeout(() => {
        if (span) span.textContent = 'Update Check-in';
        if (icon) icon.className = 'ri-check-line';
        btn.classList.remove('success-pulse');
    }, 2000);
}

// =============================================
// LOAD ALL LOGS
// =============================================
async function loadAllLogs() {
    let firestoreLogs = [];

    try {
        const authUser = await waitForAuth(3000);
        const uid = authUser?.uid || cachedUser?.uid;

        if (uid && db) {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - 30);
            const dateStr = daysAgo.toISOString().split('T')[0];

            const snap = await db.collection('users').doc(uid)
                .collection('symptom_logs')
                .where('date', '>=', dateStr)
                .orderBy('date', 'asc')
                .get();

            snap.forEach(doc => firestoreLogs.push({ id: doc.id, ...doc.data() }));
        }
    } catch (e) {
        console.warn('Firestore fetch error:', e);
    }

    const localLogs = getLocalLogs();
    const merged = {};
    firestoreLogs.forEach(log => { merged[log.date] = log; });
    localLogs.forEach(log => { if (!merged[log.date]) merged[log.date] = log; });

    allLogs = Object.values(merged).sort((a, b) => a.date.localeCompare(b.date));

    const todayLog = allLogs.find(l => l.date === getTodayStr());
    if (todayLog) {
        prefillForm(todayLog);
        document.getElementById('already-logged-banner')?.classList.remove('hidden');
    }
}

// BUG FIX #5: prefillForm now safely handles missing/undefined arrays.
function prefillForm(log) {
    const slider = document.getElementById('checkin-pain');
    const notesEl = document.getElementById('checkin-notes');
    const submitBtn = document.getElementById('checkin-submit');

    if (slider) { slider.value = log.pain || 3; updatePainDisplay(); }
    if (notesEl) notesEl.value = log.notes || '';
    if (submitBtn) {
        const span = submitBtn.querySelector('span');
        if (span) span.textContent = 'Update Check-in';
    }

    // Safe symptom prefill
    selectedSymptoms = Array.isArray(log.symptoms) ? [...log.symptoms] : [];
    document.querySelectorAll('#symptom-chips .symptom-chip').forEach(chip => {
        chip.classList.toggle('active', selectedSymptoms.includes(chip.dataset.symptom));
    });

    // Safe mood prefill
    selectedMood = log.mood || 'okay';
    document.querySelectorAll('#mood-selector .mood-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mood === selectedMood);
    });
}

// =============================================
// QUICK STATS
// =============================================
function updateQuickStats() {
    const totalEl = document.getElementById('total-entries');
    if (totalEl) totalEl.textContent = allLogs.length;

    const streakEl = document.getElementById('streak-count');
    if (streakEl) {
        const streak = calculateStreak();
        streakEl.textContent = streak;
        if (streak >= 3) streakEl.classList.add('streak-fire');
        else streakEl.classList.remove('streak-fire');
    }

    const avgEl = document.getElementById('weekly-avg');
    if (avgEl) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        const recent = allLogs.filter(l => l.date >= cutoffStr);
        if (recent.length > 0) {
            const avg = recent.reduce((sum, l) => sum + (l.pain || 0), 0) / recent.length;
            avgEl.textContent = avg.toFixed(1);
            avgEl.className = avg <= 3 ? 'severity-mild' : avg <= 6 ? 'severity-moderate' : 'severity-severe';
        } else {
            avgEl.textContent = '—';
        }
    }
}

function calculateStreak() {
    if (allLogs.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i <= 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (allLogs.some(l => l.date === dateStr)) {
            streak++;
        } else {
            if (i === 0) continue;
            break;
        }
    }
    return streak;
}

// =============================================
// CHART
// BUG FIX #6: Guard canvas.parentElement — may be null on first render.
// =============================================
function renderChart() {
    const canvas = document.getElementById('pain-chart');
    const chartEmpty = document.getElementById('chart-empty');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - currentRange);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const filteredLogs = allLogs.filter(l => l.date >= cutoffStr);

    if (filteredLogs.length === 0) {
        canvas.style.display = 'none';
        if (chartEmpty) chartEmpty.style.display = '';
        if (painChart) { painChart.destroy(); painChart = null; }
        return;
    }

    canvas.style.display = '';
    if (chartEmpty) chartEmpty.style.display = 'none';

    const labels = filteredLogs.map(l => formatDateShort(l.date));
    const dataValues = filteredLogs.map(l => l.pain || 0);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    // BUG FIX: Safe gradient — use canvas height fallback if parentElement is null
    const chartHeight = canvas.parentElement?.clientHeight || 280;
    const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
    gradient.addColorStop(0, isDark ? 'rgba(20, 244, 216, 0.25)' : 'rgba(11, 209, 187, 0.2)');
    gradient.addColorStop(1, isDark ? 'rgba(20, 244, 216, 0)' : 'rgba(11, 209, 187, 0)');

    const pointColors = dataValues.map(v => v <= 3 ? '#10b981' : v <= 6 ? '#f59e0b' : '#ef4444');
    const pointBorderColors = dataValues.map(() => isDark ? '#1e293b' : '#fff');

    if (painChart) painChart.destroy();

    painChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Pain Level',
                data: dataValues,
                fill: true,
                backgroundColor: gradient,
                borderColor: isDark ? '#14f4d8' : '#0bd1bb',
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: pointColors,
                pointBorderColor: pointBorderColors,
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 9,
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    titleColor: isDark ? '#e2e8f0' : '#0f172a',
                    bodyColor: isDark ? '#94a3b8' : '#64748b',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: false,
                    callbacks: {
                        label: (tooltipItem) => {
                            const v = tooltipItem.parsed.y;
                            const level = v <= 3 ? 'Mild' : v <= 6 ? 'Moderate' : 'Severe';
                            return `Pain: ${v}/10 (${level})`;
                        },
                        afterLabel: (tooltipItem) => {
                            const log = filteredLogs[tooltipItem.dataIndex];
                            const parts = [];
                            if (log.mood) parts.push(`Mood: ${capitalize(log.mood)}`);
                            if (log.symptoms?.length) parts.push(`Symptoms: ${log.symptoms.map(s => s.replace(/_/g, ' ')).join(', ')}`);
                            if (log.timeOfDay) parts.push(`Time: ${capitalize(log.timeOfDay)}`);
                            return parts.join('\n');
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0, max: 10,
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { weight: 600 }, stepSize: 2 },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textColor, font: { weight: 600 }, maxRotation: 0 },
                    border: { display: false }
                }
            },
            animation: { duration: 800, easing: 'easeOutQuart' }
        }
    });
}

// =============================================
// RISING SEVERITY DETECTION
// =============================================
function checkRisingSeverity() {
    const alertBanner = document.getElementById('severity-alert-banner');
    if (!alertBanner) return;
    if (allLogs.length < 3) return;
    if (sessionStorage.getItem('tracker_alert_dismissed')) return;

    const recent = allLogs.slice(-3);
    let rising = true;
    for (let i = 1; i < recent.length; i++) {
        if (recent[i].pain <= recent[i - 1].pain) { rising = false; break; }
    }

    if (rising && recent[recent.length - 1].pain >= 5) {
        alertBanner.classList.remove('hidden');
    }
}

// =============================================
// LOG HISTORY
// =============================================
function renderLogHistory() {
    const listEl = document.getElementById('log-history-list');
    if (!listEl) return;

    const recentLogs = allLogs.slice().reverse().slice(0, 10);
    if (recentLogs.length === 0) {
        listEl.innerHTML = `<div class="activity-empty">
            <i class="ri-file-list-3-line"></i>
            <p>No logs yet. Complete your first daily check-in above!</p>
        </div>`;
        return;
    }

    const moodEmojis = { great: '😊', good: '🙂', okay: '😐', tired: '😴', bad: '😞', awful: '😣' };
    let html = '';

    recentLogs.forEach((log, i) => {
        const sevClass = log.pain <= 3 ? 'mild' : log.pain <= 6 ? 'moderate' : 'severe';
        const symptomsArr = Array.isArray(log.symptoms) ? log.symptoms : [];
        const symptomsStr = symptomsArr.map(s => capitalize(s.replace(/_/g, ' '))).join(', ') || 'None logged';
        const moodEmoji = moodEmojis[log.mood] || '😐';
        const isToday = log.date === getTodayStr();

        html += `
            <div class="log-history-item" style="--delay: ${0.05 + i * 0.05}s" data-date="${log.date}">
                <div class="log-item-header">
                    <span class="log-item-date">
                        ${isToday ? '<span class="today-badge">Today</span>' : ''}
                        ${formatDateFull(log.date)}
                        ${log.timeOfDay ? `<span class="time-of-day-tag">${capitalize(log.timeOfDay)}</span>` : ''}
                    </span>
                    <div class="log-item-actions">
                        <span class="activity-severity ${sevClass}">${log.pain}/10</span>
                        ${!isToday ? `<button class="log-delete-btn" onclick="deleteLogEntry('${log.date}')" title="Delete entry"><i class="ri-delete-bin-line"></i></button>` : ''}
                    </div>
                </div>
                <div class="log-item-body">
                    <span class="log-item-mood">${moodEmoji} ${capitalize(log.mood || 'okay')}</span>
                    <span class="log-item-symptoms">${symptomsStr}</span>
                </div>
                ${log.notes ? `<div class="log-item-notes">"${escapeHtml(log.notes)}"</div>` : ''}
            </div>`;
    });

    listEl.innerHTML = html;
}

// =============================================
// DELETE LOG ENTRY
// =============================================
async function deleteLogEntry(date) {
    if (!confirm(`Delete the log for ${formatDateFull(date)}?`)) return;

    try {
        const authUser = await waitForAuth(2000);
        const uid = authUser?.uid || cachedUser?.uid;
        if (uid && db) {
            await db.collection('users').doc(uid).collection('symptom_logs').doc(date).delete();
        }
    } catch (e) {
        console.warn('Firestore delete error:', e);
    }

    deleteLogLocal(date);
    await loadAllLogs();
    renderChart();
    renderLogHistory();
    updateQuickStats();
    showToast('Log entry deleted', 'info');
}

// =============================================
// GROQ AI TREND ANALYSIS
// =============================================
async function runAITrendAnalysis() {
    const aiTrendSection = document.getElementById('ai-trend-section');
    const trendContent = document.getElementById('trend-content');
    const trendLoading = document.getElementById('trend-loading');
    if (!aiTrendSection || !trendContent || !trendLoading) return;
    if (allLogs.length < 3) return;

    const cacheKey = allLogs.map(l => `${l.date}:${l.pain}`).join(',');
    const cachedAnalysis = sessionStorage.getItem('tracker_ai_cache');
    const cachedKeyStored = sessionStorage.getItem('tracker_ai_cache_key');

    if (cachedAnalysis && cachedKeyStored === cacheKey) {
        aiTrendSection.classList.remove('hidden');
        try { renderTrendAnalysis(JSON.parse(cachedAnalysis)); return; } catch (e) { /* re-run */ }
    }

    aiTrendSection.classList.remove('hidden');
    trendLoading.classList.remove('hidden');
    trendContent.innerHTML = '';

    const userLanguage = localStorage.getItem('medintelli_language') || 'English';
    const logSummary = allLogs.slice(-14).map(log => ({
        date: log.date,
        pain: log.pain,
        symptoms: Array.isArray(log.symptoms) ? log.symptoms : [],
        mood: log.mood || 'unknown',
        notes: log.notes || '',
        timeOfDay: log.timeOfDay || 'unknown'
    }));

    const prompt = `You are an AI health pattern analyst for MySymptoms. Analyze this patient's symptom log time-series data and identify hidden patterns.

=== SYMPTOM LOG DATA (last ${logSummary.length} entries) ===
${JSON.stringify(logSummary, null, 2)}

=== ANALYSIS INSTRUCTIONS ===
1. Identify TRENDS: Is pain rising, falling, or fluctuating?
2. Detect PATTERNS: Co-occurring symptoms, mood correlations, recurring patterns.
3. Detect TRIGGERS: Look at notes for clues (meals, sleep, stress).
4. Assess SEVERITY trajectory: Getting better or worse?
5. Provide ACTIONABLE advice.
6. Flag CONCERNS if data suggests something worrying.

=== OUTPUT FORMAT ===
Respond STRICTLY with valid JSON in ${userLanguage}:
{
    "trend_direction": "rising" | "falling" | "stable" | "fluctuating",
    "trend_summary": "2-3 sentence summary. Be specific with dates and numbers.",
    "patterns_detected": ["Array of specific patterns found"],
    "possible_triggers": ["Array of possible triggers"],
    "severity_assessment": "Brief assessment",
    "recommendation": "1-2 actionable sentences",
    "alert_level": "green" | "yellow" | "red"
}`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are a medical pattern analyst. Output ONLY valid JSON, no markdown." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.2,
                max_tokens: 1024,
                response_format: { type: "json_object" }
            })
        });

        const json = await response.json();
        if (!response.ok) throw new Error(json.error?.message || 'API request failed');

        const result = JSON.parse(json.choices[0].message.content);
        sessionStorage.setItem('tracker_ai_cache', JSON.stringify(result));
        sessionStorage.setItem('tracker_ai_cache_key', cacheKey);

        renderTrendAnalysis(result);

        if (analytics) {
            analytics.logEvent('trend_analysis_complete', {
                trend: result.trend_direction,
                alert: result.alert_level,
                entries_analyzed: logSummary.length
            });
        }

    } catch (error) {
        console.error('AI trend analysis error:', error);
        trendContent.innerHTML = `
            <div class="trend-fallback">
                <i class="ri-error-warning-line"></i>
                <p>AI analysis unavailable right now. Keep logging — your chart still shows the trend visually!</p>
                <button onclick="runAITrendAnalysis()" class="retry-btn"><i class="ri-refresh-line"></i> Retry</button>
            </div>`;
    } finally {
        trendLoading.classList.add('hidden');
    }
}

function renderTrendAnalysis(result) {
    const trendContent = document.getElementById('trend-content');
    if (!trendContent) return;

    const alertColors = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444' };
    const alertIcons = { green: 'ri-checkbox-circle-fill', yellow: 'ri-alert-line', red: 'ri-alarm-warning-fill' };
    const alertLabels = { green: 'Looking Good', yellow: 'Monitor Closely', red: 'Seek Care' };

    const color = alertColors[result.alert_level] || alertColors.yellow;
    const icon = alertIcons[result.alert_level] || alertIcons.yellow;
    const label = alertLabels[result.alert_level] || 'Analysis';
    const arrows = { rising: '↗', falling: '↘', stable: '→', fluctuating: '↕' };
    const arrow = arrows[result.trend_direction] || '→';

    let html = `
        <div class="trend-alert-chip" style="--alert-color: ${color}">
            <i class="${icon}"></i><span>${label}</span>
        </div>
        <div class="trend-direction">
            <span class="trend-arrow" style="color: ${color}">${arrow}</span>
            <span class="trend-dir-label">Trend: <strong>${capitalize(result.trend_direction || 'unknown')}</strong></span>
        </div>
        <p class="trend-summary-text">${escapeHtml(result.trend_summary || '')}</p>`;

    if (result.patterns_detected?.length) {
        html += `<div class="trend-sub-section"><h4><i class="ri-search-eye-line"></i> Patterns Detected</h4>
            <ul>${result.patterns_detected.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul></div>`;
    }

    if (result.possible_triggers?.length) {
        html += `<div class="trend-sub-section"><h4><i class="ri-flashlight-line"></i> Possible Triggers</h4>
            <ul>${result.possible_triggers.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>`;
    }

    if (result.severity_assessment) {
        html += `<div class="trend-sub-section"><h4><i class="ri-shield-cross-line"></i> Severity Assessment</h4>
            <p class="trend-assessment-text">${escapeHtml(result.severity_assessment)}</p></div>`;
    }

    if (result.recommendation) {
        html += `<div class="trend-recommendation"><i class="ri-lightbulb-line"></i>
            <p>${escapeHtml(result.recommendation)}</p></div>`;
    }

    trendContent.innerHTML = html;
}

// =============================================
// EXPOSE GLOBALS EARLY — before any HTML onclick fires
// BUG FIX #7: Assign to window BEFORE DOMContentLoaded so onclick handlers work.
// =============================================
window.deleteLogEntry = deleteLogEntry;
window.runAITrendAnalysis = runAITrendAnalysis;

// =============================================
// MAIN INIT — wrapped in DOMContentLoaded
// BUG FIX #8: ALL DOM event listeners moved inside DOMContentLoaded.
// This is the root cause of chips and mood buttons not responding —
// the original code ran querySelector before the DOM was parsed.
// =============================================
document.addEventListener('DOMContentLoaded', () => {

    // Theme toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('medintelli_theme', newTheme);
        });
    }

    // Today's date display
    const checkinDateEl = document.getElementById('checkin-date');
    if (checkinDateEl) checkinDateEl.textContent = formatDateFull(getTodayStr());

    // Pain slider
    const painSlider = document.getElementById('checkin-pain');
    if (painSlider) {
        painSlider.addEventListener('input', updatePainDisplay);
        updatePainDisplay();
    }

    // =============================================
    // SYMPTOM CHIPS — BUG FIX: now inside DOMContentLoaded
    // =============================================
    document.querySelectorAll('#symptom-chips .symptom-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const symptom = chip.dataset.symptom;
            chip.classList.toggle('active');
            if (chip.classList.contains('active')) {
                if (!selectedSymptoms.includes(symptom)) selectedSymptoms.push(symptom);
            } else {
                selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
            }
        });
    });

    // =============================================
    // MOOD BUTTONS — BUG FIX: now inside DOMContentLoaded
    // =============================================
    document.querySelectorAll('#mood-selector .mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#mood-selector .mood-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedMood = btn.dataset.mood;
        });
    });

    // Alert dismiss
    const dismissAlertBtn = document.getElementById('dismiss-alert-btn');
    if (dismissAlertBtn) {
        dismissAlertBtn.addEventListener('click', () => {
            document.getElementById('severity-alert-banner')?.classList.add('hidden');
            sessionStorage.setItem('tracker_alert_dismissed', '1');
        });
    }

    // Chart range toggle
    document.querySelectorAll('.range-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRange = parseInt(btn.dataset.range);
            renderChart();
        });
    });

    // =============================================
    // FORM SUBMIT — BUG FIX: now inside DOMContentLoaded
    // =============================================
    const checkinForm = document.getElementById('checkin-form');
    if (checkinForm) {
        checkinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isSubmitting) return;
            isSubmitting = true;

            const pain = parseInt(document.getElementById('checkin-pain')?.value || 3);
            const notes = (document.getElementById('checkin-notes')?.value || '').trim();
            const today = getTodayStr();
            const timeOfDay = getTimeOfDay();

            setSubmitLoading(true);

            try {
                const authUser = await waitForAuth();
                const uid = authUser?.uid || cachedUser?.uid;

                const logData = {
                    pain,
                    symptoms: [...selectedSymptoms],
                    mood: selectedMood,
                    notes,
                    date: today,
                    timeOfDay,
                    timestamp: new Date().toISOString()
                };

                if (uid && db) {
                    await db.collection('users').doc(uid)
                        .collection('symptom_logs').doc(today)
                        .set({
                            ...logData,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                }

                saveLogLocal(today, logData);

                if (analytics) {
                    analytics.logEvent('symptom_checkin', {
                        pain_level: pain,
                        symptom_count: selectedSymptoms.length,
                        mood: selectedMood,
                        time_of_day: timeOfDay
                    });
                }

                showCheckinSuccess();
                showToast('Check-in saved successfully!', 'success');

                await loadAllLogs();
                renderChart();
                renderLogHistory();
                updateQuickStats();
                checkRisingSeverity();

                setTimeout(() => {
                    document.getElementById('chart-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 600);

                if (allLogs.length >= 3) runAITrendAnalysis();

            } catch (error) {
                console.error('Check-in save error:', error);

                saveLogLocal(today, {
                    pain, symptoms: [...selectedSymptoms], mood: selectedMood,
                    notes, date: today, timeOfDay, timestamp: new Date().toISOString()
                });

                showToast('Saved locally (offline mode)', 'warning');
                await loadAllLogs();
                renderChart();
                renderLogHistory();
                updateQuickStats();
            } finally {
                setSubmitLoading(false);
                isSubmitting = false;
            }
        });
    }

    // =============================================
    // INIT
    // =============================================
    async function init() {
        await loadAllLogs();
        renderChart();
        renderLogHistory();
        updateQuickStats();
        checkRisingSeverity();
        if (allLogs.length >= 3) runAITrendAnalysis();
    }

    init();

    // Prevent back-button loop
    history.replaceState(null, '', 'tracker.html');
});
