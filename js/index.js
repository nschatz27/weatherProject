
const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const apiKey = "8852ced530e50ddec98ae83386195e25";

weatherForm.addEventListener("submit", async event => {

    event.preventDefault();

    const city = cityInput.value;

    if(city) {
        try{
            const weatherData = await getWeatherData(city);
            displayWeatherInfo(weatherData);
        }
        catch(error){
            console.error(error);
            displayError(error);
        }
    }
    else {
        displayError("Please enter a city or ZIP code");
    }
});

async function getWeatherData(city) {

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

    const response = await fetch(apiUrl);

    if(!response.ok) {
        throw new Error("Could not fetch weather data");
    }

    return await response.json();

}


function displayWeatherInfo(data) {

    const {name: city,
           main: {temp, feels_like, humidity},
           weather: [{description, id}]} = data;

    card.textContent = "";
    card.style.display = "flex";

    const cityDisplay = document.createElement("h1");
    const tempDisplay = document.createElement("p");
    const feelDisplay = document.createElement("p");
    const windDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const uvDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");
    const weatherEmoji = document.createElement("p");

    cityDisplay.textContent = city;
    tempDisplay.textContent = `${temp.toFixed(0)}°F`;
    feelDisplay.textContent = `Feels like: ${feels_like.toFixed(0)}°F`;
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    descDisplay.textContent = description;
    weatherEmoji.textContent = getWeatherEmoji(id);

    cityDisplay.classList.add("cityDisplay");
    tempDisplay.classList.add("tempDisplay");
    feelDisplay.classList.add("feelDisplay");
    humidityDisplay.classList.add("humidityDisplay");
    descDisplay.classList.add("descDisplay");
    weatherEmoji.classList.add("weatherEmoji");

    card.appendChild(cityDisplay);
    card.appendChild(tempDisplay);
    card.appendChild(feelDisplay);
    card.appendChild(humidityDisplay);
    card.appendChild(descDisplay);
    card.appendChild(weatherEmoji);
}

function getWeatherEmoji(weatherId) {

    switch(true) {
        case (weatherId >= 200 && weatherId < 300):
            return "⛈️";
        case (weatherId >= 300 && weatherId < 400):
            return "🌧️";
        case (weatherId >= 500 && weatherId < 600):
            return "🌧️";
        case (weatherId >= 600 && weatherId < 700):
            return "❄️";
        case (weatherId >= 700 && weatherId < 800):
            return "🌫️";
        case (weatherId === 800):
            return "☀️";
        case (weatherId >= 801 && weatherId < 810):
            return "☁️";
        default:
            "❔";
    }

}

function displayError(message) {

    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("errorDisplay");

    card.textContent = "";
    card.style.display = "flex";
    card.appendChild(errorDisplay);
}