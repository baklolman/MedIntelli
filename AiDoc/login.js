// =============================================
// FIREBASE CONFIG & GOOGLE AUTH
// =============================================

// Firebase project configuration
// IMPORTANT: Replace these values with your own Firebase project credentials
// Go to https://console.firebase.google.com → Your Project → Settings → General → Your Apps
const firebaseConfig = {
    apiKey: "aa",
    authDomain: "medintelli-team.firebaseapp.com",
    projectId: "medintelli-team",
    storageBucket: "medintelli-team.firebasestorage.app",
    messagingSenderId: "66495074574",
    appId: "1:66495074574:web:ff77cd0345196ecac2075f",
    measurementId: "G-7BDQ95NQVN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Add scopes for user profile
provider.addScope('profile');
provider.addScope('email');

// Initialize Analytics, Performance & Firestore
let analytics = null;
let perf = null;
let db = null;

if (firebase.analytics) {
    analytics = firebase.analytics();
    analytics.logEvent('page_view', {
        page_title: 'MedIntelli Login',
        page_location: window.location.href
    });
}

if (firebase.performance) {
    perf = firebase.performance();
}

if (firebase.firestore) {
    db = firebase.firestore();
}

// =============================================
// THEME INHERITANCE
// =============================================
const savedTheme = localStorage.getItem('medintelli_theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
} else if (savedTheme === 'system') {
    const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', preferDark ? 'dark' : 'light');
}

// =============================================
// BACK BUTTON PROTECTION
// =============================================
// Prevent user from going back to onboarding after reaching login
history.replaceState(null, '', 'login.html');
window.addEventListener('popstate', () => {
    // If user presses back, keep them on login page
    history.pushState(null, '', 'login.html');
});

// =============================================
// DOM ELEMENTS
// =============================================
const googleBtn = document.getElementById('google-login-btn');
const errorBox = document.getElementById('login-error');
const errorText = document.getElementById('error-text');
const userGreeting = document.getElementById('user-greeting');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');

// =============================================
// CHECK IF ALREADY LOGGED IN
// =============================================
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is already authenticated — cache info & redirect
        cacheUserInfo(user);
        redirectToApp();
    }
});

// =============================================
// GOOGLE SIGN-IN HANDLER
// =============================================
googleBtn.addEventListener('click', async () => {
    // Set loading state
    googleBtn.classList.add('loading');
    googleBtn.innerHTML = `<div class="btn-spinner"></div><span>Signing in...</span>`;
    hideError();

    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        // Show greeting briefly
        showGreeting(user);

        // Cache user info to localStorage
        cacheUserInfo(user);

        // Analytics — track successful login
        if (analytics) {
            analytics.logEvent('login', { method: 'google' });
            analytics.setUserId(user.uid);
        }

        // Firestore — save/update user profile on login
        if (db) {
            try {
                await db.collection('users').doc(user.uid).set({
                    displayName: user.displayName || '',
                    email: user.email || '',
                    photoURL: user.photoURL || '',
                    country: localStorage.getItem('medintelli_country') || '',
                    language: localStorage.getItem('medintelli_language') || 'English',
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    loginCount: firebase.firestore.FieldValue.increment(1)
                }, { merge: true });
            } catch (e) {
                console.warn('Firestore user save error:', e);
            }
        }

        // Wait a moment for UX, then redirect
        setTimeout(() => {
            redirectToApp();
        }, 1200);

    } catch (error) {
        console.error('Login error:', error);

        // Analytics — track login failure
        if (analytics) {
            analytics.logEvent('login_error', {
                error_code: error.code || 'unknown',
                error_message: error.message || ''
            });
        }

        handleAuthError(error);
        resetButton();
    }
});

// =============================================
// HELPER FUNCTIONS
// =============================================

function cacheUserInfo(user) {
    const userInfo = {
        uid: user.uid,
        displayName: user.displayName || 'User',
        email: user.email || '',
        photoURL: user.photoURL || '',
        lastLogin: new Date().toISOString()
    };
    localStorage.setItem('medintelli_user', JSON.stringify(userInfo));
}

function showGreeting(user) {
    if (user.photoURL) {
        userPhoto.src = user.photoURL;
        userPhoto.style.display = 'block';
    } else {
        userPhoto.style.display = 'none';
    }
    userName.textContent = `Welcome, ${user.displayName || 'User'}!`;
    userGreeting.classList.add('visible');
}

function redirectToApp() {
    // Use replaceState so user can't go back to login after auth
    window.location.replace('index.html');
}

function showError(message) {
    errorText.textContent = message;
    errorBox.classList.add('visible');
}

function hideError() {
    errorBox.classList.remove('visible');
}

function resetButton() {
    googleBtn.classList.remove('loading');
    googleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>Sign in with Google</span>
    `;
}

function handleAuthError(error) {
    const errorMessages = {
        'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
        'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups for this site.',
        'auth/cancelled-popup-request': 'Only one sign-in window can be open at a time.',
        'auth/network-request-failed': 'Network error. Please check your internet connection.',
        'auth/too-many-requests': 'Too many login attempts. Please wait a moment and try again.',
        'auth/user-disabled': 'This account has been disabled. Please contact support.',
        'auth/internal-error': 'An internal error occurred. Please try again later.',
        'auth/invalid-api-key': 'Firebase configuration error. Please contact the administrator.'
    };

    const message = errorMessages[error.code] || `Login failed: ${error.message}`;
    showError(message);
}
