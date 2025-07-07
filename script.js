// --- DICTIONARY ---
const langDict = {
    en: {
        report_title: "Asset Inspection Report",
        tab_inspection_report: "Inspection Report",
        tab_saved_projects: "Saved Projects",
        tab_cost_estimation: "Cost Estimation",
        tab_vehicle_tracking: "Vehicle Tracking",
        date: "Date",
        add_new_asset: "Add New Asset",
        asset_description_placeholder: "Asset Description",
        drop_or_click_photos: "Drag & Drop or Click to Add Photos",
        details_and_recommendations: "Details & Recommendations",
        status_placeholder: "Status (e.g., Good, Damaged)",
        recommendation_placeholder: "Recommendation (e.g., Repair, Replace)",
        calculate_quantity: "Calculate Quantity",
        gps_location: "GPS Location",
        location_mode_auto: "Automatic",
        location_mode_manual: "Manual",
        get_current_gps: "Get Current GPS",
        manual_lat_placeholder: "Manual Latitude",
        manual_lng_placeholder: "Manual Longitude",
        latitude: "Latitude",
        longitude: "Longitude",
        insert_location_to_form: "Insert to Form",
        add_row_to_table: "Add Row to Table",
        print_report: "Print Report",
        export_pdf_report: "Export PDF",
        print_estimation: "Print Estimation",
        export_pdf_estimation: "Export PDF",
        enter_quantity_details: "Enter Quantity Details",
        length_m: "Length (m)",
        width_m: "Width (m)",
        depth_m: "Depth (m)",
        repetitions_nr: "Repetitions (NR)",
        set_quantity: "Set Quantity",
        cancel: "Cancel",
        download_csv_template: "Download CSV Template",
        clear_map: "Clear Map",
        assets_loaded: "Assets loaded:",
        total_assets: "Total assets:",
        last_modified: "Last Modified:",
        saved_date: "Saved Date:",
        project_name_placeholder: "Type project name to confirm",
        confirm_delete: "Confirm Deletion",
        cancel_delete: "Cancel",
        type_project_name: "Type the project name to confirm:",
        confirm_deletion_message: "Are you sure you want to delete this project?",
        created_by: "Created by Eng. Islam"
    },
    ar: {
        report_title: "تقرير فحص الأصول",
        tab_inspection_report: "تقرير الفحص",
        tab_saved_projects: "المشاريع المحفوظة",
        tab_cost_estimation: "تقدير التكلفة",
        tab_vehicle_tracking: "تتبع المركبات",
        date: "التاريخ",
        add_new_asset: "إضافة أصل جديد",
        asset_description_placeholder: "وصف الأصل",
        drop_or_click_photos: "اسحب وأفلت أو انقر لإضافة الصور",
        details_and_recommendations: "التفاصيل والتوصيات",
        status_placeholder: "الحالة (مثال: جيد، متضرر)",
        recommendation_placeholder: "التوصية (مثال: إصلاح، استبدال)",
        calculate_quantity: "حساب الكمية",
        gps_location: "موقع GPS",
        location_mode_auto: "تلقائي",
        location_mode_manual: "يدوي",
        get_current_gps: "الحصول على الموقع الحالي",
        manual_lat_placeholder: "خط العرض اليدوي",
        manual_lng_placeholder: "خط الطول اليدوي",
        latitude: "خط العرض",
        longitude: "خط الطول",
        insert_location_to_form: "إدراج في النموذج",
        add_row_to_table: "إضافة صف للجدول",
        print_report: "طباعة التقرير",
        export_pdf_report: "تصدير PDF",
        print_estimation: "طباعة التقدير",
        export_pdf_estimation: "تصدير PDF",
        enter_quantity_details: "إدخال تفاصيل الكمية",
        length_m: "الطول (م)",
        width_m: "العرض (م)",
        depth_m: "العمق (م)",
        repetitions_nr: "التكرارات (عدد)",
        set_quantity: "تحديد الكمية",
        cancel: "إلغاء",
        download_csv_template: "تنزيل قالب CSV",
        clear_map: "مسح الخريطة",
        assets_loaded: "الأصول المحملة:",
        total_assets: "إجمالي الأصول:",
        last_modified: "آخر تعديل:",
        saved_date: "تاريخ الحفظ:",
        project_name_placeholder: "اكتب اسم المشروع للتأكيد",
        confirm_delete: "تأكيد الحذف",
        cancel_delete: "إلغاء",
        type_project_name: "اكتب اسم المشروع للتأكيد:",
        confirm_deletion_message: "هل أنت متأكد أنك تريد حذف هذا المشروع؟",
        created_by: "تصميم م. إسلام"
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (langDict[currentLang]?.[key]) {
            element.textContent = langDict[currentLang][key];
        }
    });
    document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
        const key = element.getAttribute('data-lang-placeholder');
        if (langDict[currentLang]?.[key]) {
            element.placeholder = langDict[currentLang][key];
        }
    });
}

