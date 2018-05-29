import d3 from 'd3';
import { AggResponseTabifyProvider } from 'ui/agg_response/tabify/tabify';
import { uiModules } from 'ui/modules';
import numeral from 'numeral';
import { VisAggConfigProvider } from 'ui/vis/agg_config';
import AggConfigResult from 'ui/vis/agg_config_result';


const module = uiModules.get('kibana/multi-line', ['kibana']);
var map = new Map();
var categories = new Set();
      var series = new Set();
      var colors = ["#3498db","#e74c3c","#2ecc71","#7FFFD4","#FFE4C4","#00FFFF","#7FFF00","#FF1493","#8B0000"];
module.controller('multiLineVisController', function ($scope, $element, $rootScope, Private) {
  const tabifyAggResponse = Private(AggResponseTabifyProvider);
  const AggConfig = Private(VisAggConfigProvider);
  let data = [];



    $scope.$watch('esResponse', (resp) => {
      //$scope.$watch('esResponse', function (resp) {
        map = new Map();
    if(resp) {
      console.debug('[computed-columns] Watch es response and vis params called');
      var tableGroups = $scope.tableGroups = null;
      let hasSomeRows = $scope.hasSomeRows = null;
      let computedColumns = $scope.vis.params.computedColumns;
      let hiddenColumns = $scope.vis.params.hiddenColumns;

      console.log(resp);
      resp.tables.forEach(function (table) {  
        categories = new Set();
        series = new Set();
        const cols = table.columns;
        table.rows.forEach(function (row,i) {
          var axes = {};
          for (let i = 1; i < row.length; i++) {
            if(cols[i].aggConfig.__type.name.startsWith('min')) {
              axes.y = row[i];
            }
            else if(cols[i].aggConfig.__type.name.startsWith('max')) {
              axes.y0 =  row[i];
            }
            else if(cols[i].aggConfig.__type.name.startsWith('date')) {
              axes.month = row[i];
              categories.add(row[i]);
            }
          }
          series.add(row[0]);
          if(map.has(row[0])) {
             map.get(row[0]).push(axes);
          }
          else{
            var lcl = [];
            lcl.push(axes);
            map.set(row[0],lcl);
          }
        });
      });
      if(map.size>1)
        render_chart(map);
    }
  });

  function init_render(map) {
    
  }

  function render_chart(map) {
      var stack = d3.layout.stack();
     var dataset = {};
     var colorSet = new Array();
      var layers  = new Array();
     for(let i=0;i<series.size;i++) {
       colorSet.push(colors[i])
     }
      map.forEach(function (value, key, mapObj){
        layers.push(value);
      });
      dataset.categories = Array.from(categories.values());
      dataset.series = Array.from(series.values());
      dataset.colors = colorSet;
      dataset.layers = layers;
      console.log(dataset);

      var n = dataset["series"].length // Number of Layers
      var m = dataset["layers"].length // Number of Samples in 1 layer

      var yGroupMax = d3.max(dataset["layers"], function(layer) { return d3.max(layer, function(d) { return d.y0; }); });
      var yGroupMin = d3.min(dataset["layers"], function(layer) { return d3.min(layer, function(d) { return d.y; }); });
      
      var margin = {top: 50, right: 50, bottom: 50, left: 100},
      width = 900 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      d3.select("#chartDiv").selectAll('svg').remove();
      let svg = d3.select("#chartDiv").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var x = d3.scale.ordinal()
      .domain(dataset["categories"])
      .rangeRoundBands([0, width], .08);

  var y = d3.scale.linear()
      .domain([yGroupMin, yGroupMax])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .tickSize(5)
      .tickPadding(6)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");
  

  var layer = svg.selectAll(".layer")
      .data(dataset["layers"])
      .enter().append("g")
      .attr("class", "layer");

  var rect = layer.selectAll("rect")
      .data(function(d,i){d.map(function(b){b.colorIndex=i;return b;});return d;})
      .enter().append("rect")
      .transition()
      .duration(500)
      .delay(function(d, i) { return i * 10; })
      .attr("x", function(d, i, j) { return x(d.month) + x.rangeBand() / n * j; })
      .attr("width", x.rangeBand() / n)
      .transition()
      .attr("y", function(d) { return y(d.y0); })
      .attr("height", function(d) { return height - y(d.y0-d.y)})
      .attr("class","bar")
      .style("fill",function(d){return dataset["colors"][d.colorIndex];})

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.select("g")
          .attr("class", "y axis")
          .call(yAxis);

      svg.append("text")
      .attr("x", width/3)
      .attr("y", 0)
      .attr("dx", ".71em")
      .attr("dy", "-.71em")
      .text("Min - Max Temperature (Month wise)");

  //add legend
  var legend = svg.append("g")
    .attr("class", "legend")

  legend.selectAll('text')
    .data(dataset["colors"])
    .enter()
    .append("rect")
    .attr("x", width-margin.right)
    .attr("y", function(d, i){ return i *  20;})
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function(d) {
      return d;
    })

  legend.selectAll('text')
    .data(dataset["series"])
    .enter()
  .append("text")
  .attr("x", width-margin.right + 25)
  .attr("y", function(d, i){ return i *  20 + 9;})
  .text(function(d){return d});

  var tooltip = d3.select("body")
  .append('div')
  .attr('class', 'tooltip');

  tooltip.append('div')
  .attr('class', 'month');
  tooltip.append('div')
  .attr('class', 'tempRange');

  svg.selectAll("rect")
  .on('mouseover', function(d) {
      if(!d.month)return null;

      tooltip.select('.month').html("<b>" + d.month + "</b>");
      tooltip.select('.tempRange').html(d.y + "&#8451; to " + d.y0 + "&#8451;");

      tooltip.style('display', 'block');
      tooltip.style('opacity',2);

  })
  .on('mousemove', function(d) {

      if(!d.month)return null;

      tooltip.style('top', (d3.event.layerY + 50) + 'px')
      .style('left', (d3.event.layerX + 525) + 'px');
  })
  .on('mouseout', function() {
      // tooltip.style('display', 'none');
      // tooltip.style('opacity',0);
  });


  }


});