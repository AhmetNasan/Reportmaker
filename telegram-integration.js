(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/telegram-integration.js b/telegram-integration.js
--- a/telegram-integration.js
+++ b/telegram-integration.js
@@ -0,0 +1,603 @@
+// ===================================
+// TELEGRAM INTEGRATION SYSTEM
+// ===================================
+
+// Telegram configuration
+let telegramConfig = {
+    botToken: 'YOUR_TELEGRAM_BOT_TOKEN_PLACEHOLDER',
+    chatId: 'YOUR_TELEGRAM_CHAT_ID_PLACEHOLDER',
+    webhookUrl: 'YOUR_WEBHOOK_URL_PLACEHOLDER',
+    adminChatId: 'YOUR_ADMIN_CHAT_ID_PLACEHOLDER'
+};
+
+let telegramBot = {
+    connected: false,
+    lastUpdate: null,
+    messageQueue: [],
+    analysisQueue: []
+};
+
+// Initialize Telegram integration
+document.addEventListener('DOMContentLoaded', function() {
+    initializeTelegramBot();
+    setupTelegramCommands();
+    loadTelegramSettings();
+});
+
+// ===================================
+// TELEGRAM BOT INITIALIZATION
+// ===================================
+
+function initializeTelegramBot() {
+    // Load saved Telegram settings
+    const savedSettings = localStorage.getItem('telegramSettings');
+    if (savedSettings) {
+        try {
+            const settings = JSON.parse(savedSettings);
+            telegramConfig = { ...telegramConfig, ...settings };
+        } catch (error) {
+            console.error('Error loading Telegram settings:', error);
+        }
+    }
+    
+    // Set up webhook if token is available
+    if (telegramConfig.botToken && telegramConfig.botToken !== 'YOUR_TELEGRAM_BOT_TOKEN_PLACEHOLDER') {
+        setupTelegramWebhook();
+    }
+    
+    console.log('Telegram integration initialized');
+}
+
+async function setupTelegramWebhook() {
+    try {
+        // In production, set up webhook
+        // For demo, simulate connection
+        telegramBot.connected = true;
+        updateTelegramStatus();
+        
+        // Start polling for demo
+        startTelegramPolling();
+        
+    } catch (error) {
+        console.error('Telegram webhook setup failed:', error);
+        telegramBot.connected = false;
+        updateTelegramStatus();
+    }
+}
+
+function startTelegramPolling() {
+    // Simulate polling for demo
+    setInterval(() => {
+        processTelegramQueue();
+    }, 5000);
+}
+
+// ===================================
+// AI ANALYSIS VIA TELEGRAM
+// ===================================
+
+async function sendImageToTelegramAI(imageData, metadata = {}) {
+    const analysisRequest = {
+        id: generateId(),
+        image: imageData,
+        metadata: metadata,
+        timestamp: new Date().toISOString(),
+        status: 'pending'
+    };
+    
+    telegramBot.analysisQueue.push(analysisRequest);
+    
+    try {
+        // Send image to Telegram bot for AI analysis
+        await sendTelegramMessage('🔍 Analyzing uploaded image for defect detection...', 'photo', imageData);
+        
+        // Simulate AI analysis response
+        setTimeout(() => {
+            simulateAIAnalysisResponse(analysisRequest);
+        }, 3000);
+        
+        showMessage('Image sent to Telegram AI for analysis', 'info');
+        logActivity('AI Analysis', 'Image sent to Telegram bot for defect detection');
+        
+    } catch (error) {
+        console.error('Failed to send image to Telegram:', error);
+        showMessage('Failed to send image to Telegram bot', 'error');
+    }
+}
+
+function simulateAIAnalysisResponse(request) {
+    // Simulate AI analysis results
+    const defects = [
+        { type: 'Surface Cracking', severity: 'Medium', confidence: 0.85 },
+        { type: 'Edge Deterioration', severity: 'Low', confidence: 0.72 }
+    ];
+    
+    const analysisResult = {
+        requestId: request.id,
+        defects: defects,
+        overallSeverity: 'Medium',
+        recommendedAction: 'Schedule repair within 30 days',
+        confidence: 0.78,
+        timestamp: new Date().toISOString()
+    };
+    
+    // Send results back via Telegram
+    const resultMessage = `🔍 *AI Analysis Complete*\n\n` +
+        `📍 Defects Found: ${defects.length}\n` +
+        defects.map(d => `• ${d.type} (${d.severity}) - ${Math.round(d.confidence * 100)}%`).join('\n') +
+        `\n\n⚠️ Overall Severity: ${analysisResult.overallSeverity}\n` +
+        `📋 Recommended Action: ${analysisResult.recommendedAction}`;
+    
+    sendTelegramMessage(resultMessage);
+    
+    // Store in AI results
+    if (typeof aiResults !== 'undefined') {
+        aiResults.push({
+            id: generateId(),
+            image: request.image,
+            coordinates: request.metadata.coordinates || 'Unknown',
+            timestamp: new Date().toLocaleString(),
+            defects: defects.map(d => d.type),
+            severity: analysisResult.overallSeverity,
+            action: analysisResult.recommendedAction
+        });
+        
+        // Update AI results table if visible
+        if (typeof renderAIResultsTable === 'function') {
+            renderAIResultsTable();
+        }
+    }
+    
+    showNotification('AI Analysis Complete', `Found ${defects.length} defects with ${analysisResult.overallSeverity} severity`, 'info');
+}
+
+// ===================================
+// SMART FAQ AND SUPPORT BOT
+// ===================================
+
+function setupTelegramCommands() {
+    const commands = {
+        '/start': handleStartCommand,
+        '/help': handleHelpCommand,
+        '/status': handleStatusCommand,
+        '/upload': handleUploadCommand,
+        '/summary': handleSummaryCommand,
+        '/defects': handleDefectsCommand,
+        '/backup': handleBackupCommand,
+        '/weather': handleWeatherCommand,
+        '/location': handleLocationCommand
+    };
+    
+    window.telegramCommands = commands;
+}
+
+function handleStartCommand(chatId, messageText) {
+    const welcomeMessage = `🏗️ *Welcome to Engineering Platform Bot!*\n\n` +
+        `I can help you with:\n` +
+        `📸 AI defect analysis\n` +
+        `📊 Project summaries\n` +
+        `🗺️ Location services\n` +
+        `☁️ Data backup\n` +
+        `📋 Status reports\n\n` +
+        `Type /help for more commands.`;
+    
+    sendTelegramMessage(welcomeMessage, 'text', null, chatId);
+}
+
+function handleHelpCommand(chatId, messageText) {
+    const helpMessage = `🤖 *Available Commands:*\n\n` +
+        `/start - Welcome message\n` +
+        `/help - Show this help\n` +
+        `/status - Platform status\n` +
+        `/upload - Upload image for analysis\n` +
+        `/summary [today/week] - Get reports\n` +
+        `/defects - Latest defect detections\n` +
+        `/backup - Create data backup\n` +
+        `/weather [location] - Weather info\n` +
+        `/location - Share location`;
+    
+    sendTelegramMessage(helpMessage, 'text', null, chatId);
+}
+
+function handleStatusCommand(chatId, messageText) {
+    const stats = {
+        projects: JSON.parse(localStorage.getItem('engineeringProjects') || '[]').length,
+        files: JSON.parse(localStorage.getItem('engineeringFiles') || '[]').length,
+        inspections: JSON.parse(localStorage.getItem('engineeringInspections') || '[]').length,
+        defects: JSON.parse(localStorage.getItem('engineeringAIResults') || '[]').length
+    };
+    
+    const statusMessage = `📊 *Platform Status*\n\n` +
+        `🏗️ Active Projects: ${stats.projects}\n` +
+        `📁 Stored Files: ${stats.files}\n` +
+        `🔍 Inspections: ${stats.inspections}\n` +
+        `⚠️ Detected Defects: ${stats.defects}\n\n` +
+        `🕐 Last Update: ${new Date().toLocaleTimeString()}`;
+    
+    sendTelegramMessage(statusMessage, 'text', null, chatId);
+}
+
+function handleSummaryCommand(chatId, messageText) {
+    const period = messageText.split(' ')[1] || 'today';
+    
+    // Generate summary based on period
+    const summaryData = generatePlatformSummary(period);
+    
+    const summaryMessage = `📋 *${period.charAt(0).toUpperCase() + period.slice(1)} Summary*\n\n` +
+        `📸 Images Analyzed: ${summaryData.imagesAnalyzed}\n` +
+        `⚠️ New Defects: ${summaryData.newDefects}\n` +
+        `📊 Reports Generated: ${summaryData.reportsGenerated}\n` +
+        `📁 Files Uploaded: ${summaryData.filesUploaded}\n\n` +
+        `🔥 Priority Items: ${summaryData.priorityItems}`;
+    
+    sendTelegramMessage(summaryMessage, 'text', null, chatId);
+}
+
+// ===================================
+// REPORT GENERATOR VIA TELEGRAM
+// ===================================
+
+async function sendDailySummaryReport() {
+    const summary = generatePlatformSummary('today');
+    
+    const reportMessage = `📊 *Daily Summary Report*\n` +
+        `📅 ${new Date().toLocaleDateString()}\n\n` +
+        `🔍 *AI Analysis:*\n` +
+        `• Images processed: ${summary.imagesAnalyzed}\n` +
+        `• Defects detected: ${summary.newDefects}\n` +
+        `• Critical issues: ${summary.criticalIssues}\n\n` +
+        `📁 *File Activity:*\n` +
+        `• Files uploaded: ${summary.filesUploaded}\n` +
+        `• Files shared: ${summary.filesShared}\n\n` +
+        `🏗️ *Project Updates:*\n` +
+        `• Inspections completed: ${summary.inspectionsCompleted}\n` +
+        `• Reports generated: ${summary.reportsGenerated}`;
+    
+    await sendTelegramMessage(reportMessage);
+    
+    // Also send as file if there's data
+    if (summary.imagesAnalyzed > 0 || summary.filesUploaded > 0) {
+        const reportData = generateDetailedReport('daily');
+        await sendTelegramFile(reportData, `daily-report-${new Date().toISOString().split('T')[0]}.json`);
+    }
+}
+
+function generatePlatformSummary(period) {
+    const now = new Date();
+    let startDate;
+    
+    switch (period) {
+        case 'today':
+            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
+            break;
+        case 'week':
+            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
+            break;
+        default:
+            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
+    }
+    
+    // Analyze data from localStorage
+    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
+    const recentActivities = activities.filter(a => new Date(a.timestamp) >= startDate);
+    
+    return {
+        imagesAnalyzed: recentActivities.filter(a => a.action === 'AI Analysis').length,
+        newDefects: recentActivities.filter(a => a.action === 'AI Analysis').length * 2, // Estimate
+        reportsGenerated: recentActivities.filter(a => a.action.includes('Report')).length,
+        filesUploaded: recentActivities.filter(a => a.action === 'File Upload').length,
+        filesShared: recentActivities.filter(a => a.action === 'File Share').length,
+        inspectionsCompleted: recentActivities.filter(a => a.description.includes('inspection')).length,
+        criticalIssues: Math.floor(Math.random() * 3), // Random for demo
+        priorityItems: Math.floor(Math.random() * 5) + 1
+    };
+}
+
+// ===================================
+// FILE DELIVERY VIA TELEGRAM
+// ===================================
+
+async function sendFileViaTelegram(fileId, recipientChatId = null) {
+    const file = getFileById(fileId);
+    if (!file) {
+        showMessage('File not found', 'error');
+        return;
+    }
+    
+    try {
+        const chatId = recipientChatId || telegramConfig.chatId;
+        
+        // Send file notification first
+        const fileMessage = `📁 *File Delivery*\n\n` +
+            `📄 Name: ${file.originalName}\n` +
+            `📊 Size: ${formatFileSize(file.size)}\n` +
+            `📅 Uploaded: ${new Date(file.uploadedAt).toLocaleDateString()}\n` +
+            `🏗️ Contract: ${file.contractNumber}`;
+        
+        await sendTelegramMessage(fileMessage, 'text', null, chatId);
+        
+        // Send actual file
+        await sendTelegramFile(file.content, file.originalName, chatId);
+        
+        showMessage(`File sent to Telegram successfully`, 'success');
+        logActivity('Telegram Delivery', `Sent ${file.originalName} via Telegram`);
+        
+    } catch (error) {
+        console.error('Failed to send file via Telegram:', error);
+        showMessage('Failed to send file via Telegram', 'error');
+    }
+}
+
+async function sendTelegramFile(fileData, filename, chatId = null) {
+    // For demo, simulate file sending
+    console.log(`Would send file ${filename} to Telegram chat ${chatId || telegramConfig.chatId}`);
+    
+    // In production, use Telegram Bot API sendDocument
+    const apiUrl = `https://api.telegram.org/bot${telegramConfig.botToken}/sendDocument`;
+    
+    // Mock successful response
+    return new Promise((resolve) => {
+        setTimeout(() => {
+            resolve({ ok: true, result: { message_id: Date.now() } });
+        }, 1000);
+    });
+}
+
+// ===================================
+// BACKUP & DATA EXPORT VIA TELEGRAM
+// ===================================
+
+async function createTelegramBackup() {
+    try {
+        showMessage('Creating backup for Telegram delivery...', 'info');
+        
+        // Create comprehensive backup
+        const backupData = {
+            timestamp: new Date().toISOString(),
+            projects: JSON.parse(localStorage.getItem('engineeringProjects') || '[]'),
+            contracts: JSON.parse(localStorage.getItem('engineeringContracts') || '[]'),
+            inspections: JSON.parse(localStorage.getItem('engineeringInspections') || '[]'),
+            costEstimations: JSON.parse(localStorage.getItem('engineeringCostEstimations') || '[]'),
+            aiResults: JSON.parse(localStorage.getItem('engineeringAIResults') || '[]'),
+            files: JSON.parse(localStorage.getItem('engineeringFiles') || '[]').map(f => ({
+                ...f,
+                content: null // Exclude content for size
+            })),
+            settings: {
+                theme: localStorage.getItem('selectedTheme'),
+                aiSettings: JSON.parse(localStorage.getItem('aiSettings') || '{}')
+            }
+        };
+        
+        const backupJson = JSON.stringify(backupData, null, 2);
+        const filename = `engineering-backup-${new Date().toISOString().split('T')[0]}.json`;
+        
+        // Send backup message
+        const backupMessage = `☁️ *Automated Backup*\n\n` +
+            `📅 Date: ${new Date().toLocaleDateString()}\n` +
+            `📊 Projects: ${backupData.projects.length}\n` +
+            `📁 Files: ${backupData.files.length}\n` +
+            `🔍 Inspections: ${backupData.inspections.length}\n` +
+            `💰 Cost Estimates: ${backupData.costEstimations.length}\n\n` +
+            `💾 Backup file attached below.`;
+        
+        await sendTelegramMessage(backupMessage);
+        await sendTelegramFile(backupJson, filename);
+        
+        showMessage('Backup sent to Telegram successfully', 'success');
+        logActivity('Telegram Backup', 'Full platform backup sent via Telegram');
+        
+    } catch (error) {
+        console.error('Telegram backup failed:', error);
+        showMessage('Failed to create Telegram backup', 'error');
+    }
+}
+
+function scheduleAutomaticBackup() {
+    // Schedule daily backups
+    const now = new Date();
+    const tomorrow = new Date(now);
+    tomorrow.setDate(tomorrow.getDate() + 1);
+    tomorrow.setHours(2, 0, 0, 0); // 2 AM
+    
+    const msUntilTomorrow = tomorrow.getTime() - now.getTime();
+    
+    setTimeout(() => {
+        createTelegramBackup();
+        // Schedule next backup
+        setInterval(createTelegramBackup, 24 * 60 * 60 * 1000); // Daily
+    }, msUntilTomorrow);
+}
+
+// ===================================
+// MAP INTEGRATION VIA TELEGRAM
+// ===================================
+
+function handleLocationCommand(chatId, messageText) {
+    // Send current platform location or request user location
+    const locationMessage = `🗺️ *Location Services*\n\n` +
+        `📍 Share your location to:\n` +
+        `• Find nearby projects\n` +
+        `• Get weather updates\n` +
+        `• Locate construction sites\n\n` +
+        `Use the location button below or send coordinates.`;
+    
+    sendTelegramMessage(locationMessage, 'text', null, chatId);
+}
+
+async function processLocationFromTelegram(location) {
+    const { latitude, longitude } = location;
+    
+    // Find nearby projects
+    const projects = JSON.parse(localStorage.getItem('engineeringProjects') || '[]');
+    const nearbyProjects = projects.filter(project => {
+        if (!project.coordinates) return false;
+        
+        const distance = calculateDistance(
+            latitude, longitude,
+            project.coordinates[0], project.coordinates[1]
+        );
+        
+        return distance < 10; // Within 10km
+    });
+    
+    let responseMessage = `📍 *Location Received*\n` +
+        `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n\n`;
+    
+    if (nearbyProjects.length > 0) {
+        responseMessage += `🏗️ *Nearby Projects (${nearbyProjects.length}):*\n`;
+        nearbyProjects.forEach(project => {
+            responseMessage += `• ${project.name} - ${project.location}\n`;
+        });
+    } else {
+        responseMessage += `No projects found within 10km of your location.`;
+    }
+    
+    await sendTelegramMessage(responseMessage);
+    
+    // Get weather for location
+    await sendWeatherUpdate(latitude, longitude);
+}
+
+async function sendWeatherUpdate(lat, lng) {
+    // Mock weather data
+    const weatherData = {
+        temperature: Math.round(Math.random() * 30 + 10),
+        humidity: Math.round(Math.random() * 40 + 40),
+        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
+        windSpeed: Math.round(Math.random() * 20 + 5)
+    };
+    
+    const weatherMessage = `🌤️ *Weather Update*\n\n` +
+        `📍 Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}\n` +
+        `🌡️ Temperature: ${weatherData.temperature}°C\n` +
+        `💧 Humidity: ${weatherData.humidity}%\n` +
+        `☁️ Condition: ${weatherData.condition}\n` +
+        `💨 Wind: ${weatherData.windSpeed} km/h\n\n` +
+        `Suitable for outdoor construction work.`;
+    
+    await sendTelegramMessage(weatherMessage);
+}
+
+// ===================================
+// TELEGRAM MESSAGE HANDLING
+// ===================================
+
+async function sendTelegramMessage(text, type = 'text', attachment = null, chatId = null) {
+    const message = {
+        chat_id: chatId || telegramConfig.chatId,
+        text: text,
+        parse_mode: 'Markdown'
+    };
+    
+    // Add to queue for processing
+    telegramBot.messageQueue.push({
+        message,
+        type,
+        attachment,
+        timestamp: new Date().toISOString()
+    });
+    
+    // For demo, just log
+    console.log('Telegram message queued:', text);
+    
+    return new Promise((resolve) => {
+        setTimeout(resolve, 500);
+    });
+}
+
+function processTelegramQueue() {
+    if (telegramBot.messageQueue.length === 0) return;
+    
+    const message = telegramBot.messageQueue.shift();
+    console.log('Processing Telegram message:', message.message.text);
+    
+    // In production, send via Telegram Bot API
+    // For demo, simulate processing
+}
+
+function updateTelegramStatus() {
+    const statusElements = document.querySelectorAll('.telegram-connection-status');
+    statusElements.forEach(element => {
+        element.textContent = telegramBot.connected ? 'Connected' : 'Disconnected';
+        element.className = `telegram-connection-status ${telegramBot.connected ? 'connected' : 'disconnected'}`;
+    });
+}
+
+// ===================================
+// UTILITY FUNCTIONS
+// ===================================
+
+function calculateDistance(lat1, lng1, lat2, lng2) {
+    const R = 6371; // Earth's radius in km
+    const dLat = (lat2 - lat1) * Math.PI / 180;
+    const dLng = (lng2 - lng1) * Math.PI / 180;
+    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
+        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
+        Math.sin(dLng/2) * Math.sin(dLng/2);
+    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
+    return R * c;
+}
+
+function generateDetailedReport(period) {
+    return {
+        period,
+        generated: new Date().toISOString(),
+        summary: generatePlatformSummary(period),
+        activities: JSON.parse(localStorage.getItem('activities') || '[]').slice(0, 50)
+    };
+}
+
+function loadTelegramSettings() {
+    // Load settings from localStorage
+    const settings = JSON.parse(localStorage.getItem('telegramSettings') || '{}');
+    telegramConfig = { ...telegramConfig, ...settings };
+}
+
+function saveTelegramSettings() {
+    localStorage.setItem('telegramSettings', JSON.stringify(telegramConfig));
+}
+
+// ===================================
+// ENHANCED FUNCTIONS FOR OTHER MODULES
+// ===================================
+
+// Override file sharing to include Telegram option
+function enhancedSendTelegramShare(shareRecord, file) {
+    sendFileViaTelegram(file.id, shareRecord.sharedWith);
+}
+
+// Override AI image upload to include Telegram analysis
+function enhancedHandleAIImageUpload(event) {
+    const files = event.target.files;
+    
+    Array.from(files).forEach(async (file) => {
+        // Original AI processing
+        if (typeof handleAIImageUpload === 'function') {
+            handleAIImageUpload(event);
+        }
+        
+        // Enhanced Telegram AI analysis
+        const imageData = await fileToBase64(file);
+        const metadata = {
+            filename: file.name,
+            size: file.size,
+            uploadTime: new Date().toISOString()
+        };
+        
+        await sendImageToTelegramAI(imageData, metadata);
+    });
+}
+
+// Auto-schedule backups
+scheduleAutomaticBackup();
+
+// Export for global use
+window.telegramIntegration = {
+    sendFileViaTelegram,
+    createTelegramBackup,
+    sendImageToTelegramAI,
+    sendDailySummaryReport,
+    saveTelegramSettings,
+    loadTelegramSettings
+};
EOF
)
