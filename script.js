import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// --- Supabase Client Setup ---
const supabaseUrl = 'https://cykjjrrexaqmsqwrgnzp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5a2pqcnJleGFxbXNxd3JnbnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MjUyMDksImV4cCI6MjA2NzIwMTIwOX0.Fx6f23TWCQQMCIkc5hcx8LqHyskVMm6WAhJl1UFZpMA';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- GLOBAL STATE & CONSTANTS ---
const ADMIN_EMAIL = "ahmetnasan1993@gmail.com"; // Consider making this more secure
let currentUser;
let map; // Global map instance

// --- GLOBAL FUNCTIONS ATTACHED TO WINDOW ---
window.showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
};

window.signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error signing out:", error.message);
        alert("Failed to sign out. Please try again.");
    }
};

window.openTab = (evt, tabName) => {
    document.querySelectorAll('#app-page .tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelectorAll('#app-page .tab-button').forEach(tb => tb.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');

    if (tabName === 'map-tab-content' && !map) {
        initializeVehicleMap();
    }
};

// --- AUTH STATE LOGIC ---
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
        currentUser = null;
        sessionStorage.removeItem('selectedContractId');
        window.showPage('login-page');
    } else if (session) {
        currentUser = session.user;
        const selectedContractId = sessionStorage.getItem('selectedContractId');
        if (selectedContractId) {
            loadContractAndShowApp(selectedContractId);
        } else {
            window.showPage('contracts-page');
            loadContracts();
            if (currentUser.email === ADMIN_EMAIL) {
                document.getElementById('admin-panel').style.display = 'block';
                loadPendingRequests();
            } else {
                document.getElementById('admin-panel').style.display = 'none'; // Hide if not admin
            }
        }
    }
});

// --- AUTH FORM HANDLERS ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const loginButton = e.target.querySelector('button');
    const errorMessage = document.getElementById('login-error-message');

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    loginButton.disabled = true;
    errorMessage.innerText = '';

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        errorMessage.innerText = error.message;
    }
    loginButton.disabled = false;
});

document.getElementById('request-access-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const requestButton = e.target.querySelector('button');
    const errorMessage = document.getElementById('request-error-message');
    const email = document.getElementById('request-email').value;

    requestButton.disabled = true;
    errorMessage.innerText = '';

    const { error } = await supabase.from('user_requests').insert({ email: email, status: 'pending' });

    if (error) {
        errorMessage.innerText = error.message;
    } else {
        alert("Request submitted successfully! The admin has been notified.");
        document.getElementById('request-access-modal').classList.remove('active');
        e.target.reset();
    }
    requestButton.disabled = false;
});

// --- ADMIN PANEL LOGIC ---
async function loadPendingRequests() {
    const listContainer = document.getElementById('pending-requests-list');
    const { data: requests, error } = await supabase.from('user_requests').select('*').eq('status', 'pending');

    if (error) return listContainer.innerHTML = `<p>Error loading requests: ${error.message}</p>`;
    if (requests.length === 0) return listContainer.innerHTML = '<p>No pending requests.</p>';

    listContainer.innerHTML = '';
    requests.forEach(req => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `<span>${req.email}</span>`;
        const approveBtn = document.createElement('button');
        approveBtn.textContent = 'Approve';
        approveBtn.onclick = (e) => approveUser(req, e.currentTarget);
        item.appendChild(approveBtn);
        listContainer.appendChild(item);
    });
}

async function approveUser(request, button) {
    if (!confirm(`Are you sure you want to approve user: ${request.email}?`)) return;
    button.disabled = true;
    button.textContent = 'Approving...';

    try {
        const { error } = await supabase.functions.invoke('handle-user-request', {
            body: { requestId: request.id, action: 'approve' }
        });
        if (error) throw error;
        alert(`User ${request.email} approved. They will receive an invitation email.`);
        loadPendingRequests(); // Refresh the list
    } catch (error) {
        alert(`Failed to approve user: ${error.message}`);
        button.disabled = false;
        button.textContent = 'Approve';
    }
}

