/**
 * Created by PlayingBacon on 07.11.2016.
 */
'use strict';

angular.
    module('valueGraph').
    component('valueGraph', {
        templateUrl: 'value-graph/value-graph.template.html',
        bindings: {
            nodeid: '='
        },
        controller: ['$http', function ValueGraphController($http) {
            var nodeData = null;
            var self = this;

            $http.get('node-values.json').then(function (response) {
                nodeData = response.data;
                var str = "### DATA :: ";
                for (var i = 0; i < nodeData[self.nodeid].length; i++) {
                    str = str+ "(" +i+ ")->" +nodeData[self.nodeid][i].value+ " ";
                }
                out(str);
                constructVG(nodeData[self.nodeid]);
            }, function(response) {
                out("Yeah, that did not work, at all.");
            }, function(response) {
                out("What does this even do?");
            });

            out("data outer :: " +nodeData);

            function constructVG(data) {
                var svg = d3.select("div.value-graph")
                    .append("svg")
                    .attr("width", "100%")
                    .attr("height", "100%")
                    .attr("preserveAspectRatio","xMidYMin");

                var vg = d3.select("div.value-graph")[0][0];
                var max = data.length;
                var width = vg.offsetWidth;
                var height = vg.offsetHeight;
                out("### MEASUREMENTS :: width " +width+ " height " +height+ " max " +max);

                window.onresize = (function(){
                    width = vg.offsetWidth;
                    height = vg.offsetHeight;
                    createSVGContent(svg,width,height,data,max);
                    console.log("resize!");
                });

                /*var xScale = d3.scale.linear()
                    .domain([0,d3.max()])
                    .range();
                var yScale = d3.scale.linear()
                    .domain()
                    .range();*/

                createSVGContent(svg,width,height,data,max);
            }

            function createSVGContent(svg, width, height, data, max) {
                /*svg.selectAll("*").remove();
                svg.append("rect").attr("width",width).attr("height",height).attr("fill","blue");
                svg.selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d,i){return i*(width/max)+((width/2)/max);})
                    .attr("cy", function(){return height/2;})
                    .attr("r", function(d){return d.value*30;})
                    .attr("fill", "white");
                */
                var lineFunction = d3.svg.line()
                    .x(function(d){return d.x;})
                    .y(function(d){return d.y;})
                    .interpolate("linear");

                svg.selectAll("*").remove();
                svg.append("rect").attr("width",width).attr("height",height).attr("fill","blue");
                svg.append("path")
                    .attr("d", lineFunction(data))
                    .attr("stroke", "black")
                    .attr("stroke-width", 2)
                    .attr("fill", "none");
            }

            // I'm a lazy fuck.
            function out(str) {
                console.log(str);
            }
        }]
    });
