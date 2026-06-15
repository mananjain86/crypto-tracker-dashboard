# CryptoGaze Tracker 🚀

A premium, full-stack cryptocurrency dashboard delivering sub-second real-time market data, interactive historical charts, and decentralized Web3 community sentiment voting.

## 🌟 Key Features
- **Real-Time Market Data:** Live price updates powered by **Binance WebSockets**.
- **Interactive Charts:** Comprehensive historical market data provided by the **CoinGecko REST API**, fetched directly from the client to bypass strict server rate limits.
- **Web3 Sentiment Voting:** A fully decentralized voting system leveraging a custom **Solidity Smart Contract** deployed on the Ethereum testnet. Connect via **MetaMask** using `ethers.js` to cast verifiable on-chain votes (with a 0-ETH fallback mechanism).
- **Authentication & Security:** Robust custom backend with **MongoDB** and **JWT** session management, integrated seamlessly with **Google OAuth** for 1-click user onboarding.
- **Premium UI/UX:** Responsive, glassmorphic design utilizing **TailwindCSS** and **Chart.js**.

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, TailwindCSS 4, Chart.js, ethers.js, `@react-oauth/google`
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs
- **APIs/Services:** Binance WebSockets, CoinGecko API, Google Cloud Console (OAuth)
- **Blockchain:** Solidity, MetaMask
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## 📂 Repository Structure
```text
backend/           # Node/Express API (Auth, DB Caching, Vote Logging)
frontend/          # React + Vite application
contracts/         # Solidity Smart Contracts (Voting.sol)
```

---

## ⚙️ Environment Variables Setup

### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secure-random-string
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_VOTING_CONTRACT_ADDRESS=your-deployed-smart-contract-address (Optional)
```
*(Note: If `VITE_VOTING_CONTRACT_ADDRESS` is left blank, the app will gracefully fallback to 0-ETH data transactions for Web3 voting).*

---

## 🚀 Local Development

### 1. Install Dependencies
```bash
# Install Backend deps
cd backend
npm install

# Install Frontend deps
cd ../frontend
npm install
```

### 2. Start the Development Servers
Open two separate terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## 🌐 Deployment Instructions

### Backend (Render)
1. Push the repository to GitHub.
2. Connect the repository to a new **Web Service** on [Render](https://render.com).
3. Set the Build Command to `npm install` and the Start Command to `node index.js`.
4. Add your `MONGODB_URI` and `JWT_SECRET` to the Render Environment Variables.

### Frontend (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set the Framework Preset to **Vite**.
3. In Environment Variables, set:
   - `VITE_API_BASE_URL` to `https://your-render-url.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID` to your Google OAuth ID.
   - `VITE_VOTING_CONTRACT_ADDRESS` to your deployed contract address (if applicable).
4. Deploy!

*(⚠️ Important: Ensure your Vercel URL is added to the "Authorized JavaScript origins" in your Google Cloud Console, and to the CORS whitelist inside `backend/index.js`)*.

---

## 📜 Smart Contract Deployment
To deploy the voting contract:
1. Go to [Remix IDE](https://remix.ethereum.org/).
2. Paste the contents of `contracts/Voting.sol`.
3. Compile using the Solidity compiler.
4. Go to "Deploy & Run Transactions", set the environment to **Injected Provider - MetaMask**.
5. Connect your wallet (on Sepolia or another testnet) and click **Deploy**.
6. Copy the resulting contract address into your frontend environment variables.

---
## License
ISC
