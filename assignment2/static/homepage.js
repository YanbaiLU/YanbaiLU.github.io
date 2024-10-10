function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const textFields = [
    document.getElementById('street'),
    document.getElementById('city'),
    document.getElementById('state')
];

// const street = document.getElementById('street').value;
// const city = document.getElementById('city').value;
// const state = document.getElementById('state').value;
const checkbox = document.getElementById('auto-detect');
let address;
// let location;

const statusToImg = {
    "Clear,Sunny": "clear_day.svg",
    "Cloudy": "cloudy.svg",
    "Drizzle": "drizzle.svg",
    "Flurries": "flurries.svg",
    "Fog": "fog.svg",
    "Light Fog": "fog_light.svg",
    "Freezing Drizzle": "freezing_drizzle.svg",
    "Freezing Rain": "freezing_rain.svg",
    "Freezing Rain Heavy": "freezing_rain_heavy.svg",
    "Freezing Rain Light": "freezing_rain_light.svg",
    "Ice Pellets": "ice_pellets.svg",
    "Ice Pellets Heavy": "ice_pellets_heavy.svg",
    "Ice Pellets Light": "ice_pellets_light.svg",
    "Light Wind": "light_wind.jpg",
    "Mostly Clear Day": "mostly_clear_day.svg",
    "Mostly Cloudy": "mostly_cloudy.svg",
    "Partly Cloudy Day": "partly_cloudy_day.svg",
    "Rain": "rain.svg",
    "Rain Heavy": "rain_heavy.svg",
    "Rain Light": "rain_light.svg",
    "Snow": "snow.svg",
    "Snow Heavy": "snow_heavy.svg",
    "Snow Light": "snow_light.svg",
    "Strong-Wind": "strong-wind.png",
    "Tstorm": "tstorm.svg",
    "Wind": "wind.png"
}

window.onload = function (){
    checkbox.checked = false
    document.getElementById('error-box').style.display = 'none';
}

checkbox.addEventListener('change', function () {
    if (checkbox.checked) {
        textFields.forEach(textField => {
            textField.disabled = true;
        });
    } else {
        textFields.forEach(textField => {
            textField.disabled = false;
        });
    }
});

document.getElementById('weatherForm').addEventListener('reset', function (event) {
    if (checkbox.checked) {
        checkbox.checked = false;
        let event = new Event('change');
        checkbox.dispatchEvent(event);
    }
    if (document.getElementById('weatherAndTableHidden').style.display === 'block') {
        document.getElementById('weatherAndTableHidden').style.display = 'none';
        document.getElementById('weather-table').innerHTML = "";
    }
})

document.getElementById('weatherForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        document.getElementById('weather-table').innerHTML = "";

        const street = document.getElementById('street').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const autoDetect = document.getElementById('auto-detect').checked;
        console.log(street, city, state, autoDetect);

        let locData;
        if (autoDetect === true) {
            console.log("auto detect")
            fetch("https://ipinfo.io/?token=6b0e583eaf5cd8", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
                .then(IPdata => {
                    // Handle the response from the backend
                    // console.log('Success:', IPdata);
                    locData = (IPdata.loc).split(",", 2);
                    locData = {lat: locData[0], lng: locData[1]};
                    console.log('Success:', locData);
                    address = IPdata.city + ", " + IPdata.region
                    // city = IPdata.city
                    // state = IPdata.region
                    alert('IP information fetched successfully!');
                })
                .catch((error) => {
                    console.error('Error:', error);
                    alert('Failed to fetch IP information.');
                });
        } else {
            address = "" + street + "+" + city + "+" + state;
            address = address.replace(/ /g, "+")
            console.log("address filled in", address)
            let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyDys1jsxVgTVvTSSKzEIxBRQTNkkV28Cys`;
            console.log(url)
            fetch(url, {
                method: 'GET'
            }).then(response => response.json())
                .then(locdata => {
                    locData = locdata.results[0].geometry.location
                    address = "" + street + ", " + city + ", " + state
                    console.log('locData:', locData);
                })
                .catch((error) => {
                    //console.error('Error:', error);
                    //alert('Failed to fetch geo information.');
                    address = state;
                    url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyDys1jsxVgTVvTSSKzEIxBRQTNkkV28Cys&language=EN`;
                    fetch(url, {
                        method: 'GET'
                    }).then(response => response.json())
                        .then(locdata => {
                            locData = locdata.results[0].geometry.location
                            address = locdata.results[0].formatted_address
                            console.log("fixed url:", url)
                            console.log('locData:', locData);
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                            alert('Failed to fetch geo information.');
                        })
                });
        }

        await sleep(2000);
        let serverUrl = "http://127.0.0.1:5000/weatherdata?latitude=" + locData.lat + "&longitude=" + locData.lng;
        let dataList;
        console.log("serverurl:", serverUrl)
        fetch(serverUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        }).then(response => response.json())
            .then(data => {
                // Handle the response from the backend
                console.log('Success:', data);
                data = data.results
                displayWeatherData(data[0]);
                displayWeatherDataTable(data);
                const hiddenContent = document.getElementById('weatherAndTableHidden');
                if (hiddenContent.style.display === 'none' || hiddenContent.style.display === '') {
                    hiddenContent.style.display = 'block'; // 显示隐藏的内容
                }
                alert('Weather information fetched successfully!');
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Failed to fetch weather information.');
                displayErrorStatement()
            });
    }
)

