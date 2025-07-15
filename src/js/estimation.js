// Global Variables
let inspectionData = [];
let costEstimationData = [];
let projectMap = null;
let miniMap = null;
let mainMap = null;
let currentLocation = { lat: 25.2854, lng: 51.5310 };
let mapMarkers = [];
let photoFiles = [];
let cameraStream = null;
let quantityContext = 'inspection';
let boqUsage = {};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadBOQUsage();
});

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const page = document.getElementById(`${pageId}-page`);
    if (page) {
        page.classList.add('active');
        currentPage = pageId;
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const navItem = document.querySelector(`[onclick="showPage('${pageId}')"]`);
    if (navItem) {
        navItem.classList.add('active');
    }

    if (pageId === 'map' && !mainMap) {
        setTimeout(initializeMainMap, 100);
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function toggleUserMenu() {
    document.getElementById('user-dropdown').classList.toggle('active');
}

function toggleTheme() {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle i');

    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.className = 'fas fa-moon';
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.className = 'fas fa-sun';
    }
}

// Tab Management
function openTab(event, tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');

    if (tabName === 'map-tab' && !projectMap) {
        setTimeout(initializeProjectMap, 100);
    }
}

// Map Functions
function initializeMaps() {
    setTimeout(() => {
        initializeMiniMap();
        if (currentPage === 'estimation-inspection') {
            initializeProjectMap();
        }
    }, 500);
}

function initializeMiniMap() {
    if (miniMap) return;

    const miniMapEl = document.getElementById('mini-map');
    if (!miniMapEl) return;

    miniMap = L.map('mini-map').setView([currentLocation.lat, currentLocation.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(miniMap);

    updateMiniMapLocation();
}

function initializeProjectMap() {
    if (projectMap) return;

    const projectMapEl = document.getElementById('project-map');
    if (!projectMapEl) return;

    projectMap = L.map('project-map').setView([currentLocation.lat, currentLocation.lng], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(projectMap);
}

function initializeMainMap() {
    if (mainMap) return;

    const mainMapEl = document.getElementById('main-map');
    if (!mainMapEl) return;

    mainMap = L.map('main-map').setView([currentLocation.lat, currentLocation.lng], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mainMap);
}

function updateMiniMapLocation() {
    if (!miniMap) return;

    miniMap.setView([currentLocation.lat, currentLocation.lng], 15);

    if (window.currentLocationMarker) {
        miniMap.removeLayer(window.currentLocationMarker);
    }

    window.currentLocationMarker = L.marker([currentLocation.lat, currentLocation.lng])
        .addTo(miniMap)
        .bindPopup('Current Location');
}

// GPS Functions
function switchLocationMode(mode) {
    document.getElementById('auto-location').classList.toggle('active', mode === 'auto');
    document.getElementById('manual-location').classList.toggle('active', mode === 'manual');

    document.getElementById('auto-location-panel').style.display = mode === 'auto' ? 'block' : 'none';
    document.getElementById('manual-location-panel').style.display = mode === 'manual' ? 'block' : 'none';

    if (mode === 'auto') {
        getCurrentLocation();
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation.lat = position.coords.latitude;
                currentLocation.lng = position.coords.longitude;
                updateLocationDisplay();
                updateMiniMapLocation();
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Could not get your location. Please check permissions.');
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function updateLocationDisplay() {
    document.getElementById('current-lat').textContent = currentLocation.lat.toFixed(6);
    document.getElementById('current-lng').textContent = currentLocation.lng.toFixed(6);

    // Update manual inputs if in manual mode
    const manualLat = document.getElementById('manual-lat');
    const manualLng = document.getElementById('manual-lng');
    if (manualLat && manualLng) {
        manualLat.value = currentLocation.lat.toFixed(6);
        manualLng.value = currentLocation.lng.toFixed(6);
    }
}

// Photo Functions
function handlePhotos(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                addPhotoPreview(e.target.result, file.name);
            };
            reader.readAsDataURL(file);
        }
    });
}

function addPhotoPreview(src, name) {
    const previewsContainer = document.getElementById('photo-previews');
    const photoDiv = document.createElement('div');
    photoDiv.className = 'photo-preview';
    photoDiv.innerHTML = `
        <img src="${src}" alt="${name}" onclick="showImagePreview('${src}')">
        <button onclick="removePhoto(this)" style="position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px;">&times;</button>
    `;
    previewsContainer.appendChild(photoDiv);

    photoFiles.push({ src, name });
}

function removePhoto(button) {
    const photoDiv = button.parentElement;
    const img = photoDiv.querySelector('img');
    const src = img.src;

    photoFiles = photoFiles.filter(photo => photo.src !== src);
    photoDiv.remove();
}

function openCamera() {
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('camera-feed');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            cameraStream = stream;
            video.srcObject = stream;
            modal.classList.add('active');
        })
        .catch(err => {
            console.error('Error accessing camera:', err);
            alert('Could not access camera');
        });
}

