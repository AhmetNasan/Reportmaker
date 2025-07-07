document.addEventListener('DOMContentLoaded', () => {

    // --- Supabase Client Setup ---
    const SUPABASE_URL = 'https://cykjjrrexaqmsqwrgnzp.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5a2pqcnJleGFxbXNxd3JnbnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MjUyMDksImV4cCI6MjA2NzIwMTIwOX0.Fx6f23TWCQQMCIkc5hcx8LqHyskVMm6WAhJl1UFZpMA';
    
    const { createClient } = supabase;
    const dbClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // --- State & DOM Elements ---
    let map;
    let apiKeys = {};
    const appState = {
        currentUser: null,
        isAdmin: false, 
    };

    const authScreen = document.getElementById('auth-screen');
    const appContainer = document.getElementById('app-container');
    const authContainer = document.getElementById('auth-container');
    const loginWrapper = document.getElementById('login-wrapper');
    const signupWrapper = document.getElementById('signup-wrapper');
    const logoutBtn = document.getElementById('logout-btn');
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    const adminPasswordScreen = document.getElementById('admin-password-screen');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminCancelBtn = document.getElementById('admin-cancel-btn');
    
    // --- App Initialization ---
    function init() {
        loadApiKeys();
        setupEventListeners();
        checkUserSession();
    }

    // --- Authentication ---
    function setupAuthEventListeners() {
        authContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('toggle-auth')) {
                const formToShow = e.target.dataset.form;
                if (formToShow === 'signup') {
                    loginWrapper.classList.add('hidden');
                    signupWrapper.classList.remove('hidden');
                } else {
                    signupWrapper.classList.add('hidden');
                    loginWrapper.classList.remove('hidden');
                }
            }
        });

        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            handleSignup();
        });
    }

    async function handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const { data, error } = await dbClient.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
    }
    
    async function handleSignup() {
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const { data, error } = await dbClient.auth.signUp({ email, password });
        if (error) {
            alert(error.message);
        } else {
            alert('Signup successful! Please check your email for a confirmation link.');
            loginWrapper.classList.remove('hidden');
            signupWrapper.classList.add('hidden');
        }
    }

    async function handleLogout() {
        await dbClient.auth.signOut();
    }

    async function checkUserSession() {
        const { data: { session } } = await dbClient.auth.getSession();
        appState.currentUser = session?.user || null;
        updateUIForAuthState();

        dbClient.auth.onAuthStateChange((_event, session) => {
            appState.currentUser = session?.user || null;
            updateUIForAuthState();
        });
    }
    
    function updateUIForAuthState() {
        if (appState.currentUser) {
            authScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            document.getElementById('user-email').textContent = appState.currentUser.email;
            if (!map) initMap();
            loadReportsOnMap();
            loadNotifications();
        } else {
            authScreen.classList.remove('hidden');
            appContainer.classList.add('hidden');
        }
    }

    // --- Admin Panel & API Keys ---
    function loadApiKeys() {
        const storedKeys = localStorage.getItem('siteMonitorApiKeys');
        if (storedKeys) {
            apiKeys = JSON.parse(storedKeys);
        } else {
            setTimeout(() => {
                if(appState.currentUser && Object.keys(apiKeys).length === 0) {
                    alert('Welcome! Please go to the Admin Panel to set up your API keys.');
                }
            }, 5000);
        }
    }

    function saveApiKeys(e) {
        e.preventDefault();
        apiKeys = {
            tomtom: document.getElementById('key-tomtom').value,
            openweathermap: document.getElementById('key-openweathermap').value,
            roboflowUrl: document.getElementById('key-roboflow-url').value,
            roboflowPrivate: document.getElementById('key-roboflow-private').value,
            telegramToken: document.getElementById('key-telegram-token').value,
            telegramChatId: document.getElementById('key-telegram-chatid').value
        };
        localStorage.setItem('siteMonitorApiKeys', JSON.stringify(apiKeys));
        alert('API Keys saved successfully!');
    }
    
    function handleAdminLogin() {
        const pass = document.getElementById('admin-password').value;
        if (pass === 'Admin169633%') {
            appState.isAdmin = true;
            document.querySelector('.nav-button[data-tab="admin-tab"]').classList.remove('hidden');
            adminPasswordScreen.classList.add('hidden');
            showTab('admin-tab');
            document.getElementById('key-tomtom').value = apiKeys.tomtom || '';
            document.getElementById('key-openweathermap').value = apiKeys.openweathermap || '';
            document.getElementById('key-roboflow-url').value = apiKeys.roboflowUrl || '';
            document.getElementById('key-roboflow-private').value = apiKeys.roboflowPrivate || '';
            document.getElementById('key-telegram-token').value = apiKeys.telegramToken || '';
            document.getElementById('key-telegram-chatid').value = apiKeys.telegramChatId || '';
        } else {
            alert('Incorrect password.');
        }
    }

    // --- Navigation ---
    function setupEventListeners() {
        setupAuthEventListeners();
        logoutBtn.addEventListener('click', handleLogout);
        adminPanelBtn.addEventListener('click', () => adminPasswordScreen.classList.remove('hidden'));
        adminLoginBtn.addEventListener('click', handleAdminLogin);
        adminCancelBtn.addEventListener('click', () => adminPasswordScreen.classList.add('hidden'));

        document.querySelector('nav').addEventListener('click', (e) => {
            if (e.target.matches('.nav-button')) {
                showTab(e.target.dataset.tab);
            }
        });
        
        document.getElementById('api-key-form').addEventListener('submit', saveApiKeys);
        document.getElementById('report-form').addEventListener('submit', handleReportSubmit);
    }
    
    function showTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
        document.getElementById(tabId).classList.remove('hidden');
        
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.nav-button[data-tab="${tabId}"]`).classList.add('active');
        
        if (tabId === 'map-tab' && map) {
            map.resize();
        }
    }

    // --- Map Logic ---
    function initMap() {
        if (map) return; 

        const qnasApiKey = 'ba80a013eb1d4a08a198f79991aefd4b';
        const qnasTileUrl = `https://tiles.qnas.qa/styles/osm-bright/{z}/{x}/{y}.png?key=${qnasApiKey}`;

        map = new maplibregl.Map({
            container: 'map',
            style: {
                version: 8,
                sources: {
                    'qnas-tiles': {
                        type: 'raster',
                        tiles: [qnasTileUrl],
                        tileSize: 256,
                        attribution: '&copy; <a href="https://gisqatar.org.qa/">GIS Qatar</a>'
                    }
                },
                layers: [{
                    id: 'qnas-layer',
                    type: 'raster',
                    source: 'qnas-tiles',
                    minzoom: 0,
                    maxzoom: 22
                }]
            },
            center: [51.5310, 25.2867], // Doha, Qatar
            zoom: 10
        });
        
        map.on('load', () => {
            document.getElementById('toggle-traffic').addEventListener('change', (e) => {
                if (!apiKeys.tomtom) return alert('TomTom API key not set in Admin Panel.');
                toggleTrafficLayer(e.target.checked);
            });
        });
    }
    
    async function loadReportsOnMap() {
        const { data: reports, error } = await dbClient.from('reports').select('*');
        if (error) return console.error('Error fetching reports:', error);

        reports.forEach(report => {
            if (report.location && report.location.longitude && report.location.latitude) {
                const popupHTML = `
                    <div>
                        <h4>Defect Report</h4>
                        <p>${report.notes || 'No notes.'}</p>
                        <p><strong>Status:</strong> ${report.status}</p>
                        <img src="${report.image_url}" width="150" alt="Defect image">
                        <small>Reported at: ${new Date(report.created_at).toLocaleString()}</small>
                    </div>
                `;
                new maplibregl.Marker()
                    .setLngLat([report.location.longitude, report.location.latitude])
                    .setPopup(new maplibregl.Popup().setHTML(popupHTML))
                    .addTo(map);
            }
        });
    }
    
    function toggleTrafficLayer(visible) {
        alert(`Traffic layer visibility set to ${visible}. (This is a demo feature)`);
    }

    // --- Report Submission & AI ---
    async function handleReportSubmit(e) {
        e.preventDefault();
        if (!apiKeys.roboflowUrl || !apiKeys.roboflowPrivate) {
            return alert('Roboflow API keys are not set in the Admin Panel.');
        }

        const reportStatusEl = document.getElementById('report-status');
        reportStatusEl.textContent = 'Submitting...';

        const imageFile = document.getElementById('report-image').files[0];
        const notes = document.getElementById('report-notes').value;

        const location = await new Promise(resolve => {
            navigator.geolocation.getCurrentPosition(
                pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                err => {
                    console.warn('Could not get location:', err.message);
                    resolve(null); 
                }
            );
        });
        
        reportStatusEl.textContent = 'Uploading image...';
        const filePath = `reports/${appState.currentUser.id}/${Date.now()}-${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await dbClient.storage
            .from('report-images')
            .upload(filePath, imageFile);
        
        if (uploadError) {
            reportStatusEl.textContent = `Upload Error: ${uploadError.message}`;
            return console.error(uploadError);
        }
        
        const { data: { publicUrl } } = dbClient.storage.from('report-images').getPublicUrl(filePath);

        reportStatusEl.textContent = 'Analyzing image with AI...';
        let analysisResult = {};
        try {
            const roboflowUrlWithKey = `${apiKeys.roboflowUrl}?api_key=${apiKeys.roboflowPrivate}&image=${encodeURIComponent(publicUrl)}`;
            const response = await fetch(roboflowUrlWithKey, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            analysisResult = await response.json();
        } catch (aiError) {
            console.error('AI analysis failed:', aiError);
            analysisResult = { error: 'AI analysis failed' };
        }
        
        reportStatusEl.textContent = 'Saving final report...';
        const reportData = {
            user_id: appState.currentUser.id,
            notes: notes,
            image_url: publicUrl,
            location: location,
            ai_analysis: analysisResult,
            status: analysisResult.predictions?.length > 0 ? 'Defect Detected' : 'No Defect Detected'
        };

        const { error: insertError } = await dbClient.from('reports').insert(reportData);

        if (insertError) {
            reportStatusEl.textContent = `Database Error: ${insertError.message}`;
            return console.error(insertError);
        }

        reportStatusEl.textContent = 'Report submitted successfully!';
        document.getElementById('report-form').reset();
        
        if(analysisResult.predictions?.length > 0) {
            sendTelegramAlert(`🚨 Critical Defect Detected! \nNotes: ${notes}\nImage: ${publicUrl}`);
        }
    }
    
    // --- Notifications ---
    async function loadNotifications() {
        const listEl = document.getElementById('notification-list');
        const { data: notifications, error } = await dbClient.from('reports')
            .select('*').order('created_at', { ascending: false }).limit(20);
            
        if (error) return console.error('Error fetching notifications:', error);
        
        listEl.innerHTML = notifications.map(n => `
            <li class="notification-item ${n.status === 'Defect Detected' ? 'critical' : ''}">
                <p><strong>${n.status}</strong></p>
                <p>${n.notes || 'No notes provided.'}</p>
                <small>${new Date(n.created_at).toLocaleString()}</small>
            </li>
        `).join('');
    }

    async function sendTelegramAlert(message) {
        if (!apiKeys.telegramToken || !apiKeys.telegramChatId) return;
        const url = `https://api.telegram.org/bot${apiKeys.telegramToken}/sendMessage`;
        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: apiKeys.telegramChatId,
                    text: message
                })
            });
        } catch (e) {
            console.error("Failed to send Telegram alert:", e);
        }
    }

    // --- Start the App ---
    init();

});
