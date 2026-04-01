// =============================================
// MOBILE NAVIGATION DRAWER — MySymptoms
// Injected dynamically on all pages.
// =============================================

(function () {
    // Only activate at mobile breakpoint
    // But we still inject the HTML so that the CSS toggle works on resize

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Detect active page for highlight
    function isActive(href) {
        return currentPage === href || (currentPage === '' && href === 'index.html');
    }

    // --- Build Hamburger Button ---
    const hamburger = document.createElement('button');
    hamburger.className = 'mobile-hamburger';
    hamburger.id = 'mobile-hamburger';
    hamburger.setAttribute('aria-label', 'Open Menu');
    hamburger.innerHTML = '<i class="ri-menu-3-line"></i>';

    // Insert into header-inner (after logo)
    const headerInner = document.querySelector('.header-inner');
    if (headerInner) {
        headerInner.appendChild(hamburger);
    }

    // --- Build Drawer Overlay ---
    const overlay = document.createElement('div');
    overlay.className = 'mobile-drawer-overlay';
    overlay.id = 'mobile-drawer-overlay';

    // --- Build Drawer ---
    const drawer = document.createElement('div');
    drawer.className = 'mobile-drawer';
    drawer.id = 'mobile-drawer';

    // User info from cache
    const cachedUser = JSON.parse(localStorage.getItem('medintelli_user') || 'null');
    let userInfoHtml = '';
    if (cachedUser) {
        const photo = cachedUser.photoURL
            ? `<img src="${cachedUser.photoURL}" alt="avatar" class="drawer-avatar">`
            : '<div class="drawer-avatar-fallback"><i class="ri-user-3-fill"></i></div>';
        userInfoHtml = `
            <div class="drawer-user-info">
                ${photo}
                <div>
                    <div class="drawer-user-name">${cachedUser.displayName || 'User'}</div>
                    <div class="drawer-user-email">${cachedUser.email || ''}</div>
                </div>
            </div>
        `;
    }

    // Navigation links — consistent across all pages
    const navLinks = [
        { href: 'index.html', icon: 'ri-home-4-line', label: 'Home' },
        { href: 'diagnosis-quiz.html', icon: 'ri-clipboard-pulse-line', label: 'Diagnosis Quiz' },
        { href: 'tracker.html', icon: 'ri-pulse-line', label: 'Symptom Tracker' },
        { href: 'profile.html', icon: 'ri-user-3-line', label: 'Profile' }
    ];

    let linksHtml = navLinks.map(link => {
        const activeClass = isActive(link.href) ? 'active' : '';
        return `<a href="${link.href}" class="drawer-link ${activeClass}"><i class="${link.icon}"></i> ${link.label}</a>`;
    }).join('');

    // Additional action buttons
    let actionsHtml = '';

    // Theme toggle
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    actionsHtml += `
        <button class="drawer-link drawer-action" id="drawer-theme-toggle">
            <i class="${isDark ? 'ri-sun-line' : 'ri-moon-line'}"></i>
            <span>${isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
    `;

    // Sign out (only if logged in)
    if (cachedUser) {
        actionsHtml += `
            <button class="drawer-link drawer-action drawer-signout" id="drawer-sign-out">
                <i class="ri-logout-box-r-line"></i>
                <span>Sign Out</span>
            </button>
        `;
    }

    drawer.innerHTML = `
        <div class="drawer-header">
            <div class="logo">
                <i class="ri-heart-pulse-fill"></i>
                <span>MySymptoms</span>
            </div>
            <button class="drawer-close" id="drawer-close-btn" aria-label="Close Menu">
                <i class="ri-close-line"></i>
            </button>
        </div>
        ${userInfoHtml}
        <nav class="drawer-nav">
            ${linksHtml}
        </nav>
        <div class="drawer-divider"></div>
        <div class="drawer-actions">
            ${actionsHtml}
        </div>
        <div class="drawer-footer">
            <p>&copy; 2026 MySymptoms</p>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // --- Open / Close Logic ---
    function openDrawer() {
        drawer.classList.add('open');
        overlay.classList.add('visible');
        document.body.classList.add('drawer-open');
    }

    function closeDrawer() {
        drawer.classList.remove('open');
        overlay.classList.remove('visible');
        document.body.classList.remove('drawer-open');
    }

    hamburger.addEventListener('click', openDrawer);
    overlay.addEventListener('click', closeDrawer);
    document.getElementById('drawer-close-btn').addEventListener('click', closeDrawer);

    // Auto-close on link tap
    drawer.querySelectorAll('.drawer-link:not(.drawer-action)').forEach(link => {
        link.addEventListener('click', () => closeDrawer());
    });

    // Theme toggle inside drawer
    const drawerThemeBtn = document.getElementById('drawer-theme-toggle');
    if (drawerThemeBtn) {
        drawerThemeBtn.addEventListener('click', () => {
            // Trigger the existing theme toggle button if it exists
            const mainToggle = document.getElementById('theme-toggle-btn');
            if (mainToggle) {
                mainToggle.click();
            } else {
                // Fallback: toggle manually
                const nowDark = document.documentElement.getAttribute('data-theme') === 'dark';
                const newTheme = nowDark ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('medintelli_theme', newTheme);
            }

            // Update icon
            const nowDarkAfter = document.documentElement.getAttribute('data-theme') === 'dark';
            drawerThemeBtn.querySelector('i').className = nowDarkAfter ? 'ri-sun-line' : 'ri-moon-line';
            drawerThemeBtn.querySelector('span').textContent = nowDarkAfter ? 'Light Mode' : 'Dark Mode';
        });
    }

    // Sign out inside drawer
    const drawerSignOut = document.getElementById('drawer-sign-out');
    if (drawerSignOut) {
        drawerSignOut.addEventListener('click', () => {
            // Try triggering the existing sign-out button first
            const mainSignOut = document.getElementById('sign-out-btn');
            if (mainSignOut) {
                mainSignOut.click();
            } else {
                if (confirm('Are you sure you want to sign out?')) {
                    localStorage.removeItem('medintelli_user');
                    localStorage.removeItem('medintelli_onboarded');
                    localStorage.removeItem('medintelli_country');
                    localStorage.removeItem('medintelli_language');
                    if (typeof firebase !== 'undefined' && firebase.auth) {
                        firebase.auth().signOut().catch(() => { });
                    }
                    window.location.replace('login.html');
                }
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
    });

    // --- Build Floating SOS Button ---
    // This button will only be visible on mobile via CSS
    const floatingSos = document.createElement('button');
    floatingSos.className = 'mobile-floating-sos';
    floatingSos.innerHTML = `<i class="ri-alarm-warning-fill"></i><span>SOS</span>`;
    floatingSos.addEventListener('click', () => {
        const modal = document.getElementById('emergency-modal');
        if (modal) {
            modal.classList.remove('hidden');
        } else {
            window.location.href = 'index.html#open-sos';
        }
    });
    document.body.appendChild(floatingSos);
})();
