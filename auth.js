// Konfigurasi Google Client ID
const GOOGLE_CLIENT_ID = "GANTI_DENGAN_GOOGLE_CLIENT_ID_ANDA.apps.googleusercontent.com";

window.currentUser = null;

function handleCredentialResponse(response) {
    if (response.credential) {
        try {
            // Decode JWT to get user info
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            window.currentUser = {
                uid: payload.sub,
                name: payload.name,
                picture: payload.picture,
                email: payload.email,
                token: response.credential
            };

            document.getElementById('login-btn').classList.add('hidden');
            const profile = document.getElementById('user-profile');
            if (profile) profile.classList.remove('hidden');
            const nameEl = document.getElementById('user-name');
            if (nameEl) nameEl.textContent = payload.name;
            const avatarEl = document.getElementById('user-avatar');
            if (avatarEl) avatarEl.src = payload.picture;

            console.log("Logged in as: ", payload.name);
        } catch (e) {
            console.error("JWT Decode error", e);
        }
    }
}

function initGoogleAuth() {
    if (GOOGLE_CLIENT_ID.startsWith("GANTI")) {
        console.warn("⚠️ Google Client ID belum diatur. Silakan ganti GOOGLE_CLIENT_ID di auth.js.");
    }

    // Initialize Google library
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse
        });

        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            // Kita attach click event listener untuk trigger prompt
            loginBtn.addEventListener('click', () => {
                google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        // Kalau prompt gagal muncul karena browser diblokir/cookie issue
                        console.log("Prompt skipped", notification.getNotDisplayedReason());
                        alert("Tidak dapat memunculkan login. Pastikan browser mengizinkan Cookies (Third-party) atau tidak dalam Incognito.");
                    }
                });
            });
        }
    }
}

function logout() {
    window.currentUser = null;
    document.getElementById('login-btn').classList.remove('hidden');
    document.getElementById('user-profile').classList.add('hidden');
}

window.addEventListener('load', () => {
    initGoogleAuth();
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
});
