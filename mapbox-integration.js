// ===================================
// MAPBOX GL JS INTEGRATION
// ===================================

// Mapbox global variables
let mapboxMap = null;
let mapboxDraw = null;
let mapboxConfig = {
    accessToken: 'YOUR_MAPBOX_TOKEN_PLACEHOLDER',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [-74.0060, 40.7128],
    zoom: 10
};

let gisData = {
    shapes: [],
    markers: [],
    overlays: {
        traffic: false,
        weather: false,
        riskZones: false
    }
};

// Initialize when mapping page is shown
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Mapbox when mapping page is accessed
    setupMapboxIntegration();
});

// ===================================
// MAPBOX INITIALIZATION
// ===================================

function setupMapboxIntegration() {
    // Override the original map initialization
    if (typeof showPage === 'function') {
        const originalShowPage = showPage;
        showPage = function(pageId) {
            originalShowPage(pageId);
            if (pageId === 'mapping-page') {
                setTimeout(initializeMapboxMap, 100);
            }
        };
    }
}

function initializeMapboxMap() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer || mapboxMap) return;

    // Set Mapbox access token
    if (window.mapboxgl) {
        mapboxgl.accessToken = mapboxConfig.accessToken;
        
        try {
            // Create Mapbox map
            mapboxMap = new mapboxgl.Map({
                container: 'map-container',
                style: mapboxConfig.style,
                center: mapboxConfig.center,
                zoom: mapboxConfig.zoom,
                attributionControl: false
            });

            // Add navigation controls
            mapboxMap.addControl(new mapboxgl.NavigationControl(), 'top-left');
            
            // Add scale control
            mapboxMap.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

            // Initialize drawing tools
            initializeMapboxDraw();
            
            // Setup floating UI cards
            createFloatingUICards();
            
            // Load saved GIS data
            loadGISData();
            
            // Setup event listeners
            setupMapboxEventListeners();
            
            console.log('Mapbox map initialized successfully');
            
        } catch (error) {
            console.error('Mapbox initialization failed:', error);
            // Fallback to original Leaflet map
            initializeLeafletFallback();
        }
    } else {
        console.warn('Mapbox GL JS not loaded, using Leaflet fallback');
        initializeLeafletFallback();
    }
}

function initializeMapboxDraw() {
    if (!window.MapboxDraw) {
        console.warn('Mapbox Draw not available');
        return;
    }

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
}

function initializeLeafletFallback() {
    // Use original Leaflet implementation if Mapbox fails
    if (typeof initializeMap === 'function') {
        initializeMap();
    }
}

// ===================================
// FLOATING UI CARDS
// ===================================

