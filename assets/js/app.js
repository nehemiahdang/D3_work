// Create a function to the whole chart responsive to window adjustments
function makeResponsive() {

    // Removes the svgArea and replaces it if it isn't empty when the page loads and resizes it
    var svgArea = d3.select("body")
     .select("svg")
     .attr("style", "border: 5px black solid");

    // Clear the svgArea if it's not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // Set up SVG chart
    // var svgWidth = 960;
    // var svgHeight = 500;
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
        top: 20,
        right: 20,
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
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .classed("chart", true);

    // Initial Parameters
    var activeXAxis = "poverty";
    var activeYAxis = "healthcare";

    // Create an x-axis and y-axis scale function
    function xScale(paperData, activeXAxis) {
        var xLinearScale = d3.scaleLinear()
        .domain([d3.min(paperData, d => d[activeXAxis]) * 0.9,
        d3.max(paperData, d => d[activeXAxis]) * 1.1])
        .range([0, chartWidth]);

        return xLinearScale;
    }

    function yScale(paperData, activeYAxis) {
        var yLinearScale = d3.scaleLinear()
        .domain([d3.min(paperData, d => d[activeYAxis]) * 0.9,
        d3.max(paperData, d => d[activeYAxis]) * 1.1])
        .range([chartHeight, 0]);

        return yLinearScale;
    }

    // Create function to render the x-axis and y-axis when a new scale is inputted
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

    // Create a function to render the data circles when the option is changed
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

    // Create a function to render the state abbreviation when the option is changed
    function renderXStates(statesGroup, newXScale, activeXAxis) {
        statesGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[activeXAxis]))

        return statesGroup;
    }

    function renderYStates(statesGroup, newYScale, activeYAxis) {
        statesGroup.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[activeYAxis]))

        return statesGroup;
    }

    // Create a function to for the d3 tool tip and it based on the options
    function updateToolTip(activeXAxis, activeYAxis, circlesGroup) {
        
        // Create an empty variable to update it with conditions
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
        .attr("class", "d3-tip")
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
    d3.csv("/assets/data/data.csv").then(function(paperData, err) {
        if (err) throw err;

        // Print the data into the console
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
        var xLinearScale = xScale(paperData, activeXAxis);
        var yLinearScale = yScale(paperData, activeYAxis);

        // Setup x-axis and y-axis
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append the x-axis and y-axis onto the chart
        var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

        var yAxis = chartGroup.append("g")
        .call(leftAxis);

        // Append the circle / scatter points onto the chart
        var circlesGroup = chartGroup.selectAll("circle")
        .data(paperData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[activeXAxis]))
        .attr("cy", d => yLinearScale(d[activeYAxis]))
        .attr("r", 10)
        .classed("stateCircle", true);

        // Append the state abbreviation onto the chart
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

        // Create a group for the x and y labels
        var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

        var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
        // Create individual label topics for the x-axis
        var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .classed("aText", true)
        .text("In Poverty(%)");

        var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .classed("aText", true)
        .text("Age (Median)");

        var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .classed("aText", true)
        .text("Household Income (Median)");

        // Create individual label topics for the y-axis
        var healthcareLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -90 - margin.left)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "3.6em")
        .attr("value", "healthcare")
        .classed("active", true)
        .classed("aText", true)
        .text("Lacks Healthcare (%)");

        var smokeLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -95 - margin.left)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "2.3em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .classed("aText", true)
        .text("Smokes (%)");

        var obeseLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -100 - margin.left)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .classed("aText", true)
        .text("Obese (%)");

        // Initializes the d3 tool tip
        var circlesGroup = updateToolTip(activeXAxis, activeYAxis, circlesGroup);

        // Create an event listener for the labels, when a different option is selected
        // X-axis labels event listener
        xLabelsGroup.selectAll("text")
        .on("click", function() {
            // Get the value of the selection
            var value = d3.select(this)
            .attr("value");
            if (value !== activeXAxis) {
                // Replaces the activeXAxis variable with the value
                activeXAxis = value;

                // Updates the x-scale for the new data
                xLinearScale = xScale(paperData, activeXAxis);

                // Updates the x-axis for the new x values and transitions
                xAxis = renderXAxes(xLinearScale, xAxis);

                // Updates the circles with new x values and transitions
                circlesGroup = renderXCircles(circlesGroup, xLinearScale, activeXAxis);

                // Updates the placement of the state abbreviations and transitions
                statesGroup = renderXStates(statesGroup, xLinearScale, activeXAxis);

                // Updates the d3 tool tip with the new data
                circlesGroup = updateToolTip(activeXAxis, activeYAxis, circlesGroup);
                
                // Changes the appearance of the labels, based on which one is selected
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
            }});

        // Y-axis labels event listener
        yLabelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== activeYAxis) {
                activeYAxis = value;

                yLinearScale = yScale(paperData, activeYAxis);

                yAxis = renderYAxes(yLinearScale, yAxis);

                circlesGroup = renderYCircles(circlesGroup, yLinearScale, activeYAxis);

                statesGroup = renderYStates(statesGroup, yLinearScale, activeYAxis);

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
        });
    }).catch(error => console.log(error));
}

// Call the makeResponsive function when the page loads
makeResponsive();

// Call makeResponse() when the window is resized
d3.select(window).on("resize", makeResponsive);