function closeCamera() {
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('camera-feed');

    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    video.srcObject = null;
    modal.classList.remove('active');
}

function capturePhoto() {
    const video = document.getElementById('camera-feed');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    addPhotoPreview(dataUrl, `captured-${timestamp}.jpg`);

    closeCamera();
}

// Quantity Calculator
function showQuantityCalculator(context = 'inspection') {
    quantityContext = context;
    document.getElementById('quantity-modal').classList.add('active');

    // Pre-fill values if context is BOQ
    if (context === 'boq') {
        document.getElementById('calc-length').value = document.getElementById('boq-length').value || '';
        document.getElementById('calc-width').value = document.getElementById('boq-width').value || '';
        document.getElementById('calc-height').value = document.getElementById('boq-height').value || '';
        document.getElementById('calc-repetitions').value = document.getElementById('boq-nr').value || 1;
    } else {
        // Clear for inspection context
        document.getElementById('calc-length').value = '';
        document.getElementById('calc-width').value = '';
        document.getElementById('calc-height').value = '';
        document.getElementById('calc-repetitions').value = 1;
    }

    calculateQuantity();
}

function calculateQuantity() {
    const length = parseFloat(document.getElementById('calc-length').value) || 0;
    const width = parseFloat(document.getElementById('calc-width').value) || 0;
    const height = parseFloat(document.getElementById('calc-height').value) || 0;
    const repetitions = parseFloat(document.getElementById('calc-repetitions').value) || 1;

    let quantity = 0;
    if (length > 0 && width > 0 && height > 0) {
        quantity = length * width * height * repetitions;
    } else if (length > 0 && width > 0) {
        quantity = length * width * repetitions;
    } else if (length > 0) {
        quantity = length * repetitions;
    } else {
        quantity = repetitions;
    }

    document.getElementById('calculated-quantity').value = quantity.toFixed(3);
}

function setQuantity() {
    const quantity = document.getElementById('calculated-quantity').value;

    if (quantityContext === 'boq') {
        document.getElementById('boq-nr').value = document.getElementById('calc-repetitions').value;
        document.getElementById('boq-length').value = document.getElementById('calc-length').value;
        document.getElementById('boq-width').value = document.getElementById('calc-width').value;
        document.getElementById('boq-height').value = document.getElementById('calc-height').value;
        calculateBOQTotal();
    } else {
        document.getElementById('asset-quantity').value = quantity;
    }

    hideModal('quantity-modal');
}

// BOQ Functions
function updateBOQDetails() {
    const select = document.getElementById('boq-select');
    const selectedOption = select.options[select.selectedIndex];

    if (selectedOption && selectedOption.value) {
        document.getElementById('boq-description').value = selectedOption.getAttribute('data-desc') || '';
        document.getElementById('boq-unit').value = selectedOption.getAttribute('data-unit') || '';
        document.getElementById('boq-rate').value = selectedOption.getAttribute('data-rate') || '';
        calculateBOQTotal();
    }
}

