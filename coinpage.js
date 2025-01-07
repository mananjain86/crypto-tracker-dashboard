const toggleBtn = document.getElementById("toggleBtn");
const body = document.body;
toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
});

// to extract query parameters from the URL of the current webpage
const params = new URLSearchParams(window.location.search);
const cryptoId = params.get('id');


const detailsUrl = `https://api.coingecko.com/api/v3/coins/${cryptoId}`;
if (!cryptoId) {
    document.getElementById("coin-details").innerHTML = `<p>Invalid cryptocurrency ID.</p>`;
} else {
fetch(detailsUrl)
.then(response => response.json())
.then(data => {
    let description = data.description.en;
    const coinData = document.getElementById("coin-data");
    console.log(data);
    description = description.split('. ')[0] + '.' + description.split('. ')[1] + '.';

    coinData.innerHTML = `
        <h3><img src="${data.image.large}" alt="${data.name} logo" width=25px> ${data.name} (${data.symbol.toUpperCase()}) <small><i class="fa-regular fa-star" id="emptyStar"  style="float: right; display: block"></i> <i class="fa-solid fa-star" id="filledStar"  style="float: right; display: none"></i></small></h3>
        <h1 id="priceOfCoin">$${data.market_data.current_price.usd.toLocaleString()} </h1>
        <span class="${data.market_data.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}"> ${data.market_data.price_change_percentage_24h >= 0 ? '<i class="fa-solid fa-caret-up"></i>' : '<i class="fa-solid fa-caret-down"></i>'} ${Math.abs(data.market_data.price_change_percentage_24h).toFixed(2)}%</span>
        <p style="padding-bottom:20px; padding-top:15px">${description}</p>
        <div id="coinDetails">
        <p><small>Market Cap Rank</small> <strong><span style="float: right">${data.market_cap_rank}</span> </strong></p>
        <p><small>Current Price</small> <span style="float: right"><strong>$${data.market_data.current_price.usd.toLocaleString()}</strong></span></p>
        <p><small>Market Cap</small> <span style="float: right"><strong>$${data.market_data.market_cap.usd.toLocaleString()}</strong></span></p>
        <p><small>Fully Diluted Valuation(FDV)</small> <span style="float: right"><strong>$${data.market_data.fully_diluted_valuation.usd.toLocaleString()}</strong></span></p>
        <p><small>Market Cap/FDV</small><span style="float: right"><strong> ${data.market_data.market_cap_fdv_ratio}</strong></span></p>
        <p><small>Total Trading Volume</small><span style="float: right"><strong>$${data.market_data.total_volume.usd.toLocaleString()}</strong></span></p>
        <p><small>Circulating Supply</small><span style="float: right"><strong>${data.market_data.circulating_supply.toLocaleString()}</strong></span></p>
        <p><small>Total Supply</small><span style="float: right"><strong>${data.market_data.total_supply.toLocaleString()}</strong></span></p>
        <p><small>Max Supply</small><span style="float: right"><strong>${data.market_data.max_supply ? data.market_data.max_supply.toLocaleString(): '∞' }</strong></span></p>
        <p><small>All Time High</small><span style="float: right"><strong>$${data.market_data.ath.usd.toLocaleString()}</strong></span></p>
        <p><small>All Time Low</small><span style="float: right"><strong>$${data.market_data.atl.usd.toLocaleString()}</strong></span></p>
        </div>
        <div class="priceData">
        <h3>Price Change</h3>
        <p><small>1 HOUR</small><span style="float: right"><strong> $${data.market_data.price_change_percentage_1h_in_currency.usd}</strong></span></p>
        <p><small>1 DAY</small><span class="${data.market_data.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}" style="float: right"><strong>${data.market_data.price_change_percentage_24h >= 0 ? '<i class="fa-solid fa-caret-up"></i>' : '<i class="fa-solid fa-caret-down"></i>'} ${Math.abs(data.market_data.price_change_percentage_24h).toFixed(2)}%</strong></span></p>
        <p><small>1 WEEK</small><span class="${data.market_data.price_change_percentage_7d >= 0 ? 'positive' : 'negative'}" style="float: right"><strong>${data.market_data.price_change_percentage_7d >= 0 ? '<i class="fa-solid fa-caret-up"></i>' : '<i class="fa-solid fa-caret-down"></i>'} ${Math.abs(data.market_data.price_change_percentage_7d).toFixed(2)}%</strong></span></p>
        <p><small>1 MONTH</small><span class="${data.market_data.price_change_percentage_30d >= 0 ? 'positive' : 'negative'}" style="float: right"><strong>${data.market_data.price_change_percentage_30d >= 0 ? '<i class="fa-solid fa-caret-up"></i>' : '<i class="fa-solid fa-caret-down"></i>'} ${Math.abs(data.market_data.price_change_percentage_30d).toFixed(2)}%</strong></span></p>
        <p><small>1 YEAR</small><span class="${data.market_data.price_change_percentage_1y >= 0 ? 'positive' : 'negative'}" style="float: right"><strong>${data.market_data.price_change_percentage_1y >= 0 ? '<i class="fa-solid fa-caret-up"></i>' : '<i class="fa-solid fa-caret-down"></i>'} ${Math.abs(data.market_data.price_change_percentage_1y).toFixed(2)}%</strong></span></p>
        </div>
        
    `;
})
    .catch(error => {
        console.error("Error fetching details:", error);
        alert("Failed to load details. Please try again later.")
        // document.getElementById("coin-data").innerHTML = `<p>Failed to load details. Please try again later.</p>`;
    });  
}

