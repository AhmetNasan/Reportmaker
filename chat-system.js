// ===================================
// REAL-TIME CHAT SYSTEM
// ===================================

// Chat global variables
let chatSocket = null;
let chatConnected = false;
let conversations = [];
let currentConversation = null;
let chatFiles = [];
let chatSettings = {
    downloadDirectory: null,
    autoDownload: false,
    notificationSound: true,
    saveToLocalStorage: true
};

// Initialize chat system
document.addEventListener('DOMContentLoaded', function() {
    initializeChatSystem();
    loadChatSettings();
    loadChatHistory();
    setupChatEventListeners();
});

// ===================================
// CHAT INITIALIZATION
// ===================================

function initializeChatSystem() {
    // For demo purposes, simulate WebSocket connection
    // In production, use actual WebSocket server
    setupMockWebSocket();
    
    // Load saved conversations
    loadConversations();
    
    // Initialize chat UI
    updateConversationsList();
    
    // Setup file download directory
    setupFileDownloadDirectory();
}

function setupMockWebSocket() {
    // Mock WebSocket for demo
    chatSocket = {
        send: function(data) {
            console.log('Mock send:', data);
            // Simulate echo back for demo
            setTimeout(() => {
                const message = JSON.parse(data);
                if (message.type === 'chat_message') {
                    simulateIncomingMessage(message);
                }
            }, 500);
        },
        close: function() {
            chatConnected = false;
            updateConnectionStatus();
        }
    };
    
    chatConnected = true;
    updateConnectionStatus();
    
    console.log('Mock chat system initialized');
}

function connectToRealTimeChat() {
    // For production WebSocket connection
    const wsUrl = 'wss://your-websocket-server/chat';
    
    try {
        chatSocket = new WebSocket(wsUrl);
        
        chatSocket.onopen = function() {
            chatConnected = true;
            updateConnectionStatus();
            console.log('Connected to chat server');
        };
        
        chatSocket.onmessage = function(event) {
            const message = JSON.parse(event.data);
            handleIncomingMessage(message);
        };
        
        chatSocket.onclose = function() {
            chatConnected = false;
            updateConnectionStatus();
            // Attempt to reconnect after 5 seconds
            setTimeout(connectToRealTimeChat, 5000);
        };
        
        chatSocket.onerror = function(error) {
            console.error('Chat connection error:', error);
            chatConnected = false;
            updateConnectionStatus();
        };
        
    } catch (error) {
        console.error('Failed to connect to chat server:', error);
        // Fall back to mock system
        setupMockWebSocket();
    }
}

// ===================================
// CHAT UI MANAGEMENT
// ===================================

function openChatPanel() {
    const panel = document.getElementById('chat-panel');
    if (panel) {
        panel.classList.add('active');
        loadConversations();
        updateConversationsList();
    }
}

function closeChatPanel() {
    const panel = document.getElementById('chat-panel');
    if (panel) {
        panel.classList.remove('active');
    }
}

function minimizeChatPanel() {
    const panel = document.getElementById('chat-panel');
    if (panel) {
        panel.classList.toggle('minimized');
    }
}

function updateConnectionStatus() {
    const statusElements = document.querySelectorAll('.chat-connection-status');
    statusElements.forEach(element => {
        element.textContent = chatConnected ? 'Connected' : 'Disconnected';
        element.className = `chat-connection-status ${chatConnected ? 'connected' : 'disconnected'}`;
    });
}

// ===================================
// CONVERSATION MANAGEMENT
// ===================================

function loadConversations() {
    const stored = localStorage.getItem('chatConversations');
    if (stored) {
        try {
            conversations = JSON.parse(stored);
        } catch (error) {
            console.error('Error loading conversations:', error);
            conversations = [];
        }
    }
}

function saveConversations() {
    try {
        localStorage.setItem('chatConversations', JSON.stringify(conversations));
    } catch (error) {
        console.error('Error saving conversations:', error);
    }
}

