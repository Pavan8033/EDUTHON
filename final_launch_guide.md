# 🏆 CityFix Hackathon Final Launch Guide

**Repository:** [https://github.com/Pavan8033/EDUTHON.git](https://github.com/Pavan8033/EDUTHON.git)

Below are the exact steps you need to manually perform to deploy the codebase, verify the features, and present to the judges! Since I cannot log into Render or Vercel for you, please follow these instructions carefully.

---

## Step 1. Backend Deployment (Render)
1.  Go to [Render.com](https://render.com) and log in with your GitHub account.
2.  Click **New +** -> **Web Service**.
3.  Choose **Build and deploy from a Git repository** and connect `Pavan8033/EDUTHON`.
4.  Render will automatically configure the **Root Directory** as `backend`.
5.  Under **Environment Variables**, click **Add Environment Variable** for each of these:
    *   `MONGO_URI`: *(Paste your MongoDB Atlas connection string here)*
    *   `JWT_SECRET`: `cityfixsecret`
    *   `PORT`: `10000`
6.  Click **Deploy Web Service**.
7.  **Wait for the deployment to finish (it will say "Live").**
8.  Copy your live backend API URL (e.g., `https://cityfix-backend-[randomletters].onrender.com`). You will need this for the next step.

---

## Step 2. Frontend Deployment (Vercel)
1.  Go to [Vercel.com](https://vercel.com) and log in with your GitHub account.
2.  Click **Add New...** -> **Project**.
3.  Import the `Pavan8033/EDUTHON` repository.
4.  Set the **Root Directory** to `frontend`. It will automatically configure Vite.
5.  Expand **Environment Variables** and add:
    *   `VITE_API_BASE_URL`: *(Paste the Render Backend URL you just copied in Step 1)*
6.  Click **Deploy**.
7.  **Wait for the deployment to finish.** Vercel will provide your live frontend website URL (e.g., `https://eduthon-[randomletters].vercel.app`).

---

## Step 3. Deployment Verification Checklist
Once Vercel has finished deploying, open your Live Frontend URL.

- [ ]  Landing page loads correctly with the new modern design.
- [ ]  Login page works. (Test with `admin@cityfix.com` / `password123`)
- [ ]  Citizen dashboard loads. (Test with `citizen@cityfix.com` / `password123`)
- [ ]  Admin dashboard loads and charts appear.
- [ ]  Maintenance dashboard loads. (Test with `maintenance@cityfix.com` / `password123`)
- [ ]  City map heatmap appears correctly on the Map view.
- [ ]  Issue reporting form works correctly.
- [ ]  WebSocket real-time updates function (create an issue as a citizen, see it instantly appear on the admin dashboard).

---

## Step 4. AI Feature Verification (TensorFlow.js)
1.  Log in as a citizen.
2.  Navigate to the 'File New Report' form.
3.  Drag and drop or select an image of a common civic issue (e.g., a pothole or garbage).
4.  **Verification Check:**
    - [ ] The AI loader activates ("AI Smart Detection" section).
    - [ ] TensorFlow.js analyzes the uploaded image within the browser.
    - [ ] The predicted issue type automatically fills the Category field or is displayed below the upload box.
    - [ ] When you click 'Transmit Report', this prediction (`aiPrediction`) is saved in MongoDB.

---

## 🎤 Step 5. Hackathon Demo Preparation (The Script)
**Follow this exact flow while presenting to the judges to highlight your technical stack.**

1.  **Start:** Show the live public Vercel URL. Point out the Vite/React architecture.
2.  **Citizen Reports Issue:** Log in as `citizen@cityfix.com`. Select a photo of a pothole.
3.  **AI Detection 'Wow' Moment:** Point out the TensorFlow.js integration. Explain how replacing back-end Python microservices with edge AI in the browser reduces server load and instantly categorizes the issue.
4.  **Admin Assigns Repair:** Log in as `admin@cityfix.com` in another tab. Watch the issue appear immediately via Socket.io. Show the City Map Heatmap using Leaflet. Assign the task.
5.  **Maintenance Completes Task:** Log in as `maintenance@cityfix.com`. Resolve the issue.
6.  **Dashboard Analytics Update:** Flip back to the Admin screen. Show the Recharts dashboard instantly reflecting the resolved status.

---

## 📋 Step 6. Final Deployment Report (Template)
*Once you finish deploying, you can use this template to hand over the links to the judges.*

*   **Frontend Live URL:** `[Your Vercel URL Here]`
*   **Backend API URL:** `[Your Render URL Here]`
*   **Database:** MongoDB Atlas is fully connected and successfully processing telemetry data.
*   **Edge AI Detection:** TensorFlow.js integration verified active in browser.
*   **Status:** CityFix platform is **100% deployed and ready for hackathon presentation.**
