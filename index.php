<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GlobeRoute — World Map Explorer</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link href="css/style.css" rel="stylesheet">
</head>
<body>
    <div class="app">
        <header class="app-header">
            <div class="brand">
                <span class="brand-icon" aria-hidden="true">🌍</span>
                <div>
                    <h1 class="brand-title">GlobeRoute</h1>
                    <p class="brand-tagline">Search anywhere. Measure any distance.</p>
                </div>
            </div>
            <div class="header-actions">
                <div class="unit-toggle" role="group" aria-label="Distance unit">
                    <button type="button" class="unit-btn active" data-unit="km">km</button>
                    <button type="button" class="unit-btn" data-unit="mi">mi</button>
                </div>
            </div>
        </header>

        <main class="app-main">
            <aside class="sidebar" aria-label="Map controls">
                <nav class="sidebar-tabs" role="tablist">
                    <button type="button" class="tab-btn active" data-tab="search" role="tab" aria-selected="true">Search</button>
                    <button type="button" class="tab-btn" data-tab="distance" role="tab" aria-selected="false">Distance</button>
                    <button type="button" class="tab-btn" data-tab="explore" role="tab" aria-selected="false">Explore</button>
                </nav>

                <div class="tab-panel active" id="panel-search" role="tabpanel">
                    <form id="searchForm" class="panel-form">
                        <label for="searchInput" class="field-label">Find a place worldwide</label>
                        <div class="input-group">
                            <input type="text" class="field-input" id="searchInput" placeholder="City, landmark, address..." autocomplete="off">
                            <button type="submit" class="btn btn-primary" id="searchBtn">Search</button>
                        </div>
                    </form>
                    <div id="searchResults" class="results-list" hidden></div>
                </div>

                <div class="tab-panel" id="panel-distance" role="tabpanel" hidden>
                    <form id="distanceForm" class="panel-form">
                        <label for="startLocation" class="field-label">From</label>
                        <input type="text" class="field-input" id="startLocation" placeholder="Start location">

                        <label for="endLocation" class="field-label">To</label>
                        <input type="text" class="field-input" id="endLocation" placeholder="End location">

                        <button type="submit" class="btn btn-primary w-full">Calculate route distance</button>
                    </form>

                    <button type="button" id="toggleDistanceMode" class="btn btn-secondary w-full">
                        Pick two points on map
                    </button>

                    <div id="distanceResult" class="result-card" hidden>
                        <span class="result-label">Straight-line distance</span>
                        <strong class="result-value"><span id="distanceValue">0</span> <span id="distanceUnit">km</span></strong>
                    </div>
                </div>

                <div class="tab-panel" id="panel-explore" role="tabpanel" hidden>
                    <p class="panel-hint">Jump to iconic cities around the world.</p>
                    <ul class="explore-list" id="featuredPlaces"></ul>
                </div>
            </aside>

            <div class="map-wrapper">
                <div id="map" class="map-container"></div>
                <button type="button" id="locateBtn" class="map-fab" title="Go to my location" aria-label="Go to my location">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                    </svg>
                </button>
            </div>
        </main>

        <div id="toast" class="toast" role="status" aria-live="polite"></div>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="js/map.js"></script>
</body>
</html>
