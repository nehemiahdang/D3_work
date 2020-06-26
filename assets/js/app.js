// Set up SVG chart
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG element wrapper
var svg = d3
 .select("#scatter")
 .append("svg")
 .attr("width", svgWidth)
 .attr("height", svgHeight);

// Append a group to hold the chart
var chartGroup = svg.append("g")
 .attr("transform", `translate(${margin.left}, ${margin.top})`);

 // Initial Parameters
var activeXAxis = "poverty";
var activeYAxis = "healthcare";

 //
function xScale(paperData, activeXAxis) {
    var xLinearScale = d3.scaleLinear()
     .domain([d3.min(paperData, d => d[activeXAxis]) * 0.8,
     d3.max(paperData, d => d[activeXAxis]) * 1.2])
     .range([0, chartWidth]);

    return xLinearScale;
}

function yScale(paperData, activeYAxis) {
    var yLinearScale = d3.scaleLinear()
     .domain([d3.min(paperData, d => d[activeYAxis]) * 0.8,
     d3.max(paperData, d => d[activeYAxis]) * 1.2])
     .range([chartHeight, 0]);

    return yLinearScale;
}

function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
     .duration(1000)
     .call(bottomAxis);

    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
     .duration(1000)
     .call(leftAxis);

    return yAxis;
}

function renderXCircles(circlesGroup, newXScale, activeXAxis) {
    
    circlesGroup.transition()
     .duration(1000)
     .attr("cx", d => newXScale(d[activeXAxis]));

    return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, activeYAxis) {

    circlesGroup.transition()
     .duration(1000)
     .attr("cy", d => newYScale(d[activeYAxis]));

    return circlesGroup;
}

function updateToolTip(activeXAxis, activeYAxis, circlesGroup) {
    
    var xLabel;
    if (activeXAxis === "poverty") {
        xLabel = "Poverty: ";
    }
    else if (activeXAxis === "age") {
        xLabel = "Age: ";
    }
    else {
        xLabel = "Household Income: ";
    }

    var yLabel;
    if (activeYAxis === "healthcare") {
        yLabel = "Healthcare: ";
    }
    else if (activeYAxis === "smokes") {
        yLabel = "Smokes: ";
    }
    else {
        yLabel = "Obesity: ";
    }

    var toolTip = d3.tip()
     .attr("class", "tooltip")
     .offset([80, -60])
     .html(function(d) {
         return (`${d.state}<br>
         ${xLabel} ${d[activeXAxis]}<br>
         ${yLabel} ${d[activeYAxis]}`);
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })

     .on("mouseout", function(data) {
         toolTip.hide(data);
     });

    return circlesGroup;
}