function displayWeatherData(data) {
    console.log(data)
    document.getElementById('location').textContent = `${address}`;
    document.getElementById('weather-img').src = `resources/Images/Weather%20Symbols%20for%20Weather%20Codes/${statusToImg[data.values.weatherStatus]}`;
    document.getElementById('weather-description').textContent = `${data.values.weatherStatus}`;
    document.getElementById('temperature').textContent = `${data.values.temperature}°`;
    document.getElementById('humidity').textContent = `${data.values.humidity}%`;
    document.getElementById('pressure').textContent = `${data.values.pressureSeaLevel}inHg`;
    document.getElementById('wind-speed').textContent = `${data.values.windSpeed}mph`;
    document.getElementById('visibility').textContent = `${data.values.visibility}mi`;
    document.getElementById('cloud-cover').textContent = `${data.values.cloudCover}%`;
    document.getElementById('uv-level').textContent = data.values.uvIndex;
}

function displayWeatherDataTable(data) {
    // 为什么temperature和temperatureMax一样
    const weatherDataTable = [];
    for (let dataSec of data) {
        weatherDataTable.push({
            date: dataSec.Date,
            status: dataSec.values.weatherStatus,
            icon: `resources/Images/Weather%20Symbols%20for%20Weather%20Codes/${statusToImg[dataSec.values.weatherStatus]}`,
            tempHigh: dataSec.values.temperatureMax,
            tempLow: dataSec.values.temperatureMin,
            windSpeed: dataSec.values.windSpeed,
            humidity: dataSec.values.humidity,
            visibility: dataSec.values.visibility,
            precipitation: dataSec.values.precipitation,
            rainChance: dataSec.values.precipitationProbability,
            sunrise: dataSec.values.sunrise,
            sunset: dataSec.values.sunset
        })
    }
    const tableBody = document.getElementById('weather-table');
    weatherDataTable.forEach(day => {
        const row = document.createElement('tr');
        // let tempDate = day.date.replace(",", "，")
        row.setAttribute("onclick", `showWeatherDetails('${day.date}', '${day.status}','${day.tempHigh}', '${day.tempLow}', '${day.windSpeed}', '${day.humidity}%', '${day.visibility} mi', '${day.precipitation}', '${day.rainChance}%', '${day.sunrise}', '${day.sunset}')`)
        row.innerHTML = `
        <td>${day.date}</td>
        <td><img src="${day.icon}" alt="${day.status}" /> ${day.status}</td>
        <td>${day.tempHigh}</td>
        <td>${day.tempLow}</td>
        <td>${day.windSpeed}</td>`;
        tableBody.appendChild(row);
    });
}

function showWeatherDetails(date, status, highTemp, lowTemp, windSpeed, humidity, visibility, precipitation, rainChance, sunrise, sunset) {
    document.getElementById('weatherDate').textContent = date;
    document.getElementById('weatherStatus').textContent = status;
    document.getElementById('weatherTemp').textContent = `Temperature: ${highTemp}°F/${lowTemp}°F`;
    document.getElementById('weatherPrecipitation').textContent = `Precipitation: ${precipitation}`;
    document.getElementById('weatherRain').textContent = `Chance of Rain: ${rainChance}`;
    document.getElementById('weatherWind').textContent = `Wind Speed: ${windSpeed} mph`;
    document.getElementById('weatherHumidity').textContent = `Humidity: ${humidity}`;
    document.getElementById('weatherVisibility').textContent = `Visibility: ${visibility}`;
    document.getElementById('weatherSunrise').textContent = `Sunrise: ${sunrise}`;
    document.getElementById('weatherSunset').textContent = `Sunset: ${sunset}`;
    document.getElementById('weatherDetails').style.display = 'block';
    document.getElementById('tableHidden').style.display = 'none';
}

function displayErrorStatement(){
    document.getElementById('error-box').style.display = 'block';
}