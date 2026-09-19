# 🚉 RailNav

### Railway Station Indoor Navigation System

> **From knowing where to go, to knowing how to get there.**

RailNav is an indoor navigation and intelligent wayfinding system designed for complex railway stations. It helps passengers navigate from their current location to platforms, facilities, exits, and other points of interest using dynamic route planning, turn-by-turn guidance, accessibility-aware routing, crowd-aware navigation, voice guidance, and an AR-assisted navigation experience.

Instead of displaying only a static station map, RailNav treats the railway station as a dynamic navigation graph and continuously adapts the passenger's route when station conditions change.

---

## 🎯 Problem

Large railway stations can be difficult to navigate, especially for passengers who are unfamiliar with the station.

Passengers may know **where** their platform or facility is, but still struggle with:

- Finding the correct route inside the station
- Navigating between multiple floors
- Locating lifts, stairs, exits, toilets, and other facilities
- Avoiding crowded corridors
- Handling temporary corridor closures
- Reaching platforms after a last-minute platform change
- Finding accessible routes for passengers with mobility requirements

Traditional signboards and static maps provide information, but they cannot dynamically guide a passenger based on changing station conditions.

---

## 💡 Solution

RailNav provides a unified indoor navigation experience that combines:

**Station Map + Graph Routing + Live Guidance + Accessibility + Dynamic Rerouting**

The station is represented internally as a graph:

- **Nodes** represent platforms, junctions, entrances, lifts, stairs, facilities, and other important locations.
- **Edges** represent walkable connections between those locations.
- **A\*** pathfinding determines an appropriate route to the selected destination.

Route costs can consider:

- Walking distance
- Crowd levels
- Accessibility requirements
- Closed or unavailable corridors

This allows RailNav to generate and update routes instead of relying on a permanently painted path.

---

## ✨ Key Features

### 🗺️ Interactive Indoor Station Map

- Multi-floor railway station layout
- Current passenger location
- Platforms and facilities
- Destination markers
- Calculated route visualization
- Floor switching
- Zoom, pan, and recenter controls

### 🧭 Turn-by-Turn Indoor Navigation

RailNav provides contextual instructions while the passenger moves through the station.

Examples:

- Continue straight
- Turn left
- Turn right
- Take the lift
- Take the stairs
- Platform ahead
- Destination reached

The passenger marker, directional arrow, navigation banner, AR guidance, and voice instructions share the same navigation state.

### 🚶 Simulated Indoor Positioning

The prototype includes a demo positioning engine that simulates a passenger walking through the station.

It supports:

- Start
- Pause
- Resume
- Step-by-step movement
- Reset
- Route progress tracking
- Heading updates
- Remaining distance
- ETA calculation

This allows the complete indoor-navigation workflow to be demonstrated without requiring physical positioning hardware inside a railway station.

### ♿ Accessibility-Aware Routing

Passengers can enable accessible navigation.

When enabled, the routing engine avoids unsuitable paths such as stairs and prioritizes accessible alternatives including:

- Lifts
- Accessible corridors
- Suitable floor transitions

### 👥 Crowd-Aware Navigation

RailNav can apply crowd penalties to station routes.

A shorter but heavily crowded corridor may therefore be replaced with a slightly longer, less congested route.

This behaviour can be demonstrated using simulated crowd conditions.

### 🚧 Dynamic Corridor Closures

If part of the station becomes unavailable, RailNav can recalculate the route from the passenger's current position.

The system updates:

- Route geometry
- Navigation instructions
- Distance
- ETA
- Voice guidance
- AR guidance

### 🚆 Train & Platform Navigation

Passengers can search for trains and navigate directly to the corresponding platform.

The prototype also demonstrates dynamic platform changes.

For example:

```text
Train destination: Platform 3
        ↓
Platform changed
        ↓
New destination: Platform 6
        ↓
Route recalculated from current position
```

### 📍 Off-Route Detection & Rerouting

The demo can simulate a passenger leaving the recommended route.

RailNav then:

1. Detects the changed position
2. Displays a rerouting state
3. Calculates a new route
4. Updates guidance
5. Continues navigation toward the original destination

### 🔊 Voice Guidance

RailNav uses browser speech synthesis to provide spoken navigation instructions.

Voice guidance is synchronized with the same navigation state used by the visual navigation system.

### 📱 AR-Assisted Navigation

RailNav includes an AR navigation experience that provides directional guidance through a camera-style interface.

Where camera access is unavailable or denied, the application provides an **AR Demo Mode** so the navigation experience can still be demonstrated.

> The current prototype does not claim production-grade indoor AR localization.

---

## 🧠 Routing Architecture

<img width="1536" height="1024" alt="ChatGPT Image Sep 19, 2026, 09_42_00 PM" src="https://github.com/user-attachments/assets/e0a24cc3-7935-4892-8e7f-8ba2e47a3f4a" />


RailNav models the station as a weighted graph.

```text
Passenger Location
        │
        ▼
Station Graph
        │
        ▼
Route Constraints
 ┌──────┼────────┐
 │      │        │
Distance Crowd Accessibility
 │      │        │
 └──────┼────────┘
        ▼
    A* Routing
        │
        ▼
Calculated Route
        │
        ▼
Navigation State
        │
 ┌──────┼───────────┐
 ▼      ▼           ▼
Map   Voice      AR Guidance
```

