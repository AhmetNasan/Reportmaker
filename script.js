
// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cykjjrrexaqmsqwrgnzp.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5a2pqcnJleGFxbXNxd3JnbnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MjUyMDksImV4cCI6MjA2NzIwMTIwOX0.Fx6f23TWCQQMCIkc5hcx8LqHyskVMm6WAhJl1UFZpMA'

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ======== UTILS & HELPERS ========
const getEl = (id) => document.getElementById(id);
const show = (id) => getEl(id).style.display = 'flex';
const hide = (id) => getEl(id).style.display = 'none';

const showModal = (id) => getEl(id).classList.add('active');
const hideModal = (id) => getEl(id).classList.remove('active');

const showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    getEl(pageId).classList.add('active');
};

const showAppPage = (pageId) => {
    document.querySelectorAll('.app-content').forEach(p => hide(p.id));
    getEl(pageId).style.display = 'block';

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const navButtonId = pageId.replace('-page', '');
    getEl(`nav-${navButtonId}`).classList.add('active');

    // Special handler for map initialization
    if (pageId === 'map-page' && !window.mapInitialized) {
        initializeMap();
    }
};

const displayMessage = (elementId, text, type) => {
    const el = getEl(elementId);
    el.textContent = text;
    el.className = `message ${type}`;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 5000);
};

const addNotification = async (type, message) => {
    try {
        await supabase
            .from('notifications')
            .insert([
                { 
                    type, 
                    message, 
                    user_id: Auth.currentUser.id,
                    created_at: new Date().toISOString() 
                }
            ]);
        loadNotifications();
    } catch (error) {
        console.error('Error adding notification:', error);
    }
};

// ======== AUTHENTICATION WITH SUPABASE ========
const Auth = {
    currentUser: null,
    handleLogin: async (e) => {
        e.preventDefault();
        const email = getEl('login-email').value;
        const password = getEl('login-password').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                displayMessage('login-message', error.message, 'error');
                return;
            }

            if (data.user) {
                Auth.currentUser = data.user;
                showPage('app-container');
                initializeApp();
            }
        } catch (error) {
            displayMessage('login-message', 'An error occurred during sign in.', 'error');
            console.error('Login error:', error);
        }
    },
    handleSignup: async (e) => {
        e.preventDefault();
        const email = getEl('signup-email').value;
        const password = getEl('signup-password').value;

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) {
                displayMessage('signup-message', error.message, 'error');
                return;
            }

            displayMessage('signup-message', 'Sign up successful! Please check your email to confirm your account.', 'success');
            setTimeout(() => hideModal('signup-modal'), 2000);
        } catch (error) {
            displayMessage('signup-message', 'An error occurred during sign up.', 'error');
            console.error('Signup error:', error);
        }
    },
    signOut: async () => {
        try {
            await supabase.auth.signOut();
            Auth.currentUser = null;
            showPage('login-page');
            location.reload();
        } catch (error) {
            console.error('Sign out error:', error);
        }
    },
    checkSession: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                Auth.currentUser = session.user;
                showPage('app-container');
                initializeApp();
            } else {
                showPage('login-page');
            }
        } catch (error) {
            console.error('Session check error:', error);
            showPage('login-page');
        }
    }
};

// ======== APP INITIALIZATION ========
const initializeApp = () => {
    getEl('current-user-email').textContent = Auth.currentUser.email;
    loadContracts();
    loadNotifications();
    loadAIPrompt();
};

// ======== CONTRACTS WITH SUPABASE ========
const handleSaveContract = async (e) => {
    e.preventDefault();
    const title = getEl('contract-title').value;
    const number = getEl('contract-number').value;
    const start = getEl('contract-start').value;
    const end = getEl('contract-end').value;
    const boqFile = getEl('contract-boq').files[0];

    if (!title || !number || !start || !end || !boqFile) {
        alert('Please fill all fields and upload a BOQ file.');
        return;
    }

    Papa.parse(boqFile, {
        header: true,
        complete: async (results) => {
            try {
                const { data, error } = await supabase
                    .from('contracts')
                    .insert([
                        {
                            title,
                            number,
                            start_date: start,
                            end_date: end,
                            boq_data: results.data,
                            user_id: Auth.currentUser.id
                        }
                    ]);

                if (error) {
                    alert('Error saving contract: ' + error.message);
                    return;
                }

                hideModal('contract-form-modal');
                loadContracts();
                await addNotification('Contract', `New contract "${title}" added.`);
            } catch (error) {
                alert('Error saving contract: ' + error.message);
                console.error('Contract save error:', error);
            }
        },
        error: (err) => {
            alert('Error parsing CSV file: ' + err.message);
        }
    });
};