// --- GLOBAL VARIABLES ---
let reportTable, costEstimationTable, map, vehicleMap, currentMarker;
let editingRow = null;
let activeProjectName = "active_report";
let projects = {};
let clientLogoInspection = null, companyLogoInspection = null;
let clientLogoEstimation = null, companyLogoEstimation = null;

let boqData = [
    { ref: "A1.1", description: "Excavation", unit: "m³", rate: 15.00 },
    { ref: "A1.2", description: "Backfilling", unit: "m³", rate: 10.00 },
    { ref: "B2.1", description: "Concrete Paving", unit: "m²", rate: 75.00 }
];

const assetOptions = ["(B) Zonal Inspections", "(C) Site Clearance", "(D) Drainage and Service Ducts", "(E) Earthworks", "(F) Sub-Base and Road Base", "(G) Flexible Surfacing", "(H) Kerbs & Footways", "(I) Road Markings", "(J) Directional Signs", "(K) Works by Statutory Undertakers", "(L) Street Lighting Works", "(M) Structures", "(N) Traffic Management", "(O) VRS", "(P) Supply of Materials", "(Q) Traffic Signs", "(R) Time and Material Rates", "(S) Plant and Equipment", "(T) Street Furniture"];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('display-date').value = today;
    document.getElementById('estimation-date').value = today;
    document.getElementById('current-year').textContent = new Date().getFullYear();

    reportTable = document.getElementById('report-table');
    costEstimationTable = document.getElementById('cost-estimation-table');

    if (!reportTable.tHead) {
        reportTable.createTHead().insertRow().innerHTML = `<th>ID</th><th>Asset</th><th>Status</th><th>Recommendation</th><th>Quantity</th><th>Photos</th><th>Latitude</th><th>Longitude</th><th>Action</th>`;
        reportTable.createTBody();
    }
    
    populateDatalist('asset-options', assetOptions);
    repopulateBOQSelect();
    
    projects = loadProjects();
    loadProject(activeProjectName);
    updateProjectsList();
    setupEventListeners();
    populateMenus();
    updateMostUsedBOQ();
    setLanguage('en'); 
});

function setupEventListeners() {
    // Drag and drop for photos
    const dropZone = document.getElementById('drop-zone');
    dropZone.addEventListener('dragover', e => e.preventDefault());
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        document.querySelector('.photo-input').files = e.dataTransfer.files;
        handlePhotoSelection();
    });

    // File input change
    document.querySelector('.photo-input').addEventListener('change', handlePhotoSelection);

    // BOQ Upload and Search
    document.getElementById('boq-csv-input').addEventListener('change', handleBOQUpload);
    document.getElementById('vehicle-csv-input').addEventListener('change', handleVehicleCSVUpload);
    document.getElementById('boq-search').addEventListener('input', () => repopulateBOQSelect(document.getElementById('boq-search').value));
    document.getElementById('boq-ref-select').addEventListener('change', updateBOQDetails);
    document.getElementById('print-map-btn').addEventListener('click', printMap);

    // Auto-calculate BOQ fields
    ['boq-nr', 'boq-length', 'boq-width', 'boq-height'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateBOQTotalQuantity);
    });

    // Save on any input change
    document.body.addEventListener('input', (e) => {
        if (e.target.closest('.printable-area') || e.target.closest('.form-grid') || e.target.closest('.boq-entry-card')) {
             saveProject(activeProjectName);
        }
    });
}

// --- MENU & LIST POPULATION ---
function populateMenus() {
    const mainMenu = document.querySelector('.main-header .dropdown-menu');
    mainMenu.innerHTML = `<button onclick="promptSaveProject()">💾 Save As New Project</button><hr><button onclick="setLanguage('en')">🇺🇸 English</button><button onclick="setLanguage('ar')">🇸🇦 العربية</button>`;
    
    const inspectionMenu = document.getElementById('inspection-table-menu');
    inspectionMenu.innerHTML = `<button onclick="printContent('inspection')">🖨️ Print</button><button onclick="exportToPdf('inspection')">📄 Export PDF</button>`;

    const estimationMenu = document.getElementById('estimation-table-menu');
    estimationMenu.innerHTML = `<button onclick="printContent('estimation')">🖨️ Print</button><button onclick="exportToPdf('estimation')">📄 Export PDF</button>`;
}

function populateDatalist(datalistId, optionsArray) {
    const datalist = document.getElementById(datalistId);
    datalist.innerHTML = optionsArray.map(opt => `<option value="${opt}"></option>`).join('');
}

// --- TAB MANAGEMENT ---
function openTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = 'none');
    document.querySelectorAll(".tab-button").forEach(tb => tb.classList.remove('active'));
    
    const tabElement = document.getElementById(tabName);
    tabElement.style.display = "flex";
    tabElement.classList.add('active');
    evt.currentTarget.classList.add("active");

    if (tabName === 'vehicle-tracking-tab' && !vehicleMap) {
        initializeVehicleMap();
    }
     if (tabName === 'main-report' && !map) {
        initializeInspectionMap();
    }
}

