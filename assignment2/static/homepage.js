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

const statusToImg = {
    "Clear,Sunny": "clear_day.svg",
    "Cloudy": "cloudy.svg",
    "Drizzle": "drizzle.svg",
    "Flurries": "flurries.svg",
    "Fog": "fog.svg",
    "Light Fog": "fog_light.svg",
    "Freezing Drizzle": "freezing_drizzle.svg",
    "Freezing Rain": "freezing_rain.svg",
    "Heavy Freezing Rain": "freezing_rain_heavy.svg",
    "Light Freezing Rain": "freezing_rain_light.svg",
    "Ice Pellets": "ice_pellets.svg",
    "Heavy Ice Pellets": "ice_pellets_heavy.svg",
    "Light Ice Pellets": "ice_pellets_light.svg",
    "Mostly Clear": "mostly_clear_day.svg",
    "Mostly Cloudy": "mostly_cloudy.svg",
    "Partly Cloudy": "partly_cloudy_day.svg",
    "Rain": "rain.svg",
    "Heavy Rain": "rain_heavy.svg",
    "Light Rain": "rain_light.svg",
    "Snow": "snow.svg",
    "Heavy Snow": "snow_heavy.svg",
    "Light Snow": "snow_light.svg",
    "Thunderstorm": "tstorm.svg",
    "Light Wind": "light_wind.jpg",//
    "Wind": "wind.png",//
    "Strong-Wind": "strong-wind.png"//
}

function web_reset() {
    if (checkbox.checked) {
        checkbox.checked = false;
        let event = new Event('change');
        checkbox.dispatchEvent(event);
    }
    document.getElementById('weatherAndTableHidden').style.display = 'none';
    document.getElementById('weather-table').innerHTML = "";
    document.getElementById('weatherDetails').style.display = 'none';
    document.getElementById('tableHidden').style.display = 'block';
    document.getElementById('error-box').style.display = 'none';
    document.getElementById('results-today-box').style.display = 'block';

    let c_display = document.getElementById("charts-display");
    if (c_display.style.display === 'block') {
        document.getElementById("pointDown").src = "resources/Images/point-down-512.png";
        c_display.style.display = 'none';
    }
}

window.onload = function () {
    web_reset();
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
    web_reset();
})

document.getElementById('weatherForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        document.getElementById('weatherAndTableHidden').style.display = 'none';
        document.getElementById('weather-table').innerHTML = "";
        document.getElementById('weatherDetails').style.display = 'none';
        document.getElementById('tableHidden').style.display = 'block';

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
                    // alert('IP information fetched successfully!');
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
                            // alert('Failed to fetch geo information.');
                        })
                });
        }

        await sleep(1500);
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
                let chart1Data = data.chart1Results;
                data = data.results;
                console.log('Success:', chart1Data);
                displayWeatherData(data[0]);
                displayWeatherDataTable(data, chart1Data, locData.lat, locData.lng);
                const hiddenContent = document.getElementById('weatherAndTableHidden');
                hiddenContent.style.display = 'block'; // 显示隐藏的内容
                // if (hiddenContent.style.display === 'none' || hiddenContent.style.display === '') {
                //     hiddenContent.style.display = 'block'; // 显示隐藏的内容
                // }
                // alert('Weather information fetched successfully!');
            })
            .catch((error) => {
                console.error('Error:', error);
                // alert('Failed to fetch weather information.');
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

function displayWeatherDataTable(data, chart1Data, lat, lng) {
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
        row.setAttribute("onclick", `showWeatherDetails('${day.date}', '${day.status}','${day.tempHigh}', '${day.tempLow}', '${day.windSpeed}', '${day.humidity}%', '${day.visibility} mi', '${day.precipitation}', '${day.rainChance}%', '${day.sunrise}', '${day.sunset}', '${chart1Data}', '${lat}', '${lng}')`)
        row.innerHTML = `
        <td>${day.date}</td>
        <td><img src="${day.icon}" alt="${day.status}" /> ${day.status}</td>
        <td>${day.tempHigh}</td>
        <td>${day.tempLow}</td>
        <td>${day.windSpeed}</td>`;
        tableBody.appendChild(row);
    });
}

