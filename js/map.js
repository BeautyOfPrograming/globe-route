const WORLD_CENTER = [20, 0];
const WORLD_ZOOM = 2;
const NOMINATIM_HEADERS = {
    'Accept': 'application/json',
    'Accept-Language': 'en',
    'User-Agent': 'GlobeRoute/1.0 (world map explorer; local development)'
};

const FEATURED_PLACES = [
    { name: 'New York', region: 'United States', flag: '🇺🇸', lat: 40.7128, lng: -74.0060, zoom: 12 },
    { name: 'London', region: 'United Kingdom', flag: '🇬🇧', lat: 51.5074, lng: -0.1278, zoom: 12 },
    { name: 'Tokyo', region: 'Japan', flag: '🇯🇵', lat: 35.6762, lng: 139.6503, zoom: 11 },
    { name: 'Paris', region: 'France', flag: '🇫🇷', lat: 48.8566, lng: 2.3522, zoom: 12 },
    { name: 'Sydney', region: 'Australia', flag: '🇦🇺', lat: -33.8688, lng: 151.2093, zoom: 11 },
    { name: 'Dubai', region: 'United Arab Emirates', flag: '🇦🇪', lat: 25.2048, lng: 55.2708, zoom: 11 },
    { name: 'São Paulo', region: 'Brazil', flag: '🇧🇷', lat: -23.5505, lng: -46.6333, zoom: 11 },
    { name: 'Cairo', region: 'Egypt', flag: '🇪🇬', lat: 30.0444, lng: 31.2357, zoom: 11 }
];

let map;
let markers = [];
let distanceMode = false;
let distanceMarkers = [];
let distanceLine = null;
let userLocationMarker = null;
let distanceUnit = 'km';
let toastTimeout = null;

function initMap() {
    map = L.map('map', {
        zoomControl: false,
        worldCopyJump: true
    }).setView(WORLD_CENTER, WORLD_ZOOM);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    map.on('click', handleMapClick);

    initTabs();
    initUnitToggle();
    loadFeaturedPlaces();
    bindForms();
    document.getElementById('locateBtn').addEventListener('click', locateUser);
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            tabButtons.forEach(b => {
                b.classList.toggle('active', b.dataset.tab === tab);
                b.setAttribute('aria-selected', b.dataset.tab === tab);
            });
            document.querySelectorAll('.tab-panel').forEach(panel => {
                const isActive = panel.id === `panel-${tab}`;
                panel.classList.toggle('active', isActive);
                panel.hidden = !isActive;
            });
        });
    });
}

function initUnitToggle() {
    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            distanceUnit = btn.dataset.unit;
            document.querySelectorAll('.unit-btn').forEach(b => b.classList.toggle('active', b.dataset.unit === distanceUnit));
            document.getElementById('distanceUnit').textContent = distanceUnit;

            const valueEl = document.getElementById('distanceValue');
            if (valueEl.dataset.km) {
                valueEl.textContent = formatDistance(parseFloat(valueEl.dataset.km));
            }
        });
    });
}

function bindForms() {
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
    document.getElementById('distanceForm').addEventListener('submit', handleDistanceForm);
    document.getElementById('toggleDistanceMode').addEventListener('click', toggleDistanceMode);
}

function loadFeaturedPlaces() {
    const list = document.getElementById('featuredPlaces');
    FEATURED_PLACES.forEach(place => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'explore-item';
        btn.innerHTML = `
            <span class="explore-flag">${place.flag}</span>
            <span class="explore-info">
                <span class="explore-name">${place.name}</span>
                <span class="explore-region">${place.region}</span>
            </span>
        `;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.explore-item').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            goToPlace(place);
        });
        li.appendChild(btn);
        list.appendChild(li);
    });
}

function goToPlace(place) {
    clearMarkers();
    const position = [place.lat, place.lng];
    addMarker(position, `${place.name}, ${place.region}`);
    map.flyTo(position, place.zoom, { animate: true, duration: 1.5 });
    document.getElementById('searchInput').value = place.name;
    showToast(`Showing ${place.name}`);
}

function addMarker(position, title) {
    const marker = L.marker(position).addTo(map).bindPopup(title);
    markers.push(marker);
    return marker;
}

function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

