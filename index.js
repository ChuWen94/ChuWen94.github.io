//Map dimensions (in pixels)
var width = 500;
var height = 500;

//Map projection
var projection = d3.geo.mercator()
    .scale(9000)
    .center([7.3,49.95]) //projection center
    .translate([width/2,height/2]) //translate to center 

//Paths
var path = d3.geo.path()
    .projection(projection);

//Create an SVG
var svg = d3.select("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#e7e6e6");

//Create SVG container
var rect =  d3.select("svg").append("rect")
              .attr("width", width)
              .attr("height", height);

//Group map features
var features = svg.append("g")
    .attr("class","features");


    

//Read and style Geodata
d3.json("electr_estimates_simplified.geojson",function(error,geodata) {
  if (error) return console.log(error); //unknown error, check the console
 
  var max_mwh = Math.log10(d3.max(geodata.features, function(d) { return d.properties.MWh}));
  var min_mwh = Math.log10(d3.min(geodata.features, function(d) { return d.properties.MWh}));
  var mean_mwh = Math.log10(d3.mean(geodata.features, function(d) { return d.properties.MWh}));
  var med_mwh = Math.log10(d3.median(geodata.features, function(d) { return d.properties.MWh}));

  //Legend
  var defs = svg.append("defs");             
  
  var linearGradient = defs.append("linearGradient")
                            .attr("id", "linear-gradient");

  //Set the color for the start (0%)
  linearGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#ffda66"); 

  //Median
  linearGradient.append("stop")
      .attr("offset", "38.9%")
      .attr("stop-color", "#ff9800"); 

  //Mean
  linearGradient.append("stop")
      .attr("offset", "50.6%")
      .attr("stop-color", "#f67828"); 

  //Set the color for the end (100%)
  linearGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#b60a1c"); 

  linearGradient.attr("x1", "0%")
                .attr("y1", "100%")
                .attr("x2", "0%")
                .attr("y2", "0%");


  svg.append("rect")
      .attr("width", width/55-3)
      .attr("height", height - height/2 -50)
      .attr("id", "legend")
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("x", width-10)
      .style("fill", "url(#linear-gradient)");

  //AXIS
  var y = d3.scale.linear().range([0,  height-height/2 - 60]);
  y.domain([max_mwh, min_mwh]);
                  
  var max_mwh_text = Math.round(d3.max(geodata.features, function(d) { return d.properties.MWh})/10000)*10000;
  var min_mwh_text = Math.round(d3.min(geodata.features, function(d) { return d.properties.MWh}));

  let tickLabels = [max_mwh_text, 10000, 500, min_mwh_text];

  var yAxis = d3.svg.axis().scale(y)
                    .orient("left").ticks(4)
                    .tickValues([max_mwh, 4, 2.698970004, min_mwh])
                    .tickFormat((d, i) => d3.format(",")(tickLabels[i]) + " MWh");

  var g = svg.append("g")
            .attr("class", "axis")
            .style("fill", "#0a213e")
            .call(yAxis)
            .attr("transform", "translate(490, 6)");


  //MAP

  var color = d3.scale.linear()
                        .domain([min_mwh, med_mwh, mean_mwh, max_mwh])
                        .range(["#ffda66", "#ff9800", "#f67828", "#b60a1c"])
                        .interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb

  //Create a path for each map feature in the data
  features.selectAll("path")
    .data(geodata.features)
    .enter()
    .append("path")
    .attr("d",path)
    .attr("id", "map")
    .on("mouseover",showTooltip)
    .on("mousemove",moveTooltip)
    .on("mouseout",hideTooltip)
    .attr("stroke", "black")
    .attr("stroke-opacity", "0.7")
    .attr("fill", function(d) {
      return color(Math.log10(d.properties.MWh)); 
      });
      


   
});

//Create tooltip
var tooltip = d3.select("body").append("div").attr("class","tooltip");

//Position tooltip relative to the cursor
var tooltipOffset = {x: 20, y: 10};

//Create a tooltip
function showTooltip(d) {
  moveTooltip();

  var tooltipText = d.properties.LAU2 + ", " + Intl.NumberFormat('de-DEU').format(Math.round(d.properties.MWh))+ String(" MWh");
  if (tooltipText == ""){
    tooltip.style("display", "none");
  }
  else{
    tooltip.style("display","block")
          .text(tooltipText);
  }
    
 }

//Move the tooltip to track the mouse
function moveTooltip() {
  tooltip.style("top",(d3.event.pageY+tooltipOffset.y)+"px")
          .style("left",(d3.event.pageX+tooltipOffset.x)+"px");
}

//Hide tooltip at start
function hideTooltip() {
  tooltip.style("display","none");
}
