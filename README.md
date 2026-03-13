# CityFix – Smart Urban Civic Issue Reporting System
**Ultra-Premium Dark Mode SaaS Edition** 🚀

CityFix is a comprehensive, production-ready smart-city management platform designed to connect citizens with municipal maintenance operations. Built on the MERN stack with a cutting-edge Dark Glassmorphism UI, it features real-time geographic heatmaps, priority telemetry, and dynamic issue lifecycle tracking.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Shadcn UI (Custom), Framer Motion, Recharts, React-Leaflet
- **Backend**: Node.js, Express, MongoDB (Mongoose), Local Multer Image Uploads
- **Authentication**: JWT & bcryptjs with Role-Based Access Control (RBAC)

---

## 🚀 Local Setup Instructions

### 1. Start the Backend Server
Open a terminal and navigate to the backend folder:
```bash
cd backend
npm install
npm run dev
```
*(The backend runs on `http://localhost:5000`)*

### 2. Start the Frontend Application
Open a **second** terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
npm run dev
```
*(The frontend runs on `http://localhost:5173` or `5174` depending on availability).*

---

## 🎬 Hackathon Demo Workflow
The database has been pre-seeded with 16+ geographically distributed issue points, a heatmap cluster, and 6 active user accounts.

### Step 1: Citizen Reporting (Sarah)
1. Navigate to `/login` and sign in as **citizen@example.com** (Password: `password123`).
2. Show the **Citizen Dashboard** (statistics, recent reports).
3. Go to **Report Issue**:
   - Upload a photo of a pothole.
   - Use the Map Picker to select a location in Mumbai.
   - Set priority to `High`.
   - Submit the issue and watch the dashboard metrics update instantly.

### Step 2: Admin Telemetry & Dispatch (Director)
1. Logout and sign back in as **admin@city.gov** (Password: `password123`).
2. Show the **Admin Dashboard**:
   - Highlight the Recharts analytics (Area and Pie graphs reflecting the new complaint).
   - Use the table to find Sarah's new issue and **Assign** it to `Field Lead Alpha`.
3. Go to the **City Issue Map**:
   - Toggle the **Heatmap Layer (Layers icon)** to show the density of unresolved issues.
   - Click the "High Priority" markers to preview the sleek side-panel incident data.

### Step 3: Maintenance Field Execution (Alpha)
1. Logout and sign back in as **alpha@city.gov** (Password: `password123`).
2. Show the **Maintenance Panel**:
   - Note that Sarah's issue is now in the "Assigned Tasks" queue.
   - Click "Update" to move the status from `Assigned` → `In Progress`.
   - Take action to move it to `Resolved` (simulating the physical repair).

### Step 4: Resolution & Notification (Sarah)
1. Log back in as **citizen@example.com**.
2. Notice the "Pending" metrics have decreased and "Resolved" has increased. The city is safer!

---

### Demo Accounts
*(All passwords are `password123`)*
- Admin: `admin@city.gov`
- Citizen: `citizen@example.com`
- Maintenance: `alpha@city.gov`

*Designed for the Smart City Initiative.*