function btnClick(){
    const btn_24h = document.getElementById("chart_24h");
    const btn_7d = document.getElementById("chart_7d");
    const btn_30d = document.getElementById("chart_30d");
    const btn_1y = document.getElementById("chart_1y");
    let days = 1;
    
    btn_24h.addEventListener("click", () => {
        days = 1;
        btn_24h.classList.add("selected");
        btn_7d.classList.remove("selected");
        btn_30d.classList.remove("selected");
        btn_1y.classList.remove("selected");

        
    })
    btn_7d.addEventListener("click", () => {
        days = 7;
        btn_7d.classList.add("selected");
        btn_24h.classList.remove("selected");
        btn_30d.classList.remove("selected");
        btn_1y.classList.remove("selected");

    })
    btn_30d.addEventListener("click", () => {
        days = 30;
        btn_30d.classList.add("selected");
        btn_24h.classList.remove("selected");
        btn_7d.classList.remove("selected");
        btn_1y.classList.remove("selected");

    })
    btn_1y.addEventListener("click", () => {
        days = 365;
        btn_1y.classList.add("selected");
        btn_24h.classList.remove("selected");
        btn_7d.classList.remove("selected");
        btn_30d.classList.remove("selected");
    })
}


let chartInstance; 

async function fetchChartData(days) {
    const apiUrl = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const timestamps = data.prices.map(price => new Date(price[0]).toLocaleDateString());
        const prices = data.prices.map(price => price[1]);

        updateChart(timestamps, prices);
    } catch (error) {
        console.error('Error fetching chart data:', error);
    }
}
function updateChart(timestamps, prices) {
    if (chartInstance) {
        chartInstance.data.labels = timestamps;
        chartInstance.data.datasets[0].data = prices; 
        chartInstance.update();
    } else {
        createChart(timestamps, prices); 
    }
}
function createChart(timestamps, prices) {
    const ctx = document.getElementById('cryptoChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps, 
            datasets: [{
                label: `${cryptoId.toUpperCase()} Price (USD)`,
                data: prices, 
                borderColor: 'hsl(219, 88%, 57%)',
                fill: true,
                backgroundColor: 'hsla(219, 88.10%, 57.10%, 0.13)',
                tension: 0.1,
                pointRadius: 0,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'nearest',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    type: 'category', 
                    title: {
                        display: true,
                        text: 'Date',
                    },
                    
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (USD)',
                    },
                    ticks: {
                        beginAtZero: false,
                        callback: function(value) {
                            return '$' + value.toLocaleString(); 
                        }
                    }
                }
            },
            animation: {
                duration: 500,
                easing: 'easeIn'
            }
        }
    });
}

btnClick();


function changeTimeframe(days) {
    fetchChartData(days); 
}

fetchChartData(1);