// --- LOCAL STORAGE & PROJECT MANAGEMENT ---
function generateId() { return '_' + Math.random().toString(36).substring(2, 9); }

function saveProject(projectName) {
    if (!projectName) return;
    const projectData = {
        inspection: {
            title1: document.getElementById('inspection-title-1').textContent,
            title2: document.getElementById('inspection-title-2').textContent,
            title3: document.getElementById('inspection-title-3').textContent,
            smallTitle: document.getElementById('inspection-small-title').textContent,
            date: document.getElementById('display-date').value,
            clientLogo: clientLogoInspection,
            companyLogo: companyLogoInspection,
            table: Array.from(reportTable.tBodies[0].rows).map(row => ({
                id: row.cells[0].textContent,
                asset: row.cells[1].textContent,
                status: row.cells[2].textContent,
                recommendation: row.cells[3].textContent,
                quantity: row.cells[4].textContent,
                photos: Array.from(row.cells[5].querySelectorAll('img')).map(img => img.src),
                lat: row.cells[6].textContent,
                lng: row.cells[7].textContent,
            }))
        },
        estimation: {
            title1: document.getElementById('estimation-title-1').textContent,
            title2: document.getElementById('estimation-title-2').textContent,
            title3: document.getElementById('estimation-title-3').textContent,
            smallTitle: document.getElementById('estimation-small-title').textContent,
            date: document.getElementById('estimation-date').value,
            clientLogo: clientLogoEstimation,
            companyLogo: companyLogoEstimation,
            workOrderNo: document.getElementById('work-order-no').value,
            tpcNo: document.getElementById('tpc-no').value,
            workDesc: document.getElementById('work-desc').value,
            table: Array.from(costEstimationTable.tBodies[0].rows).map(row => ({
                ref: row.cells[0].textContent,
                desc: row.cells[1].textContent,
                unit: row.cells[2].textContent,
                nr: row.cells[3].textContent,
                length: row.cells[4].textContent,
                width: row.cells[5].textContent,
                height: row.cells[6].textContent,
                totalQty: row.cells[7].textContent,
                rate: row.cells[8].textContent,
                amount: row.cells[9].textContent,
                remarks: row.cells[10].textContent,
            }))
        },
        lastSaved: new Date().toISOString()
    };
    
    projects[projectName] = projectData;
    localStorage.setItem('projects', JSON.stringify(projects));
    if (projectName !== activeProjectName) {
        updateProjectsList();
    }
}

function promptSaveProject() {
    const newName = prompt("Enter a name for this new project:");
    if (newName && !projects[newName]) {
        saveProject(newName);
        alert(`Project "${newName}" saved successfully!`);
    } else if (projects[newName]) {
        alert("A project with this name already exists. Please choose a different name.");
    }
}

function loadProject(projectName) {
    const projectData = projects[projectName];
    if (!projectData) {
        // If loading the default active report and it doesn't exist, create it.
        if (projectName === activeProjectName) {
            saveProject(activeProjectName);
        }
        return;
    }
    
    // Load Inspection Tab
    const insp = projectData.inspection;
    document.getElementById('inspection-title-1').textContent = insp.title1 || 'Maintenance of Strategic';
    document.getElementById('inspection-title-2').textContent = insp.title2 || 'Highways Qatar North';
    document.getElementById('inspection-title-3').textContent = insp.title3 || 'ZF_093';
    document.getElementById('inspection-small-title').textContent = insp.smallTitle || 'Inspection Report';
    document.getElementById('display-date').value = insp.date || new Date().toISOString().split('T')[0];
    clientLogoInspection = insp.clientLogo;
    companyLogoInspection = insp.companyLogo;
    document.getElementById('client-logo-inspection').src = insp.clientLogo || 'https://i.imgur.com/W1f3q2y.png';
    document.getElementById('company-logo-inspection').src = insp.companyLogo || 'https://i.imgur.com/1s3a1H4.png';
    reportTable.tBodies[0].innerHTML = '';
    insp.table?.forEach(rowData => addRow(rowData, true));

    // Load Estimation Tab
    const est = projectData.estimation;
    document.getElementById('estimation-title-1').textContent = est.title1 || 'Maintenance of Strategic';
    document.getElementById('estimation-title-2').textContent = est.title2 || 'Highways Qatar North';
    document.getElementById('estimation-title-3').textContent = est.title3 || 'ZF_093';
    document.getElementById('estimation-small-title').textContent = est.smallTitle || 'Cost Estimation';
    document.getElementById('estimation-date').value = est.date || new Date().toISOString().split('T')[0];
    clientLogoEstimation = est.clientLogo;
    companyLogoEstimation = est.companyLogo;
    document.getElementById('client-logo-estimation').src = est.clientLogo || 'https://i.imgur.com/W1f3q2y.png';
    document.getElementById('company-logo-estimation').src = est.companyLogo || 'https://i.imgur.com/1s3a1H4.png';
    document.getElementById('work-order-no').value = est.workOrderNo || '';
    document.getElementById('tpc-no').value = est.tpcNo || '';
    document.getElementById('work-desc').value = est.workDesc || '';
    costEstimationTable.tBodies[0].innerHTML = '';
    est.table?.forEach(rowData => insertBOQRow(rowData, true));
    calculateCostEstimationTotal();

    document.querySelector('.main-title').textContent = (projectName === activeProjectName) ? "Project Dashboard" : projectName;
}