function updateConversationsList() {
    const container = document.getElementById('conversation-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    conversations.forEach(conversation => {
        const element = document.createElement('div');
        element.className = `conversation-item ${currentConversation?.id === conversation.id ? 'active' : ''}`;
        element.onclick = () => selectConversation(conversation.id);
        
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        const lastMessageText = lastMessage ? 
            (lastMessage.type === 'text' ? lastMessage.content : `[${lastMessage.type}]`) : 
            'No messages';
        
        element.innerHTML = `
            <div class="conversation-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="conversation-info">
                <div class="conversation-name">${conversation.name}</div>
                <div class="conversation-last-message">${lastMessageText}</div>
                <div class="conversation-time">${lastMessage ? formatTime(lastMessage.timestamp) : ''}</div>
            </div>
            ${conversation.unreadCount > 0 ? `<div class="unread-badge">${conversation.unreadCount}</div>` : ''}
        `;
        
        container.appendChild(element);
    });
}

function selectConversation(conversationId) {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    currentConversation = conversation;
    conversation.unreadCount = 0;
    
    updateConversationsList();
    loadChatMessages();
    saveConversations();
}

function startNewConversation() {
    const participantEmail = prompt('Enter participant email or username:');
    if (!participantEmail) return;
    
    const newConversation = {
        id: generateChatId(),
        name: participantEmail,
        participants: [currentUser.email, participantEmail],
        messages: [],
        createdAt: new Date().toISOString(),
        unreadCount: 0
    };
    
    conversations.push(newConversation);
    saveConversations();
    updateConversationsList();
    selectConversation(newConversation.id);
    
    showMessage(`Started new conversation with ${participantEmail}`, 'success');
}

// ===================================
// MESSAGE HANDLING
// ===================================

function loadChatMessages() {
    const container = document.getElementById('chat-messages');
    if (!container || !currentConversation) return;
    
    container.innerHTML = '';
    
    currentConversation.messages.forEach(message => {
        const messageElement = createMessageElement(message);
        container.appendChild(messageElement);
    });
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function createMessageElement(message) {
    const element = document.createElement('div');
    element.className = `message ${message.senderId === currentUser.id ? 'sent' : 'received'}`;
    
    let content = '';
    
    switch (message.type) {
        case 'text':
            content = `<p>${escapeHtml(message.content)}</p>`;
            break;
        case 'file':
            content = createFileMessageContent(message);
            break;
        case 'photo':
            content = createPhotoMessageContent(message);
            break;
        case 'location':
            content = createLocationMessageContent(message);
            break;
    }
    
    element.innerHTML = `
        <div class="message-content">
            ${content}
        </div>
        <div class="message-meta">
            <span class="message-time">${formatTime(message.timestamp)}</span>
            ${message.senderId === currentUser.id ? '<i class="fas fa-check message-status"></i>' : ''}
        </div>
    `;
    
    return element;
}

function createFileMessageContent(message) {
    const fileInfo = message.fileInfo;
    return `
        <div class="file-message">
            <div class="file-icon">
                <i class="fas fa-file"></i>
            </div>
            <div class="file-details">
                <div class="file-name">${fileInfo.name}</div>
                <div class="file-size">${formatFileSize(fileInfo.size)}</div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="downloadChatFile('${message.id}')">
                <i class="fas fa-download"></i>
            </button>
        </div>
    `;
}

function createPhotoMessageContent(message) {
    return `
        <div class="photo-message">
            <img src="${message.content}" alt="Shared photo" onclick="openPhotoModal('${message.content}')">
            <button class="btn btn-sm btn-primary" onclick="downloadChatPhoto('${message.id}')">
                <i class="fas fa-download"></i>
            </button>
        </div>
    `;
}

function createLocationMessageContent(message) {
    const location = message.location;
    return `
        <div class="location-message">
            <div class="location-info">
                <i class="fas fa-map-marker-alt"></i>
                <div>
                    <div class="location-coords">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</div>
                    <div class="location-address">${location.address || 'Unknown location'}</div>
                </div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="openLocationOnMap(${location.lat}, ${location.lng})">
                <i class="fas fa-map"></i> Open on Map
            </button>
        </div>
    `;
}

function sendMessage() {
    const input = document.getElementById('chat-message-input');
    const messageText = input.value.trim();
    
    if (!messageText || !currentConversation) return;
    
    const message = {
        id: generateChatId(),
        conversationId: currentConversation.id,
        senderId: currentUser.id,
        senderName: currentUser.email,
        type: 'text',
        content: messageText,
        timestamp: new Date().toISOString()
    };
    
    // Add to current conversation
    currentConversation.messages.push(message);
    saveConversations();
    
    // Update UI
    loadChatMessages();
    input.value = '';
    
    // Send to server (or mock)
    sendToChat(message);
    
    // Log activity
    logActivity('Chat Message', `Sent message to ${currentConversation.name}`);
}

function sendToChat(message) {
    if (chatSocket && chatConnected) {
        chatSocket.send(JSON.stringify(message));
    }
    
    // Save to offline storage
    saveChatMessageOffline(message);
}

function handleIncomingMessage(message) {
    const conversation = conversations.find(c => c.id === message.conversationId);
    if (!conversation) {
        // Create new conversation if it doesn't exist
        createConversationFromMessage(message);
        return;
    }
    
    // Add message to conversation
    conversation.messages.push(message);
    
    // Update unread count if not current conversation
    if (currentConversation?.id !== conversation.id) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    }
    
    saveConversations();
    updateConversationsList();
    
    // Update messages if this is the current conversation
    if (currentConversation?.id === conversation.id) {
        loadChatMessages();
    }
    
    // Show notification
    showChatNotification(message, conversation);
    
    // Save offline
    saveChatMessageOffline(message);
}

