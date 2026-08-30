# 🚍 MetroPulse — Real-Time Bus Tracker & Live Transit Simulator

![MetroPulse Banner](https://img.shields.io/badge/MetroPulse-v1.0.0-3b82f6?style=for-the-badge&logo=bus&logoColor=white)
![Stack](https://img.shields.io/badge/Stack-Vanilla_JS_|_Leaflet_|_Vite-10b981?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-8b5cf6?style=for-the-badge)

**MetroPulse** is a high-performance, visually stunning, real-time bus tracking and transit management web application. Built with an interactive dark-mode cartography map, dynamic GPS bus simulation, real-time arrival countdowns, passenger crowdedness meters, trip planning, live traffic jam simulation, driver cockpit HUD mode, and audio-visual alerts.

---

## ✨ Key Features

### 1. 🗺️ Interactive Live Transit Map
- **Dark-Mode Vector Cartography**: Powered by **Leaflet.js** and CartoDB Dark Matter tiles.
- **Dynamic Bus Markers**: Moving markers with smooth coordinate interpolation, route color badges, and directional arrow headings reflecting actual travel direction.
- **Interactive Bus Stops**: Clickable stop markers showcasing wheelchair accessibility, connecting lines, and live upcoming arrival boards.
- **Glowing Route Paths**: Distinct polyline routes with traffic congestion highlights (dashed yellow lines for traffic delays).

### 2. 🚍 Live Fleet & Telemetry Dashboard
- **Route Filtering**: Filter fleet by specific routes (Express Skyline, Downtown Loop, University Crosstown, Nightline, Eco Rapid).
- **Vehicle Telemetry**: Real-time vehicle speed (mph), driver assignments, odometer tracking, and passenger capacity meters.
- **Live Search**: Search by Bus ID (e.g. `BUS-101A`), stop name, or route number.

### 3. 🚏 Real-Time Arrival Countdowns
- Ticking ETA timers for every bus stop calculated using live vehicle distance and route speed physics.
- Passenger crowdedness indicators: **Low** (<40%), **Moderate** (40–75%), and **Heavy** (>75%).

### 4. 🗺️ Commuter Trip Planner
- Pick an **Origin** and **Destination** stop to calculate optimal travel itineraries.
- Supports both **Direct** routes and **1-Transfer** connection itineraries with step-by-step instructions.

### 5. 🚧 Live Traffic Congestion Injector
- Inject live traffic bottlenecks on any route segment at the click of a button.
- Watch bus marker speed drop, delay tags trigger, and stop ETAs recalculate automatically across the entire network in real-time.

### 6. 👨‍✈️ Driver Cockpit HUD Mode
- Fullscreen driver cockpit view featuring a digital speed gauge, speed limit indicator, schedule variance tracker (+0.0m / +4.5m late), passenger stop request bell chime, and door opening controls.

### 7. 🔔 Synthesized Web Audio Alerts
- Custom synthesized sound effects using the **Web Audio API** (soft double chime for bus arrivals, passenger stop bell, button click feedback).

---

## 🛠️ Technology Stack

- **Core**: HTML5 & ES6 Vanilla JavaScript (Modular Architecture)
- **Styling**: Modern Vanilla CSS3 (Glassmorphism, CSS Custom Properties, HSL color system, Responsive Grid/Flexbox)
- **Map & Cartography**: Leaflet.js v1.9.4 & CartoDB Dark Matter Vector Tiles
- **Typography & Icons**: Google Fonts (*Inter* & *JetBrains Mono*) + FontAwesome 6
- **Build & Dev Tooling**: Vite 5

---

## 📂 Project Structure

```
Hellow/
├── README.md               # Documentation & usage guide
├── index.html              # Main App entry point & DOM structure
├── package.json            # Vite configuration & scripts
├── vite.config.js          # Vite server settings
└── src/
    ├── css/
    │   ├── main.css        # Core design system, variables & CSS reset
    │   ├── components.css # Sidebar tabs, cards, HUD modal & notifications
    │   └── map.css         # Leaflet custom dark map styles & marker animations
    └── js/
        ├── app.js          # Main app orchestrator & DOM event listeners
        ├── mapEngine.js    # Leaflet map instance, polyline routes & bus markers
        ├── simulator.js    # Bus physics engine, polyline interpolation & ETA math
        ├── mockData.js     # City coordinates, route waypoints, stops & initial fleet
        ├── tripPlanner.js  # A-to-B route itinerary calculation algorithm
        └── soundEffects.js # Web Audio API sound synthesizer
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)

### Running Locally

1. Open your terminal in the project directory:
   ```bash
   cd c:\Users\Shubham\OneDrive\Desktop\hello\Hellow
   ```

2. Launch the development server using Vite:
   ```bash
   npx vite --port 3000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🎮 How to Use MetroPulse

1. **Track a Bus**: Click on any bus card in the left sidebar or bus marker on the map to open the **Tracked Bus HUD**.
2. **Check Stop ETAs**: Click on any stop icon on the map or select the **Stops** tab in the sidebar.
3. **Plan a Trip**: Go to the **Planner** tab, choose your departure and destination stops, and click **Calculate Best Route**.
4. **Simulate Traffic Jam**: Go to the **Controls** tab, select a route, and click **Inject Traffic Jam** to watch real-time ETA recalculations.
5. **Experience Driver HUD**: Click the **Driver HUD** button in the top header to enter the driver's cockpit view.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