A conceptual route cost can be represented as:

```text
Route Cost =
Distance
+ Crowd Penalty
+ Accessibility Penalty
+ Closure Penalty
```

Closed or unsuitable paths can be heavily penalized or excluded from routing.

---

## 🔄 Unified Navigation State

One of RailNav's core architectural principles is maintaining a consistent navigation state.

The navigation system tracks:

```text
Current route segment
Current position
Segment progress
Travel heading
Distance to next maneuver
Active maneuver
Current instruction
Current floor
Remaining distance
ETA
Arrival state
```

The same guidance state is consumed by:

- Indoor map
- Passenger marker
- Direction arrow
- Turn-by-turn banner
- Voice guidance
- AR navigation

This keeps movement and navigation instructions synchronized.

---

## 🧪 Demo Scenarios

RailNav includes controls for demonstrating dynamic railway-station conditions.

### Normal Navigation

```text
Entrance A
   ↓
Search Train
   ↓
Express 12345
   ↓
Platform 6
   ↓
Calculate Route
   ↓
Start Navigation
   ↓
Turn-by-Turn Guidance
   ↓
Arrive
```

### Crowd Rerouting

```text
Normal Route
     ↓
High Crowd Detected
     ↓
Route Cost Changes
     ↓
Alternative Route Generated
```

### Accessible Navigation

```text
Standard Route
Stairs → Footbridge → Platform

Accessible Route
Lift → Accessible Corridor → Platform
```

### Platform Change

```text
Current Platform
       ↓
Platform Change
       ↓
Destination Updated
       ↓
Route Recalculated
       ↓
Navigation Continues
```

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe application development |
| Vite | Development and production build tooling |
| Tailwind CSS | Responsive interface styling |
| A* Pathfinding | Indoor route calculation |
| Web Speech API | Voice navigation |
| MediaDevices API | Camera access for AR experience |
| SVG / Web UI | Interactive indoor station visualization |

---

## 📂 Project Structure

```text
railnav-indoor-navigation/
│
├── src/
│   ├── components/
│   │   ├── map/
│   │   ├── navigation/
│   │   └── ar/
│   │
│   ├── context/
│   │   └── NavigationContext.tsx
│   │
│   ├── engine/
│   │   ├── routingEngine.ts
│   │   ├── instructionEngine.ts
│   │   └── positionProvider.ts
│   │
│   └── ...
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Running RailNav Locally

### Prerequisites

Install:

- Node.js
- npm

No Google AI Studio installation is required to run the application.

The current RailNav prototype does **not require a Gemini API key** for its core navigation functionality.

### 1. Clone the Repository

```bash
git clone https://github.com/vipshwetha2007-design/railnav-indoor-navigation.git
```

### 2. Enter the Project

```bash
cd railnav-indoor-navigation
```

### 3. Install Dependencies

```bash
npm install
```

If dependency resolution requires it in your environment:

```bash
npm install --legacy-peer-deps
```

### 4. Start Development Server

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

---

## 📦 Production Build

Create a production build with:

```bash
npm run build
```

The generated production files will be available in:

```text
dist/
```

TypeScript can also be verified using:

```bash
npx tsc --noEmit
```

---

## 🎬 Recommended Demo Flow

For a complete demonstration:

1. Enter as a demo passenger.
2. Search for **Express 12345**.
3. Select **Platform 6**.
4. Generate the indoor route.
5. Start navigation.
6. Start the simulated walk.
7. Observe synchronized movement and turn instructions.
8. Demonstrate a floor transition.
9. Open AR navigation.
10. Simulate high crowd conditions.
11. Demonstrate alternative routing.
12. Enable accessible navigation.
13. Simulate a corridor closure.
14. Demonstrate a platform change.
15. Trigger an off-route event.
16. Allow RailNav to reroute.
17. Reach Platform 6.

---

## ⚠️ Prototype Scope

RailNav currently demonstrates the navigation architecture using a prototype station and simulated dynamic conditions.

The following are simulated in the current prototype:

- Indoor passenger positioning
- Crowd conditions
- Corridor closures
- Platform-change events

This allows the routing and navigation architecture to be tested without requiring deployment inside a physical railway station.

---

## 🔮 Future Scope

A production implementation could integrate:

- BLE beacon-based indoor positioning
- Wi-Fi positioning
- QR checkpoint localization
- UWB positioning
- Computer-vision localization
- Real railway train-status APIs
- Live platform information
- Station IoT sensors
- Real-time crowd-density systems
- Emergency evacuation routing
- Multi-language voice navigation
- Larger multi-station indoor map datasets
- Advanced AR localization

The existing navigation architecture can then consume real positioning and station data instead of simulated prototype data.

---

## 🌍 Vision

RailNav aims to transform railway stations from environments passengers must understand themselves into environments that can actively guide them.

> **The passenger should not need to understand the station.  
> The navigation system should understand it for them.**

---

## 📄 License

This project is currently developed as a prototype for demonstration and hackathon purposes.