function simulateIncomingMessage(originalMessage) {
    // Simulate a response for demo
    const response = {
        id: generateChatId(),
        conversationId: originalMessage.conversationId,
        senderId: 'demo-other-user',
        senderName: 'Demo User',
        type: 'text',
        content: `Echo: ${originalMessage.content}`,
        timestamp: new Date().toISOString()
    };
    
    handleIncomingMessage(response);
}

// ===================================
// FILE ATTACHMENTS
// ===================================

function attachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = fileStorageConfig.allowedExtensions.map(ext => `.${ext}`).join(',');
    
    input.onchange = function(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => sendFileMessage(file));
    };
    
    input.click();
}

async function sendFileMessage(file) {
    if (!currentConversation) return;
    
    if (!validateFile(file)) return;
    
    try {
        // Convert file to base64 for storage
        const fileData = await fileToBase64(file);
        
        const message = {
            id: generateChatId(),
            conversationId: currentConversation.id,
            senderId: currentUser.id,
            senderName: currentUser.email,
            type: 'file',
            content: fileData,
            fileInfo: {
                name: file.name,
                size: file.size,
                type: file.type
            },
            timestamp: new Date().toISOString()
        };
        
        // Add to conversation
        currentConversation.messages.push(message);
        saveConversations();
        
        // Update UI
        loadChatMessages();
        
        // Send to chat
        sendToChat(message);
        
        showMessage(`File ${file.name} sent successfully`, 'success');
        
    } catch (error) {
        console.error('Error sending file:', error);
        showMessage(`Failed to send file ${file.name}`, 'error');
    }
}

function attachPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Prefer rear camera on mobile
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            sendPhotoMessage(file);
        }
    };
    
    input.click();
}

async function sendPhotoMessage(file) {
    if (!currentConversation) return;
    
    try {
        // Extract EXIF data if available
        const exifData = await extractPhotoMetadata(file);
        
        // Convert to base64
        const photoData = await fileToBase64(file);
        
        const message = {
            id: generateChatId(),
            conversationId: currentConversation.id,
            senderId: currentUser.id,
            senderName: currentUser.email,
            type: 'photo',
            content: photoData,
            photoInfo: {
                name: file.name,
                size: file.size,
                exif: exifData
            },
            timestamp: new Date().toISOString()
        };
        
        // Add to conversation
        currentConversation.messages.push(message);
        saveConversations();
        
        // Update UI
        loadChatMessages();
        
        // Send to chat
        sendToChat(message);
        
        showMessage('Photo sent successfully', 'success');
        
    } catch (error) {
        console.error('Error sending photo:', error);
        showMessage('Failed to send photo', 'error');
    }
}

// ===================================
// LOCATION SHARING
// ===================================

function shareLocation() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Share Location</h3>
            <div class="location-options">
                <button class="btn btn-primary" onclick="shareCurrentLocation()">
                    <i class="fas fa-crosshairs"></i> Current Location
                </button>
                <button class="btn btn-secondary" onclick="shareManualLocation()">
                    <i class="fas fa-map-pin"></i> Enter Coordinates
                </button>
                <button class="btn btn-info" onclick="shareGoogleMapsLink()">
                    <i class="fas fa-external-link-alt"></i> Google Maps Link
                </button>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="closeLocationModal()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function shareCurrentLocation() {
    if (!navigator.geolocation) {
        showMessage('Geolocation is not supported by this browser', 'error');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        position => {
            const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
            };
            
            sendLocationMessage(location);
            closeLocationModal();
        },
        error => {
            showMessage('Error getting location: ' + error.message, 'error');
        }
    );
}