function createFloatingUICards() {
    const cardsHTML = `
        <!-- Information Display Card -->
        <div id="info-display-card" class="floating-card">
            <div class="card-header">
                <h6><i class="fas fa-info-circle"></i> Shape Information</h6>
                <button class="card-toggle" onclick="toggleCard('info-display-card')">−</button>
            </div>
            <div class="card-content">
                <div class="info-item">
                    <label>Area (m²):</label>
                    <span id="shape-area">0</span>
                </div>
                <div class="info-item">
                    <label>Perimeter (m):</label>
                    <span id="shape-perimeter">0</span>
                </div>
                <div class="info-item">
                    <label>Length (m):</label>
                    <span id="shape-length">0</span>
                </div>
                <div class="info-item">
                    <label>Coordinates:</label>
                    <span id="shape-coordinates">Select a shape</span>
                </div>
                <div class="export-buttons">
                    <button class="btn btn-sm btn-primary" onclick="exportGIS('pdf')">PDF</button>
                    <button class="btn btn-sm btn-success" onclick="exportGIS('kml')">KML</button>
                    <button class="btn btn-sm btn-info" onclick="exportGIS('csv')">CSV</button>
                    <button class="btn btn-sm btn-warning" onclick="exportGIS('dxf')">DXF</button>
                </div>
            </div>
        </div>

        <!-- Data Entry Card -->
        <div id="data-entry-card" class="floating-card">
            <div class="card-header">
                <h6><i class="fas fa-keyboard"></i> Data Entry</h6>
                <button class="card-toggle" onclick="toggleCard('data-entry-card')">−</button>
            </div>
            <div class="card-content">
                <div class="form-group">
                    <label>Manual Coordinates</label>
                    <input type="text" id="manual-coords" placeholder="lat1,lng1 lat2,lng2..." class="form-control">
                    <button class="btn btn-sm btn-primary mt-2" onclick="addManualShape()">Add Shape</button>
                </div>
                <div class="form-group">
                    <label>Import Data</label>
                    <input type="file" id="gis-file-import" accept=".csv,.kml,.kmz,.geojson" onchange="handleGISImport(event)">
                    <button class="btn btn-sm btn-secondary mt-2" onclick="downloadCSVTemplate()">Download Template</button>
                </div>
            </div>
        </div>

        <!-- QNAS Metadata Card -->
        <div id="qnas-metadata-card" class="floating-card">
            <div class="card-header">
                <h6><i class="fas fa-tags"></i> Point Metadata</h6>
                <button class="card-toggle" onclick="toggleCard('qnas-metadata-card')">−</button>
            </div>
            <div class="card-content">
                <div class="form-group">
                    <label>Point ID</label>
                    <input type="text" id="point-id" class="form-control">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="point-description" class="form-control" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>Coordinates</label>
                    <input type="text" id="point-coords" class="form-control" readonly>
                </div>
                <button class="btn btn-sm btn-success" onclick="savePointMetadata()">Save Metadata</button>
            </div>
        </div>

        <!-- Overlays Card -->
        <div id="overlays-card" class="floating-card">
            <div class="card-header">
                <h6><i class="fas fa-layer-group"></i> Map Overlays</h6>
                <button class="card-toggle" onclick="toggleCard('overlays-card')">−</button>
            </div>
            <div class="card-content">
                <div class="overlay-controls">
                    <div class="form-check">
                        <input type="checkbox" id="traffic-overlay" onchange="toggleOverlay('traffic', this.checked)">
                        <label for="traffic-overlay">Traffic</label>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" id="weather-overlay" onchange="toggleOverlay('weather', this.checked)">
                        <label for="weather-overlay">Weather</label>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" id="risk-overlay" onchange="toggleOverlay('risk', this.checked)">
                        <label for="risk-overlay">Risk Zones</label>
                    </div>
                </div>
                <div class="simulation-buttons">
                    <button class="btn btn-sm btn-warning" onclick="simulateTrafficAlert()">Simulate Traffic Alert</button>
                    <button class="btn btn-sm btn-info" onclick="simulateWeatherAlert()">Simulate Weather Alert</button>
                </div>
            </div>
        </div>

        <!-- Hamburger Menu -->
        <div id="map-hamburger-menu" class="map-hamburger">
            <button class="hamburger-btn" onclick="toggleAllCards()">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    `;

    // Add cards to map container
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'floating-cards-container';
        cardsContainer.innerHTML = cardsHTML;
        mapContainer.appendChild(cardsContainer);
    }
}

// ===================================
// SHAPE CALCULATIONS
// ===================================

function calculateShapeInfo(feature) {
    if (!feature || !feature.geometry) return;

    const geometry = feature.geometry;
    let area = 0, perimeter = 0, length = 0;

    try {
        if (geometry.type === 'Polygon') {
            area = turf.area(feature);
            perimeter = turf.length(turf.polygonToLine(feature), { units: 'meters' });
        } else if (geometry.type === 'LineString') {
            length = turf.length(feature, { units: 'meters' });
        }

        updateInfoDisplay(area, perimeter, length, geometry.coordinates);
    } catch (error) {
        console.error('Error calculating shape info:', error);
    }
}

function updateInfoDisplay(area, perimeter, length, coordinates) {
    document.getElementById('shape-area').textContent = Math.round(area || 0);
    document.getElementById('shape-perimeter').textContent = Math.round(perimeter || 0);
    document.getElementById('shape-length').textContent = Math.round(length || 0);
    
    const coordText = coordinates ? formatCoordinates(coordinates) : 'No shape selected';
    document.getElementById('shape-coordinates').textContent = coordText;
}

function formatCoordinates(coords) {
    if (coords.length === 1) {
        // Point
        return `${coords[0][1].toFixed(6)}, ${coords[0][0].toFixed(6)}`;
    } else if (coords.length > 1) {
        // Line or polygon - show first few points
        const first = coords[0];
        const coordPairs = Array.isArray(first[0]) ? first : coords;
        return `${coordPairs.length} points (${coordPairs[0][1].toFixed(6)}, ${coordPairs[0][0].toFixed(6)}...)`;
    }
    return 'Invalid coordinates';
}

