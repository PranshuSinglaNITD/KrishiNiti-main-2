# 🌾 KrishiNiti — Field-to-Profit AI

> Strategy First. Profit Follows.

KrishiNiti is an AI-powered platform that helps farmers **decide when to harvest and where to sell** their crops for maximum profit using real-time data, ML predictions, and optimization.

---

## 🚀 Project Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open: http://localhost:3000

---

## 📁 Folder Structure

```bash
frontend/
│
├── app/                 # Next.js pages (UI + API routes)
├── components/          # Reusable UI components
├── core/                # AI & decision-making logic (MAIN BRAIN)
├── services/            # External data fetching (APIs)
├── utils/               # Helper functions
├── types/               # TypeScript types
├── data/                # Mock data for demo
```

---

## 🧠 Architecture Overview

KrishiNiti follows a **layered AI pipeline**:

```
Farmer Input
   ↓
Data Fetch (Weather + Mandi + Satellite)
   ↓
ML Models (Harvest + Price Prediction)
   ↓
Profit Optimization Engine
   ↓
Final Recommendation (Best Mandi + Best Time)
```

---

## ⚙️ Core Modules

### 🔹 Orchestrator (`core/orchestrator.ts`)

Controls the full pipeline:

* Fetches data
* Runs models
* Computes profit
* Returns final recommendation

### 🔹 Market Intelligence

* Mandi price analysis
* Trend prediction

### 🔹 Harvest Intelligence

* Optimal harvest window
* Weather + crop analysis

### 🔹 Profit Optimization

* Net profit calculation
* Transport cost deduction

---

## 📊 Demo Flow

1. User enters:

   ```
   "50 quintal wheat, Hoshangabad, harvest in 10 days"
   ```

2. System responds:

   ```
   Wait 4 days  
   Sell at Itarsi mandi (42km)  
   Expected profit: ₹7,900
   ```

---

## 🔧 Tech Stack

* **Frontend:** Next.js + Tailwind CSS
* **Backend:** Node.js (API routes)
* **AI/ML (planned):** XGBoost, LightGBM
* **Data Sources:**

  * Agmarknet (mandi prices)
  * IMD / Open-Meteo (weather)
  * ISRO (satellite data)

---

## 🧪 Current Status

* ✅ UI complete
* ✅ Demo working (mock AI)
* 🚧 ML models (to be integrated)
* 🚧 Real API connections (in progress)

---

## 🎯 Future Scope

* WhatsApp chatbot integration
* Voice-based advisory system
* Real-time satellite data
* Government scheme integration

---

## 🏆 Hackathon Focus

This project demonstrates:

* Real-world problem solving
* Data-driven AI pipeline
* Scalable architecture
* High-impact farmer use case

---

## 🤝 Team

**Dhurandhar Team**
HackIndia Spark 6 | NIT Delhi

---

## 📌 Tagline

**“From Field to Profit — Powered by Data”**
