document.addEventListener('DOMContentLoaded', () => {
    // API Setup
    const API_KEY = "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";

    // DOM Elements - Onboarding
    const onboarding = document.getElementById('onboarding');
    const startAppBtn = document.getElementById('start-app-btn');
    const prepLanguage = document.getElementById('prep-language');
    const prepCountry = document.getElementById('prep-country');
    const disclaimerCheck = document.getElementById('disclaimer-check');

    // DOM Elements - Main Form
    const form = document.getElementById('symptom-form');
    const submitBtn = document.getElementById('submit-btn');
    const resultsContainer = document.getElementById('results');

    // DOM Elements - History & Emergency
    const historyBtn = document.getElementById('history-btn');
    const historyModal = document.getElementById('history-modal');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const historyList = document.getElementById('history-list');

    const emergencyBtn = document.getElementById('emergency-guide-btn');
    const emergencyModal = document.getElementById('emergency-modal');
    const closeEmergencyBtn = document.getElementById('close-emergency-btn');

    // DOM Elements - New Features
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const voiceInputBtn = document.getElementById('voice-input-btn');
    const severitySlider = document.getElementById('severity-slider');
    const severityHidden = document.getElementById('severity');
    const painLabel = document.getElementById('pain-label');

    emergencyBtn.addEventListener('click', () => emergencyModal.classList.remove('hidden'));
    closeEmergencyBtn.addEventListener('click', () => emergencyModal.classList.add('hidden'));

    // Auto-open SOS modal if arriving from another page via floating mobile button
    if (window.location.hash === '#open-sos') {
        setTimeout(() => {
            emergencyModal.classList.remove('hidden');
            history.replaceState(null, null, ' '); // clear hash
        }, 100);
    }

    // =============================================
    // DIAGNOSIS QUIZ BRIDGE (Auto-fill)
    // =============================================
    const quizBridgeStr = localStorage.getItem('medintelli_quiz_bridge');
    if (quizBridgeStr) {
        try {
            const bridgeData = JSON.parse(quizBridgeStr);
            const symptomsInput = document.getElementById('symptoms');
            if (symptomsInput && bridgeData.summary) {
                // Determine whether to append or replace based on if user typed something already
                symptomsInput.value = bridgeData.summary;

                // Show a quick visual cue
                symptomsInput.style.backgroundColor = 'rgba(11, 209, 187, 0.1)';
                setTimeout(() => symptomsInput.style.backgroundColor = '', 1500);
            }
        } catch (e) {
            console.warn("Could not parse quiz bridge payload.", e);
        }
        localStorage.removeItem('medintelli_quiz_bridge');
    }

    // =============================================
    // INTERACTIVE BODY MAP
    // =============================================
    const bodyMapModal = document.getElementById('body-map-modal');
    const openBodyMapBtn = document.getElementById('open-body-map-btn');
    const closeBodyMapBtn = document.getElementById('close-body-map-btn');
    const bodyMapDoneBtn = document.getElementById('body-map-done-btn');
    const bodyMapChips = document.getElementById('body-map-chips');
    const locationInput = document.getElementById('location');
    let selectedBodyParts = [];

    // Open modal — also clicking the read-only input
    const openBodyMap = () => {
        bodyMapModal.classList.remove('hidden');
        syncBodyMapUI();
    };
    openBodyMapBtn.addEventListener('click', openBodyMap);
    locationInput.addEventListener('click', openBodyMap);

    // Close modal
    closeBodyMapBtn.addEventListener('click', () => bodyMapModal.classList.add('hidden'));

    // Done — apply and close
    bodyMapDoneBtn.addEventListener('click', () => {
        locationInput.value = selectedBodyParts.join(', ');
        bodyMapModal.classList.add('hidden');
    });

    // Close on overlay click
    bodyMapModal.addEventListener('click', (e) => {
        if (e.target === bodyMapModal) {
            locationInput.value = selectedBodyParts.join(', ');
            bodyMapModal.classList.add('hidden');
        }
    });

    // Region click handler — works across both front + back SVGs
    document.querySelectorAll('.body-region').forEach(region => {
        region.addEventListener('click', () => {
            const name = region.getAttribute('data-region');
            const idx = selectedBodyParts.indexOf(name);
            if (idx > -1) {
                selectedBodyParts.splice(idx, 1);
            } else {
                selectedBodyParts.push(name);
            }
            syncBodyMapUI();
        });
    });

    // Sync SVG selected classes + chip bar
    function syncBodyMapUI() {
        // Update all region elements (both views share same data-region names)
        document.querySelectorAll('.body-region').forEach(region => {
            const name = region.getAttribute('data-region');
            region.classList.toggle('selected', selectedBodyParts.includes(name));
        });

        // Render chips
        bodyMapChips.innerHTML = '';
        selectedBodyParts.forEach(part => {
            const chip = document.createElement('span');
            chip.className = 'body-map-chip';
            chip.innerHTML = `${part} <button class="chip-remove" title="Remove ${part}">&times;</button>`;
            chip.querySelector('.chip-remove').addEventListener('click', () => {
                selectedBodyParts = selectedBodyParts.filter(p => p !== part);
                syncBodyMapUI();
            });
            bodyMapChips.appendChild(chip);
        });
    }

    // =============================================
    // SOS GUIDE — SEARCH & FILTER
    // =============================================
    const sosSearch = document.getElementById('sos-search');
    const sosGrid = document.getElementById('sos-grid');
    const sosNoResults = document.getElementById('sos-no-results');

    if (sosSearch && sosGrid) {
        sosSearch.addEventListener('input', () => {
            const query = sosSearch.value.toLowerCase().trim();
            const cards = sosGrid.querySelectorAll('.guide-card-link');
            let visibleCount = 0;

            cards.forEach(card => {
                const name = (card.getAttribute('data-name') || '').toLowerCase();
                const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
                const match = name.includes(query) || title.includes(query);
                card.style.display = match ? '' : 'none';
                if (match) visibleCount++;
            });

            if (sosNoResults) {
                sosNoResults.classList.toggle('hidden', visibleCount > 0);
            }
        });
    }

    // =============================================
    // SMOOTH PAGE TRANSITIONS
    // =============================================
    // Add transition overlay to page
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'page-transition-overlay';
    document.body.appendChild(transitionOverlay);

    // Intercept guide card clicks for smooth transition
    document.querySelectorAll('.guide-card-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            transitionOverlay.classList.add('active');
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });

    // =============================================
    // DARK MODE TOGGLE
    // =============================================
    let selectedThemeChoice = 'light'; // tracks onboarding picker

    const applyTheme = (theme) => {
        if (theme === 'system') {
            const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', preferDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        updateThemeIcon();
    };

    const initTheme = () => {
        const saved = localStorage.getItem('medintelli_theme');
        if (saved) {
            selectedThemeChoice = saved;
            applyTheme(saved);
        }
        // Sync onboarding picker active state
        updateOnboardingPicker(selectedThemeChoice);
        updateThemeIcon();
    };

    const updateThemeIcon = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        themeToggleBtn.querySelector('i').className = isDark ? 'ri-sun-line' : 'ri-moon-line';
    };

    const updateOnboardingPicker = (choice) => {
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme-choice') === choice);
        });
    };

    // Onboarding theme picker — live preview on click
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedThemeChoice = btn.getAttribute('data-theme-choice');
            updateOnboardingPicker(selectedThemeChoice);
            applyTheme(selectedThemeChoice);
        });
    });

    // Header toggle
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        selectedThemeChoice = newTheme;
        applyTheme(newTheme);
        localStorage.setItem('medintelli_theme', newTheme);
    });

    initTheme();

    // =============================================
    // VOICE INPUT (Web Speech API)
    // =============================================
    let recognition = null;
    let isRecording = false;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const symptomsField = document.getElementById('symptoms');
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            if (event.results[event.results.length - 1].isFinal) {
                symptomsField.value += (symptomsField.value ? ' ' : '') + transcript;
            }
        };

        recognition.onend = () => {
            isRecording = false;
            voiceInputBtn.classList.remove('recording');
            voiceInputBtn.querySelector('i').className = 'ri-mic-line';
        };

        recognition.onerror = () => {
            isRecording = false;
            voiceInputBtn.classList.remove('recording');
            voiceInputBtn.querySelector('i').className = 'ri-mic-line';
        };
    }

    voiceInputBtn.addEventListener('click', () => {
        if (!recognition) {
            alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
            return;
        }
        if (isRecording) {
            recognition.stop();
        } else {
            isRecording = true;
            voiceInputBtn.classList.add('recording');
            voiceInputBtn.querySelector('i').className = 'ri-mic-fill';
            recognition.start();
        }
    });

    // =============================================
    // PAIN SCALE SLIDER
    // =============================================
    const updatePainLabel = () => {
        const val = parseInt(severitySlider.value);
        let level, text, cssClass;
        if (val <= 3) {
            level = 'mild';
            text = 'Mild — Discomfort, but manageable';
            cssClass = 'mild';
        } else if (val <= 6) {
            level = 'moderate';
            text = 'Moderate — Affecting daily activities';
            cssClass = 'moderate';
        } else {
            level = 'severe';
            text = 'Severe — Intense, critical, or sudden onset';
            cssClass = 'severe';
        }
        severityHidden.value = level;
        painLabel.textContent = text;
        painLabel.className = 'pain-label ' + cssClass;
    };

    severitySlider.addEventListener('input', updatePainLabel);
    updatePainLabel();

    // State — load from cache if available
    let userLanguage = localStorage.getItem('medintelli_language') || 'English';
    let userCountry = localStorage.getItem('medintelli_country') || '';

    // Follow-up Chat State
    let chatHistory = [];          // {role: 'user'|'assistant', content: string}[]
    let lastConsultationFormData = null;
    let lastConsultationResult = null;
    let lastFirestoreDocRef = null;

    // History Logic
    const loadHistory = () => {
        const historyData = JSON.parse(localStorage.getItem('medintelli_history') || '[]');
        historyList.innerHTML = '';
        if (historyData.length === 0) {
            historyList.innerHTML = '<p style="color: #64748b; text-align: center;">No past consultations found.</p>';
            return;
        }

        historyData.reverse().forEach((item) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <h4>${item.date} • ${item.severity.toUpperCase()}</h4>
                <p><strong>Symptoms:</strong> ${item.symptoms}</p>
                <p><strong>Assessment:</strong> ${item.assessment}</p>
            `;
            historyList.appendChild(div);
        });
    };

    const saveToHistory = (formData, assessment) => {
        const historyData = JSON.parse(localStorage.getItem('medintelli_history') || '[]');
        historyData.push({
            date: new Date().toLocaleDateString(),
            symptoms: formData.symptoms,
            severity: formData.severity,
            assessment: assessment
        });
        localStorage.setItem('medintelli_history', JSON.stringify(historyData));
        loadHistory();
    };

    historyBtn.addEventListener('click', () => {
        loadHistory();
        historyModal.classList.remove('hidden');
    });

    closeHistoryBtn.addEventListener('click', () => {
        historyModal.classList.add('hidden');
    });

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to delete all past consultations?")) {
            localStorage.removeItem('medintelli_history');
            loadHistory();
        }
    });

    // Onboarding Logic
    startAppBtn.addEventListener('click', () => {
        const countryVal = prepCountry.value;
        if (!countryVal) {
            alert("Please select your country to personalize care context.");
            prepCountry.focus();
            return;
        }
        if (!disclaimerCheck.checked) {
            alert("You must agree to the medical disclaimer before proceeding.");
            return;
        }

        userLanguage = prepLanguage.value;
        userCountry = countryVal;

        // Cache preferences
        localStorage.setItem('medintelli_language', userLanguage);
        localStorage.setItem('medintelli_country', userCountry);
        localStorage.setItem('medintelli_theme', selectedThemeChoice);
        localStorage.setItem('medintelli_onboarded', 'true');

        // Fade out onboarding then redirect to login
        onboarding.style.opacity = '0';
        onboarding.style.transform = 'scale(1.05)';
        onboarding.style.pointerEvents = 'none';

        setTimeout(() => {
            window.location.replace('login.html');
        }, 400);
    });

    // =============================================
    // AUTH CHECK — Skip onboarding if already logged in
    // =============================================
    const cachedUser = JSON.parse(localStorage.getItem('medintelli_user') || 'null');
    const isOnboarded = localStorage.getItem('medintelli_onboarded') === 'true';

    if (cachedUser && isOnboarded && onboarding) {
        // User is authenticated + onboarded — skip directly to app
        onboarding.style.display = 'none';
        userLanguage = localStorage.getItem('medintelli_language') || 'English';
        userCountry = localStorage.getItem('medintelli_country') || '';

        // Show user profile in header if element exists
        const userProfileEl = document.getElementById('user-profile-display');
        if (userProfileEl) {
            const photo = cachedUser.photoURL
                ? `<img src="${cachedUser.photoURL}" alt="" class="header-avatar">`
                : `<i class="ri-user-3-fill header-avatar-icon"></i>`;
            userProfileEl.innerHTML = `${photo}<span class="header-user-name">${cachedUser.displayName || 'User'}</span>`;
            userProfileEl.classList.remove('hidden');
        }
    } else if (!cachedUser && isOnboarded) {
        // Onboarded but not logged in — redirect to login
        window.location.replace('login.html');
    }

    // =============================================
    // FIREBASE INIT — Firestore, Analytics, Performance
    // =============================================
    const firebaseConfig = {
        apiKey: "AIzaSyD7q-9_5SOHE2B-A5FJA_UAuyCZFUapSWQ",
        authDomain: "medintelli-team.firebaseapp.com",
        projectId: "medintelli-team",
        storageBucket: "medintelli-team.firebasestorage.app",
        messagingSenderId: "66495074574",
        appId: "1:66495074574:web:ff77cd0345196ecac2075f",
        measurementId: "G-7BDQ95NQVN"
    };

    // Only init Firebase if not already initialized
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Initialize Firebase services
    let db = null;
    let analytics = null;
    let perf = null;
    let firebaseAuthUser = null; // LIVE Firebase auth user (not localStorage cache)

    if (typeof firebase !== 'undefined') {
        // Firestore — store user consultations
        if (firebase.firestore) {
            db = firebase.firestore();
        }

        // Auth — wait for LIVE auth session to restore
        if (firebase.auth) {
            // Set persistence so auth stays across page reloads
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(e => {
                console.warn('Auth persistence error:', e);
            });

            // Listen for auth state — this fires when Firebase restores the session
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    firebaseAuthUser = user;
                    console.log('🔑 Firebase Auth LIVE session restored:', user.email);
                } else {
                    firebaseAuthUser = null;
                    console.log('🔑 Firebase Auth: No active session');
                }
            });
        }

        // Analytics — track user engagement
        if (firebase.analytics) {
            analytics = firebase.analytics();

            // Log page view
            analytics.logEvent('page_view', {
                page_title: 'MySymptoms Home',
                page_location: window.location.href
            });

            // Set user properties if cached user exists
            if (cachedUser) {
                analytics.setUserId(cachedUser.uid);
                analytics.setUserProperties({
                    country: userCountry,
                    language: userLanguage,
                    theme: localStorage.getItem('medintelli_theme') || 'light'
                });
            }
        }

        // Performance Monitoring
        if (firebase.performance) {
            perf = firebase.performance();
        }
    }

    // Helper: wait for Firebase Auth to be ready (max 5 seconds)
    function waitForAuth() {
        return new Promise((resolve) => {
            if (firebaseAuthUser) {
                resolve(firebaseAuthUser);
                return;
            }
            // Wait for onAuthStateChanged to fire
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            });
            // Timeout after 5 seconds
            setTimeout(() => resolve(null), 5000);
        });
    }

    // =============================================
    // ANALYTICS EVENT HELPERS
    // =============================================
    function logAnalyticsEvent(eventName, params = {}) {
        if (analytics) {
            try {
                analytics.logEvent(eventName, params);
            } catch (e) {
                console.warn('Analytics event error:', e);
            }
        }
    }

    // Track SOS Guide opens
    emergencyBtn.addEventListener('click', () => {
        logAnalyticsEvent('sos_guide_opened');
    });

    // Track History panel opens
    historyBtn.addEventListener('click', () => {
        logAnalyticsEvent('history_opened');
    });

    // Track theme changes
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        logAnalyticsEvent('theme_changed', { theme: isDark ? 'dark' : 'light' });
    });

    // Track SOS guide card clicks
    document.querySelectorAll('.guide-card-link').forEach(link => {
        link.addEventListener('click', () => {
            const guideName = link.getAttribute('data-name') || 'unknown';
            logAnalyticsEvent('sos_guide_card_clicked', { guide_name: guideName });
        });
    });

    // =============================================
    // FIRESTORE — SAVE CONSULTATIONS
    // =============================================
    async function saveConsultationToFirestore(formData, aiResult) {
        console.log('🔥 Firestore Save — Starting...');
        console.log('   db:', db ? '✅ Connected' : '❌ NULL');

        if (!db) {
            console.error('❌ Firestore database not initialized. Check Firebase SDK loading.');
            return;
        }

        // CRITICAL: Wait for actual Firebase Auth session (not just localStorage)
        console.log('🔑 Waiting for Firebase Auth session...');
        const authUser = await waitForAuth();

        if (!authUser) {
            console.error('❌ No LIVE Firebase Auth session. User needs to sign in again.');
            console.error('   cachedUser exists:', !!cachedUser);
            console.error('   firebase.auth().currentUser:', firebase.auth().currentUser);
            return;
        }

        console.log('🔑 Auth confirmed:', authUser.email, '| UID:', authUser.uid);

        const now = new Date();
        const uid = authUser.uid; // Use LIVE auth user's UID

        const consultationData = {
            // Patient input — ALL fields
            age: formData.age,
            gender: formData.gender,
            symptoms: formData.symptoms,
            bodyLocation: formData.location || 'Not specified',
            severity: formData.severity,
            medications: formData.medications || 'None',

            // AI response — FULL output
            assessment: aiResult.assessment || '',
            conditions: aiResult.conditions || [],
            treatment: aiResult.treatment || [],
            lifestyle: aiResult.lifestyle || [],
            dietAdvice: aiResult.diet_advice || [],
            drugInteractions: aiResult.drug_interactions || [],
            redFlags: aiResult.red_flags || [],
            specialist: aiResult.specialist || '',
            followUp: aiResult.follow_up || '',
            emergency: aiResult.emergency || '',
            disclaimer: aiResult.disclaimer || '',

            // User info
            userId: uid,
            userName: authUser.displayName || '',
            userEmail: authUser.email || '',

            // Location & Language
            country: userCountry,
            language: userLanguage,

            // Time & Date — multiple formats for easy querying
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: now.toISOString(),
            date: now.toLocaleDateString('en-IN'),
            time: now.toLocaleTimeString('en-IN'),
            dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
            month: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),

            // Device info
            userAgent: navigator.userAgent,
            screenSize: `${screen.width}x${screen.height}`,
            platform: navigator.platform || 'unknown'
        };

        try {
            // Save consultation
            const docRef = await db.collection('users').doc(uid)
                .collection('consultations').add(consultationData);
            console.log('✅ Consultation saved! Doc ID:', docRef.id);
            lastFirestoreDocRef = docRef; // Store ref for chat transcript updates

            // Update user profile
            await db.collection('users').doc(uid).set({
                displayName: authUser.displayName || '',
                email: authUser.email || '',
                photoURL: authUser.photoURL || '',
                country: userCountry,
                language: userLanguage,
                lastConsultation: firebase.firestore.FieldValue.serverTimestamp(),
                lastConsultationDate: now.toISOString(),
                totalConsultations: firebase.firestore.FieldValue.increment(1),
                lastSeverity: formData.severity,
                lastSymptoms: formData.symptoms
            }, { merge: true });
            console.log('✅ User profile updated!');

            logAnalyticsEvent('consultation_saved', {
                severity: formData.severity,
                has_medications: formData.medications !== 'None' && formData.medications !== ''
            });

        } catch (error) {
            console.error('❌ FIRESTORE SAVE ERROR:', error.code, error.message);
            console.error('   Full error:', error);

            // Show user-visible alert for common issues
            if (error.code === 'permission-denied') {
                console.error('🔒 PERMISSION DENIED — Check Firestore Rules in Firebase Console');
                console.error('   Auth UID used:', uid);
                console.error('   firebase.auth().currentUser:', firebase.auth().currentUser?.uid);
            }
        }
    }

    // Sign Out Button
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn && cachedUser) {
        signOutBtn.style.display = '';
        signOutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to sign out?')) {
                logAnalyticsEvent('sign_out');

                // Clear all user data from cache
                localStorage.removeItem('medintelli_user');
                localStorage.removeItem('medintelli_onboarded');
                localStorage.removeItem('medintelli_country');
                localStorage.removeItem('medintelli_language');

                // Sign out from Firebase
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    firebase.auth().signOut().catch(() => { });
                }

                // Redirect to login
                window.location.replace('login.html');
            }
        });
    }

    // Back button protection — prevent returning to login page
    history.replaceState(null, '', 'index.html');
    window.addEventListener('popstate', () => {
        history.pushState(null, '', 'index.html');
    });

    // Core Processing
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value,
            symptoms: document.getElementById('symptoms').value,
            location: document.getElementById('location').value || 'Not specified',
            severity: document.getElementById('severity').value,
            medications: document.getElementById('medications').value || 'None'
        };

        if (formData.age <= 0 || formData.age > 150) {
            alert("Please enter a valid age.");
            return;
        }
        if (!formData.symptoms.trim()) {
            alert("Please describe your symptoms.");
            return;
        }

        setLoadingState(true);

        try {
            logAnalyticsEvent('consultation_submitted', {
                severity: formData.severity,
                gender: formData.gender,
                age_group: formData.age <= 12 ? 'child' : formData.age <= 17 ? 'teen' : formData.age <= 45 ? 'young_adult' : formData.age <= 65 ? 'middle_aged' : 'elderly'
            });

            const result = await fetchGroqGuidance(formData);
            renderPrescriptionResults(result, formData);
            saveToHistory(formData, result.assessment);

            // Reset chat for new consultation & store context
            chatHistory = [];
            lastConsultationFormData = formData;
            lastConsultationResult = result;
            lastFirestoreDocRef = null;
            saveConsultationToFirestore(formData, result);

            logAnalyticsEvent('consultation_success', { severity: formData.severity });
        } catch (error) {
            console.warn("API Error:", error);
            const fallbackResult = getFallbackGuidance(formData);
            renderPrescriptionResults(fallbackResult, formData);
            saveToHistory(formData, fallbackResult.assessment);

            logAnalyticsEvent('consultation_fallback', { error: error.message || 'unknown' });
        } finally {
            setLoadingState(false);
        }
    });

    function setLoadingState(isLoading) {
        const span = submitBtn.querySelector('span');
        const icon = submitBtn.querySelector('i');
        const spinner = submitBtn.querySelector('.spinner');

        if (isLoading) {
            span.classList.add('hidden');
            icon.classList.add('hidden');
            spinner.classList.remove('hidden');
            form.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = true);
        } else {
            span.classList.remove('hidden');
            icon.classList.remove('hidden');
            spinner.classList.add('hidden');
            form.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = false);
        }
    }

    // Dynamic Prompting & API Execution
    async function fetchGroqGuidance(data) {
        const isSevere = data.severity.toLowerCase() === 'severe';

        // Gender-specific medical considerations
        const genderContext = (() => {
            switch (data.gender) {
                case 'male':
                    return `GENDER-SPECIFIC CONSIDERATIONS: Patient is male. Consider conditions with higher male prevalence (e.g., cardiac events present differently — classic crushing chest pain is more common). Consider prostate-related issues for age >40. Consider testosterone-related conditions. Males have higher risk for gout, kidney stones, certain hernias.`;
                case 'female':
                    return `GENDER-SPECIFIC CONSIDERATIONS: Patient is female. Consider conditions with higher female prevalence (e.g., cardiac events may present atypically — fatigue, nausea, jaw/back pain instead of chest pain). Consider menstrual cycle, pregnancy possibility (ask "could you be pregnant?"), hormonal factors, UTIs (more common in females), autoimmune conditions (higher prevalence in females), ovarian/uterine conditions. Adjust medication advice for potential pregnancy.`;
                case 'other':
                    return `GENDER-SPECIFIC CONSIDERATIONS: Patient identifies as other gender. Consider hormonal therapy interactions if applicable. Be inclusive and thorough in differential diagnosis across all gender-specific conditions.`;
                default:
                    return `GENDER-SPECIFIC CONSIDERATIONS: Gender not specified. Consider all gender-specific conditions in differential diagnosis.`;
            }
        })();

        // Age-specific medical considerations
        const ageContext = (() => {
            const age = parseInt(data.age);
            if (age <= 2) return `AGE CONTEXT: Infant/toddler. Use pediatric dosing ONLY. Many OTC medications are NOT safe. Recommend IMMEDIATE medical evaluation for most symptoms. Dehydration risk is HIGH.`;
            if (age <= 12) return `AGE CONTEXT: Child. Use pediatric-specific dosing based on weight/age. Avoid aspirin (Reye's syndrome risk). Many adult medications require dose adjustment. Prefer pediatric formulations (syrups, chewables).`;
            if (age <= 17) return `AGE CONTEXT: Adolescent. Some adult doses may apply but verify. Consider growth-related conditions, mental health, sports injuries.`;
            if (age <= 45) return `AGE CONTEXT: Young adult. Standard adult dosing applies. Consider lifestyle-related conditions, stress, occupational factors.`;
            if (age <= 65) return `AGE CONTEXT: Middle-aged adult. Screen for chronic conditions (hypertension, diabetes, cholesterol). Higher cardiac risk. Consider cancer screening recommendations.`;
            return `AGE CONTEXT: Elderly (>65). Reduced kidney/liver function — LOWER doses often needed. Higher fall risk. Drug interactions more dangerous. Polypharmacy concerns. Consider dementia-related conditions. Avoid certain medications (e.g., NSAIDs long-term, benzodiazepines).`;
        })();

        // Country-specific medicine availability
        const countryContext = `COUNTRY-SPECIFIC INSTRUCTIONS: Patient is in ${userCountry}. You MUST recommend medicines by their LOCAL BRAND NAMES commonly available in ${userCountry}. Include generic names in parentheses. Consider:
- Local OTC availability (some drugs are prescription-only in certain countries)
- Local emergency numbers (e.g., India: 108/112, US: 911, UK: 999/111, EU: 112)
- Regional disease prevalence (e.g., malaria/dengue in tropical countries, Lyme disease in temperate regions)
- Local dietary and environmental factors that may affect symptoms
- Healthcare system context (private vs public, pharmacy accessibility)`;

        const medicalInstruction = isSevere
            ? `SEVERITY PROTOCOL — SEVERE: DO NOT list specific self-medications. This patient reports SEVERE symptoms. You MUST:
1. Strongly advise seeking IMMEDIATE professional emergency care
2. Provide the local emergency number for ${userCountry}
3. List specific RED FLAG symptoms to watch for that require immediate hospital visit
4. Give ONLY safe stabilization advice while waiting for help (positioning, what to avoid)
5. NEVER recommend self-treatment for severe symptoms`
            : `TREATMENT PROTOCOL — MILD/MODERATE: You MUST provide:
1. SPECIFIC OTC medicine names (local brand names for ${userCountry} + generic name)
2. EXACT dosing: dose amount, frequency, duration (e.g., "500mg every 6 hours for 3-5 days")
3. HOW TO USE: with food? with water? timing relative to meals?
4. CONTRAINDICATIONS: who should NOT take this medicine
5. WHEN TO STOP: side effects that mean stop immediately
6. WHEN TO ESCALATE: symptoms that mean "see a doctor now"`;

        const medicationWarning = data.medications && data.medications !== 'None'
            ? `\nDRUG INTERACTION ALERT — CRITICAL: Patient currently takes: ${data.medications}. You MUST:
1. Cross-check EVERY recommended treatment against these medications
2. Flag dangerous combinations (e.g., blood thinners + NSAIDs, SSRIs + certain pain relievers)
3. Include specific warnings in "drug_interactions" array
4. Suggest safer alternatives if interactions are found
5. If unsure about an interaction, err on the side of caution and warn the patient`
            : '';

        const bodyLocationContext = data.location && data.location !== 'Not specified'
            ? `\nBODY LOCATION ANALYSIS: Pain/symptoms localized to "${data.location}". Use anatomical knowledge to narrow differential diagnosis. Consider referred pain patterns (e.g., left shoulder pain could indicate cardiac issues, right lower quadrant pain could indicate appendicitis).`
            : '';

        const prompt = `You are a Clinical Decision Support AI for MySymptoms Clinic. Analyze the following patient data with the precision of an experienced diagnostician.

=== PATIENT DATA ===
- Age: ${data.age} years
- Gender: ${data.gender}
- Country: ${userCountry}
- Language: ${userLanguage}
- Presenting Symptoms: ${data.symptoms}
- Body Location: ${data.location || 'Not specified'}
- Self-Reported Severity: ${data.severity} (Pain Scale)
- Current Medications: ${data.medications}

=== CLINICAL REASONING INSTRUCTIONS ===
${genderContext}

${ageContext}

${countryContext}

${medicalInstruction}${medicationWarning}${bodyLocationContext}

=== DIAGNOSTIC APPROACH ===
1. Consider the TOP 2-3 most likely conditions based on ALL the patient data
2. For each possible condition, note which symptoms support it
3. Identify any RED FLAG symptoms that require urgent attention
4. Factor in the patient's age, gender, and regional disease prevalence
5. Provide actionable, specific guidance — not generic advice

=== OUTPUT FORMAT ===
Respond STRICTLY with valid JSON translated to ${userLanguage}:
{
  "assessment": "Detailed clinical assessment. Start with the most likely condition(s) and explain WHY based on the symptoms, age, and gender. Mention differential diagnoses. Be specific, not vague.",
  "conditions": ["Array of 2-3 most likely conditions in order of probability"],
  "red_flags": ["Array of WARNING symptoms that mean 'go to ER immediately'. Empty array if none apply."],
  "treatment": ["ARRAY OF FLAT STRINGS. Each string = one specific treatment recommendation with exact dosing, brand name (generic), and how-to-use instructions."],
  "lifestyle": ["ARRAY OF FLAT STRINGS. Specific, actionable do's and don'ts tailored to the suspected condition(s). Not generic wellness advice."],
  "diet_advice": ["ARRAY OF FLAT STRINGS. Foods to eat and avoid specifically for this condition."],
  "drug_interactions": ["ARRAY OF FLAT STRINGS. Interactions with current medications. Empty array if none."],
  "specialist": "Which type of doctor/specialist should the patient see if symptoms persist (e.g., 'Cardiologist', 'Orthopedic surgeon'). Empty string if self-care is sufficient.",
  "follow_up": "When to follow up: specific timeframe (e.g., 'See a doctor if symptoms don't improve within 48 hours' or 'Seek immediate care').",
  "emergency": "Emergency instructions if severe, else empty string.",
  "disclaimer": "This AI-generated guidance is for informational purposes only and does not replace professional medical consultation. Always consult a licensed healthcare provider."
}`;

        const systemPrompt = `You are an expert Clinical Decision Support System. You think like an experienced physician with 20+ years of practice. You:
- Analyze symptoms using differential diagnosis methodology
- Consider patient demographics (age, gender, location) in every recommendation
- Recommend medicines by LOCAL BRAND NAMES available in the patient's country
- Provide EXACT dosing with specific instructions (not vague advice)
- Never miss red flag symptoms that could indicate emergency conditions
- Adjust recommendations for pediatric, geriatric, and pregnancy-related concerns
- Cross-check drug interactions meticulously
- Output ONLY valid JSON. No markdown, no extra text.`;

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
                temperature: 0.15,
                max_tokens: 2048,
                response_format: { type: "json_object" }
            })
        });

        const json = await response.json();
        if (!response.ok) throw new Error(json.error?.message);

        return JSON.parse(json.choices[0].message.content);
    }

    function getFallbackGuidance(data) {
        const isSevere = data.severity === 'severe';
        return {
            assessment: `(OFFLINE MODE) Assessment: Patient reports ${data.severity} symptoms (${data.symptoms}).`,
            conditions: ['Unable to determine — AI server unavailable'],
            red_flags: isSevere ? ['Seek immediate medical attention for severe symptoms'] : [],
            treatment: isSevere ?
                ["SEVERITY IS HIGH: Seek immediate medical help."] :
                ["Rest and consider taking standard OTC medication for symptom relief if you have no allergies."],
            lifestyle: ["Stay hydrated.", "Rest thoroughly."],
            diet_advice: ["Eat light, easily digestible foods.", "Avoid heavy or spicy meals."],
            drug_interactions: [],
            specialist: '',
            follow_up: 'See a doctor if symptoms persist beyond 24 hours.',
            emergency: isSevere ? "🚨 HIGH SEVERITY ALERT: Contact local emergency services." : "",
            disclaimer: "OFFLINE NOTICE: AI server unavailable. This guidance is generic."
        };
    }

    // PDF, Print, and DOM Injection
    function renderPrescriptionResults(data, formData) {
        resultsContainer.innerHTML = '';

        const pad = document.createElement('div');
        pad.id = 'prescription-pad';
        pad.className = 'prescription-pad';

        const dateStr = new Date().toLocaleDateString(userLanguage === 'English' ? 'en-US' : undefined);

        const parseList = (item) => {
            if (typeof item === 'object' && item !== null) {
                return Object.values(item).filter(v => typeof v === 'string').join(' — ');
            }
            return String(item);
        };

        const list2Html = (arr) => (arr || []).map(i => `<li>${parseList(i)}</li>`).join('');

        let emergencyHtml = '';
        if (data.emergency && formData.severity === 'severe') {
            emergencyHtml = `
            <div class="prescription-section alert-section">
                <h4>⚠️ Emergency Notice</h4>
                <p><strong>${data.emergency}</strong></p>
            </div>`;
        }

        // Red flags section
        let redFlagsHtml = '';
        if (data.red_flags && data.red_flags.length > 0) {
            redFlagsHtml = `
            <div class="prescription-section alert-section" style="border-left-color: #dc2626; background: #fef2f2;">
                <h4>🚩 Red Flag Symptoms — Seek Immediate Care If:</h4>
                <ul class="clean-list">${list2Html(data.red_flags)}</ul>
            </div>`;
        }

        // Conditions section
        let conditionsHtml = '';
        if (data.conditions && data.conditions.length > 0) {
            conditionsHtml = `
            <div class="prescription-section">
                <h4>🔍 Suspected Conditions</h4>
                <div class="conditions-chips">
                    ${data.conditions.map((c, i) => `<span class="condition-chip ${i === 0 ? 'primary' : ''}">${i === 0 ? '⭐ Most Likely: ' : ''}${parseList(c)}</span>`).join('')}
                </div>
            </div>`;
        }

        // Diet advice section
        let dietHtml = '';
        if (data.diet_advice && data.diet_advice.length > 0) {
            dietHtml = `
            <div class="prescription-section">
                <h4>🥗 Diet & Nutrition Advice</h4>
                <ul class="clean-list">${list2Html(data.diet_advice)}</ul>
            </div>`;
        }

        // Specialist + Follow-up section
        let followUpHtml = '';
        if (data.specialist || data.follow_up) {
            followUpHtml = `
            <div class="prescription-section" style="border-left: 3px solid var(--primary-color);">
                <h4>📋 Follow-Up Guidance</h4>
                ${data.specialist ? `<p><strong>Recommended Specialist:</strong> ${data.specialist}</p>` : ''}
                ${data.follow_up ? `<p><strong>Follow-Up:</strong> ${data.follow_up}</p>` : ''}
            </div>`;
        }

        pad.innerHTML = `
            <div class="prescription-header">
                <div class="clinic-info">
                    <h2>MySymptoms Clinic</h2>
                    <p>AI Clinical Decision Support System</p>
                </div>
                <div class="patient-info">
                    <p><strong>Date:</strong> ${dateStr}</p>
                    <p><strong>Age:</strong> ${formData.age}</p>
                    <p><strong>Gender:</strong> ${formData.gender}</p>
                    <p><strong>Region:</strong> ${userCountry}</p>
                </div>
            </div>
            
            <div class="rx-symbol">Rx</div>

            ${emergencyHtml}

            ${redFlagsHtml}

            <div class="prescription-section">
                <h4>Clinical Assessment</h4>
                <p>${data.assessment}</p>
            </div>

            ${conditionsHtml}

            <div class="prescription-section highlights">
                <h4>Recommended Treatment & Medications</h4>
                <ul class="clean-list">${list2Html(data.treatment)}</ul>
            </div>

            <div class="prescription-section">
                <h4>Lifestyle & Care</h4>
                <ul class="clean-list">${list2Html(data.lifestyle)}</ul>
            </div>

            ${dietHtml}
            
            ${(data.drug_interactions && data.drug_interactions.length > 0) ? `
            <div class="prescription-section alert-section" style="border-left-color: #f59e0b;">
                <h4>⚠️ Drug Interaction Warnings</h4>
                <ul class="clean-list">${list2Html(data.drug_interactions)}</ul>
            </div>` : ''}

            ${followUpHtml}

            <div class="doc-signature">
                <div class="sign-line"></div>
                ${data.assessment.includes("OFFLINE MODE") ? "<p>MySymptoms Offline Engine</p>" : "<p>Generated by MySymptoms AI</p>"}
            </div>

            <div class="prescription-footer">
                <strong>Disclaimer:</strong> ${data.disclaimer}
            </div>
        `;
        resultsContainer.appendChild(pad);

        // Action Row
        const actionRow = document.createElement('div');
        actionRow.className = 'action-row';

        // Native Print Button
        const printBtn = document.createElement('button');
        printBtn.className = 'secondary-btn';
        printBtn.innerHTML = `<i class="ri-printer-line"></i> <span>Print</span>`;
        printBtn.style.flex = "1";
        printBtn.onclick = () => window.print();

        // PDF Button
        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'download-btn';
        downloadBtn.className = 'primary-btn';
        downloadBtn.style.margin = "0";
        downloadBtn.style.flex = "2";
        downloadBtn.innerHTML = `<i class="ri-file-download-line"></i> <span>Download PDF</span>`;

        downloadBtn.onclick = () => {
            const clone = document.getElementById('prescription-pad').cloneNode(true);
            clone.style.backgroundColor = '#ffffff';

            const printWrapper = document.createElement('div');
            printWrapper.style.position = 'fixed';
            printWrapper.style.top = '0';
            printWrapper.style.zIndex = '-9999';
            printWrapper.appendChild(clone);
            document.body.appendChild(printWrapper);

            downloadBtn.disabled = true;
            downloadBtn.innerHTML = `<i class="ri-loader-line spinner-icon"></i>`;

            html2pdf().set({
                margin: 10,
                filename: 'medintelli_Prescription.pdf',
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollY: 0, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).from(clone).save().then(() => {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = `<i class="ri-file-download-line"></i> <span>Download PDF</span>`;
                document.body.removeChild(printWrapper);
            });
        };

        actionRow.appendChild(printBtn);
        actionRow.appendChild(downloadBtn);
        resultsContainer.appendChild(actionRow);

        // Share Row
        const shareRow = document.createElement('div');
        shareRow.className = 'share-row';

        // Copy to Clipboard Button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'share-btn';
        copyBtn.innerHTML = `<i class="ri-clipboard-line"></i> Copy to Clipboard`;
        copyBtn.onclick = () => {
            const pad = document.getElementById('prescription-pad');
            const text = pad.innerText;
            navigator.clipboard.writeText(text).then(() => {
                const toast = document.createElement('div');
                toast.className = 'copy-toast';
                toast.innerHTML = '<i class="ri-checkbox-circle-fill"></i> Copied to clipboard!';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2500);
            }).catch(() => {
                alert('Failed to copy. Please try manually selecting the text.');
            });
        };

        // Email Button
        const emailBtn = document.createElement('button');
        emailBtn.className = 'share-btn';
        emailBtn.innerHTML = `<i class="ri-mail-send-line"></i> Share via Email`;
        emailBtn.onclick = () => {
            const pad = document.getElementById('prescription-pad');
            const text = pad.innerText;
            const subject = encodeURIComponent('MySymptoms - AI Medical Consultation Report');
            const body = encodeURIComponent(text);
            window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
        };

        shareRow.appendChild(copyBtn);
        shareRow.appendChild(emailBtn);
        resultsContainer.appendChild(shareRow);

        // =============================================
        // FOLLOW-UP CONSULTATION CHAT — inject UI
        // =============================================
        const chatContainer = document.createElement('div');
        chatContainer.className = 'followup-chat';
        chatContainer.innerHTML = `
            <div class="followup-chat-header">
                <i class="ri-chat-smile-2-line"></i>
                <h4>Follow-up Questions</h4>
                <span>— Ask anything about this diagnosis</span>
            </div>
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-row">
                <input type="text" id="chat-input" placeholder="e.g. Is this safe for my child?" autocomplete="off">
                <button type="button" id="chat-send-btn" class="chat-send-btn" title="Send">
                    <i class="ri-send-plane-2-fill"></i>
                </button>
            </div>
        `;
        resultsContainer.appendChild(chatContainer);

        // Chat DOM refs
        const chatMessagesEl = chatContainer.querySelector('#chat-messages');
        const chatInput = chatContainer.querySelector('#chat-input');
        const chatSendBtn = chatContainer.querySelector('#chat-send-btn');

        const sendChatMessage = async () => {
            const msg = chatInput.value.trim();
            if (!msg) return;

            // Show user bubble
            const userBubble = document.createElement('div');
            userBubble.className = 'chat-msg user';
            userBubble.textContent = msg;
            chatMessagesEl.appendChild(userBubble);

            chatHistory.push({ role: 'user', content: msg });
            chatInput.value = '';
            chatSendBtn.disabled = true;

            // Typing indicator
            const typing = document.createElement('div');
            typing.className = 'chat-typing';
            typing.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
            chatMessagesEl.appendChild(typing);
            chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;

            try {
                const reply = await fetchFollowupResponse(msg);
                typing.remove();

                const aiBubble = document.createElement('div');
                aiBubble.className = 'chat-msg ai';
                aiBubble.innerHTML = `<span class="chat-ai-label">MySymptoms AI</span>${reply}`;
                chatMessagesEl.appendChild(aiBubble);

                chatHistory.push({ role: 'assistant', content: reply });

                // Update Firestore with transcript
                updateFirestoreTranscript();

                logAnalyticsEvent('followup_chat_sent', { message_count: chatHistory.length });
            } catch (err) {
                typing.remove();
                const errBubble = document.createElement('div');
                errBubble.className = 'chat-msg ai';
                errBubble.innerHTML = `<span class="chat-ai-label">MySymptoms AI</span>Sorry, I couldn't process that. Please try again.`;
                chatMessagesEl.appendChild(errBubble);
            } finally {
                chatSendBtn.disabled = false;
                chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
                chatInput.focus();
            }
        };

        chatSendBtn.addEventListener('click', sendChatMessage);
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });

        resultsContainer.classList.remove('hidden');
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // =============================================
    // FOLLOW-UP CHAT — API CALL
    // =============================================
    async function fetchFollowupResponse(userMessage) {
        const fd = lastConsultationFormData;
        const result = lastConsultationResult;

        const systemPrompt = `You are MySymptoms AI, a follow-up medical consultation assistant. You have FULL CONTEXT of the patient's consultation below. Answer the user's follow-up question with the same clinical depth, precision, and care.

Rules:
- Keep answers concise (2-4 paragraphs max)
- Reference the original diagnosis when relevant
- Use the patient's language: ${userLanguage}
- If the question is outside scope, politely redirect to consult a real doctor
- Always include safety disclaimers for medication questions
- Do NOT output JSON — respond in natural, readable text

=== ORIGINAL CONSULTATION CONTEXT ===
Patient: Age ${fd.age}, Gender: ${fd.gender}, Country: ${userCountry}
Symptoms: ${fd.symptoms}
Body Location: ${fd.location || 'Not specified'}
Severity: ${fd.severity}
Medications: ${fd.medications || 'None'}

AI Assessment: ${result.assessment}
Suspected Conditions: ${(result.conditions || []).join(', ')}
Treatment Given: ${(result.treatment || []).join('; ')}
Red Flags: ${(result.red_flags || []).join('; ')}
Specialist: ${result.specialist || 'None'}
Follow-up: ${result.follow_up || 'None'}
====================================`;

        // Build messages array with full chat history
        const messages = [
            { role: 'system', content: systemPrompt },
            ...chatHistory
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.3,
                max_tokens: 1024
            })
        });

        const json = await response.json();
        if (!response.ok) throw new Error(json.error?.message);

        return json.choices[0].message.content;
    }

    // =============================================
    // FIRESTORE — UPDATE WITH CHAT TRANSCRIPT
    // =============================================
    async function updateFirestoreTranscript() {
        if (!db || !lastFirestoreDocRef) return;
        try {
            await lastFirestoreDocRef.update({
                chatTranscript: chatHistory.map(m => ({
                    role: m.role,
                    content: m.content,
                    timestamp: new Date().toISOString()
                })),
                chatMessageCount: chatHistory.length
            });
            console.log('✅ Chat transcript updated in Firestore');
        } catch (e) {
            console.warn('Chat transcript update failed:', e);
        }
    }
});