// --- CONTRACTS PAGE LOGIC ---
async function loadContracts() {
    if (!currentUser) return;
    const listContainer = document.getElementById('contracts-list');
    listContainer.innerHTML = '<p>Loading contracts...</p>';
    const { data: contracts, error } = await supabase.from('contracts').select('*').eq('user_id', currentUser.id);
    if (error) return listContainer.innerHTML = `<p>Error loading contracts: ${error.message}</p>`;
    if (!contracts || contracts.length === 0) return listContainer.innerHTML = '<p>No contracts found. Please add one.</p>';

    listContainer.innerHTML = '';
    contracts.forEach(contract => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `<span>${contract.title}</span>`;
        item.onclick = () => {
            sessionStorage.setItem('selectedContractId', contract.id);
            loadContractAndShowApp(contract.id);
        };
        listContainer.appendChild(item);
    });
}

document.getElementById('add-contract-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const boqFile = document.getElementById('boq-file-input').files[0];
    if (!boqFile) return alert("Please select a BOQ CSV file.");

    Papa.parse(boqFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const newContract = {
                user_id: currentUser.id,
                title: document.getElementById('contract-title').value,
                contract_number: document.getElementById('contract-number').value,
                start_date: document.getElementById('contract-start-date').value,
                end_date: document.getElementById('contract-end-date').value,
                boq: results.data,
            };
            const { error } = await supabase.from('contracts').insert(newContract);
            if (error) alert(error.message);
            else {
                alert("Contract saved!");
                loadContracts();
                e.target.reset();
            }
        },
        error: (err, file) => {
            alert(`Error parsing CSV file: ${err.message}. Please check the file format.`);
            console.error("PapaParse error:", err, file);
        }
    });
});

// --- MAIN APP LOGIC ---
let currentContractData; // Declared to hold the currently selected contract
let boqData; // Declared to hold the BOQ data of the current contract

async function loadContractAndShowApp(contractId) {
    const { data, error } = await supabase.from('contracts').select('*').eq('id', contractId).single();
    if (error || !data) {
        alert("Contract not found! Redirecting.");
        sessionStorage.removeItem('selectedContractId');
        window.showPage('contracts-page');
        return;
    }
    currentContractData = data;
    boqData = data.boq || [];
    document.getElementById('app-main-title').textContent = currentContractData.title;
    window.showPage('app-page');
    initializeAppLogic();
}

function initializeAppLogic() {
    // This function is the entry point for the main app page.
    // All event listeners and initializations for the dashboard tabs should go here.
    // Fix: Use window.openTab to correctly call the global function
    window.openTab({ currentTarget: document.querySelector('#app-page .tab-button') }, 'inspection-report-content');
}

function initializeVehicleMap() {
    if (map) map.remove();
    map = L.map('map-container').setView([25.2861, 51.5348], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    // Add other map logic like Leaflet.Draw/Geoman here.
    // Example: Initialize Leaflet.Draw controls
    // var drawnItems = new L.FeatureGroup();
    // map.addLayer(drawnItems);
    // var drawControl = new L.Control.Draw({
    //     edit: {
    //         featureGroup: drawnItems
    //     }
    // });
    // map.addControl(drawControl);
    // map.on(L.Draw.Event.CREATED, function (event) {
    //     var layer = event.layer;
    //     drawnItems.addLayer(layer);
    // });
}

// Initial check for authentication state when the script loads
supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
        currentUser = session.user;
        const selectedContractId = sessionStorage.getItem('selectedContractId');
        if (selectedContractId) {
            loadContractAndShowApp(selectedContractId);
        } else {
            window.showPage('contracts-page');
            loadContracts();
            if (currentUser.email === ADMIN_EMAIL) {
                document.getElementById('admin-panel').style.display = 'block';
                loadPendingRequests();
            }
        }
    } else {
        window.showPage('login-page');
    }
});
