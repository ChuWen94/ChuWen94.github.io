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
d3.json("electr_estimates.geojson",function(error,geodata) {
  if (error) return console.log(error); //unknown error, check the console

  
  var max_mwh = d3.max(geodata.features, function(d) { return d.properties.MWh});
  var min_mwh = d3.min(geodata.features, function(d) { return d.properties.MWh});
  var mean_mwh = d3.mean(geodata.features, function(d) { return d.properties.MWh});
  var med_mwh = d3.median(geodata.features, function(d) { return d.properties.MWh});

  var total_mwh = d3.sum(geodata.features, function(d) { return d.properties.MWh});


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
    .on("mouseover",showTooltip)
    .on("mousemove",moveTooltip)
    .on("mouseout",hideTooltip)
    .attr("stroke", "black")
    .attr("fill", function(d) {
      return color(d.properties.MWh); 
      });
      


    // //Legend
    // var defs = svg.append("defs");             

    // var linearGradient = defs.append("linearGradient")
    //                           .attr("id", "linear-gradient");

    // //Set the color for the start (0%)
    // linearGradient.append("stop")
    //               .attr("offset", "0%")
    //               .attr("stop-color", "#ffda66"); 

    // //Set the color for the median (50%)
    // linearGradient.append("stop")
    //               .attr("offset", "50%")
    //               .attr("stop-color", "#ff9800"); 

    // //Set the color for the end (100%)
    // linearGradient.append("stop")
    //               .attr("offset", "100%")
    //               .attr("stop-color", "#b60a1c"); 

    // linearGradient.attr("x1", "0%")
    //               .attr("y1", "100%")
    //               .attr("x2", "0%")
    //               .attr("y2", "0%");

    // svg.append("rect")
    //     .attr("width", width/55)
    //     .attr("height", height - height/2)
    //     .attr("id", "legend")
    //     .style("fill", "url(#linear-gradient)");

    // // Text

    // var legend = svg.append("rect")
    //                 .attr("width", width/30)
    //                 .attr("height", height-height/2)
    //                 .attr("fill", "white")
    //                 .attr("x", 10)
    //                 .style("text-anchor", "left");

    // var max_string = Intl.NumberFormat('de-DEU').format((Math.round(max_mwh/1000))*1000) + String(" MWh");

    // var text = svg.append("text")
    //                   .text(max_string)
    //                   .style("writing-mode", "vertical-lr")
    //                   .attr('x', 20)
    //                   .attr('fill', 'black')
    //                   .attr("font-size", "x-small");

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





  