function deleteProject(projectName) {
    document.getElementById('project-to-delete-name').textContent = projectName;
    document.getElementById('confirm-delete-modal').style.display = 'flex';
    document.getElementById('confirm-delete-modal').dataset.projectName = projectName;
}

function confirmProjectDeletion() {
    const projectName = document.getElementById('confirm-delete-modal').dataset.projectName;
    const confirmationInput = document.getElementById('delete-confirmation-input');
    if (confirmationInput.value === projectName) {
        delete projects[projectName];
        localStorage.setItem('projects', JSON.stringify(projects));
        updateProjectsList();
        cancelProjectDeletion();
        // If the deleted project was the active one, load the default.
        if (document.querySelector('.main-title').textContent === projectName) {
            loadProject(activeProjectName);
        }
    } else {
        alert("The entered name does not match. Deletion cancelled.");
    }
}

function cancelProjectDeletion() {
    document.getElementById('confirm-delete-modal').style.display = 'none';
    document.getElementById('delete-confirmation-input').value = '';
}

function loadProjects() {
    return JSON.parse(localStorage.getItem('projects')) || {};
}

function getSortedProjects() {
    const sortValue = document.getElementById('sort-projects').value;
    const projectEntries = Object.entries(projects).filter(([name]) => name !== activeProjectName);

    switch(sortValue) {
        case 'name':
            return projectEntries.sort((a, b) => a[0].localeCompare(b[0]));
        case 'date-newest':
            return projectEntries.sort((a, b) => new Date(b[1].lastSaved) - new Date(a[1].lastSaved));
        case 'date-oldest':
            return projectEntries.sort((a, b) => new Date(a[1].lastSaved) - new Date(b[1].lastSaved));
        default:
            return projectEntries;
    }
}