function calculateBOQTotal() {
    const nr = parseFloat(document.getElementById('boq-nr').value) || 0;
    const length = parseFloat(document.getElementById('boq-length').value) || 0;
    const width = parseFloat(document.getElementById('boq-width').value) || 0;
    const height = parseFloat(document.getElementById('boq-height').value) || 0;
    const rate = parseFloat(document.getElementById('boq-rate').value) || 0;

    let totalQty = 0;
    if (nr > 0 && length > 0 && width > 0 && height > 0) {
        totalQty = nr * length * width * height;
    } else if (nr > 0 && length > 0 && width > 0) {
        totalQty = nr * length * width;
    } else if (nr > 0 && length > 0) {
        totalQty = nr * length;
    } else if (nr > 0) {
        totalQty = nr;
    }

    const amount = totalQty * rate;

    document.getElementById('boq-total-qty').value = totalQty.toFixed(3);
    document.getElementById('boq-amount').value = amount.toFixed(2);
}

function filterBOQ() {
    const searchTerm = document.getElementById('boq-search').value.toLowerCase();
    const select = document.getElementById('boq-select');
    const options = select.querySelectorAll('option');

    let hasVisibleOptions = false;
    options.forEach(option => {
        if (option.value === '') {
            option.style.display = 'block';
            return;
        }

        const text = option.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            option.style.display = 'block';
            hasVisibleOptions = true;
        } else {
            option.style.display = 'none';
        }
    });
}

function selectBOQ(ref) {
    document.getElementById('boq-select').value = ref;
    updateBOQDetails();
}

function trackBOQUsage(ref) {
    boqUsage[ref] = (boqUsage[ref] || 0) + 1;
    saveBOQUsage();
    updateMostUsedList();
}

function loadBOQUsage() {
    const saved = localStorage.getItem('boqUsage');
    if (saved) {
        boqUsage = JSON.parse(saved);
        updateMostUsedList();
    }
}

function saveBOQUsage() {
    localStorage.setItem('boqUsage', JSON.stringify(boqUsage));
}

