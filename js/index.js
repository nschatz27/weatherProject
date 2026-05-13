const stateAbbrev = {
    "Alabama": "AL","Alaska": "AK","Arizona": "AZ","Arkansas": "AR",
    "California": "CA","Colorado": "CO","Connecticut": "CT","Delaware": "DE",
    "Florida": "FL","Georgia": "GA","Hawaii": "HI","Idaho": "ID",
    "Illinois": "IL","Indiana": "IN","Iowa": "IA","Kansas": "KS",
    "Kentucky": "KY","Louisiana": "LA","Maine": "ME","Maryland": "MD",
    "Massachusetts": "MA","Michigan": "MI","Minnesota": "MN","Mississippi": "MS",
    "Missouri": "MO","Montana": "MT","Nebraska": "NE","Nevada": "NV",
    "New Hampshire": "NH","New Jersey": "NJ","New Mexico": "NM","New York": "NY",
    "North Carolina": "NC","North Dakota": "ND","Ohio": "OH","Oklahoma": "OK",
    "Oregon": "OR","Pennsylvania": "PA","Rhode Island": "RI","South Carolina": "SC",
    "South Dakota": "SD","Tennessee": "TN","Texas": "TX","Utah": "UT",
    "Vermont": "VT","Virginia": "VA","Washington": "WA","West Virginia": "WV",
    "Wisconsin": "WI","Wyoming": "WY"
};

const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const suggestionsBox = document.querySelector(".suggestions");
const apiKey = "8852ced530e50ddec98ae83386195e25";

function normalizeCityInput(input) {
    return input.split(",")[0].trim();
}

let typingTimer;
const debounceDelay = 300;

cityInput.addEventListener("input", () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(fetchSuggestions, debounceDelay);
});

async function fetchSuggestions() {
    const raw = cityInput.value;
    const trimmed = raw.trim();
    if (trimmed.length < 2) {
        suggestionsBox.innerHTML = "";
        return;
    }

    const parts = raw.split(",");
    const cityPart = parts[0].trim();

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityPart}&limit=15&appid=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    suggestionsBox.innerHTML = "";

    const typed = cityPart.toLowerCase();

    const filtered = data.filter(p => {
        const name = p.name.toLowerCase();
        return name.includes(typed);
    });

    filtered.forEach(place => {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.gap = "10px";
        div.style.padding = "8px";
        div.style.cursor = "pointer";

        const flag = document.createElement("img");
        flag.src = `https://flagsapi.com/${place.country}/flat/32.png`;
        flag.width = 24;
        flag.height = 24;

        let stateText = "";
        if (place.state && place.country === "US") {
            stateText = stateAbbrev[place.state] || place.state;
        }

        const label = document.createElement("span");
        label.textContent = stateText
            ? `${place.name}, ${stateText} (${place.country})`
            : `${place.name} (${place.country})`;

        div.appendChild(flag);
        div.appendChild(label);

        div.addEventListener("click", () => {
            cityInput.value = stateText
                ? `${place.name}, ${stateText}`
                : place.name;
            suggestionsBox.innerHTML = "";
        });

        suggestionsBox.appendChild(div);
    });
}

function getMeteocon(condition, isDay) {
    const base = "icons/";
    switch (condition) {
        case "Clear": return isDay ? base + "clear-day.svg" : base + "clear-night.svg";
        case "Clouds": return base + "cloudy.svg";
        case "Rain": return base + "rain.svg";
        case "Drizzle": return base + "rain.svg";
        case "Thunderstorm": return base + "thunderstorms.svg";
        case "Snow": return base + "snow.svg";
        case "Mist": return base + "fog.svg";
        case "Fog": return base + "fog.svg";
        case "Haze": return base + "fog.svg";
        case "Smoke": return base + "fog.svg";
        default: return base + "partly-cloudy-day.svg";
    }
}

function updateBackground(condition, isDay) {
    const body = document.body;
    body.className = "";
    switch (condition) {
        case "Clear": body.classList.add(isDay ? "bg-sunny" : "bg-night"); break;
        case "Clouds": body.classList.add("bg-cloudy"); break;
        case "Rain": body.classList.add("bg-rainy"); break;
        case "Drizzle":body.classList.add("bg-rainy"); break;
        case "Thunderstorm": body.classList.add("bg-rainy"); break;
        case "Snow": body.classList.add("bg-snowy"); break;
        case "Mist": body.classList.add("bg-foggy"); break;
        case "Fog": body.classList.add("bg-foggy"); break;
        case "Haze": body.classList.add("bg-foggy"); break;
        case "Smoke": body.classList.add("bg-foggy"); break;
        default: body.classList.add("bg-cloudy");
    }
}

