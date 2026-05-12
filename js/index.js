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

cityInput.addEventListener("keyup", async () => {
    const query = cityInput.value.trim();
    if (query.length < 2) {
        suggestionsBox.innerHTML = "";
        return;
    }

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=15&appid=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    suggestionsBox.innerHTML = "";

    data.forEach(place => {
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
});

function getMeteocon(condition, isDay) {
    const base = "icons/";
    switch (condition) {
        case "Clear": return isDay ? base + "clear-day.svg" : base + "clear-night.svg";
        case "Clouds": return base + "cloudy.svg";
        case "Rain":
        case "Drizzle": return base + "rain.svg";
        case "Thunderstorm": return base + "thunderstorms.svg";
        case "Snow": return base + "snow.svg";
        case "Mist":
        case "Fog":
        case "Haze":
        case "Smoke": return base + "fog.svg";
        default: return base + "partly-cloudy-day.svg";
    }
}

function updateBackground(condition, isDay) {
    const body = document.body;
    body.classList.remove("bg-sunny","bg-night","bg-cloudy","bg-rainy","bg-snowy","bg-foggy");

    let c;
    switch (condition) {
        case "Clear": c = isDay ? "bg-sunny" : "bg-night"; break;
        case "Clouds": c = "bg-cloudy"; break;
        case "Rain":
        case "Drizzle":
        case "Thunderstorm": c = "bg-rainy"; break;
        case "Snow": c = "bg-snowy"; break;
        case "Mist":
        case "Fog":
        case "Haze":
        case "Smoke": c = "bg-foggy"; break;
        default: c = "bg-cloudy";
    }

    body.classList.add(c);
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
    if (!r.ok) throw new Error("Could not fetch weather data");
    return await r.json();
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
}

weatherForm.addEventListener("submit", async e => {
    e.preventDefault();
    const city = normalizeCityInput(cityInput.value);
    if (!city) return displayError("Please enter a city");
    try {
        const data = await getWeatherData(city);
        displayWeatherInfo(data);
    } catch (err) {
        displayError("City not found");
    }
});