const loadContracts = async () => {
    try {
        const { data: contracts, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('user_id', Auth.currentUser.id);

        if (error) {
            console.error('Error loading contracts:', error);
            return;
        }

        const container = getEl('saved-contracts-list');
        container.innerHTML = '';
        
        if (contracts.length === 0) {
            container.innerHTML = '<p>No contracts found. Add one to get started.</p>';
            return;
        }

        contracts.forEach(c => {
            const card = document.createElement('div');
            card.className = 'contract-card';
            card.innerHTML = `
                <h3>${c.title}</h3>
                <p><strong>Ref:</strong> ${c.number}</p>
                <p><strong>Dates:</strong> ${c.start_date} to ${c.end_date}</p>
            `;
            card.onclick = () => openContract(c.id);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading contracts:', error);
    }
};

const openContract = async (contractId) => {
    try {
        const { data: contract, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('id', contractId)
            .single();

        if (error) {
            console.error('Error loading contract:', error);
            return;
        }

        localStorage.setItem('activeContractId', contractId);
        getEl('app-main-title').textContent = contract.title;
        loadBoqTable(contract.boq_data);
        showAppPage('tables-page');
    } catch (error) {
        console.error('Error opening contract:', error);
    }
};

const downloadBoqTemplate = () => {
    const header = "BOQ Ref.,Asset,Description,Dimensions (L x W x H),Unit,Rate\n";
    const blob = new Blob([header], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "BOQ_Template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ======== DATA TABLES (BOQ) ========
const loadBoqTable = (boqData) => {
    const tableBody = getEl('boq-table-body');
    tableBody.innerHTML = '';
    boqData.forEach((row, index) => {
        if(row['BOQ Ref.']) {
            addBoqRow(row);
        }
    });
};

const addBoqRow = (rowData = {}) => {
    const tableBody = getEl('boq-table-body');
    const newRow = tableBody.insertRow();
    newRow.innerHTML = `
        <td contenteditable="true">${rowData['BOQ Ref.'] || ''}</td>
        <td contenteditable="true">${rowData['Asset'] || ''}</td>
        <td contenteditable="true">${rowData['Description'] || ''}</td>
        <td contenteditable="true" oninput="handleUnitInput(event)">${rowData['Dimensions (L x W x H)'] || ''}</td>
        <td>${rowData['Unit'] || ''}</td>
        <td contenteditable="true">${rowData['Rate'] || ''}</td>
        <td><button class="btn-danger" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button></td>
    `;
};

const deleteRow = (btn) => {
    const row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
};

const handleUnitInput = (event) => {
    const dimensions = event.target.textContent.toLowerCase();
    const unitCell = event.target.nextElementSibling;

    if (dimensions.match(/(\d|\.)+\s?x\s?(\d|\.)+\s?x\s?(\d|\.)+/)) {
        unitCell.textContent = 'm³';
    } else if (dimensions.match(/(\d|\.)+\s?x\s?(\d|\.)+/)) {
        unitCell.textContent = 'm²';
    } else if (dimensions.match(/^(\d|\.)+$/)) {
        unitCell.textContent = 'm';
    } else if (dimensions.toUpperCase() === 'NR') {
         unitCell.textContent = 'NR';
    } else {
        unitCell.textContent = 'Unit';
    }
};

const exportTableToCsv = (filename) => {
    let csv = [];
    const rows = document.querySelectorAll("#boq-table tr");
    for (const row of rows) {
        let cols = row.querySelectorAll("td, th");
        let csvrow = [];
        for (const col of cols) {
            let data = `"${col.innerText.replace(/"/g, '""')}"`;
            csvrow.push(data);
        }
        csvrow.pop();
        csv.push(csvrow.join(","));
    }
    const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(csvFile);
    link.download = filename;
    link.click();
};

const exportTableToPdf = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const container = getEl('boq-table-container').cloneNode(true);

    container.querySelectorAll('button').forEach(b => b.remove());
    container.querySelectorAll('[contenteditable="true"]').forEach(el => el.removeAttribute('contenteditable'));

    document.body.appendChild(container);

    html2canvas(container).then(canvas => {
        document.body.removeChild(container);
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        doc.save("boq-report.pdf");
    });
};

// ======== GIS MAP ========
let map;
let drawnItems;
window.mapInitialized = false;

const initializeMap = () => {
    map = L.map('map-page').setView([25.2854, 51.5310], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const geomanControls = new L.Control.Geoman(map, {
        position: 'topleft',
        drawMarker: true,
        drawCircleMarker: false,
        drawCircle: false,
        drawRectangle: true,
        drawPolygon: true,
        drawPolyline: true,
    });
    map.addControl(geomanControls);

    map.on('pm:create', (e) => {
        const layer = e.layer;
        drawnItems.addLayer(layer);
        calculateAndBindPopup(layer);
    });

    addCustomMapControls();
    window.mapInitialized = true;
};

const calculateAndBindPopup = (layer) => {
    const geojson = layer.toGeoJSON();
    let content = '<h4>Shape Details</h4>';

    if (geojson.geometry.type === 'Polygon') {
        const area = turf.area(geojson);
        content += `<p><strong>Area:</strong> ${area.toFixed(2)} m²</p>`;
    } else if (geojson.geometry.type === 'LineString') {
        const length = turf.length(geojson, { units: 'meters' });
        content += `<p><strong>Length:</strong> ${length.toFixed(2)} m</p>`;
    }

    const center = layer.getBounds().getCenter();
    content += `<p><strong>Center Coords:</strong> ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}</p>`;
    content += `<button class="btn-danger btn-sm" onclick="removeLayer(${layer._leaflet_id})">Delete</button>`;
    layer.bindPopup(content).openPopup();
};

window.removeLayer = (id) => {
    drawnItems.eachLayer(layer => {
        if (layer._leaflet_id === id) {
            drawnItems.removeLayer(layer);
        }
    });
};

const addCustomMapControls = () => {
    const customControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function (map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.innerHTML = `
                <a href="#" title="More Actions" role="button" aria-label="More Actions">
                    <i class="fa-solid fa-ellipsis-vertical" style="font-size: 1.2em; padding: 5px;"></i>
                </a>
                <div class="custom-menu" style="display:none; background:white; padding: 5px; box-shadow: var(--shadow);">
                    <button class="btn" style="width:100%; margin-bottom:5px;" onclick="getEl('kml-input').click()">Import KML</button>
                    <button class="btn" style="width:100%;" onclick="getEl('csv-input').click()">Import CSV</button>
                </div>
                <input type="file" id="kml-input" style="display:none" accept=".kml" onchange="importKML(event)">
                <input type="file" id="csv-input" style="display:none" accept=".csv" onchange="importCSV(event)">
            `;
            container.onclick = (e) => {
                e.stopPropagation();
                const menu = container.querySelector('.custom-menu');
                menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            }
            L.DomEvent.disableClickPropagation(container);
            return container;
        }
    });
    map.addControl(new customControl());
};

const importKML = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const kmlLayer = omnivore.kml.parse(e.target.result);
        drawnItems.addLayer(kmlLayer);
        map.fitBounds(kmlLayer.getBounds());
    };
    reader.readAsText(file);
};

const importCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
            results.data.forEach(point => {
                if (point.lat && point.lng) {
                    const marker = L.marker([point.lat, point.lng]).addTo(drawnItems);
                    let popupContent = '<ul>';
                    for (const key in point) {
                        popupContent += `<li><strong>${key}:</strong> ${point[key]}</li>`;
                    }
                    popupContent += '</ul>';
                    marker.bindPopup(popupContent);
                }
            });
        }
    });
};

