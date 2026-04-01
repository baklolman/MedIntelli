// =============================================
// PROFILE PAGE — MySymptoms
// =============================================

// Firebase config (same as login.js / script.js)
const firebaseConfig = {
    apiKey: "apikey",
    authDomain: "medintelli-team.firebaseapp.com",
    projectId: "medintelli-team",
    storageBucket: "medintelli-team.firebasestorage.app",
    messagingSenderId: "66495074574",
    appId: "1:66495074574:web:ff77cd0345196ecac2075f",
    measurementId: "G-7BDQ95NQVN"
};

// Initialize Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

let db = null;
let analytics = null;

if (typeof firebase !== 'undefined') {
    if (firebase.firestore) db = firebase.firestore();
    if (firebase.analytics) {
        analytics = firebase.analytics();
        analytics.logEvent('page_view', {
            page_title: 'MySymptoms Profile',
            page_location: window.location.href
        });
    }
    if (firebase.performance) firebase.performance();
}

// =============================================
// THEME MANAGEMENT
// =============================================
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const darkModeToggle = document.getElementById('dark-mode-toggle');

function applyTheme(theme) {
    if (theme === 'system') {
        const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', preferDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    updateThemeIcon();
    updateDarkModeToggle();
    updateThemeStat();
}

function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (themeToggleBtn) {
        themeToggleBtn.querySelector('i').className = isDark ? 'ri-sun-line' : 'ri-moon-line';
    }
}

function updateDarkModeToggle() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (darkModeToggle) darkModeToggle.checked = isDark;
}

function updateThemeStat() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const el = document.getElementById('stat-theme');
    if (el) el.textContent = isDark ? 'Dark' : 'Light';
}

// Init theme from localStorage
const savedTheme = localStorage.getItem('medintelli_theme') || 'light';
applyTheme(savedTheme);

// Header toggle
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('medintelli_theme', newTheme);
    });
}

// Settings toggle switch
if (darkModeToggle) {
    darkModeToggle.addEventListener('change', () => {
        const newTheme = darkModeToggle.checked ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('medintelli_theme', newTheme);
    });
}

// =============================================
// AUTH CHECK
// =============================================
const cachedUser = JSON.parse(localStorage.getItem('medintelli_user') || 'null');

if (!cachedUser) {
    // Not logged in — redirect to login
    window.location.replace('login.html');
}

