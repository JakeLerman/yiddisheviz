/*
*    main.js
*    Mastering Data Visualization with D3.js
*    6.7 - jQuery UI slider
*/

const MARGIN = { LEFT: 100, RIGHT: 50, TOP: 70, BOTTOM: 50 }
const WIDTH = 1000 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 700 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

let time = 0
let interval
let formattedData

// // Tooltip
// const tip = d3.tip()
//   .attr('class', 'd3-tip')
// 	.html(d => {
// 		let text = `<strong>Country:</strong> <span style='color:red;text-transform:capitalize'>${d.country}</span><br>`
// 		text += `<strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>${d.continent}</span><br>`
// 		text += `<strong>Life Expectancy:</strong> <span style='color:red'>${d3.format(".2f")(d.life_exp)}</span><br>`
// 		text += `<strong>GDP Per Capita:</strong> <span style='color:red'>${d3.format("$,.0f")(d.income)}</span><br>`
// 		text += `<strong>Population:</strong> <span style='color:red'>${d3.format(",.0f")(d.population)}</span><br>`
// 		return text
// 	})
// g.call(tip)

// Scales
const x = d3.scaleLinear()
	.range([0, WIDTH])
	.domain([1900, 2020])
// const y = d3.scaleLog()
// 	.base(10)
// 	.range([HEIGHT, 0])
// 	.domain([16840, 6699700])
const y = d3.scaleLinear()
	.range([HEIGHT, 0])
	.domain([16840, 8977581])
const area = d3.scaleLinear()
	.range([25*Math.PI, 1500*Math.PI])
	.domain([5360, 6699701])
const continentColor = d3.scaleOrdinal(d3.schemePastel1)

// Labels
// const xLabel = g.append("text")
// 	.attr("y", HEIGHT + 50)
// 	.attr("x", WIDTH / 2)
// 	.attr("font-size", "20px")
// 	.attr("text-anchor", "middle")
// 	.text("Date")
const yLabel = g.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", -40)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Population")
// const timeLabel = g.append("text")
// 	.attr("y", HEIGHT - 10)
// 	.attr("x", WIDTH - 40)
// 	.attr("font-size", "40px")
// 	.attr("opacity", "0.4")
// 	.attr("text-anchor", "middle")
// 	.text("1800")

// X Axis
const xAxisCall = d3.axisBottom(x).tickFormat(d3.format(".4"))
g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
	.call(xAxisCall)
	

// Y Axis
const yAxisCall = d3.axisLeft(y).tickFormat(d3.format("~s"))
g.append("g")
	.attr("class", "y axis")
	.call(yAxisCall)

const continents = ["europe", "asia", "americas", "africa", "oceana"]

const legend = g.append("g")
	.attr("transform", `translate(${WIDTH - 10}, ${HEIGHT - 125})`)

continents.forEach((continent, i) => {
	const legendRow = legend.append("g")
		.attr("transform", `translate(0, ${i * 20})`)

	legendRow.append("rect")
    .attr("width", 10)
    .attr("height", 10)
		.attr("fill", continentColor(continent))

	legendRow.append("text")
    .attr("x", -10)
    .attr("y", 10)
    .attr("text-anchor", "end")
    .style("text-transform", "capitalize")
    .text(continent)
})

d3.json("data/jewishData.json").then(function(data){
	// clean data
	formattedData = data.map(year => {
		return year["countries"].filter(country => {
			const dataExists = (country.population)
			return dataExists
		})
	})

	// first run of the visualization
	update(formattedData[0])
})

function step() {
	// at the end of our data, loop back
	time = (time < 4) ? time + 1 : 0
	if (time == 0) {g.selectAll("circle").remove()}
	update(formattedData[time])
}

$("#play-button")
	.on("click", function() {
		const button = $(this)
		if (button.text() === "Play") {
			button.text("Pause")
			interval = setInterval(step, 2000)
		}
		else {
			button.text("Play")
			clearInterval(interval)
		}
	})

$("#reset-button")
	.on("click", () => {
		time = 0
		update(formattedData[0])
	})

$("#continent-select")
	.on("change", () => {
		update(formattedData[time])
	})

// $("#date-slider").slider({
// 	min: 1900,
// 	max: 2020,
// 	step: 1,
// 	slide: (event, ui) => {
// 		time = ui.value - 1800
// 		update(formattedData[time])
// 	}
// })

function update(data) {
	
	// standard transition time for the visualization
	const t = d3.transition()
		.duration(2000)

	const continent = $("#continent-select").val()

	const filteredData = data.filter(d => {
		if (continent === "all") return true
		else {
			return d.continent == continent
		}
	})

	// JOIN new data with old elements.
	const circles = g.selectAll("circle")
		.data(filteredData, d => d.country)

	// EXIT old elements not present in new data.
	circles.exit().remove()

	
	// ENTER new elements present in new data.
	circles.enter().append("circle")
		.attr("fill", d => continentColor(d.continent))
		// .on("mouseover", tip.show)
		// .on("mouseout", tip.hide)
		.merge(circles)
		.transition(t)
			.attr("cy", d => y(d.population))
			.attr("cx", d => x(d.year))
			.attr("r", d => Math.sqrt(area(d.population) / Math.PI))
	// remove circles at the end of the timeline
	// if (time == 4) {
	// 	setTimeout(circles.remove(), 700);
	// }
	// update the time label
	// timeLabel.text(String(time + 1800))

	// $("#year")[0].innerHTML = String(time + 1800)
	// $("#date-slider").slider("value", Number(time + 1800))
}