function updateMostUsedList() {
    const list = document.getElementById('most-used-list');
    if (!list) return;

    const sorted = Object.entries(boqUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

    if (sorted.length === 0) {
        list.innerHTML = '<li>No BOQ items used yet</li>';
        return;
    }

    list.innerHTML = sorted
        .map(([ref, count]) => `<li onclick="selectBOQ('${ref}')">${ref} (${count})</li>`)
        .join('');
}

// Data Management Functions
function addInspectionRow() {
    const asset = document.getElementById('asset-description').value;
    const status = document.getElementById('asset-status').value;
    const recommendation = document.getElementById('asset-recommendation').value;
    const quantity = document.getElementById('asset-quantity').value;

    if (!asset) {
        alert('Please enter asset description');
        return;
    }

    const row = {
        id: Date.now(),
        asset: asset,
        status: status,
        recommendation: recommendation,
        quantity: quantity,
        photos: [...photoFiles],
        latitude: currentLocation.lat.toFixed(6),
        longitude: currentLocation.lng.toFixed(6)
    };

    inspectionData.push(row);
    updateInspectionTable();
    clearInspectionForm();

    // Add marker to project map
    if (projectMap) {
        const marker = L.marker([currentLocation.lat, currentLocation.lng])
            .addTo(projectMap)
            .bindPopup(`<b>${asset}</b><br>Status: ${status}`);
        mapMarkers.push(marker);
    }
}

function addBOQRow() {
    const ref = document.getElementById('boq-select').value;
    const description = document.getElementById('boq-description').value;
    const unit = document.getElementById('boq-unit').value;
    const nr = document.getElementById('boq-nr').value;
    const length = document.getElementById('boq-length').value;
    const width = document.getElementById('boq-width').value;
    const height = document.getElementById('boq-height').value;
    const totalQty = document.getElementById('boq-total-qty').value;
    const rate = document.getElementById('boq-rate').value;
    const amount = document.getElementById('boq-amount').value;
    const remarks = document.getElementById('boq-remarks').value;

    if (!ref || !description) {
        alert('Please select a BOQ item');
        return;
    }

    const row = {
        id: Date.now(),
        ref: ref,
        description: description,
        unit: unit,
        nr: nr,
        length: length,
        width: width,
        height: height,
        totalQty: totalQty,
        rate: rate,
        amount: amount,
        remarks: remarks
    };

    costEstimationData.push(row);
    updateCostEstimationTable();
    clearBOQForm();
    trackBOQUsage(ref);
}

function updateInspectionTable() {
    const tbody = document.getElementById('inspection-tbody');
    tbody.innerHTML = '';

    inspectionData.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${row.asset}</td>
            <td>${row.status}</td>
            <td>${row.recommendation}</td>
            <td>${row.quantity}</td>
            <td>
                <div class="photo-wrapper">
                    ${row.photos.map(photo => `<img src="${photo.src}" onclick="showImagePreview('${photo.src}')">`).join('')}
                </div>
            </td>
            <td>${row.latitude}</td>
            <td>${row.longitude}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteInspectionRow(${row.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateCostEstimationTable() {
    const tbody = document.getElementById('cost-tbody');
    tbody.innerHTML = '';

    let total = 0;
    costEstimationData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.ref}</td>
            <td>${row.description}</td>
            <td>${row.unit}</td>
            <td>${row.nr}</td>
            <td>${row.length}</td>
            <td>${row.width}</td>
            <td>${row.height}</td>
            <td>${row.totalQty}</td>
            <td>${row.rate}</td>
            <td>${row.amount}</td>
            <td>${row.remarks}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteCostRow(${row.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
        total += parseFloat(row.amount) || 0;
    });

    document.getElementById('total-amount').textContent = `QR ${total.toFixed(2)}`;
}

function deleteInspectionRow(id) {
    if (confirm('Are you sure you want to delete this row?')) {
        inspectionData = inspectionData.filter(row => row.id !== id);
        updateInspectionTable();
    }
}

function deleteCostRow(id) {
    if (confirm('Are you sure you want to delete this row?')) {
        costEstimationData = costEstimationData.filter(row => row.id !== id);
        updateCostEstimationTable();
    }
}

function clearInspectionForm() {
    document.getElementById('asset-description').value = '';
    document.getElementById('asset-status').value = 'Good';
    document.getElementById('asset-recommendation').value = '';
    document.getElementById('asset-quantity').value = '';
    document.getElementById('photo-previews').innerHTML = '';
    photoFiles = [];
}

function clearBOQForm() {
    document.getElementById('boq-select').value = '';
    document.getElementById('boq-description').value = '';
    document.getElementById('boq-unit').value = '';
    document.getElementById('boq-nr').value = '1';
    document.getElementById('boq-length').value = '';
    document.getElementById('boq-width').value = '';
    document.getElementById('boq-height').value = '';
    document.getElementById('boq-total-qty').value = '';
    document.getElementById('boq-rate').value = '';
    document.getElementById('boq-amount').value = '';
    document.getElementById('boq-remarks').value = '';
}

// Export Functions
function exportProject() {
    const project = {
        name: `Project_${new Date().toISOString().split('T')[0]}`,
        date: new Date().toISOString(),
        inspectionData: inspectionData,
        costEstimationData: costEstimationData,
        location: currentLocation
    };

    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importProject(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const project = JSON.parse(e.target.result);

            if (project.inspectionData) {
                inspectionData = project.inspectionData;
                updateInspectionTable();
            }

            if (project.costEstimationData) {
                costEstimationData = project.costEstimationData;
                updateCostEstimationTable();
            }

            if (project.location) {
                currentLocation = project.location;
                updateLocationDisplay();
                updateMiniMapLocation();
            }

            alert('Project imported successfully!');
        } catch (error) {
            alert('Error importing project: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function exportInspectionCSV() {
    if (inspectionData.length === 0) {
        alert('No inspection data to export');
        return;
    }

    const headers = ['ID', 'Asset', 'Status', 'Recommendation', 'Quantity', 'Photos', 'Latitude', 'Longitude'];
    const csvContent = [
        headers.join(','),
        ...inspectionData.map((row, index) => [
            index + 1,
            `"${row.asset}"`,
            `"${row.status}"`,
            `"${row.recommendation}"`,
            row.quantity,
            row.photos.length,
            row.latitude,
            row.longitude
        ].join(','))
    ].join('\n');

    downloadFile(csvContent, 'inspection_report.csv', 'text/csv');
}

function exportCostCSV() {
    if (costEstimationData.length === 0) {
        alert('No cost estimation data to export');
        return;
    }

    const headers = ['BOQ Ref', 'Description', 'Unit', 'NR', 'Length', 'Width', 'Height', 'Total Qty', 'Rate', 'Amount', 'Remarks'];
    const csvContent = [
        headers.join(','),
        ...costEstimationData.map(row => [
            `"${row.ref}"`,
            `"${row.description}"`,
            `"${row.unit}"`,
            row.nr,
            row.length,
            row.width,
            row.height,
            row.totalQty,
            row.rate,
            row.amount,
            `"${row.remarks}"`
        ].join(','))
    ].join('\n');

    downloadFile(csvContent, 'cost_estimation.csv', 'text/csv');
}

function exportInspectionKML() {
    if (inspectionData.length === 0) {
        alert('No inspection data to export');
        return;
    }

    const placemarks = inspectionData.map(row => `
        <Placemark>
            <name>${row.asset}</name>
            <description>Status: ${row.status}\nRecommendation: ${row.recommendation}\nQuantity: ${row.quantity}</description>
            <Point>
                <coordinates>${row.longitude},${row.latitude},0</coordinates>
            </Point>
        </Placemark>
    `).join('');

    const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
        <kml xmlns="http://www.opengis.net/kml/2.2">
            <Document>
                <name>Inspection Report</name>
                ${placemarks}
            </Document>
        </kml>`;

    downloadFile(kmlContent, 'inspection_locations.kml', 'application/vnd.google-earth.kml+xml');
}

function downloadBOQTemplate() {
    const headers = 'BOQ Ref,Description,Unit,NR,Length (m),Width (m),Height (m),Total Qty,Rate,Amount,Remarks';
    downloadFile(headers, 'boq_template.csv', 'text/csv');
}

function importBOQCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            results.data.forEach(row => {
                const boqRow = {
                    id: Date.now() + Math.random(),
                    ref: row['BOQ Ref'] || '',
                    description: row['Description'] || '',
                    unit: row['Unit'] || '',
                    nr: row['NR'] || '',
                    length: row['Length (m)'] || '',
                    width: row['Width (m)'] || '',
                    height: row['Height (m)'] || '',
                    totalQty: row['Total Qty'] || '',
                    rate: row['Rate'] || '',
                    amount: row['Amount'] || '',
                    remarks: row['Remarks'] || ''
                };
                costEstimationData.push(boqRow);
            });
            updateCostEstimationTable();
            alert(`${results.data.length} BOQ items imported successfully!`);
        },
        error: function(error) {
            alert('Error parsing CSV file: ' + error.message);
        }
    });
}

function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

// Print Functions
function printReport() {
    window.print();
}

function printInspectionReport() {
    const printWindow = window.open('', '_blank');
    const inspectionTable = document.getElementById('inspection-table').outerHTML;
    printWindow.document.write(`
        <html>
            <head>
                <title>Inspection Report</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                </style>
            </head>
            <body>
                <h1>Inspection Report</h1>
                ${inspectionTable}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function printCostReport() {
    const printWindow = window.open('', '_blank');
    const costTable = document.getElementById('cost-table').outerHTML;
    printWindow.document.write(`
        <html>
            <head>
                <title>Cost Estimation Report</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                </style>
            </head>
            <body>
                <h1>Cost Estimation Report</h1>
                ${costTable}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Utility Functions
function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showImagePreview(src) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '3000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90%; max-height: 90%; padding: 0;">
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 15px; z-index: 1;">&times;</button>
            <img src="${src}" style="width: 100%; height: auto; border-radius: 12px;">
        </div>
    `;
    document.body.appendChild(modal);
}

function centerMapOnUser() {
    getCurrentLocation();
    if (projectMap) {
        projectMap.setView([currentLocation.lat, currentLocation.lng], 15);
    }
}

function fitMapToMarkers() {
    if (projectMap && mapMarkers.length > 0) {
        const group = new L.featureGroup(mapMarkers);
        projectMap.fitBounds(group.getBounds());
    } else {
        alert('No markers to fit to');
    }
}

function clearMapMarkers() {
    if (projectMap) {
        mapMarkers.forEach(marker => projectMap.removeLayer(marker));
        mapMarkers = [];
    }
}

function importMapData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            if (file.name.toLowerCase().endsWith('.csv')) {
                Papa.parse(e.target.result, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function(results) {
                        results.data.forEach(row => {
                            const lat = parseFloat(row.latitude || row.Latitude || row.lat);
                            const lng = parseFloat(row.longitude || row.Longitude || row.lng);
                            const name = row.name || row.Name || row.asset || 'Marker';

                            if (!isNaN(lat) && !isNaN(lng) && projectMap) {
                                const marker = L.marker([lat, lng])
                                    .addTo(projectMap)
                                    .bindPopup(name);
                                mapMarkers.push(marker);
                            }
                        });
                        fitMapToMarkers();
                        alert(`${results.data.length} markers imported from CSV`);
                    }
                });
            } else if (file.name.toLowerCase().endsWith('.kml')) {
                // Basic KML parsing (simplified)
                const parser = new DOMParser();
                const kmlDoc = parser.parseFromString(e.target.result, 'text/xml');
                const placemarks = kmlDoc.querySelectorAll('Placemark');

                placemarks.forEach(placemark => {
                    const name = placemark.querySelector('name')?.textContent || 'Marker';
                    const coordinates = placemark.querySelector('coordinates')?.textContent;

                    if (coordinates) {
                        const coords = coordinates.trim().split(',');
                        const lng = parseFloat(coords[0]);
                        const lat = parseFloat(coords[1]);

                        if (!isNaN(lat) && !isNaN(lng) && projectMap) {
                            const marker = L.marker([lat, lng])
                                .addTo(projectMap)
                                .bindPopup(name);
                            mapMarkers.push(marker);
                        }
                    }
                });

                fitMapToMarkers();
                alert(`${placemarks.length} markers imported from KML`);
            }
        } catch (error) {
            alert('Error importing file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// AI Defect Analysis (placeholder)
function analyzeDefects(event) {
    const files = Array.from(event.target.files);
    const resultsContainer = document.getElementById('ai-results-container');
    const resultsDiv = document.getElementById('ai-results');

    resultsContainer.innerHTML = '';
    resultsDiv.style.display = 'block';

    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'card';
            resultDiv.innerHTML = `
                <h4>Analysis Result ${index + 1}</h4>
                <img src="${e.target.result}" style="max-width: 200px; border-radius: 8px;">
                <div style="margin-top: 10px;">
                    <p><strong>Detected Issues:</strong> Crack detection (simulated)</p>
                    <p><strong>Severity:</strong> Medium</p>
                    <p><strong>Recommendation:</strong> Monitor and schedule maintenance</p>
                </div>
            `;
            resultsContainer.appendChild(resultDiv);
        };
        reader.readAsDataURL(file);
    });
}

// Placeholder functions for other features
function showProfile() { alert('Profile page would open here'); }
function showSettings() { alert('Settings page would open here'); }
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        location.reload();
    }
}