// =============================================
// POPULATE PROFILE DATA (from localStorage)
// =============================================
function populateLocalData() {
    if (!cachedUser) return;

    // Avatar
    const avatarEl = document.getElementById('profile-avatar');
    if (cachedUser.photoURL) {
        avatarEl.src = cachedUser.photoURL;
        avatarEl.onerror = () => {
            avatarEl.style.display = 'none';
            avatarEl.parentElement.innerHTML = `<div class="profile-avatar-fallback"><i class="ri-user-3-fill"></i></div><div class="avatar-status-dot"></div>`;
        };
    } else {
        avatarEl.style.display = 'none';
        avatarEl.parentElement.innerHTML = `<div class="profile-avatar-fallback"><i class="ri-user-3-fill"></i></div><div class="avatar-status-dot"></div>`;
    }

    // Name & Email
    document.getElementById('profile-name').textContent = cachedUser.displayName || 'User';
    document.getElementById('profile-email').textContent = cachedUser.email || '';

    // Country & Language
    const country = localStorage.getItem('medintelli_country') || '—';
    const language = localStorage.getItem('medintelli_language') || 'English';

    document.getElementById('profile-country').textContent = country;
    document.getElementById('profile-language').textContent = language;
    document.getElementById('settings-language').textContent = language;
    document.getElementById('settings-region').textContent = country;

    // Member since from cached lastLogin
    if (cachedUser.lastLogin) {
        const memberDate = new Date(cachedUser.lastLogin);
        document.getElementById('stat-member-since').textContent = memberDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    // Analytics
    if (analytics && cachedUser.uid) {
        analytics.setUserId(cachedUser.uid);
    }
}

populateLocalData();

// =============================================
// FETCH FIRESTORE DATA (live stats)
// =============================================
async function fetchFirestoreData() {
    if (!db || !cachedUser?.uid) return;

    try {
        // --- WAIT FOR FIREBASE AUTH ---
        // Synchronize with Firebase Auth to prevent 'permission denied' race conditions on page reload.
        if (typeof firebase !== 'undefined' && firebase.auth) {
            let liveUser = firebase.auth().currentUser;
            if (!liveUser) {
                await new Promise(resolve => {
                    const unsub = firebase.auth().onAuthStateChanged(u => {
                        unsub(); resolve(u);
                    });
                    setTimeout(() => resolve(null), 3500); // Wait up to 3.5s for session restore
                });
            }
        }
        // ------------------------------

        // Fetch user profile doc
        const userDoc = await db.collection('users').doc(cachedUser.uid).get();
        const loadingEl = document.getElementById('medical-id-loading');
        if (loadingEl) loadingEl.style.display = 'none';

        if (userDoc.exists) {
            const data = userDoc.data();

            // Total consultations
            const totalConsultations = data.totalConsultations || 0;
            const consultEl = document.getElementById('stat-consultations');
            animateCount(consultEl, totalConsultations);

            // Last severity
            if (data.lastSeverity) {
                const severityEl = document.getElementById('stat-last-severity');
                severityEl.textContent = capitalizeFirst(data.lastSeverity);
                severityEl.className = 'stat-value severity-' + data.lastSeverity.toLowerCase();
            }

            // Member since (use firstLogin or createdAt if available, otherwise lastLogin)
            if (data.lastLogin) {
                const created = data.lastLogin.toDate ? data.lastLogin.toDate() : new Date(data.lastLogin);
                document.getElementById('stat-member-since').textContent = created.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }

            // Medical ID data
            if (data.medicalId) {
                window.currentMedicalData = data.medicalId;

                // Populate Display Card
                document.getElementById('display-mid-age').textContent = data.medicalId.age || 'N/A';
                document.getElementById('display-mid-blood').textContent = data.medicalId.bloodType || 'N/A';
                document.getElementById('display-mid-allergies').textContent = data.medicalId.allergies || 'None';
                document.getElementById('display-mid-medications').textContent = data.medicalId.medications || 'None';
                document.getElementById('display-mid-conditions').textContent = data.medicalId.conditions || 'None';
                document.getElementById('display-mid-contacts').textContent = data.medicalId.contacts || 'None';

                // Populate Form (for editing)
                document.getElementById('mid-age').value = data.medicalId.age || '';
                document.getElementById('mid-blood').value = data.medicalId.bloodType || '';
                document.getElementById('mid-allergies').value = data.medicalId.allergies || '';
                document.getElementById('mid-medications').value = data.medicalId.medications || '';
                document.getElementById('mid-conditions').value = data.medicalId.conditions || '';
                document.getElementById('mid-contacts').value = data.medicalId.contacts || '';

                // Show Display, Hide Form
                document.getElementById('medical-id-form-container').style.display = 'none';
                document.getElementById('medical-id-display-container').style.display = 'block';
                document.getElementById('cancel-edit-mid-btn').style.display = 'block';

                // Handle ID Badge
                if (data.medicalId.id) {
                    document.getElementById('profile-mid-text').textContent = data.medicalId.id;
                    document.getElementById('profile-mid-badge').style.display = 'flex';
                }
            } else {
                window.currentMedicalData = null;
                document.getElementById('medical-id-form-container').style.display = 'block';
                document.getElementById('medical-id-display-container').style.display = 'none';
                document.getElementById('profile-mid-badge').style.display = 'none';
            }
        } else {
            // User doc doesn't exist yet, show form
            window.currentMedicalData = null;
            document.getElementById('medical-id-form-container').style.display = 'block';
            document.getElementById('medical-id-display-container').style.display = 'none';
            document.getElementById('profile-mid-badge').style.display = 'none';
        }

        // Fetch recent consultations (last 3)
        const consultationsSnap = await db.collection('users').doc(cachedUser.uid)
            .collection('consultations')
            .orderBy('timestamp', 'desc')
            .limit(3)
            .get();

        if (!consultationsSnap.empty) {
            renderRecentActivity(consultationsSnap.docs);

            // Populate Medical ID "Last Consultation"
            const latestDoc = consultationsSnap.docs[0].data();
            if (latestDoc.assessment) {
                document.getElementById('mid-last-consultation-container').style.display = 'block';
                // Remove basic markdown elements for clean display
                const cleanAssessment = latestDoc.assessment.replace(/[\*#]/g, '').substring(0, 250) + '...';
                document.getElementById('mid-last-consultation-text').textContent = cleanAssessment;
            }
        }

        // Fetch recent quizzes (last 3)
        const quizSnap = await db.collection('users').doc(cachedUser.uid)
            .collection('quiz_results')
            .orderBy('timestamp', 'desc')
            .limit(3)
            .get();

        renderRecentQuizzes(quizSnap.docs);

    } catch (error) {
        console.warn('Firestore fetch error (profile):', error);

        // Failsafe: Hide loading spinner and show editable form if network/auth fails completely
        const loadingEl = document.getElementById('medical-id-loading');
        if (loadingEl) loadingEl.style.display = 'none';

        const formContainer = document.getElementById('medical-id-form-container');
        const displayContainer = document.getElementById('medical-id-display-container');

        // Only show the empty form if the beautiful display card didn't already successfully load!
        if (formContainer && (!displayContainer || displayContainer.style.display !== 'block')) {
            formContainer.style.display = 'block';
        }
    }
}

function animateCount(el, target) {
    if (!el || target <= 0) {
        if (el) el.textContent = target;
        return;
    }
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.textContent = current;
    }, 30);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderRecentActivity(docs) {
    const listEl = document.getElementById('recent-activity-list');
    if (!listEl || docs.length === 0) return;

    let html = '';
    docs.forEach((doc, index) => {
        const data = doc.data();
        const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        }) : (data.date || '—');
        const time = data.time || '';
        const symptoms = data.symptoms || 'No details';
        const severity = data.severity || 'unknown';
        const assessment = data.assessment || '';
        const truncatedAssessment = assessment.length > 120 ? assessment.substring(0, 120) + '…' : assessment;

        const severityClass = severity === 'severe' ? 'severe' : severity === 'moderate' ? 'moderate' : 'mild';

        html += `
            <div class="activity-item" style="--delay: ${0.1 + index * 0.1}s">
                <div class="activity-item-header">
                    <div class="activity-date">
                        <i class="ri-calendar-line"></i>
                        <span>${date}</span>
                        ${time ? `<span class="activity-time">${time}</span>` : ''}
                    </div>
                    <span class="activity-severity ${severityClass}">${capitalizeFirst(severity)}</span>
                </div>
                <div class="activity-symptoms">
                    <strong>Symptoms:</strong> ${escapeHtml(symptoms.length > 100 ? symptoms.substring(0, 100) + '…' : symptoms)}
                </div>
                <div class="activity-assessment">
                    <strong>AI Assessment:</strong> ${escapeHtml(truncatedAssessment)}
                </div>
            </div>
        `;
    });
    listEl.innerHTML = html;
}

