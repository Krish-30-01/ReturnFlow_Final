# 🚚 ReturnFlow — Smart Return Load Matching Platform (SIH)

> **ReturnFlow** is an intelligent logistics and freight backhaul matching platform connecting truck owners on empty return trips with shippers and retailers requiring fast, discounted partial-load freight movement.

---

## 🌟 Key Features

### 1. 🚛 Truck Driver Portal
- **Return Trip Registration**: Post available spare payload capacity, departure corridors, and time windows.
- **Interactive Revenue Telemetry**: Dynamic 30-day earnings trend chart with custom Recharts data visualization.
- **Trip Lifecycle Management**: Quick-action cards (View, Edit, Cancel) with state feedback.
- **Earnings & Escrow Tracking**: Clear visibility into held vs. settled earnings and automated payouts.

### 2. 🏬 Retailer / Shipper Portal
- **Active Load Management**: Post consignments with dimensions, weight, goods category, and target budgets.
- **Savings Analytics**: Interactive charts showing cumulative shipper savings compared to spot market rates.
- **Live Status Badges**: Pulsing radar badges for real-time shipment monitoring (`Searching`, `Booked (In Transit)`, `Delivered`).

### 3. 🧠 Smart Match Engine
- **Multi-Dimensional AI Scoring**: Calculates match scores (0–100%) based on route overlap, capacity fit, time window compatibility, and pricing efficiency.
- **Animated Progress Ring Gauges**: Visual circular SVG rings with color-coded score bands:
  - 🟢 **Green (90%+)**: Excellent Match
  - 🟠 **Amber (70–89%)**: Good Match
  - 🔴 **Coral (<70%)**: Partial Match
- **Expandable Score Breakdown**: Inspect route overlap %, capacity fit %, time window %, and price score %.
- **Staggered Card Transitions**: Smooth animated cascade of match results.

### 4. 🛰️ Live GPS Route Tracking & Telemetry
- **Corridor Map Simulation**: Vector path visualizer following real highway corridors with animated truck markers.
- **Real-Time ETA Countdown**: Active ticking countdown clock (`HH:MM:SS`) with color warnings.
- **Stage Progression Stepper**: Interactive tracking from `Booked` → `Picked Up` → `In Transit` → `Delivered`.
- **Driver Contact Card**: Integrated driver identity card with ratings, vehicle telemetry, direct call trigger, and in-app chat.

### 5. 🛡️ Secure Payment Escrow
- Automated milestone-based escrow hold and release mechanism protecting both truckers and shippers.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism Design Tokens
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) + CSS Keyframe Micro-interactions
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Krish-30-01/ReturnFlow.git
   cd ReturnFlow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 👥 Team
Smart India Hackathon (SIH) Project
