
// --- GLOBAL STATE ---
let currentUser = null;
let selectedContract = null;
let mapInstance = null;
let tableData = [];
let contractsData = [];

// --- BILINGUAL DICTIONARY ---
const translations = {
    en: {
        welcome_title: "Welcome to the Engineering Project Platform 👷‍♂️",
        welcome_subtitle: "Smart tools for managing maps, data, inspections, and reports for engineers and managers.",
        sign_in: "Sign In",
        need_account: "Need an account? Sign Up",
        create_account: "Create Your Account",
        sign_up: "Sign Up",
        have_account: "Already have an account? Sign In",
        sign_out: "Sign Out",
        select_contract_title: "Select a Contract",
        select_contract_subtitle: "Choose a contract to access the project dashboard."
    },
    ar: {
        welcome_title: "مرحبًا بك في منصة المشاريع الهندسية 👷‍♂️",
        welcome_subtitle: "أدوات ذكية لإدارة الخرائط والبيانات والتفتيش والتقارير للمهندسين والمديرين.",
        sign_in: "تسجيل الدخول",
        need_account: "تحتاج حساب؟ اشتراك",
        create_account: "أنشئ حسابك",
        sign_up: "اشتراك",
        have_account: "لديك حساب بالفعل؟ تسجيل الدخول",
        sign_out: "تسجيل الخروج",
        select_contract_title: "اختر عقدًا",
        select_contract_subtitle: "اختر عقدًا للوصول إلى لوحة تحكم المشروع."
    }
};

// --- SAMPLE DATA ---
const sampleContracts = [
    {
        id: 1,
        title: "Highway Construction Project",
        number: "HC-2024-001",
        startDate: "2024-01-15",
        endDate: "2024-12-31",
        value: 5000000,
        company: "ABC Engineering",
        client: "Ministry of Transport"
    },
    {
        id: 2,
        title: "Bridge Renovation Project",
        number: "BR-2024-002",
        startDate: "2024-03-01",
        endDate: "2024-08-30",
        value: 2500000,
        company: "XYZ Construction",
        client: "City Council"
    },
    {
        id: 3,
        title: "Water Treatment Plant",
        number: "WTP-2024-003",
        startDate: "2024-02-01",
        endDate: "2024-11-30",
        value: 8000000,
        company: "Water Solutions Ltd",
        client: "Water Authority"
    }
];

// --- UTILITY FUNCTIONS ---
function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    if(popup) popup.style.display = 'flex';
}

function hidePopup(popupId) {
    const popup = document.getElementById(popupId);
    if(popup) popup.style.display = 'none';
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(pageId);
    if (page) page.classList.add('active');
}

function showAppPage(pageId) {
    document.querySelectorAll('.app-page-content').forEach(p => p.style.display = 'none');
    const page = document.getElementById(pageId);
    if (page) page.style.display = 'block';
}

function switchLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
}

function signOut() {
    currentUser = null;
    selectedContract = null;
    showPage('login-page');
}

// --- AUTH FUNCTIONS ---
function handleLogin(email, password) {
    // Simulate login - replace with actual authentication
    if (email && password) {
        currentUser = { email: email, name: email.split('@')[0] };
        showPage('contract-selection-page');
        loadContractsForSelection();
        document.getElementById('login-error-message').innerText = '';
        return true;
    }
    return false;
}

function handleSignup(name, email, password) {
    // Simulate signup - replace with actual registration
    if (name && email && password) {
        const messageEl = document.getElementById('signup-message');
        messageEl.innerText = 'Account created successfully! Please sign in.';
        messageEl.className = 'success-message';
        setTimeout(() => {
            hidePopup('signup-popup');
            messageEl.innerText = '';
            messageEl.className = 'error-message';
        }, 2000);
        return true;
    }
    return false;
}