function renderRecentQuizzes(docs) {
    const listEl = document.getElementById('recent-quiz-list');
    if (!listEl || !docs || docs.length === 0) return;

    let html = '';
    docs.forEach((doc, index) => {
        const data = doc.data();
        const date = data.timestamp ? data.timestamp.toDate().toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        }) : '—';

        let topCondition = "Pending AI Analysis";
        let confidence = "";
        if (data.result && data.result.top_conditions && data.result.top_conditions.length > 0) {
            topCondition = data.result.top_conditions[0].name;
            confidence = data.result.top_conditions[0].confidence_pct + "% Match";
        }

        const category = data.category || 'Symptoms Quiz';

        html += `
            <div class="activity-item" style="--delay: ${0.1 + index * 0.1}s">
                <div class="activity-item-header">
                    <div class="activity-date">
                        <i class="ri-clipboard-pulse-line"></i>
                        <span>${category}</span>
                        <span class="activity-time">${date}</span>
                    </div>
                    <span class="activity-severity mild" style="background: rgba(11,209,187,0.15); color: var(--primary-color);">${confidence}</span>
                </div>
                <div class="activity-assessment" style="margin-top:0.8rem;">
                    <strong>Top AI Prediction:</strong> ${escapeHtml(topCondition)}
                </div>
            </div>
        `;
    });
    listEl.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fetch Firestore data
fetchFirestoreData();