function updateProjectsList() {
    const list = document.getElementById('projects-list');
    list.innerHTML = '';
    const sortedProjects = getSortedProjects();
    
    sortedProjects.forEach(([name, data]) => {
        const lastSaved = new Date(data.lastSaved).toLocaleString();
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div>
                <span class="project-name" onclick="loadProject('${name}')">${name}</span>
                <small style="display: block; color: #666;">Last Saved: ${lastSaved}</small>
            </div>
            <button class="btn-delete" onclick="deleteProject('${name}')">Delete</button>
        `;
        list.appendChild(listItem);
    });
}

function filterProjects() {
    const filter = document.getElementById('project-search').value.toLowerCase();
    const items = document.querySelectorAll('#projects-list li');
    items.forEach(item => {
        const name = item.querySelector('.project-name').textContent.toLowerCase();
        item.style.display = name.includes(filter) ? '' : 'none';
    });
}
function sortProjects() {
    updateProjectsList();
}


// --- LOGO MANAGEMENT ---
function loadLogo(event, callback) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => callback(e.target.result);
        reader.readAsDataURL(file);
    }
}
function loadClientLogo(tab) {
    loadLogo(event, (src) => {
        document.getElementById(`client-logo-${tab}`).src = src;
        if(tab === 'inspection') clientLogoInspection = src; else clientLogoEstimation = src;
        saveProject(activeProjectName);
    });
}
function loadCompanyLogo(tab) {
    loadLogo(event, (src) => {
        document.getElementById(`company-logo-${tab}`).src = src;
        if(tab === 'inspection') companyLogoInspection = src; else companyLogoEstimation = src;
        saveProject(activeProjectName);
    });
}


// --- CAMERA & PHOTO ---
let cameraStream;
async function openCamera() {
    try {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        document.getElementById('camera-feed').srcObject = cameraStream;
        document.getElementById('camera-modal').style.display = 'flex';
    } catch (err) {
        alert("Could not access the camera. Please ensure you have given permission.");
    }
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    document.getElementById('camera-modal').style.display = 'none';
}

function capturePhoto() {
    const canvas = document.getElementById('photo-canvas');
    const video = document.getElementById('camera-feed');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    addPhotoToPreview(canvas.toDataURL('image/jpeg'));
    closeCamera();
}

function handlePhotoSelection() {
    const files = document.querySelector('.photo-input').files;
    const previews = document.getElementById('photo-previews');
    previews.innerHTML = '';
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => addPhotoToPreview(e.target.result);
        reader.readAsDataURL(file);
    });
}

function addPhotoToPreview(dataUrl) {
    const previews = document.getElementById('photo-previews');
    const img = document.createElement('img');
    img.src = dataUrl;
    img.onclick = () => showImagePreview(dataUrl);
    previews.appendChild(img);
}

function addPhotoToCell(row, dataUrl) {
    const photoWrapper = row.cells[5].querySelector('.photo-wrapper');
    const img = document.createElement('img');
    img.src = dataUrl;
    img.onclick = () => showImagePreview(dataUrl);
    photoWrapper.appendChild(img);
}

function showImagePreview(src) {
    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = `<img src="${src}" alt="Preview"><button id="close-preview" onclick="hidePreview()" class="btn-delete" style="position: absolute; top: 10px; right: 10px; font-size: 24px; padding: 5px 10px; line-height: 1;">❌</button>`;
    document.getElementById('preview-overlay').style.display = 'flex';
}

function hidePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
}

// --- GPS & MAPS ---
function initializeInspectionMap() {
    if (map) return;
    map = L.map('map').setView([25.3548, 51.1839], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    map.invalidateSize();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude: lat, longitude: lng } = pos.coords;
            document.getElementById('lat-display').textContent = lat.toFixed(6);
            document.getElementById('lng-display').textContent = lng.toFixed(6);
            if (!map) initializeInspectionMap(); else map.invalidateSize();
            map.setView([lat, lng], 13);
            if (currentMarker) currentMarker.setLatLng([lat, lng]);
            else currentMarker = L.marker([lat, lng]).addTo(map);
        }, () => alert("Could not get location. Ensure location services are enabled."));
    }
}
function switchLocationMode(mode) {
    document.getElementById('location-auto-panel').style.display = mode === 'auto' ? 'flex' : 'none';
    document.getElementById('location-manual-panel').style.display = mode === 'manual' ? 'flex' : 'none';
    document.getElementById('gps-auto-btn').classList.toggle('active', mode === 'auto');
    document.getElementById('gps-manual-btn').classList.toggle('active', mode === 'manual');
    document.getElementById('map').style.display = 'block';
    if(map) map.invalidateSize(); else initializeInspectionMap();
    if(mode === 'auto') getLocation();
}

function updateLocationFromManual() {
    const lat = parseFloat(document.getElementById('manual-lat').value) || 0;
    const lng = parseFloat(document.getElementById('manual-lng').value) || 0;
    if (lat && lng) {
        document.getElementById('lat-display').textContent = lat.toFixed(6);
        document.getElementById('lng-display').textContent = lng.toFixed(6);
        if (!map) initializeInspectionMap(); else map.invalidateSize();
        map.setView([lat, lng], 13);
        if (currentMarker) currentMarker.setLatLng([lat, lng]);
        else currentMarker = L.marker([lat, lng]).addTo(map);
    }
}

function insertLocationToForm() {
    const lat = document.getElementById('lat-display').textContent;
    const lng = document.getElementById('lng-display').textContent;
    if (editingRow) {
        editingRow.cells[6].textContent = lat;
        editingRow.cells[7].textContent = lng;
        saveProject(activeProjectName);
        editingRow.style.backgroundColor = '';
        editingRow = null;
        alert("Location inserted. Select another row to edit its location.");
    } else {
        alert("Please click 'Edit' on a table row first to insert the location.");
    }
}

// --- QUANTITY MODAL ---
function showQuantityModal() {
    if (!editingRow) {
        alert("Please click 'Edit' on a table row first to calculate its quantity.");
        return;
    }
    document.getElementById('quantityModal').style.display = 'flex';
}

function closeQuantityModal() {
    document.getElementById('quantityModal').style.display = 'none';
}

function setQuantity() {
    const length = parseFloat(document.getElementById('length').value) || 0;
    const width = parseFloat(document.getElementById('width').value) || 0;
    const depth = parseFloat(document.getElementById('depth').value) || 0;
    const reps = parseFloat(document.getElementById('repetitions').value) || 1;
    
    let quantity = 0;
    let unit = 'item(s)';
    let details = `NR: ${reps}`;

    if (length > 0 && width > 0 && depth > 0) {
        quantity = reps * length * width * depth;
        unit = 'm³';
        details += `, L: ${length.toFixed(2)}, W: ${width.toFixed(2)}, H: ${depth.toFixed(2)}`;
    } else if (length > 0 && width > 0) {
        quantity = reps * length * width;
        unit = 'm²';
        details += `, L: ${length.toFixed(2)}, W: ${width.toFixed(2)}`;
    } else if (length > 0) {
        quantity = reps * length;
        unit = 'm';
        details += `, L: ${length.toFixed(2)}`;
    } else {
         quantity = reps;
    }

    const fullDescription = `${details} = ${quantity.toFixed(3)} ${unit}`;
    
    if (editingRow) {
        editingRow.cells[4].textContent = fullDescription;
        editingRow.style.backgroundColor = '';
        editingRow = null;
        saveProject(activeProjectName);
    }
    closeQuantityModal();
}

// --- TABLE ROW MANAGEMENT (INSPECTION) ---
function addRow(rowData = {}, fromLoad = false) {
    const tbody = reportTable.tBodies[0];
    const newRow = tbody.insertRow();
    
    const id = rowData.id || generateId();
    const photos = rowData.photos || (fromLoad ? [] : Array.from(document.getElementById('photo-previews').querySelectorAll('img')).map(img => img.src));

    newRow.innerHTML = `
        <td>${id}</td>
        <td contenteditable="true">${rowData.asset || document.getElementById('asset').value}</td>
        <td contenteditable="true">${rowData.status || document.getElementById('status').value}</td>
        <td contenteditable="true">${rowData.recommendation || document.getElementById('recommendation').value}</td>
        <td>${rowData.quantity || 'N/A'}</td>
        <td><div class="photo-wrapper"></div></td>
        <td>${rowData.lat || 'N/A'}</td>
        <td>${rowData.lng || 'N/A'}</td>
        <td>
            <button class="btn-action" onclick="editRow(this.parentElement.parentElement)">Edit</button>
            <button class="btn-delete" onclick="removeRow(this.parentElement.parentElement)">Del</button>
        </td>
    `;
    
    photos.forEach(src => addPhotoToCell(newRow, src));
    
    if (!fromLoad) {
        // Clear form fields
        document.getElementById('asset').value = '';
        document.getElementById('status').value = '';
        document.getElementById('recommendation').value = '';
        document.getElementById('photo-previews').innerHTML = '';
        document.querySelector('.photo-input').value = '';
        saveProject(activeProjectName);
    }
}

function editRow(row) {
    if (editingRow) {
        editingRow.style.backgroundColor = ''; // Reset previous
    }
    editingRow = row;
    row.style.backgroundColor = 'rgba(0, 123, 255, 0.2)'; // Highlight current
    
    // Load row data back to form for editing if needed
    document.getElementById('asset').value = row.cells[1].textContent;
    document.getElementById('status').value = row.cells[2].textContent;
    document.getElementById('recommendation').value = row.cells[3].textContent;
    document.getElementById('lat-display').textContent = row.cells[6].textContent;
    document.getElementById('lng-display').textContent = row.cells[7].textContent;

    alert("This row is now active for editing Quantity and GPS location.");
}


function removeRow(row) {
    if (confirm("Are you sure you want to delete this row?")) {
        row.remove();
        saveProject(activeProjectName);
    }
}

// --- BOQ & COST ESTIMATION ---
function handleBOQUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const newItems = results.data.map(row => ({
                ref: row['BOQ Ref.'] || row.ref,
                description: row.Description || row.description,
                unit: row.Unit || row.unit,
                rate: parseFloat(row.Rate || row.rate) || 0
            })).filter(item => item.ref && !isNaN(item.rate));

            newItems.forEach(newItem => {
                const exists = boqData.some(existingItem => existingItem.ref === newItem.ref);
                if (!exists) {
                    boqData.push(newItem);
                }
            });
            
            repopulateBOQSelect();
            alert(`${newItems.length} BOQ items processed and added/updated.`);
        },
        error: (err) => alert("Error parsing CSV file: " + err.message)
    });
    event.target.value = '';
}

function repopulateBOQSelect(searchTerm = '') {
    const boqSelect = document.getElementById('boq-ref-select');
    boqSelect.innerHTML = '';
    const lowerSearchTerm = searchTerm.toLowerCase();

    const filteredData = boqData.filter(item =>
        item.ref.toLowerCase().includes(lowerSearchTerm) ||
        item.description.toLowerCase().includes(lowerSearchTerm)
    );

    filteredData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.ref;
        option.textContent = `${item.ref} - ${item.description}`;
        boqSelect.appendChild(option);
    });
    updateBOQDetails();
}

function updateBOQDetails() {
    const selectedRef = document.getElementById('boq-ref-select').value;
    const item = boqData.find(d => d.ref === selectedRef);
    if(item) {
        document.getElementById('boq-desc').value = item.description;
        document.getElementById('boq-unit').value = item.unit;
        document.getElementById('boq-rate').value = item.rate.toFixed(2);
        calculateBOQTotalQuantity();
    }
}

function trackBOQUsage(boqRef) {
    let usage = JSON.parse(localStorage.getItem('boqUsage')) || {};
    usage[boqRef] = (usage[boqRef] || 0) + 1;
    localStorage.setItem('boqUsage', JSON.stringify(usage));
    updateMostUsedBOQ();
}

function updateMostUsedBOQ() {
    let usage = JSON.parse(localStorage.getItem('boqUsage')) || {};
    const sortedUsage = Object.entries(usage).sort(([,a],[,b]) => b-a).slice(0, 10);
    const list = document.getElementById('most-used-boq-list');
    list.innerHTML = '';
    sortedUsage.forEach(([ref]) => {
        const item = document.createElement('li');
        item.textContent = ref;
        item.onclick = () => {
            document.getElementById('boq-search').value = ref;
            repopulateBOQSelect(ref);
        };
        list.appendChild(item);
    });
}

function calculateBOQTotalQuantity() {
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
    
    document.getElementById('boq-total-qty').value = totalQty.toFixed(3);
    document.getElementById('boq-amount').value = (totalQty * rate).toFixed(2);
}

function insertBOQRow(rowData = {}, fromLoad = false) {
    const tbody = costEstimationTable.tBodies[0];
    const newRow = tbody.insertRow();
    
    const ref = rowData.ref || document.getElementById('boq-ref-select').value;
    
    newRow.innerHTML = `
        <td>${ref}</td>
        <td class="description-cell">${rowData.desc || document.getElementById('boq-desc').value}</td>
        <td>${rowData.unit || document.getElementById('boq-unit').value}</td>
        <td contenteditable="true">${rowData.nr || document.getElementById('boq-nr').value}</td>
        <td contenteditable="true">${rowData.length || document.getElementById('boq-length').value}</td>
        <td contenteditable="true">${rowData.width || document.getElementById('boq-width').value}</td>
        <td contenteditable="true">${rowData.height || document.getElementById('boq-height').value}</td>
        <td>${rowData.totalQty || document.getElementById('boq-total-qty').value}</td>
        <td>${rowData.rate || document.getElementById('boq-rate').value}</td>
        <td>${rowData.amount || document.getElementById('boq-amount').value}</td>
        <td contenteditable="true">${rowData.remarks || document.getElementById('boq-remarks').value}</td>
        <td><button class="btn-delete" onclick="removeBOQRow(this.parentElement.parentElement)">Del</button></td>
    `;
    
    if (!fromLoad) {
        trackBOQUsage(ref);
        ['boq-nr', 'boq-length', 'boq-width', 'boq-height', 'boq-remarks', 'boq-search'].forEach(id => document.getElementById(id).value = '');
        calculateCostEstimationTotal();
        saveProject(activeProjectName);
    }
}


function removeBOQRow(row) {
    if (confirm("Are you sure you want to delete this BOQ item?")) {
        row.remove();
        calculateCostEstimationTotal();
        saveProject(activeProjectName);
    }
}

function calculateCostEstimationTotal() {
    const rows = costEstimationTable.tBodies[0].rows;
    let total = 0;
    Array.from(rows).forEach(row => {
        total += parseFloat(row.cells[9].textContent) || 0;
    });
    document.getElementById('total-amount-cell').textContent = `QAR ${total.toFixed(2)}`;
}

// --- VEHICLE & KML MAP ---
function initializeVehicleMap() {
    if (vehicleMap) return;
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' });
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri' });
    
    vehicleMap = L.map('vehicle-map').setView([25.3548, 51.1839], 10);
    osm.addTo(vehicleMap);

    const baseMaps = { "OpenStreetMap": osm, "Satellite": satellite };
    L.control.layers(baseMaps).addTo(vehicleMap);
    
    const drawnItems = new L.FeatureGroup();
    vehicleMap.addLayer(drawnItems);
    
    const drawControl = new L.Control.Draw({
        edit: { featureGroup: drawnItems },
        draw: { polygon: true, polyline: false, rectangle: true, circle: false, marker: false, circlemarker: false }
    });
    vehicleMap.addControl(drawControl);

    vehicleMap.on(L.Draw.Event.CREATED, function (event) {
        const layer = event.layer;
        drawnItems.addLayer(layer);
        const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        layer.bindPopup(`Area: ${area.toFixed(2)} m²`).openPopup();
    });
     vehicleMap.invalidateSize();
}

function handleVehicleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const contents = e.target.result;
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension === 'kml') {
            const kmlLayer = omnivore.kml.parse(contents, null, new L.FeatureGroup());
            kmlLayer.eachLayer(layer => {
                if (layer.feature?.properties?.name) {
                    layer.bindPopup(layer.feature.properties.name);
                }
            });
            vehicleMap.addLayer(kmlLayer);
            if(kmlLayer.getBounds().isValid()) {
                 vehicleMap.fitBounds(kmlLayer.getBounds());
            }
        } else if (fileExtension === 'csv') {
            Papa.parse(contents, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const markers = L.featureGroup();
                    results.data.forEach(row => {
                        const lat = parseFloat(row.latitude || row.lat);
                        const lng = parseFloat(row.longitude || row.lng);
                        if (!isNaN(lat) && !isNaN(lng)) {
                            const marker = L.marker([lat, lng]).bindPopup(row.name || `Asset at ${lat}, ${lng}`);
                            markers.addLayer(marker);
                        }
                    });
                    vehicleMap.addLayer(markers);
                     if(markers.getBounds().isValid()) {
                        vehicleMap.fitBounds(markers.getBounds());
                    }
                }
            });
        }
    };
    reader.readAsText(file);
}

function printMap() {
    window.addEventListener('afterprint', () => {
        document.body.classList.remove('printing-map');
    }, { once: true });
    document.body.classList.add('printing-map');
    window.print();
}

function clearMapMarkers() {
    if(confirm("Are you sure you want to clear all imported markers and drawings from the map?")) {
        vehicleMap.eachLayer(layer => {
            if (!!layer.toGeoJSON) { // A simple check to avoid removing base layers
                vehicleMap.removeLayer(layer);
            }
        });
        // Re-add base layers and controls
        initializeVehicleMap();
    }
}
function centerVehicleMapOnUser() {
    navigator.geolocation.getCurrentPosition(pos => {
        vehicleMap.setView([pos.coords.latitude, pos.coords.longitude], 15);
    }, () => alert("Could not get your location."));
}

function fitMapToAssetMarkers() {
    const markers = [];
    reportTable.tBodies[0].rows.forEach(row => {
        const lat = parseFloat(row.cells[6].textContent);
        const lng = parseFloat(row.cells[7].textContent);
        if (!isNaN(lat) && !isNaN(lng)) {
            markers.push([lat, lng]);
        }
    });
    if (markers.length > 0) {
        vehicleMap.fitBounds(L.latLngBounds(markers));
    } else {
        alert("No assets with GPS coordinates found in the inspection table.");
    }
}
function fitMapToAllMarkers() {
    const bounds = L.latLngBounds([]);
    vehicleMap.eachLayer(layer => {
        if (layer instanceof L.FeatureGroup || layer instanceof L.Marker) {
             if(layer.getBounds && layer.getBounds().isValid()){
                bounds.extend(layer.getBounds());
             } else if (layer.getLatLng) {
                bounds.extend(layer.getLatLng());
             }
        }
    });
    if (bounds.isValid()) {
        vehicleMap.fitBounds(bounds);
    } else {
        alert("No markers found to fit.");
    }
}

function downloadCSVTemplate() {
    const csvContent = "data:text/csv;charset=utf-8," + "name,latitude,longitude\nAsset 1,25.2854,51.5310";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "vehicle_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function downloadBOQTemplate() {
    const csvContent = "data:text/csv;charset=utf-8," + "BOQ Ref.,Description,Unit,Rate\nC3.4,Asphalt Repair,m2,120.50";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "boq_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// --- PRINT & PDF EXPORT ---
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00'); 
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function preparePrintHeader(reportType) {
    const isInspection = reportType === 'inspection';
    const clientLogoSrc = document.getElementById(isInspection ? 'client-logo-inspection' : 'client-logo-estimation').src;
    const companyLogoSrc = document.getElementById(isInspection ? 'company-logo-inspection' : 'company-logo-estimation').src;
    const printTitleContainerId = isInspection ? 'inspection-print-title' : 'estimation-print-title';
    const printDateFooterId = isInspection ? 'inspection-print-date' : 'estimation-print-date';
    
    document.getElementById(isInspection ? 'client-logo-print-src' : 'est-client-logo-print-src').src = clientLogoSrc;
    document.getElementById(isInspection ? 'company-logo-print-src' : 'est-company-logo-print-src').src = companyLogoSrc;

    const titleContainer = document.getElementById(printTitleContainerId);
    titleContainer.innerHTML = `
        <b>${document.getElementById(`${reportType}-title-1`).textContent}</b>
        <b>${document.getElementById(`${reportType}-title-2`).textContent}</b>
        <b>${document.getElementById(`${reportType}-title-3`).textContent}</b>
    `;

    const dateFooter = document.getElementById(printDateFooterId).parentNode;
    dateFooter.innerHTML = `
        <span>${formatDate(document.getElementById(isInspection ? 'display-date' : 'estimation-date').value)}</span>
        <span>${document.getElementById(`${reportType}-small-title`).textContent}</span>
    `;
}

function printContent(reportType) {
    preparePrintHeader(reportType);
    window.print();
}

async function exportToPdf(reportType) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const contentToCapture = document.querySelector(`#${reportType === 'inspection' ? 'main-report' : 'cost-estimation-tab'} .printable-area`);
    
    if (!contentToCapture) { return alert("Error: Printable content not found."); }
    
    preparePrintHeader(reportType);

    const canvas = await html2canvas(contentToCapture, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20; // with margin
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = pdfHeight;
    let position = 10; // top margin
    
    pdf.addImage(imgData, 'PNG', 10, position, pdfWidth, pdfHeight);
    heightLeft -= (pdf.internal.pageSize.getHeight() - 20);

    while (heightLeft > 0) {
      position = - (pdfHeight - heightLeft) + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, pdfWidth, pdfHeight);
      heightLeft -= (pdf.internal.pageSize.getHeight() - 10);
    }
    const projectName = document.querySelector('.main-title').textContent.trim();
    pdf.save(`${projectName}-${reportType}-report.pdf`);
}