// ===================================
// EVENT HANDLERS
// ===================================

function setupMapboxEventListeners() {
    if (!mapboxMap) return;

    // Map load event
    mapboxMap.on('load', function() {
        loadProjectMarkers();
        setupMapInteractions();
    });

    // Draw events
    if (mapboxDraw) {
        mapboxMap.on('draw.create', function(e) {
            const feature = e.features[0];
            calculateShapeInfo(feature);
            saveGISShape(feature);
        });

        mapboxMap.on('draw.update', function(e) {
            const feature = e.features[0];
            calculateShapeInfo(feature);
            updateGISShape(feature);
        });

        mapboxMap.on('draw.delete', function(e) {
            deleteGISShape(e.features[0].id);
            updateInfoDisplay(0, 0, 0, null);
        });

        mapboxMap.on('draw.selectionchange', function(e) {
            if (e.features.length > 0) {
                calculateShapeInfo(e.features[0]);
            } else {
                updateInfoDisplay(0, 0, 0, null);
            }
        });
    }

    // Click events for markers
    mapboxMap.on('click', function(e) {
        handleMapClick(e);
    });
}

function handleMapClick(e) {
    const coords = e.lngLat;
    
    // Update QNAS card with clicked coordinates
    document.getElementById('point-coords').value = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    
    // Show QNAS card if hidden
    showCard('qnas-metadata-card');
}

// ===================================
// OVERLAY MANAGEMENT
// ===================================

function toggleOverlay(type, enabled) {
    gisData.overlays[type] = enabled;
    
    switch (type) {
        case 'traffic':
            toggleTrafficOverlay(enabled);
            break;
        case 'weather':
            toggleWeatherOverlay(enabled);
            break;
        case 'risk':
            toggleRiskOverlay(enabled);
            break;
    }
}

function toggleTrafficOverlay(enabled) {
    if (!mapboxMap) return;
    
    if (enabled) {
        // Add traffic layer (simulation)
        mapboxMap.addSource('traffic-data', {
            type: 'geojson',
            data: generateTrafficData()
        });
        
        mapboxMap.addLayer({
            id: 'traffic-layer',
            type: 'line',
            source: 'traffic-data',
            paint: {
                'line-color': ['get', 'color'],
                'line-width': 5,
                'line-opacity': 0.7
            }
        });
    } else {
        if (mapboxMap.getLayer('traffic-layer')) {
            mapboxMap.removeLayer('traffic-layer');
            mapboxMap.removeSource('traffic-data');
        }
    }
}

function toggleWeatherOverlay(enabled) {
    if (!mapboxMap || !enabled) return;
    
    // Simulate weather overlay
    const weatherPopup = new mapboxgl.Popup()
        .setLngLat(mapboxMap.getCenter())
        .setHTML('<div class="weather-popup">🌧️ Rain: 65% | Temp: 22°C</div>')
        .addTo(mapboxMap);
    
    setTimeout(() => weatherPopup.remove(), 5000);
}

function toggleRiskOverlay(enabled) {
    if (!mapboxMap) return;
    
    if (enabled) {
        // Add risk zones
        mapboxMap.addSource('risk-zones', {
            type: 'geojson',
            data: generateRiskZones()
        });
        
        mapboxMap.addLayer({
            id: 'risk-layer',
            type: 'fill',
            source: 'risk-zones',
            paint: {
                'fill-color': ['get', 'color'],
                'fill-opacity': 0.3
            }
        });
    } else {
        if (mapboxMap.getLayer('risk-layer')) {
            mapboxMap.removeLayer('risk-layer');
            mapboxMap.removeSource('risk-zones');
        }
    }
}

// ===================================
// IMPORT/EXPORT FUNCTIONS
// ===================================

function handleGISImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    
    switch (extension) {
        case 'csv':
            importCSVData(file);
            break;
        case 'kml':
        case 'kmz':
            importKMLData(file);
            break;
        case 'geojson':
            importGeoJSONData(file);
            break;
        default:
            showMessage('Unsupported file format', 'error');
    }
}