// =============================================
// LOCAL HISTORY FALLBACK
// =============================================
// If Firestore doesn't return data, show from localStorage
setTimeout(() => {
    const listEl = document.getElementById('recent-activity-list');
    if (listEl && listEl.querySelector('.activity-empty')) {
        // Try localStorage history
        const localHistory = JSON.parse(localStorage.getItem('medintelli_history') || '[]');
        if (localHistory.length > 0) {
            const recent = localHistory.slice(-3).reverse();
            let html = '';
            recent.forEach((item, index) => {
                const severityClass = item.severity === 'severe' ? 'severe' : item.severity === 'moderate' ? 'moderate' : 'mild';
                html += `
    < div class="activity-item" style = "--delay: ${0.1 + index * 0.1}s" >
                        <div class="activity-item-header">
                            <div class="activity-date">
                                <i class="ri-calendar-line"></i>
                                <span>${item.date || '—'}</span>
                            </div>
                            <span class="activity-severity ${severityClass}">${capitalizeFirst(item.severity || 'unknown')}</span>
                        </div>
                        <div class="activity-symptoms">
                            <strong>Symptoms:</strong> ${escapeHtml(item.symptoms || 'No details')}
                        </div>
                        ${item.assessment ? `<div class="activity-assessment">${escapeHtml(item.assessment.substring(0, 120))}…</div>` : ''}
                    </div >
    `;
            });
            listEl.innerHTML = html;

            // Also set consultation count from local history
            const consultEl = document.getElementById('stat-consultations');
            if (consultEl && consultEl.textContent === '—') {
                animateCount(consultEl, localHistory.length);
            }
        }
    }
}, 3000);

// =============================================
// SIGN OUT
// =============================================
const signOutBtn = document.getElementById('sign-out-btn');
if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to sign out?')) {
            if (analytics) {
                analytics.logEvent('sign_out', { source: 'profile_page' });
            }

            // Clear all user data
            localStorage.removeItem('medintelli_user');
            localStorage.removeItem('medintelli_onboarded');
            localStorage.removeItem('medintelli_country');
            localStorage.removeItem('medintelli_language');

            // Firebase sign out
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().signOut().catch(() => { });
            }

            window.location.replace('login.html');
        }
    });
}

// =============================================
// MEDICAL ID LOGIC
// =============================================
const saveMidBtn = document.getElementById('save-medical-id-btn');