// --- CONTRACT FUNCTIONS ---
function loadContractsForSelection() {
    const listContainer = document.getElementById('contract-selection-list');
    listContainer.innerHTML = '';

    sampleContracts.forEach(contract => {
        const card = document.createElement('div');
        card.className = 'contract-select-card';
        card.innerHTML = `
            <h3>${contract.title}</h3>
            <p><strong>Contract #:</strong> ${contract.number}</p>
            <p><strong>Value:</strong> $${contract.value.toLocaleString()}</p>
            <p><strong>Client:</strong> ${contract.client}</p>
            <p><strong>Duration:</strong> ${contract.startDate} to ${contract.endDate}</p>
        `;
        card.onclick = () => selectContract(contract);
        listContainer.appendChild(card);
    });
}

function selectContract(contract) {
    selectedContract = contract;
    document.getElementById('app-main-title').innerText = `${contract.title}`;
    showPage('app-container');
    showAppPage('map-page-content');
    loadSavedContracts();
}

function loadSavedContracts() {
    // Use in-memory storage instead of localStorage
    contractsData = [...sampleContracts];

    const container = document.getElementById('saved-contracts');
    if (!container) return;

    container.innerHTML = '';

    contractsData.forEach(contract => {
        const card = document.createElement('div');
        card.className = 'contract-select-card';
        card.innerHTML = `
            <h3>${contract.title}</h3>
            <p><strong>Contract #:</strong> ${contract.number}</p>
            <p><strong>Value:</strong> $${contract.value.toLocaleString()}</p>
            <div style="margin-top: 15px;">
                <button class="btn-success" onclick="editContract(${contract.id})">Edit</button>
                <button class="btn-danger" onclick="deleteContract(${contract.id})">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function addNewContract() {
    showPopup('contract-form-popup');
}

function saveContract(contractData) {
    // Use in-memory storage instead of localStorage
    contractData.id = Date.now();
    contractsData.push(contractData);
    loadSavedContracts();
    hidePopup('contract-form-popup');
}

function editContract(id) {
    alert('Edit functionality will be implemented');
}

function deleteContract(id) {
    if (confirm('Are you sure you want to delete this contract?')) {
        contractsData = contractsData.filter(c => c.id !== id);
        loadSavedContracts();
    }
}

function downloadBOQTemplate() {
    const csvContent = "BOQ Ref.,Asset,Description,Unit,Rate\n001,Foundation,Concrete Foundation,m³,150\n002,Walls,Brick Walls,m²,45\n003,Roofing,Metal Roofing,m²,75";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BOQ_Template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// --- MAP FUNCTIONS ---
function initializeMap() {
    if (mapInstance) {
        mapInstance.remove();
    }

    const mapContainer = document.getElementById('map-container');
    mapInstance = L.map(mapContainer).setView([25.2854, 51.5310], 10); // Doha coordinates

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Add drawing controls
    mapInstance.pm.addControls({
        position: 'topleft',
        drawCircle: true,
        drawMarker: true,
        drawPolyline: true,
        drawRectangle: true,
        drawPolygon: true,
        editMode: true,
        dragMode: true,
        cutPolygon: true,
        removalMode: true,
    });
}

function exportMapToPDF() {
    alert('Map PDF export functionality will be implemented');
}

function saveMapState() {
    alert('Save map functionality will be implemented');
}

function loadMapState() {
    alert('Load map functionality will be implemented');
}

// --- TABLE FUNCTIONS ---
function addTableRow() {
    const tableBody = document.getElementById('table-body');
    const newRow = tableBody.insertRow();
    newRow.innerHTML = `
        <td contenteditable="true">00${tableBody.rows.length + 1}</td>
        <td contenteditable="true">New Item</td>
        <td contenteditable="true">1</td>
        <td contenteditable="true">unit</td>
        <td contenteditable="true">0</td>
        <td>0</td>
        <td><button class="btn-danger" onclick="deleteRow(this)">❌</button></td>
    `;

    // Add calculation functionality
    const quantityCell = newRow.cells[2];
    const rateCell = newRow.cells[4];
    const totalCell = newRow.cells[5];

    function updateTotal() {
        const quantity = parseFloat(quantityCell.innerText) || 0;
        const rate = parseFloat(rateCell.innerText) || 0;
        totalCell.innerText = (quantity * rate).toFixed(2);
    }

    quantityCell.addEventListener('input', updateTotal);
    rateCell.addEventListener('input', updateTotal);
}

function deleteRow(button) {
    if (confirm('Are you sure you want to delete this row?')) {
        button.closest('tr').remove();
    }
}

function exportTableToPDF() {
    alert('Table PDF export functionality will be implemented');
}

function exportTableToExcel() {
    const table = document.getElementById('main-table');
    let csvContent = '';

    // Get headers
    const headers = Array.from(table.querySelectorAll('th')).slice(0, -1); // Exclude Actions column
    csvContent += headers.map(th => th.innerText).join(',') + '\n';

    // Get data rows
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = Array.from(row.cells).slice(0, -1); // Exclude Actions column
        csvContent += cells.map(cell => cell.innerText).join(',') + '\n';
    });

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function importFromCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const tableBody = document.getElementById('table-body');

                // Clear existing rows except the first one
                while (tableBody.rows.length > 1) {
                    tableBody.deleteRow(1);
                }

                // Skip header row and add data
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = lines[i].split(',');
                        const row = tableBody.insertRow();
                        row.innerHTML = `
                            <td contenteditable="true">${values[0] || ''}</td>
                            <td contenteditable="true">${values[1] || ''}</td>
                            <td contenteditable="true">${values[2] || ''}</td>
                            <td contenteditable="true">${values[3] || ''}</td>
                            <td contenteditable="true">${values[4] || ''}</td>
                            <td>${(parseFloat(values[2]) * parseFloat(values[4])) || 0}</td>
                            <td><button class="btn-danger" onclick="deleteRow(this)">❌</button></td>
                        `;
                    }
                }
            };
            reader.readAsText(file);
        }
    };

    input.click();
}

// --- REPORT FUNCTIONS ---
function generateReport() {
    const reportDate = document.getElementById('report-date');
    const reportProject = document.getElementById('report-project');

    reportDate.innerText = new Date().toLocaleDateString();
    reportProject.innerText = selectedContract ? selectedContract.title : 'No Contract Selected';

    // Add table data to report
    const reportSummary = document.getElementById('report-summary');
    const table = document.getElementById('main-table');
    const rows = table.querySelectorAll('tbody tr');

    let totalValue = 0;
    rows.forEach(row => {
        const total = parseFloat(row.cells[5].innerText) || 0;
        totalValue += total;
    });

    reportSummary.innerHTML = `
        <h4>Summary</h4>
        <p>This report contains the current status of the selected project including maps, tables, and analysis results.</p>
        <p><strong>Total Project Value:</strong> $${totalValue.toLocaleString()}</p>
        <p><strong>Number of Items:</strong> ${rows.length}</p>
        <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
    `;
}

function exportReportToPDF() {
    alert('Report PDF export functionality will be implemented');
}

function saveReport() {
    alert('Save report functionality will be implemented');
}

function updateRowTotal(cell) {
    const row = cell.closest('tr');
    const quantity = parseFloat(row.cells[2].innerText) || 0;
    const rate = parseFloat(row.cells[4].innerText) || 0;
    row.cells[5].innerText = (quantity * rate).toFixed(2);
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', function() {
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (handleLogin(email, password)) {
            document.getElementById('login-form').reset();
        } else {
            document.getElementById('login-error-message').innerText = 'Please enter valid credentials';
        }
    });

    // Signup form submission
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (handleSignup(name, email, password)) {
            document.getElementById('signup-form').reset();
        }
    });

    // Contract form submission
    document.getElementById('contract-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const contractData = {
            title: document.getElementById('contract-title').value,
            number: document.getElementById('contract-number').value,
            startDate: document.getElementById('contract-start').value,
            endDate: document.getElementById('contract-end').value,
            value: parseFloat(document.getElementById('contract-value').value),
            company: document.getElementById('contract-company').value,
            client: document.getElementById('contract-client').value
        };

        saveContract(contractData);
        document.getElementById('contract-form').reset();
    });

    // Table body event delegation for input
    document.getElementById('table-body').addEventListener('input', function(e) {
        if (e.target.tagName === 'TD' && e.target.cellIndex >= 2 && e.target.cellIndex <= 4) {
            updateRowTotal(e.target);
        }
    });
});
