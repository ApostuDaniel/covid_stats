let docList = document.getElementById("countries")
let countriesList = []

const getCountryList = async () =>{
    const unformated = await fetch('https://api.covid19api.com/countries')
    const formated = await unformated.json()
    return formated
}

const htmlCountryList = async () =>{
    countriesList = await getCountryList();
    countriesList.forEach(element => {
        const countryOption = document.createElement("option")
        countryOption.value = element["Country"]
        countryOption.id = element["Slug"]
        docList.appendChild(countryOption)
    });
}

htmlCountryList()


const getTotalStatsPerCountry = async (country) =>{
    const unformated = await fetch(`https://api.covid19api.com/total/country/${country}`)
    const formated = await unformated.json()
    return formated;
}

const updateTotal = (data) =>{
    document.getElementById("totalConfirmed").innerHTML = `Confirmed: ${data["Confirmed"]}`
    document.getElementById("totalRecovered").innerHTML = `Recovered: ${data["Recovered"]}`
    document.getElementById("totalDeaths").innerHTML = `Deaths: ${data["Deaths"]}`
}

const updateToday = (today, yesterday) =>{
    document.getElementById("todayConfirmed").innerHTML = `Confirmed: ${today["Confirmed"] - yesterday["Confirmed"] }`
    document.getElementById("todayRecovered").innerHTML = `Recovered: ${today["Recovered"] - yesterday["Recovered"]}`
    document.getElementById("todayDeaths").innerHTML = `Deaths: ${today["Deaths"] - yesterday["Deaths"]}`
    document.getElementById("activeCases").innerHTML = `Active: ${today["Active"]}`
}

const reinitializeGraph = () =>{
    const parent1 = document.getElementById("confirmed-graphs")
    const parent2 = document.getElementById("recovered-graphs")
    const parent3 = document.getElementById("dead-graphs")
    parent1.innerHTML = "";  parent2.innerHTML = "";  parent3.innerHTML = "";
    let confirmedTotal = document.createElement('canvas')
    let confirmedDay = document.createElement('canvas')
    let recoveredTotal = document.createElement('canvas')
    let recoveredDay = document.createElement('canvas')
    let deadTotal = document.createElement('canvas')
    let deadDay = document.createElement('canvas')
    confirmedTotal.id = "confirmed-total"
    confirmedDay.id = "confirmed-day"
    recoveredTotal.id = "recovered-total"
    recoveredDay.id = "recovered-day"
    deadTotal.id = "dead-total"
    deadDay.id = "dead-day"
    confirmedTotal.classList.add("graph")
    confirmedDay.classList.add("graph")
    recoveredTotal.classList.add("graph")
    recoveredDay.classList.add("graph")
    deadTotal.classList.add("graph")
    deadDay.classList.add("graph")
    parent1.appendChild(confirmedTotal)
    parent1.appendChild(confirmedDay)
    parent2.appendChild(recoveredTotal)
    parent2.appendChild(recoveredDay)
    parent3.appendChild(deadTotal)
    parent3.appendChild(deadDay)
}

const drawGraph = (dataSet, dataLabel, canvasId, chartType, infoType, color ) =>{
    let ctx = document.getElementById(`${canvasId}`).getContext('2d');
    let myChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: dataSet["Date"],
            datasets: [{
                label: dataLabel,
                data: dataSet[infoType],
                backgroundColor: [
                    color
                ],
                borderColor: [
                    color
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

const showStatistics = async (country) =>{
    let countryData = await getTotalStatsPerCountry(country)
    console.log(countryData[countryData.length - 1], countryData[countryData.length - 2])
    updateTotal(countryData[countryData.length - 1])
    updateToday(countryData[countryData.length - 1], countryData[countryData.length - 2] )
    let procesedData = {Confirmed: [], Recovered: [], Deaths: [], Date: []};
    let byDayProcessedData = {Confirmed: [], Recovered: [], Deaths: [], Date: []}
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    countryData.forEach( element => {
        let readable = new Date(element["Date"])
        procesedData["Confirmed"].push(element["Confirmed"])
        procesedData["Recovered"].push(element["Recovered"])
        procesedData["Deaths"].push(element["Deaths"])
        let date = months[readable.getMonth()] + " "  + (readable.getDate())  +  ", " + readable.getFullYear(); 
        procesedData["Date"].push(date)
    })

    for(let i = 1; i < procesedData["Date"].length; ++i)
    {
        byDayProcessedData["Confirmed"].push(procesedData["Confirmed"][i] - procesedData["Confirmed"][i - 1] )
        byDayProcessedData["Recovered"].push(procesedData["Recovered"][i] - procesedData["Recovered"][i - 1] )
        byDayProcessedData["Deaths"].push(procesedData["Deaths"][i] - procesedData["Deaths"][i - 1] )
        byDayProcessedData["Date"].push( procesedData["Date"][i])
    }
    console.log(byDayProcessedData)

    reinitializeGraph()
    drawGraph(procesedData, "Total Cases Confirmed", "confirmed-total", "line", "Confirmed", 'rgb(139, 0, 0, 1)')
    drawGraph(byDayProcessedData, "Confirmed Cases by Day", "confirmed-day", "bar", "Confirmed", 'rgb(139, 0, 0, 1)')
    drawGraph(procesedData, "Total Cases Recovered", "recovered-total", "line", "Recovered", 'rgb(0, 100, 0, 1)')
    drawGraph(byDayProcessedData, "Recovered Cases by Day", "recovered-day", "bar", "Recovered", 'rgb(0, 100, 0, 1)')
    drawGraph(procesedData, "Total Deaths", "dead-total", "line", "Deaths", 'rgb(0, 0, 0, 1)')
    drawGraph(byDayProcessedData, "Deaths per Day", "dead-day", "bar", "Deaths", 'rgb(0, 0, 0, 1)')
}


const buttonEvent = async () =>{
    const country = document.getElementById("input").value
    let found = false
    for(let i = 0; i < countriesList.length; ++i ){
        if(country === countriesList[i]["Country"] || country === countriesList[i]["Slug"]){
            found = true;
            await showStatistics(countriesList[i]["Slug"])
            break;
        }
    }
    if (found == false) alert("Invalid input")
}


const getCurrentCountry = async () => {
    const ufdata = await fetch('https://ipapi.co/json/')
    const fdata = await ufdata.json()
    return fdata["country_name"]
}

const statsCurrentCountry = async () =>{
    let country = await getCurrentCountry()
    document.getElementById("input").value = country
    country = country.toLowerCase().trim().replace(/\s/g, "-").split(',')[0]
    showStatistics(country)
}

statsCurrentCountry();