async function nominatimSearch(query, limit = 5) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`;
    const response = await fetch(url, { headers: NOMINATIM_HEADERS });
    if (!response.ok) {
        throw new Error('Search service unavailable');
    }
    return response.json();
}

async function searchLocation(query) {
    const trimmed = query.trim();
    if (!trimmed) {
        throw new Error('Please enter a search term');
    }
    const results = await nominatimSearch(trimmed);
    if (results.length > 0) {
        return results;
    }
    throw new Error('Location not found');
}

function getZoomForResult(result) {
    const type = result.type || result.class;
    if (type === 'country') return 5;
    if (type === 'state' || type === 'administrative') return 8;
    if (type === 'city' || type === 'town') return 11;
    if (type === 'street') return 15;
    if (type === 'building') return 17;
    return 13;
}

function isBroadAreaSearch(query, result) {
    const broadTypes = ['country', 'state', 'city', 'town', 'administrative'];
    return broadTypes.includes(result.type) || query.split(',').length === 1 && result.importance > 0.5;
}

async function handleSearch(e) {
    e.preventDefault();
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchBtn');
    const query = input.value.trim();

    if (!query) {
        showToast('Enter a city, country, or address', 'error');
        return;
    }

    btn.classList.add('loading');
    btn.textContent = 'Searching...';

    try {
        const results = await searchLocation(query);
        clearMarkers();
        const bounds = L.latLngBounds([]);

        results.forEach(location => {
            const position = [parseFloat(location.lat), parseFloat(location.lon)];
            addMarker(position, location.display_name);
            bounds.extend(position);
        });

        const first = results[0];
        if (isBroadAreaSearch(query, first)) {
            map.flyTo(bounds.getCenter(), getZoomForResult(first), { animate: true, duration: 1.5 });
        } else {
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true, duration: 1.5 });
        }

        renderSearchResults(results);
        showToast(`${results.length} result${results.length > 1 ? 's' : ''} found`);
    } catch (error) {
        console.error(error);
        hideSearchResults();
        showToast(error.message || 'Search failed. Try another term.', 'error');
    } finally {
        btn.classList.remove('loading');
        btn.textContent = 'Search';
    }
}

function renderSearchResults(results) {
    const container = document.getElementById('searchResults');
    container.innerHTML = '';
    container.hidden = false;

    results.forEach(result => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'result-item';
        btn.textContent = result.display_name;
        btn.addEventListener('click', () => {
            const position = [parseFloat(result.lat), parseFloat(result.lon)];
            clearMarkers();
            addMarker(position, result.display_name);
            map.flyTo(position, getZoomForResult(result), { animate: true, duration: 1.2 });
            container.hidden = true;
        });
        container.appendChild(btn);
    });
}

function hideSearchResults() {
    const container = document.getElementById('searchResults');
    container.innerHTML = '';
    container.hidden = true;
}

function formatDistance(km) {
    if (distanceUnit === 'mi') {
        return (km * 0.621371).toFixed(2);
    }
    return km.toFixed(2);
}

function displayDistance(km) {
    const resultEl = document.getElementById('distanceResult');
    const valueEl = document.getElementById('distanceValue');
    valueEl.dataset.km = km;
    valueEl.textContent = formatDistance(km);
    document.getElementById('distanceUnit').textContent = distanceUnit;
    resultEl.hidden = false;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

async function handleDistanceForm(e) {
    e.preventDefault();
    const start = document.getElementById('startLocation').value.trim();
    const end = document.getElementById('endLocation').value.trim();

    if (!start || !end) {
        showToast('Enter both start and end locations', 'error');
        return;
    }

    try {
        const [startResults, endResults] = await Promise.all([
            searchLocation(start),
            searchLocation(end)
        ]);

        const startCoords = [parseFloat(startResults[0].lat), parseFloat(startResults[0].lon)];
        const endCoords = [parseFloat(endResults[0].lat), parseFloat(endResults[0].lon)];
        const distance = calculateDistance(
            startCoords[0], startCoords[1],
            endCoords[0], endCoords[1]
        );

        clearDistanceOverlays();
        clearMarkers();
        addMarker(startCoords, startResults[0].display_name);
        addMarker(endCoords, endResults[0].display_name);
        drawDistanceLine(startCoords, endCoords);
        displayDistance(distance);

        map.fitBounds(L.latLngBounds([startCoords, endCoords]), {
            padding: [80, 80],
            maxZoom: 14
        });
    } catch (error) {
        console.error(error);
        showToast('Could not calculate distance. Check both locations.', 'error');
    }
}

function handleMapClick(e) {
    if (!distanceMode) return;

    const position = [e.latlng.lat, e.latlng.lng];
    if (distanceMarkers.length >= 2) return;

    const marker = L.marker(position)
        .addTo(map)
        .bindPopup(`Point ${distanceMarkers.length + 1}`);

    distanceMarkers.push(marker);

    if (distanceMarkers.length === 2) {
        calculateDistanceFromMarkers();
        setDistanceMode(false);
    }
}

function calculateDistanceFromMarkers() {
    if (distanceMarkers.length !== 2) return;

    const start = distanceMarkers[0].getLatLng();
    const end = distanceMarkers[1].getLatLng();
    const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);

    drawDistanceLine([start.lat, start.lng], [end.lat, end.lng]);
    displayDistance(distance);

    map.fitBounds(L.latLngBounds([start, end]), {
        padding: [80, 80],
        maxZoom: 14
    });
}

function drawDistanceLine(start, end) {
    if (distanceLine) {
        map.removeLayer(distanceLine);
    }
    distanceLine = L.polyline([start, end], {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8'
    }).addTo(map);
}

function clearDistanceOverlays() {
    distanceMarkers.forEach(marker => map.removeLayer(marker));
    distanceMarkers = [];
    if (distanceLine) {
        map.removeLayer(distanceLine);
        distanceLine = null;
    }
}

function setDistanceMode(active) {
    distanceMode = active;
    const button = document.getElementById('toggleDistanceMode');

    if (active) {
        clearDistanceOverlays();
        document.getElementById('distanceResult').hidden = true;
        button.textContent = 'Cancel — click map to pick points';
        button.classList.add('active-mode');
        showToast('Click two points on the map');
    } else {
        button.textContent = 'Pick two points on map';
        button.classList.remove('active-mode');
    }
}

function toggleDistanceMode() {
    setDistanceMode(!distanceMode);
}

function locateUser() {
    if (!navigator.geolocation) {
        showToast('Geolocation is not supported in this browser', 'error');
        return;
    }

    showToast('Finding your location...');

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            const position = [latitude, longitude];

            if (userLocationMarker) {
                map.removeLayer(userLocationMarker);
            }

            userLocationMarker = L.circleMarker(position, {
                radius: 10,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.35,
                weight: 3
            }).addTo(map).bindPopup('You are here');

            map.flyTo(position, 13, { animate: true, duration: 1.5 });
            showToast('Location found');
        },
        () => {
            showToast('Unable to access your location', 'error');
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show${type === 'error' ? ' error' : ''}`;

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

window.addEventListener('load', initMap);