// ======== AI & NOTIFICATIONS ========
const handleAIAnalysis = () => {
    const file = getEl('ai-image-upload').files[0];
    if (!file) {
        alert("Please upload an image first.");
        return;
    }
    getEl('ai-results-card').style.display = 'block';
    getEl('ai-results-table').style.display = 'none';
    getEl('ai-spinner').style.display = 'block';

    setTimeout(async () => {
        const exampleResult = `
            <table>
                <thead>
                    <tr><th>Defect Type</th><th>Severity</th><th>Location</th><th>Description</th><th>Action</th></tr>
                </thead>
                <tbody>
                    <tr><td>Pothole</td><td>High</td><td>Lower-left</td><td>Surface collapse due to traffic and environmental factors.</td><td>Immediate Patching Required</td></tr>
                    <tr><td>Longitudinal Crack</td><td>Medium</td><td>Center</td><td>Crack running parallel to the pavement's centerline, potential for water ingress.</td><td>Seal Crack</td></tr>
                </tbody>
            </table>
        `;
        getEl('ai-spinner').style.display = 'none';
        getEl('ai-results-table').innerHTML = exampleResult;
        getEl('ai-results-table').style.display = 'block';
        await addNotification('AI Analysis', `Analysis complete for image ${file.name}.`);
    }, 2500);
};

const loadAIPrompt = () => {
    const prompt = localStorage.getItem('ai_prompt') || `You are a civil engineering expert trained to analyze road surface images for pavement condition assessment. Examine the input image and identify all visible road surface defects. Use precise civil engineering terminology for each defect type. For every defect detected, provide the following details in tabular format:
1. Defect Type
2. Severity Level (Low/Med/High)
3. Location in image
4. Technical Description
5. Recommended Action
If no defects are found, return 'No visible defects detected'. Present result in structured table.`;
    getEl('ai-prompt-textarea').value = prompt;
};

const saveAIPrompt = () => {
    localStorage.setItem('ai_prompt', getEl('ai-prompt-textarea').value);
    alert('AI prompt saved!');
};

const loadNotifications = async () => {
    try {
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', Auth.currentUser.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading notifications:', error);
            return;
        }

        const tableBody = getEl('notifications-table-body');
        tableBody.innerHTML = '';
        
        notifications.forEach(n => {
            const row = tableBody.insertRow();
            row.innerHTML = `<td>${new Date(n.created_at).toLocaleDateString()}</td><td>${n.type}</td><td>${n.message}</td>`;
        });
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
};

// ======== GLOBAL FUNCTIONS ========
window.signOut = Auth.signOut;

// ======== EVENT LISTENERS ========
document.addEventListener('DOMContentLoaded', () => {
    Auth.checkSession();

    getEl('login-form').addEventListener('submit', Auth.handleLogin);
    getEl('signup-form').addEventListener('submit', Auth.handleSignup);
    getEl('contract-form').addEventListener('submit', handleSaveContract);

    getEl('show-signup-link').addEventListener('click', (e) => {
        e.preventDefault();
        showModal('signup-modal');
    });
});