function importCSVData(file) {
    Papa.parse(file, {
        header: true,
        complete: function(results) {
            const data = results.data;
            
            data.forEach(row => {
                if (row.lat && row.lng) {
                    const marker = new mapboxgl.Marker()
                        .setLngLat([parseFloat(row.lng), parseFloat(row.lat)])
                        .setPopup(new mapboxgl.Popup().setHTML(`
                            <h6>${row.name || 'Imported Point'}</h6>
                            <p>${row.description || 'No description'}</p>
                        `))
                        .addTo(mapboxMap);
                    
                    gisData.markers.push({
                        id: generateId(),
                        coordinates: [parseFloat(row.lng), parseFloat(row.lat)],
                        metadata: row
                    });
                }
            });
            
            showMessage(`Imported ${data.length} points from CSV`, 'success');
            saveGISData();
        }
    });
}

function exportGIS(format) {
    const shapes = mapboxDraw ? mapboxDraw.getAll() : { features: [] };
    
    switch (format) {
        case 'pdf':
            exportToPDF();
            break;
        case 'kml':
            exportToKML(shapes);
            break;
        case 'csv':
            exportToCSV(shapes);
            break;
        case 'dxf':
            exportToDXF(shapes);
            break;
    }
}

function exportToPDF() {
    html2canvas(document.getElementById('map-container')).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('gis-map-export.pdf');
        
        showMessage('Map exported to PDF', 'success');
    });
}

