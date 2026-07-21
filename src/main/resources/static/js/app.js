/**
 * H3 Geospatial Core — Dashboard Application
 * 12 endpoint desteğiyle interaktif API test arayüzü
 */

// ============================================
// STATE & CONFIG
// ============================================
const API_BASE = '/api/h3';
let map = null;
let mapLayers = [];
let currentEndpoint = null;

// ============================================
// ENDPOINT DEFINITIONS (12 Endpoint)
// ============================================
const ENDPOINTS = {
  // ── CORE (4) ──
  cell: {
    title: 'Hücre Bul (LatLng → Cell)',
    path: '/api/h3/cell',
    method: 'GET',
    group: 'core',
    description: 'Enlem, boylam ve çözünürlük değeriyle H3 hücre adresini bulun.',
    fields: [
      { name: 'lat', label: 'Enlem (Latitude)', type: 'number', placeholder: '41.0166', step: 'any', min: -90, max: 90, required: true },
      { name: 'lng', label: 'Boylam (Longitude)', type: 'number', placeholder: '29.0930', step: 'any', min: -180, max: 180, required: true },
      { name: 'resolution', label: 'Çözünürlük (0-15)', type: 'range', min: 0, max: 15, value: 7, required: true }
    ],
    buildRequest: (data) => ({
      url: `${API_BASE}/cell?lat=${data.lat}&lng=${data.lng}&resolution=${data.resolution}`,
      method: 'GET'
    }),
    onResponse: async (data, inputData) => {
      if (data.cell) {
        const lat = parseFloat(inputData.lat);
        const lng = parseFloat(inputData.lng);
        addMarker(lat, lng, `📍 ${data.cell}`);
        const latlngs = await fetchBoundaryAndDraw(data.cell, '#6366f1', data.cell);
        if (!latlngs) {
          // Boundary fetch failed, fallback to input coordinates
          map.setView([lat, lng], 14);
        }
      }
    }
  },

  parent: {
    title: 'Üst Hücre (Parent)',
    path: '/api/h3/parent/{cell}',
    method: 'GET',
    group: 'core',
    description: 'Bir H3 hücresinin üst (parent) hücresini bulun.',
    fields: [
      { name: 'cell', label: 'H3 Hücre Adresi', type: 'text', placeholder: '872830828ffffff', required: true }
    ],
    buildRequest: (data) => ({
      url: `${API_BASE}/parent/${data.cell}`,
      method: 'GET'
    }),
    onResponse: async (data) => {
      if (data.cell) {
        await fetchBoundaryAndDraw(data.cell, '#6366f1', 'Orijinal Hücre');
      }
      if (data.parent) {
        await fetchBoundaryAndDraw(data.parent, '#8b5cf6', 'Üst Hücre');
      }
    }
  },

  children: {
    title: 'Alt Hücreler (Children)',
    path: '/api/h3/children/{cell}',
    method: 'GET',
    group: 'core',
    description: 'Bir H3 hücresinin tüm alt (children) hücrelerini listeleyin.',
    fields: [
      { name: 'cell', label: 'H3 Hücre Adresi', type: 'text', placeholder: '872830828ffffff', required: true }
    ],
    buildRequest: (data) => ({
      url: `${API_BASE}/children/${data.cell}`,
      method: 'GET'
    }),
    onResponse: async (data) => {
      if (data.children && data.children.length > 0) {
        for (let i = 0; i < data.children.length; i++) {
          await fetchBoundaryAndDraw(data.children[i], getColorFromIndex(i), data.children[i]);
        }
      }
    }
  },

  convert: {
    title: 'Çözünürlük Dönüştür',
    path: '/api/h3/convert/{cell}',
    method: 'GET',
    group: 'core',
    description: 'Bir H3 hücresini farklı çözünürlüğe dönüştürün.',
    fields: [
      { name: 'cell', label: 'H3 Hücre Adresi', type: 'text', placeholder: '872830828ffffff', required: true },
      { name: 'targetRes', label: 'Hedef Çözünürlük (0-15)', type: 'range', min: 0, max: 15, value: 5, required: true }
    ],
    buildRequest: (data) => ({
      url: `${API_BASE}/convert/${data.cell}?targetRes=${data.targetRes}`,
      method: 'GET'
    }),
    onResponse: async (data) => {
      if (data.result) {
        if (typeof data.result === 'string') {
          await fetchBoundaryAndDraw(data.result, '#10b981', 'Dönüştürülmüş');
        } else if (Array.isArray(data.result)) {
          for (let i = 0; i < data.result.length; i++) {
            await fetchBoundaryAndDraw(data.result[i], getColorFromIndex(i), data.result[i]);
          }
        }
      }
    }
  },

  // ── GEOMETRY (5) ──
  boundary: {
    title: 'Hücre Sınırı (Boundary)',
    path: '/api/h3/geometry/boundary/{cell}',
    method: 'GET',
    group: 'geometry',
    description: 'Bir H3 hücresinin poligon sınır koordinatlarını alın.',
    fields: [
      { name: 'cell', label: 'H3 Hücre Adresi', type: 'text', placeholder: '872830828ffffff', required: true }
    ],
    buildRequest: (data) => ({
      url: `${API_BASE}/geometry/boundary/${data.cell}`,
      method: 'GET'
    }),
    onResponse: async (data) => {
      if (data.coordinates && data.coordinates.length > 0) {
        const latlngs = data.coordinates.map(c => [c.lat, c.lng]);
        drawPolygon(latlngs, '#10b981', data.cell);
        fitBoundsToPolygon(latlngs);
      }
    }
  },

  metrics: {
    title: 'Hücre Metrikleri',
    path: '/api/h3/geometry/metrics/{cell}',
    method: 'GET',
    group: 'geometry',
    description: 'Bir H3 hücresinin alan, kenar uzunluğu ve merkez bilgilerini görüntüleyin.',
    fields: [
      { name: 'cell', label: 'H3 Hücre Adresi', type: 'text', placeholder: '872830828ffffff', required: true }
    ],
    buildRequest: (data) => ({
      url: `${API_BASE}/geometry/metrics/${data.cell}`,
      method: 'GET'
    }),
    onResponse: async (data) => {
      if (data.center) {
        addMarker(data.center.lat, data.center.lng, `📍 Merkez: ${data.cell}`);
        await fetchBoundaryAndDraw(data.cell, '#10b981', data.cell);
      }
    }
  },

  fillPolygon: {
    title: 'Poligon Doldur',
    path: '/api/h3/geometry/fill/polygon',
    method: 'POST',
    group: 'geometry',
    description: 'Bir poligon alanını H3 hücreleriyle doldurun. En az 3 koordinat girin.',
    fields: [
      { name: 'coordinates', label: 'Koordinatlar (JSON)', type: 'textarea', placeholder: '[\n  {"lat": 41.025, "lng": 29.08},\n  {"lat": 41.025, "lng": 29.11},\n  {"lat": 41.005, "lng": 29.11},\n  {"lat": 41.005, "lng": 29.08}\n]', required: true },
      { name: 'resolution', label: 'Çözünürlük (0-15)', type: 'range', min: 0, max: 15, value: 7, required: true }
    ],
    buildRequest: (data) => {
      let coordinates;
      try { coordinates = JSON.parse(data.coordinates); } catch (e) { throw new Error('Koordinatlar geçerli JSON formatında olmalı!'); }
      return {
        url: `${API_BASE}/geometry/fill/polygon`,
        method: 'POST',
        body: { coordinates, resolution: parseInt(data.resolution) }
      };
    },
    onResponse: (data) => {
      if (data.cells && data.cells.length > 0) {
        drawCellsOnMap(data.cells);
      }
    }
  },

  fillBbox: {
    title: 'BBox Doldur',
    path: '/api/h3/geometry/fill/bbox',
    method: 'POST',
    group: 'geometry',
    description: 'Bir dikdörtgen alanı (bounding box) H3 hücreleriyle doldurun.',
    fields: [
      { name: 'minLat', label: 'Min Enlem', type: 'number', placeholder: '41.005', step: 'any', min: -90, max: 90, required: true, row: 1 },
      { name: 'minLng', label: 'Min Boylam', type: 'number', placeholder: '29.08', step: 'any', min: -180, max: 180, required: true, row: 1 },
      { name: 'maxLat', label: 'Max Enlem', type: 'number', placeholder: '41.025', step: 'any', min: -90, max: 90, required: true, row: 2 },
      { name: 'maxLng', label: 'Max Boylam', type: 'number', placeholder: '29.11', step: 'any', min: -180, max: 180, required: true, row: 2 },
      { name: 'resolution', label: 'Çözünürlük (0-15)', type: 'range', min: 0, max: 15, value: 7, required: true }
    ],
    buildRequest: (data) => ({
      url: `${API_BASE}/geometry/fill/bbox`,
      method: 'POST',
      body: {
        minLat: parseFloat(data.minLat), minLng: parseFloat(data.minLng),
        maxLat: parseFloat(data.maxLat), maxLng: parseFloat(data.maxLng),
        resolution: parseInt(data.resolution)
      }
    }),
    onResponse: (data) => {
      if (data.cells && data.cells.length > 0) {
        drawCellsOnMap(data.cells);
      }
    }
  },

  fillCircle: {
    title: 'Daire Doldur',
    path: '/api/h3/geometry/fill/circle',
    method: 'POST',
    group: 'geometry',
    description: 'Dairesel bir alanı H3 hücreleriyle doldurun.',
    fields: [
      { name: 'lat', label: 'Merkez Enlem', type: 'number', placeholder: '41.0166', step: 'any', min: -90, max: 90, required: true, row: 1 },
      { name: 'lng', label: 'Merkez Boylam', type: 'number', placeholder: '29.0930', step: 'any', min: -180, max: 180, required: true, row: 1 },
      { name: 'radiusInMeters', label: 'Yarıçap (metre)', type: 'number', placeholder: '1000', step: 'any', min: 1, required: true },
      { name: 'resolution', label: 'Çözünürlük (0-15)', type: 'range', min: 0, max: 15, value: 7, required: true }
    ],
    buildRequest: (data) => ({
      url: `${API_BASE}/geometry/fill/circle`,
      method: 'POST',
      body: {
        lat: parseFloat(data.lat), lng: parseFloat(data.lng),
        radiusInMeters: parseFloat(data.radiusInMeters),
        resolution: parseInt(data.resolution)
      }
    }),
    onResponse: (data) => {
      if (data.cells && data.cells.length > 0) {
        drawCellsOnMap(data.cells);
      }
    }
  },

  // ── SPATIAL (3) ──
  neighbors: {
    title: 'Komşular (Neighbors)',
    path: '/api/h3/neighbors/{cell}',
    method: 'GET',
    group: 'spatial',
    description: 'Bir H3 hücresinin komşu hücrelerini bulun.',
    fields: [
      { name: 'cell', label: 'H3 Hücre Adresi', type: 'text', placeholder: '872830828ffffff', required: true }
    ],
    buildRequest: (data) => ({
      url: `${API_BASE}/neighbors/${data.cell}`,
      method: 'GET'
    }),
    onResponse: async (data) => {
      if (data.cell) {
        await fetchBoundaryAndDraw(data.cell, '#f59e0b', 'Merkez');
      }
      if (data.neighbors && data.neighbors.length > 0) {
        for (let i = 0; i < data.neighbors.length; i++) {
          await fetchBoundaryAndDraw(data.neighbors[i], getColorFromIndex(i), data.neighbors[i]);
        }
      }
    }
  },

  kring: {
    title: 'K-Ring Halkası',
    path: '/api/h3/kring/{cell}',
    method: 'GET',
    group: 'spatial',
    description: 'Bir H3 hücresinin etrafındaki K-Ring halkasını bulun.',
    fields: [
      { name: 'cell', label: 'H3 Hücre Adresi', type: 'text', placeholder: '872830828ffffff', required: true },
      { name: 'radius', label: 'Halka Yarıçapı (K)', type: 'number', placeholder: '2', min: 0, step: '1', required: true }
    ],
    buildRequest: (data) => ({
      url: `${API_BASE}/kring/${data.cell}?radius=${data.radius}`,
      method: 'GET'
    }),
    onResponse: (data) => {
      if (data.kRing && data.kRing.length > 0) {
        drawCellsOnMap(data.kRing);
      }
    }
  },

  distance: {
    title: 'Grid Mesafesi',
    path: '/api/h3/distance',
    method: 'POST',
    group: 'spatial',
    description: 'İki H3 hücresi arasındaki grid mesafesini hesaplayın.',
    fields: [
      { name: 'cell1', label: '1. Hücre Adresi', type: 'text', placeholder: '872830828ffffff', required: true },
      { name: 'cell2', label: '2. Hücre Adresi', type: 'text', placeholder: '87283082affffff', required: true }
    ],
    buildRequest: (data) => ({
      url: `${API_BASE}/distance`,
      method: 'POST',
      body: { cell1: data.cell1, cell2: data.cell2 }
    }),
    onResponse: async (data) => {
      if (data.cell1) await fetchBoundaryAndDraw(data.cell1, '#6366f1', 'Hücre 1');
      if (data.cell2) await fetchBoundaryAndDraw(data.cell2, '#ef4444', 'Hücre 2');
    }
  }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initNavigation();
  initForm();
  initClearMap();
});