function showWeatherDetails(date, status, highTemp, lowTemp, windSpeed, humidity, visibility, precipitation, rainChance, sunrise, sunset, chart1Data, lat, lng) {
    document.getElementById('weatherDate').textContent = date;
    document.getElementById('weatherStatus').textContent = status;
    document.getElementById('card-head-img').src = `resources/Images/Weather%20Symbols%20for%20Weather%20Codes/${statusToImg[status]}`;
    document.getElementById('weatherTemp').textContent = `${highTemp}°F/${lowTemp}°F`;
    document.getElementById('weatherPrecipitation').textContent = `${precipitation}`;
    document.getElementById('weatherRain').textContent = `${rainChance}`;
    document.getElementById('weatherWind').textContent = `${windSpeed} mph`;
    document.getElementById('weatherHumidity').textContent = `${humidity}`;
    document.getElementById('weatherVisibility').textContent = `${visibility}`;
    document.getElementById('weatherSunriseSunset').textContent = `${sunrise}/${sunset}`;
    first_chart(chart1Data);
    chart2_generation(lat, lng);
    document.getElementById('results-today-box').style.display = 'none';
    document.getElementById('weatherDetails').style.display = 'block';
    document.getElementById('tableHidden').style.display = 'none';
    window.scrollTo({
        top: 400, // 滚动到的位置（单位：像素）
    });
}

function displayErrorStatement() {
    document.getElementById('error-box').style.display = 'block';
}

document.addEventListener("DOMContentLoaded", function() {
        const button = document.getElementById("pointDown");
        button.addEventListener("click", chart_display_status_change())});

function chart_display_status_change() {
    let c_display = document.getElementById("charts-display");
    if (c_display.style.display === 'none') {
        document.getElementById("pointDown").src = "resources/Images/point-up-512.png";
        c_display.style.display = 'block';
    } else {
        document.getElementById("pointDown").src = "resources/Images/point-down-512.png";
        c_display.style.display = 'none';
    }
    window.scrollTo({
        top: 1300, // 滚动到的位置（单位：像素）
    });
}

function first_chart(chart1Data) {
    const chart1DataA = chart1Data.split(",").map(Number)
    let chart1DataArr = chart1DataA.reduce((acc, curr, index) => {
        if (index % 3 === 0) {
            acc.push(chart1DataA.slice(index, index + 3));
        }
        return acc;
    }, []);
    console.log("chart1Data", chart1DataArr);
    // [
    //     [1483232400000, 1.4, 4.7],
    //     [1483318800000, -1.3, 1.9],
    //     [1483405200000, -0.7, 4.3],
    //     [1483491600000, -5.5, 3.2],
    //     [1483578000000, -9.9, -6.6],
    //     [1483664400000, -9.6, 0.1],
    //     [1483750800000, -0.9, 4.0],
    //     [1483837200000, -2.2, 2.9]
    // ]
    Highcharts.chart('highcharts1-container', {
        chart: {
            renderTo: document.getElementById("highcharts1-container"),
            type: 'arearange',
            zooming: {
                type: 'x'
            },
            scrollablePlotArea: {
                minWidth: 600,
                scrollPositionX: 1
            }
        },
        title: {
            text: 'Temperature Range (Min, Max)'
        },
        xAxis: {
            type: 'datetime',
            accessibility: {
                rangeDescription: 'Range: next 15 days.'
            }
        },
        yAxis: {
            title: {
                text: null
            }
        },
        tooltip: {
            crosshairs: true,
            shared: true,
            valueSuffix: '°F',
            xDateFormat: '%A, %b %e'
        },
        legend: {
            enabled: false
        },
        series: [{
            name: 'Temperatures',
            data: chart1DataArr,
            color: {
                linearGradient: {
                    x1: 0,
                    x2: 0,
                    y1: 0,
                    y2: 1
                },
                stops: [
                    [0, '#FFA500'],
                    [1, '#ADD8E6']
                ]
            }
        }]
    });
}