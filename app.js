// ===================================
// ENGINEERING PLATFORM - MASTER SCRIPT
// ===================================

// --- GLOBAL VARIABLES & CONFIGURATION ---
let supabaseClient;
let currentUser = null;
let mapboxMap = null;
let mapboxDraw = null;
let currentOpenPage = 'dashboard-page';

const config = {
    supabaseUrl: 'YOUR_SUPABASE_URL_PLACEHOLDER',
    supabaseKey: 'YOUR_SUPABASE_ANON_KEY_PLACEHOLDER',
    mapboxToken: 'YOUR_MAPBOX_TOKEN_PLACEHOLDER',
    telegramBotToken: 'YOUR_TELEGRAM_BOT_TOKEN_PLACEHOLDER',
    telegramChatId: 'YOUR_TELEGRAM_CHAT_ID_PLACEHOLDER',
    fileStorage: {
        maxFileSize: 20 * 1024 * 1024 * 1024, // 20GB
        allowedExtensions: ['pdf', 'xlsx', 'xls', 'dwg', 'dxf', 'svg', 'jpg', 'jpeg', 'png', 'kml', 'kmz', 'csv', 'geojson'],
        systemFolders: ['Contracts', 'BOQ', 'GISReports', 'ChatMedia', 'Inspections', 'CostEstimations', 'CAD']
    },
    ai: {
        defaultPrompt: `You are an expert civil engineer specializing in road defect detection. Analyze the provided road image and identify any defects such as:\n\n1. Cracks (longitudinal, transverse, alligator)\n2. Potholes\n3. Rutting\n4. Bleeding\n5. Raveling\n6. Edge deterioration\n\nFor each defect found, provide:\n- Type of defect\n- Severity level (Low, Medium, High)\n- Recommended action`
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Core Initializers
    initializeSupabase();
    initializeTheme();
    
    // Check auth state to decide if we should show the app or redirect to login
    const mockUser = localStorage.getItem('mockUser');
    if (window.location.pathname.includes('app.html')) {
        if (!mockUser) {
            window.location.href = 'index.html';
            return;
        }
        currentUser = JSON.parse(mockUser);
    }
    
    // App-specific Initializers (only on app.html)
    if (window.location.pathname.includes('app.html')) {
        initializeApp();
    }
});

function initializeApp() {
    console.log("Initializing Engineering Platform...");
    updateUserInterface();
    setupEventListeners();

    // Initialize all modules
    initializeGISSystem();
    initializeChatSystem();
    initializeFileManager();
    initializeNotificationSystem();
    initializeAdditionalSystems();
    initializeTelegram();

    // Load initial data
    loadActivityFeed();
    loadDashboardStats();
    
    // Fix UI issues
    fixPrintTooltips();
}

function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.nav-btn.active').classList.remove('active');
            btn.classList.add('active');
        });
    });
    
    // Settings tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelector('.settings-tab.active').classList.remove('active');
            e.target.classList.add('active');
        });
    });

    // Theme options
     document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', (e) => setTheme(e.target.dataset.theme));
    });
}


// --- UTILITY FUNCTIONS ---
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function showMessage(message, type = 'info', duration = 3000) {
    const container = document.getElementById('message-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `message-toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, duration);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function showPage(pageId) {
    if (currentOpenPage === pageId) return;
    
    document.getElementById(currentOpenPage).classList.remove('active');
    document.getElementById(pageId).classList.add('active');
    currentOpenPage = pageId;

    // Special handling for map page to ensure it renders correctly
    if (pageId === 'mapping-page' && mapboxMap) {
        setTimeout(() => mapboxMap.resize(), 10);
    }
}

function toggleLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

// --- AUTHENTICATION & USER MANAGEMENT ---
function initializeSupabase() {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
        console.log('Supabase client initialized.');
    } else {
        console.error('Supabase library not found. Using mock data.');
        // Fallback to mock/localStorage logic
    }
}