function exportToKML(shapes) {
    // Simple KML export
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<name>GIS Export</name>`;

    shapes.features.forEach((feature, index) => {
        const coords = feature.geometry.coordinates;
        const name = `Shape ${index + 1}`;
        
        if (feature.geometry.type === 'Point') {
            kml += `
<Placemark>
    <name>${name}</name>
    <Point>
        <coordinates>${coords[0]},${coords[1]}</coordinates>
    </Point>
</Placemark>`;
        }
    });

    kml += `
</Document>
</kml>`;

    downloadFile(kml, 'gis-export.kml', 'application/vnd.google-earth.kml+xml');
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function toggleCard(cardId) {
    const card = document.getElementById(cardId);
    const content = card.querySelector('.card-content');
    const toggle = card.querySelector('.card-toggle');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '−';
    } else {
        content.style.display = 'none';
        toggle.textContent = '+';
    }
}

function toggleAllCards() {
    const cards = document.querySelectorAll('.floating-card');
    const isAnyVisible = Array.from(cards).some(card => 
        card.querySelector('.card-content').style.display !== 'none'
    );
    
    cards.forEach(card => {
        const content = card.querySelector('.card-content');
        const toggle = card.querySelector('.card-toggle');
        
        if (isAnyVisible) {
            content.style.display = 'none';
            toggle.textContent = '+';
        } else {
            content.style.display = 'block';
            toggle.textContent = '−';
        }
    });
}

function showCard(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
        const content = card.querySelector('.card-content');
        const toggle = card.querySelector('.card-toggle');
        content.style.display = 'block';
        toggle.textContent = '−';
    }
}

function saveGISData() {
    localStorage.setItem('gisData', JSON.stringify(gisData));
}

function loadGISData() {
    const saved = localStorage.getItem('gisData');
    if (saved) {
        try {
            gisData = { ...gisData, ...JSON.parse(saved) };
        } catch (error) {
            console.error('Error loading GIS data:', error);
        }
    }
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function generateTrafficData() {
    // Generate mock traffic data
    return {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [[-74.006, 40.7128], [-74.0, 40.72]]
                },
                properties: { color: '#ff0000' }
            }
        ]
    };
}

function generateRiskZones() {
    // Generate mock risk zones
     return {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[-74.01, 40.71], [-74.00, 40.71], [-74.00, 40.72], [-74.01, 40.72], [-74.01, 40.71]]]
                },
                properties: { color: '#ffaa00' }
            }
        ]
    };
}

// Missing utility functions for Mapbox integration
function saveGISShape(feature) {
    gisData.shapes.push({
        id: feature.id || generateId(),
        feature: feature,
        createdAt: new Date().toISOString()
    });
    saveGISData();
}

function updateGISShape(feature) {
    const index = gisData.shapes.findIndex(s => s.id === feature.id);
    if (index !== -1) {
        gisData.shapes[index].feature = feature;
        gisData.shapes[index].updatedAt = new Date().toISOString();
        saveGISData();
    }
}

function deleteGISShape(featureId) {
    gisData.shapes = gisData.shapes.filter(s => s.id !== featureId);
    saveGISData();
}

function loadProjectMarkers() {
    // Load project markers on map
    const projects = JSON.parse(localStorage.getItem('engineeringProjects') || '[]');
    projects.forEach(project => {
        if (project.coordinates && mapboxMap) {
            const marker = new mapboxgl.Marker()
                .setLngLat(project.coordinates)
                .setPopup(new mapboxgl.Popup().setHTML(`
                    <h6>${project.name}</h6>
                    <p>${project.description || 'No description'}</p>
                `))
                .addTo(mapboxMap);
        }
    });
}

function setupMapInteractions() {
    // Setup additional map interactions
    if (mapboxMap) {
        mapboxMap.on('moveend', function() {
            // Save map position
            const center = mapboxMap.getCenter();
            const zoom = mapboxMap.getZoom();
            localStorage.setItem('mapPosition', JSON.stringify({
                center: [center.lng, center.lat],
                zoom: zoom
            }));
        });
    }
}

function addManualShape() {
    const coordsInput = document.getElementById('manual-coords');
    if (!coordsInput || !coordsInput.value) return;

    try {
        const coords = coordsInput.value.split(' ').map(pair => {
            const [lat, lng] = pair.split(',').map(Number);
            return [lng, lat]; // GeoJSON format
        });

        if (coords.length >= 2) {
            const feature = {
                type: 'Feature',
                geometry: {
                    type: coords.length > 2 ? 'Polygon' : 'LineString',
                    coordinates: coords.length > 2 ? [coords] : coords
                }
            };

            if (mapboxDraw) {
                mapboxDraw.add(feature);
            }
            coordsInput.value = '';
            showMessage('Shape added successfully', 'success');
        }
    } catch (error) {
        showMessage('Invalid coordinate format', 'error');
    }
}

function downloadCSVTemplate() {
    const template = 'name,description,lat,lng\nSample Point,Description,40.7128,-74.0060';
    downloadFile(template, 'gis-template.csv', 'text/csv');
}

function savePointMetadata() {
    const pointId = document.getElementById('point-id').value;
    const description = document.getElementById('point-description').value;
    const coords = document.getElementById('point-coords').value;

    if (pointId && coords) {
        const metadata = {
            id: pointId,
            description: description,
            coordinates: coords,
            timestamp: new Date().toISOString()
        };

        const points = JSON.parse(localStorage.getItem('gisPoints') || '[]');
        points.push(metadata);
        localStorage.setItem('gisPoints', JSON.stringify(points));

        showMessage('Point metadata saved', 'success');

        // Clear form
        document.getElementById('point-id').value = '';
        document.getElementById('point-description').value = '';
    }
}

function importKMLData(file) {
    // Mock KML import
    showMessage('KML import not fully implemented in demo', 'warning');
}

function importGeoJSONData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const geojson = JSON.parse(e.target.result);
            if (mapboxDraw && geojson.features) {
                geojson.features.forEach(feature => {
                    mapboxDraw.add(feature);
                });
            }
            showMessage(`Imported ${geojson.features?.length || 0} features from GeoJSON`, 'success');
        } catch (error) {
            showMessage('Invalid GeoJSON format', 'error');
        }
    };
    reader.readAsText(file);
}

function exportToCSV(shapes) {
    let csv = 'type,coordinates,area,length\n';

    shapes.features.forEach(feature => {
        const coords = JSON.stringify(feature.geometry.coordinates);
        const area = feature.geometry.type === 'Polygon' ? 
            (window.turf ? turf.area(feature) : 0) : '';
        const length = feature.geometry.type === 'LineString' ? 
            (window.turf ? turf.length(feature, { units: 'meters' }) : 0) : '';

        csv += `${feature.geometry.type},"${coords}",${area},${length}\n`;
    });

    downloadFile(csv, 'gis-export.csv', 'text/csv');
}

function exportToDXF(shapes) {
    // Mock DXF export
    showMessage('DXF export not fully implemented in demo', 'warning');
}

function simulateTrafficAlert() {
    showMessage('🚨 Traffic Alert: Heavy congestion detected on main route', 'warning');
    if (typeof showNotification === 'function') {
        showNotification('Traffic Alert', 'Heavy congestion detected', 'warning');
    }
}

function simulateWeatherAlert() {
    showMessage('🌧️ Weather Alert: Rain expected in 30 minutes', 'info');
    if (typeof showNotification === 'function') {
        showNotification('Weather Alert', 'Rain expected in 30 minutes', 'info');
    }
}

// Export for use in other modules
window.mapboxIntegration = {
    initializeMapboxMap,
    exportGIS,
    toggleOverlay
};