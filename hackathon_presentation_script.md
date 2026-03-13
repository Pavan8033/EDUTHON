# 🏆 CityFix Hackathon Demo Script & Deployment Guide

## 🌐 1. Deployment Execution Guide

**Because I automated your GitHub repository (`github.com/Pavan8033/EDUTHON.git`), deploying takes less than 3 minutes. Here are the exact steps to get your URLs:**

### Part A: Backend (Render)
1. Log into **[Render](https://render.com/)** with GitHub.
2. Click **New +** -> **Web Service** -> Build from Git -> Connect `Pavan8033/EDUTHON`.
3. Render will use the `render.yaml` file to auto-configure everything.
4. Scroll to **Environment Variables** and add:
   - `MONGO_URI`: `mongodb+srv://BLACKSQUAD123:Pavan%4012345@blacksquad.1paqsyp.mongodb.net/civic-issues?appName=BLACKSQUAD`
   - `JWT_SECRET`: `cityfixsecret`
   - `PORT`: `10000`
5. Click **Deploy Web Service** and wait for the "🟢 Live" badge. Copy the URL.

### Part B: Frontend (Vercel)
1. Log into **[Vercel](https://vercel.com/)** with GitHub.
2. Click **Add New** -> **Project** -> Import `Pavan8033/EDUTHON`.
3. Set **Root Directory** to `frontend`.
4. Open **Environment Variables** and add:
   - `VITE_API_BASE_URL`: *(Paste your Render backend URL here)*
5. Click **Deploy**. Vercel will output your final `https://your-project.vercel.app` URL.

---

## 🎤 2. Presentation Demo Script for Judges

**Use this script when you are standing in front of the judges to highlight the technical achievements of the MERN stack + AI.**

### Stage 1: The Citizen Experience & AI Detection
1. Open your Vercel URL and log in as `citizen@cityfix.com` (password: `password123`).
2. Show the Modern Deep Dark SaaS Dashboard and the custom statistics.
3. Click **"File New Report"**.
4. **The "WOW" Moment**: Select an image of a pothole or a pile of garbage from your computer and drop it into the upload box.
5. **Say this**: *"Instead of asking citizens to manually classify complex issues, we embedded an edge-computing Machine Learning model (TensorFlow.js MobileNet) directly into the browser. Watch the AI instantly analyze the pixel data and automatically classify this as a Pothole Priority incident—with zero server-side processing latency."*
6. Point to the spinning AI Validation UI and show how it tags the database payload. Click **Transmit Report**.
7. Log out.

### Stage 2: Admin Dispatch & Real-Time Syncing
1. Log in as `admin@cityfix.com` (password: `password123`).
2. **Say this**: *"Our Express backend utilizes a highly optimized REST API connected to a cloud-clustered MongoDB Atlas database. Admins see city-wide data aggregated on this Recharts analytics board."*
3. Click on the **City Map** link.
4. **Say this**: *"Here is our Spatial Analytics engine. Using Carto dark tiles and actual GPS coordinates seeded in Mumbai, we generate a dynamic Heatmap using `leaflet.heat` to identify infrastructure failure hotspots."*
5. Go back to the Dashboard, find the issue you just created, and assign it to `Field Lead Alpha`.
6. Log out.

### Stage 3: Maintenance & Resolution
1. Log in as `maintenance@cityfix.com` (password: `password123`).
2. **Say this**: *"Our field workers receive instant assignments on their mobile-responsive terminals. The entire application uses secure JWT payload validation and bcrypt hashing to enforce strict Role-Based Access Control."*
3. Show the detailed Issue card (which contains the AI Prediction tag).
4. Click **Resolve Node**. Upload a dummy "fixed" photo.
5. **Say this**: *"As the issue is resolved, our cross-platform MERN architecture guarantees that the Citizen and the Admin immediately see the completed status updating their metrics in real-time."*

---

## ✅ Deployment Verification Checklist
Before you walk up to the stage, make sure:
- [ ] Vercel URL loads the `index.html` without errors.
- [ ] Render URL is fully synced and not sleeping.
- [ ] TensorFlow.js triggers the loading spinner when dropping an image.
- [ ] Heatmap nodes appear over Mumbai on the Map page.

You are 100% prepared. Go win this Hackathon! 🚀