function setParticles(type) {
    const container = document.querySelector(".weatherParticles");
    container.innerHTML = "";
    let count = type === "rain" ? 80 : type === "snow" ? 60 : 0;
    for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        if (type === "rain") {
            p.classList.add("rain-drop");
            p.style.left = Math.random() * 100 + "vw";
            p.style.animationDuration = 0.4 + Math.random() * 0.6 + "s";
        }
        if (type === "snow") {
            p.classList.add("snow-flake");
            p.style.left = Math.random() * 100 + "vw";
            p.style.animationDuration = 2 + Math.random() * 3 + "s";
        }
        container.appendChild(p);
    }
}

async function getWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;
    const r = await fetch(url);
    if (!r.ok) throw new Error();
    return await r.json();
}

async function getForecastData(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;
    const r = await fetch(url);
    if (!r.ok) throw new Error();
    return await r.json();
}

function extractDailyForecast(list) {
    const daily = {};
    list.forEach(item => {
        if (item.dt_txt.includes("12:00:00")) {
            const date = new Date(item.dt_txt);
            const day = date.toLocaleDateString("en-US", { weekday: "short" });
            daily[day] = item;
        }
    });
    return Object.values(daily).slice(0, 5);
}

function displayForecast(data) {
    const list = extractDailyForecast(data.list);
    const container = document.querySelector(".forecast");
    container.innerHTML = "";
    container.style.display = "flex";

    list.forEach(item => {
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });
        const temp = Math.round(item.main.temp);
        const condition = item.weather[0].main;
        const iconSrc = getMeteocon(condition, true);

        const div = document.createElement("div");
        div.className = "forecast-day";
        div.innerHTML = `
            <p class="day">${day}</p>
            <img src="${iconSrc}">
            <p class="temp">${temp}°F</p>
        `;
        container.appendChild(div);
    });
}


function displayWeatherInfo(data) {
    const condition = data.weather[0].main;
    const isDay = data.weather[0].icon.includes("d");
    updateBackground(condition, isDay);
    if (condition === "Rain" || condition === "Drizzle" || condition === "Thunderstorm") setParticles("rain");
    else if (condition === "Snow") setParticles("snow");
    else setParticles("none");

    const iconSrc = getMeteocon(condition, isDay);
    const { name: city, main: { temp, feels_like, humidity }, weather: [{ description }] } = data;

    card.className = "card";
    card.textContent = "";
    card.style.display = "flex";

    const cityDisplay = document.createElement("h1");
    const tempDisplay = document.createElement("p");
    const feelDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");
    const icon = document.createElement("img");

    icon.classList.add("weatherIcon");
    icon.src = iconSrc;

    cityDisplay.textContent = city;
    tempDisplay.textContent = `${temp.toFixed(0)}°F`;
    feelDisplay.textContent = `Feels like: ${feels_like.toFixed(0)}°F`;
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    descDisplay.textContent = description;

    cityDisplay.classList.add("cityDisplay");
    tempDisplay.classList.add("tempDisplay");
    feelDisplay.classList.add("feelDisplay");
    humidityDisplay.classList.add("humidityDisplay");
    descDisplay.classList.add("descDisplay");

    card.appendChild(cityDisplay);
    card.appendChild(tempDisplay);
    card.appendChild(feelDisplay);
    card.appendChild(humidityDisplay);
    card.appendChild(descDisplay);
    card.appendChild(icon);
}

function displayError(msg) {
    const e = document.createElement("p");
    e.textContent = msg;
    e.classList.add("errorDisplay");
    card.textContent = "";
    card.style.display = "flex";
    card.appendChild(e);
    document.querySelector(".forecast").style.display = "none";
}

weatherForm.addEventListener("submit", async e => {
    e.preventDefault();
    const city = normalizeCityInput(cityInput.value);
    if (!city) {
        displayError("Please enter a city");
        return;
    }
    try {
        const data = await getWeatherData(city);
        displayWeatherInfo(data);
        const forecast = await getForecastData(city);
        displayForecast(forecast);
    } catch {
        displayError("City not found");
    }
});