function updateUserInterface() {
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.email;
    }
}

function logout() {
    console.log('Logging out...');
    localStorage.removeItem('mockUser');
    // In real app: await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
}

// --- THEME & UI ---
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    adjustFontSize(savedFontSize);
}

function setTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    localStorage.setItem('theme', themeName);
}

function adjustFontSize(size) {
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.body.classList.add(`font-size-${size}`);
    localStorage.setItem('fontSize', size);
}

function handleBackgroundUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.body.style.backgroundImage = `url(${e.target.result})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundAttachment = 'fixed';
            localStorage.setItem('customBackground', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function toggleMobileNav() {
    document.getElementById('main-sidebar').classList.toggle('mobile-open');
}

function toggleGlobalMenu() {
    document.getElementById('global-menu').classList.toggle('show');
}

function fixPrintTooltips() {
    // This function addresses the user's specific bug report.
    // We are now using onclick="window.print()" directly in the HTML for simplicity,
    // but this function can be used to dynamically fix elements if needed.
    console.log("Checking for problematic print tooltips... (Now handled directly in HTML)");
}

// --- SETTINGS MANAGEMENT ---
function showSettingsTab(tabName) {
    document.querySelector('.settings-panel.active').classList.remove('active');
    document.getElementById(`${tabName}-settings`).classList.add('active');
}

function saveAISettings() {
    const prompt = document.getElementById('ai-prompt').value;
    localStorage.setItem('aiPrompt', prompt);
    showMessage('AI prompt saved successfully!', 'success');
}

function saveSecuritySettings() {
    const timeout = document.getElementById('session-timeout').value;
    localStorage.setItem('sessionTimeout', timeout);
    showMessage('Security settings saved!', 'success');
}

function saveTelegramSettings() {
    config.telegramBotToken = document.getElementById('telegram-bot-token').value;
    config.telegramChatId = document.getElementById('telegram-chat-id').value;
    localStorage.setItem('telegramConfig', JSON.stringify({ botToken: config.telegramBotToken, chatId: config.telegramChatId }));
    showMessage('Telegram settings saved!', 'success');
}


// --- ACTIVITY LOGGING ---
function logActivity(action, description) {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const newActivity = {
        id: generateId(),
        action,
        description,
        timestamp: new Date().toISOString()
    };
    activities.unshift(newActivity);
    if (activities.length > 50) activities.pop(); // Keep last 50
    localStorage.setItem('activities', JSON.stringify(activities));
    loadActivityFeed();
}

function loadActivityFeed() {
    const container = document.getElementById('activity-list');
    if(!container) return;
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    container.innerHTML = activities.length ? '' : '<p>No recent activity.</p>';
    activities.slice(0, 10).forEach(activity => {
        container.innerHTML += `
            <div class="activity-item">
                <strong>${activity.action}:</strong> ${activity.description}
                <small class="text-muted d-block">${new Date(activity.timestamp).toLocaleString()}</small>
            </div>
        `;
    });
}

// --- DASHBOARD ---
function loadDashboardStats() {
    // Mock data, replace with real data fetching
    document.getElementById('total-projects').textContent = '12';
    document.getElementById('total-files').textContent = '1,284';
    document.getElementById('total-inspections').textContent = '312';
    document.getElementById('total-defects').textContent = '89';
}

function openCustomDashboard() {
    showMessage("Dashboard Builder feature would open here.", 'info');
    // Implementation for dashboard builder modal
}

function generatePlatformReport() {
    showMessage("Generating a comprehensive platform report...", 'info');
    // Implementation for report generation
}


// --- GIS MAPPING SYSTEM (MAPBOX) ---
function initializeGISSystem() {
    if (!document.getElementById('map-container')) return;
    mapboxgl.accessToken = config.mapboxToken;

    mapboxMap = new mapboxgl.Map({
        container: 'map-container',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-74.0060, 40.7128],
        zoom: 12
    });

    mapboxDraw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            polygon: true,
            line_string: true,
            point: true,
            trash: true
        }
    });

    mapboxMap.addControl(mapboxDraw, 'top-left');
    mapboxMap.addControl(new mapboxgl.NavigationControl(), 'top-left');

    createFloatingUICards();
}

function createFloatingUICards() {
    const container = document.getElementById('map-container');
    const cardsHTML = `
        <div class="floating-cards-container">
            <button class="btn hamburger-btn" onclick="toggleAllCards()"><i class="fas fa-bars"></i></button>
            <div id="qnas-metadata-card" class="floating-card">
                <div class="card-header" onclick="toggleCard(this)"><h6><i class="fas fa-tags"></i> Point Metadata</h6></div>
                <div class="card-content" style="display:none;"></div>
            </div>
            <div id="data-entry-card" class="floating-card">
                 <div class="card-header" onclick="toggleCard(this)"><h6><i class="fas fa-keyboard"></i> Data Entry</h6></div>
                 <div class="card-content" style="display:none;"></div>
            </div>
            <div id="info-display-card" class="floating-card">
                 <div class="card-header" onclick="toggleCard(this)"><h6><i class="fas fa-info-circle"></i> Shape Info</h6></div>
                 <div class="card-content" style="display:none;"></div>
            </div>
            <div id="overlays-card" class="floating-card">
                <div class="card-header" onclick="toggleCard(this)"><h6><i class="fas fa-layer-group"></i> Overlays</h6></div>
                <div class="card-content" style="display:none;"></div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', cardsHTML);
}

