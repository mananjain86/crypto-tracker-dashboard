// API Realtime Data Fetch
   
let cryptoData = [];
let watchlist = [];

let pageCache = {};


async function fetchCryptoData(page) {
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=${page}`;


    if (pageCache[page]) {
        return pageCache[page]; 
    }

    try {

        const response = await fetch(apiUrl);
        const data = await response.json();


        pageCache[page] = data;

        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to retrieve data. Please try again later.");
        throw error; 
    }
}
function displayCryptoData(data, isSearch = false){
    const cryptoList = document.getElementById("crypto-list");
    cryptoList.innerHTML = '';
    if (!data || data.length === 0) {
        cryptoList.innerHTML = '<tr><td colspan="7">No matching results found.</td></tr>';
        return;
    }
    data.forEach((crypto) => {
        const row = document.createElement('tr');
        row.addEventListener('click', () => {
            
            ;
        });
            
        row.innerHTML = `
            <td> <small><i class="fa-regular fa-star" id="emptyStar" style="display:block"></i><i class="fa-solid fa-star" id="filledStar" style="display:none"></i> </small></td>
            <td>${crypto.market_cap_rank.toLocaleString()}</td>
            <td  onclick = "window.location.href = 'coinpage.html?id=${crypto.id}'"><img src="${crypto.image}" width=25px> &nbsp; <b>${crypto.name.toLocaleString()}</b> <small>(${crypto.symbol.toUpperCase()})</small>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</td>
            <td>$${crypto.current_price.toLocaleString()}</td>
            <td class="${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">${crypto.price_change_percentage_24h >= 0 ? '<i class="fa-solid fa-caret-up"></i>' : '<i class="fa-solid fa-caret-down"></i>'} ${Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%</td>
            <td>$${crypto.market_cap.toLocaleString()}</td>
            <td>$${crypto.total_volume.toLocaleString()}</td>
        `;
        cryptoList.appendChild(row);
        });

        if (!isSearch) {
            updatePagination();
        }
}




// Light and Dark theme toggle
const toggleBtn = document.getElementById("toggleBtn");
const body = document.body;
toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
});

// Login popup function
const auth = document.getElementById("login");
const popup  = document.getElementById("popup");
const closeBtn = document.getElementById("close-btn");
const complete = document.getElementById("complete");
auth.addEventListener("click", function(){
    popup.classList.add("active");
    complete.classList.add("active");

});
closeBtn.addEventListener("click", function(){
    popup.classList.remove("active");
    complete.classList.remove("active");
});

//Login - Signup Shift
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

loginBtn.addEventListener("click", () => {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    loginBtn.classList.add("active");
    signupBtn.classList.remove("active");
});
  
signupBtn.addEventListener("click", () => {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    signupBtn.classList.add("active");
    loginBtn.classList.remove("active");
});

// Search Bar Functionality
function search(event) {
    const searchTerm = event.target.value.toLowerCase().trim();

    if (!searchTerm) {
        loadPageData(); 
        return;
    }

    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const filteredData = data.filter(crypto =>
                crypto.name.toLowerCase().includes(searchTerm) || 
                crypto.symbol.toLowerCase().includes(searchTerm)
            );
            displayCryptoData(filteredData, true);
        })
        .catch(error => {
            console.error("Error fetching search results:", error);
        });
}
document.getElementById("search").addEventListener('input', search);

// Watchlist Add Button

function changeStar(button){
    // alert("Adding to Watchlist");
    // addToWatchlist.textContent = "★";
    
    const star = document.getElementById('btcToWatchlist');
    star.addEventListener('click', () => {
        star.classList.toggle('revertStar');
    })
    if (star.classList.contains('revertStar')) {
        alert("Add to Watchlist");
    } else {
        alert("Removing from Watchlist");
    }

}


// Pagination
let currentPage = 1;
function updatePagination(){
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    prevButton.disabled = currentPage === 1;
    fetchCryptoData(currentPage + 1)
    .then(data => {
        nextButton.disabled = !data || data.length === 0;
    })
    .catch(() => {
        nextButton.disabled = true; 
    });
}

function loadPageData() {

        fetchCryptoData(currentPage).then(data => {
            displayCryptoData(data);
        });
}

document.getElementById('next-page').addEventListener('click', () => {

        currentPage++;
        loadPageData();
});


document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadPageData(); 
    }
});

loadPageData();