if (saveMidBtn) {
    saveMidBtn.addEventListener('click', async () => {
        if (!db || !cachedUser?.uid) {
            alert('Database not initialized or user not found. Please refresh.');
            return;
        }

        // --- AUTH SYNC CHECK ---
        // Ensure the actual Firebase token is alive, since localStorage doesn't expire.
        let liveUser = firebase.auth().currentUser;
        if (!liveUser) {
            liveUser = await new Promise(resolve => {
                const unsub = firebase.auth().onAuthStateChanged(u => {
                    unsub(); resolve(u);
                });
                setTimeout(() => resolve(null), 3000);
            });
        }

        if (!liveUser || liveUser.uid !== cachedUser.uid) {
            alert('Your secure session has expired. Please sign out and sign back in to save.');
            return;
        }
        // ------------------------

        const originalText = saveMidBtn.innerHTML;
        saveMidBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Saving...';
        saveMidBtn.disabled = true;

        const StringId = window.currentMedicalData && window.currentMedicalData.id ? window.currentMedicalData.id : null;
        const generatedId = StringId || ('MID-' + cachedUser.uid.substring(0, 5).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000));

        const medicalData = {
            id: generatedId,
            age: document.getElementById('mid-age').value || '',
            bloodType: document.getElementById('mid-blood').value || '',
            allergies: document.getElementById('mid-allergies').value || '',
            medications: document.getElementById('mid-medications').value || '',
            conditions: document.getElementById('mid-conditions').value || '',
            contacts: document.getElementById('mid-contacts').value || '',
            updatedAt: new Date().toISOString()
        };

        try {
            await db.collection('users').doc(cachedUser.uid).set({ medicalId: medicalData }, { merge: true });

            window.currentMedicalData = medicalData;

            // Instantly transition to Display view
            document.getElementById('display-mid-age').textContent = medicalData.age || 'N/A';
            document.getElementById('display-mid-blood').textContent = medicalData.bloodType || 'N/A';
            document.getElementById('display-mid-allergies').textContent = medicalData.allergies || 'None';
            document.getElementById('display-mid-medications').textContent = medicalData.medications || 'None';
            document.getElementById('display-mid-conditions').textContent = medicalData.conditions || 'None';
            document.getElementById('display-mid-contacts').textContent = medicalData.contacts || 'None';

            document.getElementById('profile-mid-text').textContent = medicalData.id;
            document.getElementById('profile-mid-badge').style.display = 'flex';

            saveMidBtn.innerHTML = '<i class="ri-check-line"></i> Saved';
            saveMidBtn.style.color = 'white';

            setTimeout(() => {
                saveMidBtn.innerHTML = originalText;
                saveMidBtn.disabled = false;
                document.getElementById('medical-id-form-container').style.display = 'none';
                document.getElementById('medical-id-display-container').style.display = 'block';
                document.getElementById('cancel-edit-mid-btn').style.display = 'block';
            }, 800);

            if (analytics) analytics.logEvent('medical_id_updated');
        } catch (error) {
            console.error('Error saving Medical ID:', error);
            alert(`Failed to save: ${error.message || 'Permission denied or network error.'}`);
            saveMidBtn.innerHTML = originalText;
            saveMidBtn.disabled = false;
        }
    });

    // Share via WhatsApp
    const waBtn = document.getElementById('share-wa-btn');
    if (waBtn) {
        waBtn.addEventListener('click', () => {
            const data = window.currentMedicalData || {};
            const name = document.getElementById('profile-name').textContent || 'User';
            const mid = data.id || 'N/A';
            const age = data.age || 'N/A';
            const blood = data.bloodType || 'N/A';
            const allergies = data.allergies || 'None';
            const meds = data.medications || 'None';
            const conditions = data.conditions || 'None';
            const contacts = data.contacts || 'None';

            const text = `🚨 *Emergency Medical ID for ${name}* 🚨\n*ID:* ${mid}\n\n*Age:* ${age}\n*Blood Type:* ${blood}\n*Allergies:* ${allergies}\n*Current Medications:* ${meds}\n*Medical Conditions:* ${conditions}\n*Emergency Contacts:* ${contacts}\n\n_Generated via medintelli_`;

            const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
            if (analytics) analytics.logEvent('medical_id_shared_wa');
        });
    }

    // QR Code Generation
    const qrBtn = document.getElementById('show-qr-btn');
    const qrModal = document.getElementById('qr-modal');
    const closeQrBtn = document.getElementById('close-qr-btn');
    const qrContainer = document.getElementById('qrcode-container');

    if (qrBtn && qrModal) {
        qrBtn.addEventListener('click', () => {
            const data = window.currentMedicalData || {};
            const name = document.getElementById('profile-name').textContent || 'User';
            const mid = data.id || 'N/A';
            const age = data.age || 'N/A';
            const blood = data.bloodType || 'N/A';
            const allergies = data.allergies || 'None';
            const meds = data.medications || 'None';
            const conditions = data.conditions || 'None';
            const contacts = data.contacts || 'None';

            const text = `EMERGENCY MEDICAL ID\nName: ${name}\nID: ${mid}\nAge: ${age}\nBlood Type: ${blood}\nAllergies: ${allergies}\nMedications: ${meds}\nConditions: ${conditions}\nContacts: ${contacts}`;

            qrContainer.innerHTML = ''; // clear previous

            // Generate QR
            if (typeof QRCode !== 'undefined') {
                new QRCode(qrContainer, {
                    text: text,
                    width: 200,
                    height: 200,
                    colorDark: "#0f172a",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });
            } else {
                qrContainer.innerHTML = '<p style="color:red">QR Library failed to load.</p>';
            }

            qrModal.classList.remove('hidden');
            if (analytics) analytics.logEvent('medical_id_qr_viewed');
        });

        closeQrBtn.addEventListener('click', () => qrModal.classList.add('hidden'));
    }

    // Edit and Cancel Buttons
    const editBtn = document.getElementById('edit-medical-id-btn');
    const cancelBtn = document.getElementById('cancel-edit-mid-btn');

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            document.getElementById('medical-id-display-container').style.display = 'none';
            document.getElementById('medical-id-form-container').style.display = 'block';
            document.getElementById('mid-age').focus();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('medical-id-form-container').style.display = 'none';
            document.getElementById('medical-id-display-container').style.display = 'block';

            // Restore form fields
            if (window.currentMedicalData) {
                document.getElementById('mid-age').value = window.currentMedicalData.age || '';
                document.getElementById('mid-blood').value = window.currentMedicalData.bloodType || '';
                document.getElementById('mid-allergies').value = window.currentMedicalData.allergies || '';
                document.getElementById('mid-medications').value = window.currentMedicalData.medications || '';
                document.getElementById('mid-conditions').value = window.currentMedicalData.conditions || '';
                document.getElementById('mid-contacts').value = window.currentMedicalData.contacts || '';
            }
        });
    }
}

// =============================================
// BACK BUTTON PROTECTION
// =============================================
history.replaceState(null, '', 'profile.html');