function toggleCard(headerElement) {
    const content = headerElement.nextElementSibling;
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
}

function toggleAllCards() {
    document.querySelectorAll('.floating-card .card-content').forEach(content => {
         content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });
}

// --- FILE MANAGEMENT ---
function initializeFileManager() { /* Logic for file manager init */ }
function triggerFileUpload() { /* Logic to open file dialog */ }
// ... Other file management functions ...

function determineFolderPath(file, contractNumber) {
    const extension = file.name.split('.').pop().toLowerCase();
    let subFolder = 'General'; // Default

    if (['pdf', 'doc', 'docx'].includes(extension)) subFolder = config.fileStorage.systemFolders[0]; // Contracts
    else if (['xlsx', 'xls', 'csv'].includes(extension)) subFolder = config.fileStorage.systemFolders[1]; // BOQ
    else if (['kml', 'kmz', 'geojson'].includes(extension)) subFolder = config.fileStorage.systemFolders[2]; // GISReports
    else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) subFolder = config.fileStorage.systemFolders[3]; // ChatMedia
    else if (['dwg', 'dxf', 'svg'].includes(extension)) subFolder = config.fileStorage.systemFolders[6]; // CAD
    
    return `/storage/${contractNumber}/${subFolder}`;
}

function generateFileName(originalName, contractNumber) {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const extension = originalName.substring(originalName.lastIndexOf('.') + 1);
    
    return `${contractNumber}_${nameWithoutExt}_${timestamp}.${extension}`;
}

// --- CHAT SYSTEM ---
function initializeChatSystem() { /* Logic for chat init */ }
function startNewConversation() { /* Logic for new chat */ }
function sendMessage() { /* Logic to send a message */ }
function attachFile() { /* Logic for chat file attachment */ }
function attachPhoto() { /* Logic for chat photo attachment */ }
function shareLocation() { /* Logic for chat location sharing */ }

// --- TELEGRAM INTEGRATION ---
function initializeTelegram() { /* Logic for Telegram bot init */ }
function sendToTelegram(message) { /* Logic to send message via Telegram */ }

// --- ADDITIONAL SYSTEMS (Placeholders) ---
function initializeAdditionalSystems() {
    console.log("Initializing additional systems (Vehicle Tracking, Logistics, etc.)");
}
// ... Stubs for all other features from additional_systems.js