function shareManualLocation() {
    const lat = prompt('Enter latitude:');
    const lng = prompt('Enter longitude:');
    
    if (lat && lng) {
        const location = {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        };
        
        if (!isNaN(location.lat) && !isNaN(location.lng)) {
            sendLocationMessage(location);
            closeLocationModal();
        } else {
            showMessage('Invalid coordinates', 'error');
        }
    }
}

function shareGoogleMapsLink() {
    const link = prompt('Paste Google Maps link:');
    if (!link) return;
    
    const location = parseGoogleMapsLink(link);
    if (location) {
        sendLocationMessage(location);
        closeLocationModal();
    } else {
        showMessage('Invalid Google Maps link. Please use links with coordinates.', 'error');
    }
}

function sendLocationMessage(location) {
    if (!currentConversation) return;
    
    const message = {
        id: generateChatId(),
        conversationId: currentConversation.id,
        senderId: currentUser.id,
        senderName: currentUser.email,
        type: 'location',
        content: `Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
        location: location,
        timestamp: new Date().toISOString()
    };
    
    // Add to conversation
    currentConversation.messages.push(message);
    saveConversations();
    
    // Update UI
    loadChatMessages();
    
    // Send to chat
    sendToChat(message);
    
    showMessage('Location shared successfully', 'success');
}

function parseGoogleMapsLink(link) {
    // Parse different Google Maps link formats
    let match;
    
    // Format: ?q=lat,lng
    match = link.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
    
    // Format: @lat,lng
    match = link.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
    
    // Format: /maps/place/.../@lat,lng
    match = link.match(/\/maps\/place\/[^@]*@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
    
    return null;
}

function closeLocationModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// ===================================
// OFFLINE STORAGE
// ===================================

function saveChatMessageOffline(message) {
    if (!chatSettings.saveToLocalStorage) return;
    
    const offlineMessages = JSON.parse(localStorage.getItem('chatMessagesOffline') || '[]');
    offlineMessages.push(message);
    
    // Keep only last 1000 messages
    if (offlineMessages.length > 1000) {
        offlineMessages.splice(0, offlineMessages.length - 1000);
    }
    
    localStorage.setItem('chatMessagesOffline', JSON.stringify(offlineMessages));
}

function loadChatHistory() {
    // Load chat history from localStorage
    const history = JSON.parse(localStorage.getItem('chatMessagesOffline') || '[]');
    
    // Organize messages by conversation
    history.forEach(message => {
        const conversation = conversations.find(c => c.id === message.conversationId);
        if (conversation) {
            // Check if message already exists to avoid duplicates
            const exists = conversation.messages.find(m => m.id === message.id);
            if (!exists) {
                conversation.messages.push(message);
            }
        }
    });
    
    // Sort messages by timestamp
    conversations.forEach(conversation => {
        conversation.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    
    saveConversations();
}

// ===================================
// FILE DOWNLOAD MANAGEMENT
// ===================================

function setupFileDownloadDirectory() {
    // For web browsers, we can't set a specific download directory
    // But we can provide naming conventions
    const savedDirectory = localStorage.getItem('chatDownloadDirectory');
    if (savedDirectory) {
        chatSettings.downloadDirectory = savedDirectory;
    }
}

function downloadChatFile(messageId) {
    const message = findMessageById(messageId);
    if (!message || message.type !== 'file') {
        showMessage('File not found', 'error');
        return;
    }
    
    try {
        // Create download link
        const link = document.createElement('a');
        link.href = message.content; // Base64 data URL
        
        // Generate filename with timestamp
        const timestamp = new Date(message.timestamp).toISOString().replace(/[:.]/g, '-').split('T');
        const dateStr = timestamp[0];
        const timeStr = timestamp[1].split('.')[0].replace(/-/g, '');
        const fileName = `chat_${message.fileInfo.name.split('.')[0]}_${dateStr}_${timeStr}.${message.fileInfo.name.split('.').pop()}`;
        
        link.download = fileName;
        link.click();
        
        showMessage(`Downloaded ${fileName}`, 'success');
        logActivity('File Download', `Downloaded chat file: ${fileName}`);
        
    } catch (error) {
        console.error('Download failed:', error);
        showMessage('Failed to download file', 'error');
    }
}

function downloadChatPhoto(messageId) {
    const message = findMessageById(messageId);
    if (!message || message.type !== 'photo') {
        showMessage('Photo not found', 'error');
        return;
    }

    try {
        // Create download link for photo
        const link = document.createElement('a');
        link.href = message.content; // Base64 data URL

        // Generate filename with timestamp
        const timestamp = new Date(message.timestamp).toISOString().replace(/[:.]/g, '-').split('T');
        const dateStr = timestamp[0];
        const timeStr = timestamp[1].split('.')[0].replace(/-/g, '');
        const fileName = `chat_photo_${dateStr}_${timeStr}.jpg`;

        link.download = fileName;
        link.click();

        showMessage(`Downloaded ${fileName}`, 'success');
        logActivity('Photo Download', `Downloaded chat photo: ${fileName}`);

    } catch (error) {
        console.error('Photo download failed:', error);
        showMessage('Failed to download photo', 'error');
    }
}

// Missing utility functions for chat system
function generateChatId() {
    return 'chat_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function findMessageById(messageId) {
    for (const conversation of conversations) {
        const message = conversation.messages.find(m => m.id === messageId);
        if (message) return message;
    }
    return null;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
        return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function extractPhotoMetadata(file) {
    return new Promise((resolve) => {
        if (window.EXIF && window.EXIF.getData) {
            window.EXIF.getData(file, function() {
                const exifData = {
                    make: window.EXIF.getTag(this, 'Make'),
                    model: window.EXIF.getTag(this, 'Model'),
                    dateTime: window.EXIF.getTag(this, 'DateTime'),
                    gps: {
                        lat: window.EXIF.getTag(this, 'GPSLatitude'),
                        lng: window.EXIF.getTag(this, 'GPSLongitude'),
                        latRef: window.EXIF.getTag(this, 'GPSLatitudeRef'),
                        lngRef: window.EXIF.getTag(this, 'GPSLongitudeRef')
                    }
                };
                resolve(exifData);
            });
        } else {
            resolve({});
        }
    });
}

function createConversationFromMessage(message) {
    const newConversation = {
        id: message.conversationId,
        name: message.senderName,
        participants: [message.senderId, currentUser.id],
        messages: [message],
        createdAt: message.timestamp,
        unreadCount: 1
    };
    
    conversations.push(newConversation);
    saveConversations();
    updateConversationsList();
}

function showChatNotification(message, conversation) {
    // Don't show notification for own messages
    if (message.senderId === currentUser.id) return;
    
    let title = `New message from ${message.senderName}`;
    let body = '';
    
    switch (message.type) {
        case 'text':
            body = message.content;
            break;
        case 'file':
            body = `Sent a file: ${message.fileInfo.name}`;
            break;
        case 'photo':
            body = 'Sent a photo';
            break;
        case 'location':
            body = 'Shared location';
            break;
    }
    
    // Show in-app notification
    showNotification(title, body, 'info');
    
    // Play notification sound if enabled
    if (chatSettings.notificationSound) {
        playNotificationSound();
    }
    
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/favicon.ico',
            tag: `chat-${message.conversationId}`
        });
    }
}

function playNotificationSound() {
    // Create a simple notification sound
    const audioContext = window.AudioContext || window.webkitAudioContext;
    if (audioContext) {
        const context = new audioContext();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.setValueAtTime(800, context.currentTime);
        oscillator.frequency.setValueAtTime(600, context.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
        
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.2);
    }
}

// ===================================
// CHAT SETTINGS
// ===================================

function loadChatSettings() {
    const saved = localStorage.getItem('chatSettings');
    if (saved) {
        try {
            chatSettings = { ...chatSettings, ...JSON.parse(saved) };
        } catch (error) {
            console.error('Error loading chat settings:', error);
        }
    }
}

function saveChatSettings() {
    localStorage.setItem('chatSettings', JSON.stringify(chatSettings));
}

function openChatSettings() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Chat Settings</h3>
            <div class="settings-section">
                <div class="form-check">
                    <input type="checkbox" id="chat-auto-download" ${chatSettings.autoDownload ? 'checked' : ''}>
                    <label for="chat-auto-download">Auto-download files</label>
                </div>
                
                <div class="form-check">
                    <input type="checkbox" id="chat-notification-sound" ${chatSettings.notificationSound ? 'checked' : ''}>
                    <label for="chat-notification-sound">Notification sound</label>
                </div>
                
                <div class="form-check">
                    <input type="checkbox" id="chat-save-local" ${chatSettings.saveToLocalStorage ? 'checked' : ''}>
                    <label for="chat-save-local">Save messages locally</label>
                </div>
                
                <div class="mb-3">
                    <label>Download naming pattern:</label>
                    <select id="chat-naming-pattern" class="form-control">
                        <option value="timestamp">filename_YYYY-MM-DD_HHMM</option>
                        <option value="simple">filename</option>
                        <option value="detailed">chat_filename_sender_timestamp</option>
                    </select>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="saveChatSettingsModal()">Save</button>
                <button class="btn btn-secondary" onclick="closeChatSettingsModal()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function saveChatSettingsModal() {
    chatSettings.autoDownload = document.getElementById('chat-auto-download').checked;
    chatSettings.notificationSound = document.getElementById('chat-notification-sound').checked;
    chatSettings.saveToLocalStorage = document.getElementById('chat-save-local').checked;
    
    saveChatSettings();
    closeChatSettingsModal();
    showMessage('Chat settings saved', 'success');
}

function closeChatSettingsModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function generateChatId() {
    return 'chat_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
        return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function findMessageById(messageId) {
    for (const conversation of conversations) {
        const message = conversation.messages.find(m => m.id === messageId);
        if (message) return message;
    }
    return null;
}

function createConversationFromMessage(message) {
    const newConversation = {
        id: message.conversationId,
        name: message.senderName,
        participants: [message.senderId, currentUser.id],
        messages: [message],
        createdAt: message.timestamp,<replit_final_file>
        unreadCount: 1
    };
    
    conversations.push(newConversation);
    saveConversations();
    updateConversationsList();
}

async function extractPhotoMetadata(file) {
    return new Promise((resolve) => {
        if (window.EXIF && window.EXIF.getData) {
            window.EXIF.getData(file, function() {
                const exifData = {
                    make: window.EXIF.getTag(this, 'Make'),
                    model: window.EXIF.getTag(this, 'Model'),
                    dateTime: window.EXIF.getTag(this, 'DateTime'),
                    gps: {
                        lat: window.EXIF.getTag(this, 'GPSLatitude'),
                        lng: window.EXIF.getTag(this, 'GPSLongitude'),
                        latRef: window.EXIF.getTag(this, 'GPSLatitudeRef'),
                        lngRef: window.EXIF.getTag(this, 'GPSLongitudeRef')
                    }
                };
                resolve(exifData);
            });
        } else {
            resolve({});
        }
    });
}

function openLocationOnMap(lat, lng) {
    // If mapping page exists, switch to it and center on location
    if (typeof showPage === 'function') {
        showPage('mapping-page');
        
        // Wait for map to initialize then center on location
        setTimeout(() => {
            if (window.map) {
                map.setView([lat, lng], 15);
                L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup('Shared location from chat')
                    .openPopup();
            }
        }, 500);
    } else {
        // Open in external map
        const url = `https://maps.google.com/?q=${lat},${lng}`;
        window.open(url, '_blank');
    }
}

function openPhotoModal(photoSrc) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay photo-modal';
    modal.innerHTML = `
        <div class="modal-content photo-modal-content">
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <img src="${photoSrc}" alt="Shared photo" style="max-width: 100%; max-height: 90vh;">
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on click outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Setup event listeners
function setupChatEventListeners() {
    // Enter key to send message
    document.addEventListener('keypress', function(e) {
        if (e.target.id === 'chat-message-input' && e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize chat input
    const chatInput = document.getElementById('chat-message-input');
    if (chatInput) {
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });
    }
}

// Export functions for use in other modules
window.chatSystem = {
    openChatPanel,
    closeChatPanel,
    sendMessage,
    shareLocation,
    attachFile,
    attachPhoto
};