const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const apiKey = "8852ced530e50ddec98ae83386195e25";

function getMeteocon(condition, isDay) {
    const base = "icons/";
    switch (condition) {
        case "Clear":
            return isDay ? base + "clear-day.svg" : base + "clear-night.svg";
        case "Clouds":
            return base + "cloudy.svg";
        case "Rain":
        case "Drizzle":
            return base + "rain.svg";
        case "Thunderstorm":
            return base + "thunderstorms.svg";
        case "Snow":
            return base + "snow.svg";
        case "Mist":
        case "Fog":
        case "Haze":
        case "Smoke":
            return base + "fog.svg";
        default:
            return base + "partly-cloudy-day.svg";
    }
}

function updateBackground(condition) {
    const body = document.body;
    body.classList.remove("bg-sunny","bg-cloudy","bg-rainy","bg-snowy","bg-foggy");
    let c;
    switch (condition) {
        case "Clear": c = "bg-sunny"; break;
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
    updateBackground(condition);

    if (condition === "Rain" || condition === "Drizzle" || condition === "Thunderstorm") setParticles("rain");
    else if (condition === "Snow") setParticles("snow");
    else setParticles("none");

    const isDay = data.weather[0].icon.includes("d");
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
    const city = cityInput.value;
    if (!city) return displayError("Please enter a city");
    try {
        const data = await getWeatherData(city);
        displayWeatherInfo(data);
    } catch (err) {
        displayError("City not found");
    }
});