// ============================================
// MAP INITIALIZATION
// ============================================
function initMap() {
  map = L.map('map', {
    center: [41.0166, 29.0930], // Ümraniye
    zoom: 13,
    zoomControl: true,
    attributionControl: true
  });

  // Dark tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
  const items = document.querySelectorAll('.endpoint-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const endpointKey = item.dataset.endpoint;
      selectEndpoint(endpointKey);

      // Active state
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function selectEndpoint(key) {
  currentEndpoint = key;
  const endpoint = ENDPOINTS[key];

  // Update top bar
  document.getElementById('topBarTitle').textContent = endpoint.title;
  document.getElementById('topBarPath').textContent = endpoint.path;

  // Show panels, hide welcome
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('formPanel').style.display = 'flex';
  document.getElementById('mapPanel').style.display = 'flex';
  document.getElementById('responsePanel').style.display = 'flex';

  // Re-trigger animations
  document.getElementById('formPanel').classList.remove('animate-in');
  void document.getElementById('formPanel').offsetWidth;
  document.getElementById('formPanel').classList.add('animate-in');

  // Update form title
  document.getElementById('formTitle').textContent = endpoint.title;

  // Build form fields
  buildFormFields(endpoint);

  // Clear response
  resetResponse();

  // Invalidate map size after layout change (multiple delays for reliable reflow)
  setTimeout(() => { if (map) map.invalidateSize(); }, 100);
  setTimeout(() => { if (map) map.invalidateSize(); }, 300);
  setTimeout(() => { if (map) map.invalidateSize(); }, 600);
}

// ============================================
// FORM BUILDER
// ============================================
function buildFormFields(endpoint) {
  const container = document.getElementById('formFields');
  container.innerHTML = '';

  // Description
  if (endpoint.description) {
    const descDiv = document.createElement('div');
    descDiv.className = 'form-group';
    descDiv.innerHTML = `<p style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5;margin-bottom:var(--space-md);padding:var(--space-md);background:var(--glass-bg);border-radius:var(--radius-sm);border:1px solid var(--glass-border);">💡 ${endpoint.description}</p>`;
    container.appendChild(descDiv);
  }

  // Group fields by row for paired layout
  const rowGroups = {};
  const noRowFields = [];
  endpoint.fields.forEach(field => {
    if (field.row !== undefined) {
      if (!rowGroups[field.row]) rowGroups[field.row] = [];
      rowGroups[field.row].push(field);
    } else {
      noRowFields.push(field);
    }
  });

  // Render row groups first
  const sortedRows = Object.keys(rowGroups).sort((a, b) => a - b);
  sortedRows.forEach(rowKey => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'form-row';
    rowGroups[rowKey].forEach(field => {
      rowDiv.appendChild(createFieldElement(field));
    });
    container.appendChild(rowDiv);
  });

  // Render remaining fields
  noRowFields.forEach(field => {
    container.appendChild(createFieldElement(field));
  });
}

function createFieldElement(field) {
  const group = document.createElement('div');
  group.className = 'form-group';

  if (field.type === 'range') {
    const defaultVal = field.value || field.min || 0;
    group.innerHTML = `
      <label for="field-${field.name}">${field.label}: <span id="range-val-${field.name}" style="color:var(--accent-core);font-weight:700;font-family:var(--font-mono);">${defaultVal}</span></label>
      <input type="range" id="field-${field.name}" name="${field.name}"
             min="${field.min}" max="${field.max}" value="${defaultVal}"
             ${field.required ? 'required' : ''}>
    `;
    // Add live value display
    setTimeout(() => {
      const rangeInput = document.getElementById(`field-${field.name}`);
      if (rangeInput) {
        rangeInput.addEventListener('input', () => {
          document.getElementById(`range-val-${field.name}`).textContent = rangeInput.value;
        });
      }
    }, 0);
  } else if (field.type === 'textarea') {
    group.innerHTML = `
      <label for="field-${field.name}">${field.label}</label>
      <textarea id="field-${field.name}" name="${field.name}"
                placeholder='${field.placeholder || ''}'
                ${field.required ? 'required' : ''}></textarea>
    `;
  } else {
    group.innerHTML = `
      <label for="field-${field.name}">${field.label}</label>
      <input type="${field.type}" id="field-${field.name}" name="${field.name}"
             placeholder="${field.placeholder || ''}"
             ${field.step ? `step="${field.step}"` : ''}
             ${field.min !== undefined ? `min="${field.min}"` : ''}
             ${field.max !== undefined ? `max="${field.max}"` : ''}
             ${field.required ? 'required' : ''}>
    `;
    if (field.hint) {
      group.innerHTML += `<div class="form-hint">${field.hint}</div>`;
    }
  }

  return group;
}

// ============================================
// FORM SUBMISSION
// ============================================
function initForm() {
  document.getElementById('apiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentEndpoint) return;

    const endpoint = ENDPOINTS[currentEndpoint];
    const formData = getFormData(endpoint);

    // Build request
    let request;
    try {
      request = endpoint.buildRequest(formData);
    } catch (err) {
      showToast(err.message, 'error');
      return;
    }

    // Show loading
    const btn = document.getElementById('btnSubmit');
    btn.classList.add('loading');

    const startTime = performance.now();

    try {
      const fetchOptions = {
        method: request.method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (request.body) {
        fetchOptions.body = JSON.stringify(request.body);
      }

      const response = await fetch(request.url, fetchOptions);
      const elapsed = Math.round(performance.now() - startTime);
      const data = await response.json();

      if (response.ok) {
        showResponse(data, response.status, elapsed);
        clearMapLayers();

        // Call endpoint-specific visualization
        if (endpoint.onResponse) {
          endpoint.onResponse(data, formData);
        }

        showToast('İstek başarılı!', 'success');
      } else {
        showResponse(data, response.status, elapsed);
        showToast(`Hata: ${response.status} ${response.statusText}`, 'error');
      }
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      showResponse({ error: err.message }, 0, elapsed);
      showToast(`Bağlantı hatası: ${err.message}`, 'error');
    } finally {
      btn.classList.remove('loading');
    }
  });
}

function getFormData(endpoint) {
  const data = {};
  endpoint.fields.forEach(field => {
    const el = document.getElementById(`field-${field.name}`);
    if (el) {
      data[field.name] = el.value;
    }
  });
  return data;
}

// ============================================
// RESPONSE DISPLAY
// ============================================
function showResponse(data, statusCode, elapsed) {
  const statusEl = document.getElementById('responseStatus');
  const timeEl = document.getElementById('responseTime');
  const contentEl = document.getElementById('responseContent');

  // Status badge
  statusEl.style.display = 'inline-flex';
  if (statusCode >= 200 && statusCode < 300) {
    statusEl.className = 'response-status success';
    statusEl.textContent = `✓ ${statusCode} OK`;
  } else {
    statusEl.className = 'response-status error';
    statusEl.textContent = `✗ ${statusCode || 'ERR'}`;
  }

  // Time
  timeEl.textContent = `${elapsed}ms`;

  // JSON syntax highlighting
  contentEl.innerHTML = syntaxHighlight(JSON.stringify(data, null, 2));
}

function resetResponse() {
  document.getElementById('responseStatus').style.display = 'none';
  document.getElementById('responseTime').textContent = '';
  document.getElementById('responseContent').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">📡</div>
      <div class="empty-title">Henüz yanıt yok</div>
      <div class="empty-desc">Formu doldurup istek gönderin, yanıt burada görüntülenecek.</div>
    </div>
  `;
}

function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

// ============================================
// MAP FUNCTIONS
// ============================================
function clearMapLayers() {
  mapLayers.forEach(layer => {
    if (map.hasLayer(layer)) map.removeLayer(layer);
  });
  mapLayers = [];
}

function initClearMap() {
  document.getElementById('btnClearMap').addEventListener('click', () => {
    clearMapLayers();
    showToast('Harita temizlendi', 'success');
  });
}

function drawPolygon(latlngs, color = '#6366f1', tooltip = '') {
  const polygon = L.polygon(latlngs, {
    color: color,
    fillColor: color,
    fillOpacity: 0.25,
    weight: 2,
    opacity: 0.8
  }).addTo(map);

  if (tooltip) {
    polygon.bindTooltip(tooltip, { className: 'cell-tooltip', sticky: true });
  }

  mapLayers.push(polygon);
  return polygon;
}

function addMarker(lat, lng, tooltip = '') {
  const marker = L.circleMarker([lat, lng], {
    radius: 7,
    fillColor: '#f59e0b',
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.9
  }).addTo(map);

  if (tooltip) {
    marker.bindTooltip(tooltip, { className: 'cell-tooltip' });
  }

  mapLayers.push(marker);
  return marker;
}

function fitBoundsToPolygon(latlngs) {
  if (!latlngs || latlngs.length === 0) return;
  const bounds = L.latLngBounds(latlngs);
  if (bounds.isValid()) {
    if (map) map.invalidateSize();
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true });
  }
}

async function fetchBoundaryAndDraw(cellAddress, color = '#6366f1', tooltip = '') {
  try {
    const response = await fetch(`${API_BASE}/geometry/boundary/${cellAddress}`);
    if (response.ok) {
      const data = await response.json();
      if (data.coordinates && data.coordinates.length > 0) {
        const latlngs = data.coordinates.map(c => [c.lat, c.lng]);
        console.log('Drawing boundary for', cellAddress, 'coords:', latlngs);
        drawPolygon(latlngs, color, tooltip || cellAddress);
        fitBoundsToPolygon(latlngs);
        return latlngs;
      }
    }
  } catch (err) {
    console.warn('Boundary fetch failed for:', cellAddress, err);
  }
  return null;
}

async function drawCellsOnMap(cells) {
  if (!cells || cells.length === 0) return;

  // Limit for performance — draw max 500 cells
  const cellsToDraw = cells.slice(0, 500);
  const batchSize = 20;
  const allLatLngs = [];

  for (let i = 0; i < cellsToDraw.length; i += batchSize) {
    const batch = cellsToDraw.slice(i, i + batchSize);
    const promises = batch.map(async (cell, idx) => {
      try {
        const response = await fetch(`${API_BASE}/geometry/boundary/${cell}`);
        if (response.ok) {
          const data = await response.json();
          if (data.coordinates && data.coordinates.length > 0) {
            const latlngs = data.coordinates.map(c => [c.lat, c.lng]);
            const color = getColorFromIndex(i + idx);
            drawPolygon(latlngs, color, cell);
            allLatLngs.push(...latlngs);
          }
        }
      } catch (err) {
        console.warn('Cell draw failed:', cell, err);
      }
    });
    await Promise.all(promises);
  }

  // Fit map to all cells
  if (allLatLngs.length > 0) {
    const bounds = L.latLngBounds(allLatLngs);
    map.fitBounds(bounds.pad(0.1));
  }

  // Show count
  if (cells.length > 500) {
    showToast(`${cells.length} hücreden ${500} tanesi haritada gösteriliyor (performans limiti)`, 'warning');
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
const HEX_COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c084fc',
  '#10b981', '#34d399', '#6ee7b7',
  '#f59e0b', '#fbbf24', '#fcd34d',
  '#ef4444', '#f87171', '#fca5a5',
  '#06b6d4', '#22d3ee', '#67e8f9',
  '#ec4899', '#f472b6', '#f9a8d4'
];

function getColorFromIndex(index) {
  return HEX_COLORS[index % HEX_COLORS.length];
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
