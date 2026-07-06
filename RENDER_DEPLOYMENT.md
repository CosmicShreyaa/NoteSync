# Deploying NoteSync to Render

This guide outlines step-by-step instructions for hosting both the **ExpressJS API** and the **TanStack Start React Frontend** on Render, using **MongoDB Atlas** as the database.

---

## Step 1: Set Up MongoDB Atlas (Database)

Render does not host free MongoDB databases directly, so using MongoDB Atlas (free tier) is the recommended path.

1. Sign up/log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **Database Cluster** (select the **M0 Free** tier).
3. In the Security settings:
   - **Database Access**: Create a database user with a username and password.
   - **Network Access**: Add IP Address `0.0.0.0/0` (allows Render to connect from anywhere since Render's server IPs can rotate).
4. Go to **Database** (clusters view), click **Connect** on your cluster, and choose **Drivers** (Node.js).
5. Copy the **Connection String** (URI). It will look similar to this:
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
   *Remember to replace `<username>` and `<password>` with the database user details you created.*

---

## Step 2: Deploy the ExpressJS API (Backend)

We will deploy the Express backend as a **Web Service** on Render.

1. Log in to [Render](https://render.com).
2. Click **New** (top right) and select **Web Service**.
3. Connect your Git repository.
4. Configure the Web Service settings:
   - **Name**: `notesync-api`
   - **Root Directory**: `server` (or leave empty if building from the root)
   - **Language**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Select **Free**
5. Click **Advanced** to add **Environment Variables**:
   - `MONGODB_URI`: *Your MongoDB connection string copied from Step 1.*
   - `PORT`: `10000` (Render allocates this dynamically, but setting this is a good practice)
6. Click **Create Web Service**. 
7. Once deployed, Render will provide a public URL (e.g., `https://notesync-api.onrender.com`). Copy this URL.

---

## Step 3: Deploy the TanStack Start Frontend

Since TanStack Start is a full-stack framework utilizing a Nitro Node server for SSR (Server-Side Rendering), we must deploy the frontend as a **Web Service** on Render as well.

1. Click **New** (top right) and select **Web Service**.
2. Connect your Git repository (same repo).
3. Configure the Web Service settings:
   - **Name**: `notesync-frontend`
   - **Root Directory**: *(leave blank to deploy from the root)*
   - **Language**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `node .output/server/index.mjs`
   - **Instance Type**: Select **Free**
4. Click **Advanced** to add **Environment Variables**:
   - `VITE_API_URL`: *The URL of your deployed Express API (e.g., `https://notesync-api.onrender.com`). Do not include a trailing slash.*
5. Click **Create Web Service**.
6. Once deployment finishes, you can navigate to the frontend URL provided by Render to access the live collaborative notes workspace.