// Import the CSV file
d3.csv("/assets/data/data.csv").then(function(paperData) {
    console.log(paperData);
    // console.log(paperData.map(data => data.poverty));

    // Parse the data
    paperData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
      });
    

    // Create the scales
    // var xLinearScale = d3.scaleLinear()
    //  .domain(d3.extent(paperData, d => d.poverty))
    //  .range([0, chartWidth]);
    var xLinearScale = xScale(paperData, activeXAxis);
    
    // var yLinearScale = d3.scaleLinear()
    //  .domain([0, d3.max(paperData, d => d.healthcare)])
    //  .range([chartHeight, 0]);
    var yLinearScale = yScale(paperData, activeYAxis);

    // Setup x-axis and y-axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append the axis onto the chart
    var xAxis = chartGroup.append("g")
     .attr("transform", `translate(0, ${chartHeight})`)
     .call(bottomAxis);

    var yAxis = chartGroup.append("g")
     .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
     .data(paperData)
     .enter()
     .append("circle")
     .attr("cx", d => xLinearScale(d[activeXAxis]))
     .attr("cy", d => yLinearScale(d[activeYAxis]))
     .attr("r", 10)
     .classed("stateCircle", true);

    var statesGroup = chartGroup.append("g")
     .selectAll("text")
     .data(paperData)
     .enter()
     .append("text")
     .text(d => d.abbr)
     .attr("dx", d => xLinearScale(d[activeXAxis]))
     .attr("dy", d => yLinearScale(d[activeYAxis]))
     .attr("font-size", "10")
     .classed("stateText", true);

    var labelsGroup = chartGroup.append("g")
     .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
    
    var povertyLabel = labelsGroup.append("text")
     .attr("x", 0)
     .attr("y", 20)
     .attr("value", "poverty")
     .classed("active", true)
     .text("In Poverty(%)");

    var ageLabel = labelsGroup.append("text")
     .attr("x", 0)
     .attr("y", 40)
     .attr("value", "age")
     .classed("inactive", true)
     .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
     .attr("x", 0)
     .attr("y", 60)
     .attr("value", "income")
     .classed("inactive", true)
     .text("Household Income (Median)");

    //
    var healthcareLabel = labelsGroup.append("text")
     .attr("transform", "rotate(90)")
     .attr("y", 0)
     .attr("x", 0 - (chartHeight / 2))
     .attr("dy", "1em")
     .classed("active", true)
     .text("Lacks Healthcare (%)");

    var smokeLabel = labelsGroup.append("text")
    .attr("transform", "rotate(90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (chartHeight / 2) + 20)
    .attr("dy", "2em")
    .classed("inactive", true)
    .text("Smokes (%)");

    console.log("Yo!");

    var obeseLabel = labelsGroup.append("text")
    .attr("transform", "rotate(90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (chartHeight / 2) + 40)
    .attr("dy", "3em")
    .classed("inactive", true)
    .text("Obese (%)");

    var circlesGroup = updateToolTip(activeXAxis, activeYAxis, circlesGroup);

    var statesGroup = updateToolTip(activeXAxis, activeYAxis, circlesGroup);

    labelsGroup.selectAll("text")
     .on("click", function() {
        var value = d3.select(this)
         .attr("value");
        if (value !== activeXAxis) {
            activeXAxis = value;

            xLinearScale = xScale(paperData, activeXAxis);

            xAxis = renderXAxes(xLinearScale, xAxis);

            circlesGroup = renderXCircles(circlesGroup, xLinearScale, activeXAxis);

            circlesGroup = updateToolTip(activeXAxis, activeYAxis, circlesGroup);

            if (activeXAxis === "age") {
                ageLabel
                .classed("active", true)
                .classed("inactive", false);
                povertyLabel
                .classed("active", false)
                .classed("inactive", true);
                incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (activeXAxis === "poverty") {
                povertyLabel
                .classed("active", true)
                .classed("inactive", false);
                ageLabel
                .classed("active", false)
                .classed("inactive", true);
                incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (activeXAxis === "income") {
                incomeLabel
                .classed("active", true)
                .classed("inactive", false);
                povertyLabel
                .classed("active", false)
                .classed("inactive", true);
                ageLabel
                .classed("active", false)
                .classed("inactive", true);
            }
        }},
    labelsGroup.selectAll("text")
    .on("click", function() {
        var value = d3.select(this)
        .attr("value");
        if (value !== activeYAxis) {
            activeYAxis = value;

            yLinearScale = yScale(paperData, activeYAxis);

            yAxis = renderYAxes(yLinearScale, yAxis);

            circlesGroup = renderYCircles(circlesGroup, yLinearScale, activeYAxis);

            circlesGroup = updateToolTip(activeXAxis, activeYAxis, circlesGroup);

            if (activeYAxis === "smokes") {
                smokeLabel
                .classed("active", true)
                .classed("inactive", false);
                healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
                obeseLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (activeYAxis === "healthcare") {
                healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
                smokeLabel
                .classed("active", false)
                .classed("inactive", true);
                obeseLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (activeYAxis === "obesity") {
                obeseLabel
                .classed("active", true)
                .classed("inactive", false);
                healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
                smokeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
        }
     }));
}).catch(error => console.log(error));