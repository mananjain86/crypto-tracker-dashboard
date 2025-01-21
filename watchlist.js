import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase, get, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyAA136fBD1NQEaa_X6PSBp2-W-9PvX541s",
  authDomain: "crypto-tracker-b26cf.firebaseapp.com",
  projectId: "crypto-tracker-b26cf",
  storageBucket: "crypto-tracker-b26cf.firebasestorage.app",
  messagingSenderId: "602351349910",
  appId: "1:602351349910:web:54b857cf388080f41252b7",
  measurementId: "G-E43K8SFMRZ"
};
// let pageCache = {};
async function fetchCryptoData(apiUrl) {
    // const apiUrl = `https://api.coingecko.com/api/v3/coins/${crypto}`;

    

    try {

        const response = await fetch(apiUrl);
        const data = await response.json();


        // pageCache[page] = data;

        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to retrieve data. Please try again later.");
        throw error; 
    }
}
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getDatabase();
onAuthStateChanged(auth, (user) => {
    if (user) {
        const cryptoList = document.getElementById("crypto-list");
        const watchlistRef = ref(db, `Watchlist/${user.uid}`);
        async function getWatchlist() {
            let count = 1;
            const snapshot = await get(watchlistRef);
            const ids = snapshot.val();
            ids.forEach(coinid => {
                const coinUrl = `https://api.coingecko.com/api/v3/coins/${coinid}`;
                fetchCryptoData(coinUrl).then(crypto => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${count++}</td>
                    <td  onclick = "window.location.href = 'coinpage.html?id=${coinid}'"><img src="${crypto.image.large}" width=25px> &nbsp; <b>${crypto.name.toLocaleString()}</b> <small>(${crypto.symbol.toUpperCase()})</small>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</td>
                    <td>$${crypto.market_data.current_price.usd.toLocaleString()}</td>
                    <td class="${crypto.market_data.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">${crypto.market_data.price_change_percentage_24h >= 0 ? '<i class="fa-solid fa-caret-up"></i>' : '<i class="fa-solid fa-caret-down"></i>'} ${Math.abs(crypto.market_data.price_change_percentage_24h).toFixed(2)}%</td>
                    <td>$${crypto.market_data.market_cap.usd.toLocaleString()}</td>
                    <td>$${crypto.market_data.total_volume.usd.toLocaleString()}</td>
                `;
                cryptoList.appendChild(row);
            });
            });
        }
        getWatchlist();
    }
});
