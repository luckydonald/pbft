/**
 * Created by PlayingBacon on 27.10.2016.
 */
'use strict';

angular.
    module('failureTable').
    component('failureTable', {
        templateUrl: 'failure-table/failure-table.template.html',
        controller: ['$http', function FailureTableController($http) {
            var self = this;

            self.nodes = [{
                "id": "1"    
            }, {
                "id": "2"
            }, {
                "id": "3"
            }, {
                "id": "4"
            }/*, {
                "id": "5"
            }, {
                "id": "6"
            }*/];

            self.setupTimeline = (function(data, help) {
                d3.select("div#timeline").select("*").remove();

                var svg = d3.select("div#timeline")
                    .append("svg")
                    .attr("width","100%").attr("height","100%");

                var tl = d3.select("div#timeline")[0][0];
                var width = tl.offsetWidth;
                var height = tl.offsetHeight;

                window.onresize = (function() {
                    width = tl.offsetWidth;
                    height = tl.offsetHeight;
                    svg.selectAll("*").remove();
                    setupBackground(svg,width,height);
                    if (help) {
                        setupHelpMeasurements(svg,width,height);
                    }
                    setupNodeElements(svg,width,height);
                });
                setupBackground(svg,width,height);
                if (help) {
                    setupHelpMeasurements(svg,width,height);
                }
                setupNodeElements(svg,width,height);
            });

            self.setupTimeline(null,false);
            
            function setupBackground(svg,svgWidth,svgHeight) {
                svg.append("rect")
                    .attr("x",0).attr("y",0)
                    .attr("width",function(){return svgWidth;}).attr("height",function(){return svgHeight;})
                    .attr("fill","white");
            }

            function setupNodeElements(svg, svgWidth, svgHeight) {
                var len = self.nodes.length;
                var nW = svgWidth/(len*len); // node width
                var nH = 50; // node height
                var nC = "red"; // node color
                var gap = (svgWidth-(nW*len))/(len+1);  // one gap := (<width of svg> - <width of all nodes combined>) / (<number of gaps present in the svg>)
                                                        // NOTE: every node has one gap to it's left and right
                var y = svgHeight*0.1;
                for (var i = 0; i < len; i++) {
                    var x = i*nW+(i+1)*gap;
                    svg.append("rect")
                        .attr("x",x).attr("y",y)
                        .attr("width",function(){return nW;}).attr("height",function(){return nH;})
                        .attr("fill",nC);

                    var text = svg.append("text")
                        .text(function(){return "Node " +self.nodes[i].id;})
                        .attr("x",x+(nW/2-getTextWidth("Node" +self.nodes[i].id)/2)).attr("y",(y+nH/2))
                        .attr("fill","white")
                        .attr("font-family","Verdana");
                    svg.append("line")
                        .attr("x1",(x+(nW/2))).attr("y1",y+(nH/2))
                        .attr("x2",(x+(nW/2))).attr("y2",svgHeight)
                        .attr("stroke",nC).attr("stroke-width",3).attr("stroke-linecap","round").attr("stroke-dasharray","1,10");
                }
            }

            function getTextWidth(str) {
                var temp = d3.select("body")
                    .append("svg");
                temp.append("text").text(str).attr("x",0).attr("y",20).attr("font-family","Verdana");
                var tW = temp.node().getBBox().width;
                temp.remove();

                return tW;
            }

            function setupHelpMeasurements(svg,svgWidth,svgHeight) {
                // setup vertical line at svg middle
                svg.append("line")
                    .attr("x1",(svgWidth/2)).attr("y1",0)
                    .attr("x2",(svgWidth/2)).attr("y2",svgHeight)
                    .attr("stroke","black").attr("stroke-width",2);

                // setup horizontal line at svg relative top
                svg.append("line")
                    .attr("x1",0).attr("y1",(svgHeight*0.05))
                    .attr("x2",svgWidth).attr("y2",(svgHeight*0.05))
                    .attr("stroke","black").attr("stroke-width",2);

                // add additional vertical lines with marking text to horizontal line
                for (var i = 0; i < (svgWidth/200); i++) {
                    svg.append("line")
                        .attr("x1",(svgWidth/2-(i*100))).attr("y1",(svgHeight*0.05))    // lines to the left of the middle
                        .attr("x2",(svgWidth/2-(i*100))).attr("y2",(svgHeight*0.06))    // "
                        .attr("stroke","black").attr("stroke-width",2);
                    svg.append("text")
                        .text(i*100)
                        .attr("x",(svgWidth/2-(i*100))).attr("y",(svgHeight*0.025))
                        .attr("font-family","Verdana").attr("font-size","10px")
                        .attr("fill","black");
                }
                for (var i = 1; i < (svgWidth/200); i++) {
                    svg.append("line")
                        .attr("x1",(svgWidth/2+(i*100))).attr("y1",(svgHeight*0.05))    // lines to the right of the middle
                        .attr("x2",(svgWidth/2+(i*100))).attr("y2",(svgHeight*0.06))    // "
                        .attr("stroke","black").attr("stroke-width",2);
                    svg.append("text")
                        .text(i*100)
                        .attr("x",(svgWidth/2+(i*100))).attr("y",(svgHeight*0.025))
                        .attr("font-family","Verdana").attr("font-size","10px")
                        .attr("fill","black");
                }

                // and also setup this weird little thingie
                // i*nW+(i+1)*gap
                /*var len = self.nodes.length;
                var nW = svgWidth/(len*4); // node width
                var gap = (svgWidth-(nW*len))/(len+1);
                for (var i = 0; i < len; i++) {
                    var x = i*nW+(i+1)*gap;
                    // i*nW ..
                    svg.append("line")
                        .attr("x1",(i*x)).attr("y1",(svgHeight*0.25))
                        .attr("x2",(i*x)+(i*nW)).attr("y2",svgHeight*0.25)
                        .attr("stroke","blue").attr("stroke-width",2);
                    svg.append("line")
                        .attr("x1",(i*x)).attr("y1",(svgHeight*0.25))
                        .attr("x2",(i*x)).attr("y2",(svgHeight*0.3))
                        .attr("stroke","blue").attr("stroke-width",1);
                    svg.append("line")
                        .attr("x1",(i*x)+(i*nW)).attr("y1",(svgHeight*0.25))
                        .attr("x2",(i*x)+(i*nW)).attr("y2",(svgHeight*0.3))
                        .attr("stroke","blue").attr("stroke-width",1);

                    // + (i+1)*gap
                    svg.append("line")
                        .attr("x1",(i*x)+(i*nW)).attr("y1",(svgHeight*0.35))
                        .attr("x2",(i*x)+(i*nW+(i+1)*gap)).attr("y2",svgHeight*0.35)
                        .attr("stroke","orange").attr("stroke-width",2);
                    svg.append("line")
                        .attr("x1",(i*x)+(i*nW)).attr("y1",(svgHeight*0.35))
                        .attr("x2",(i*x)+(i*nW)).attr("y2",(svgHeight*0.4))
                        .attr("stroke","orange").attr("stroke-width",1);
                    svg.append("line")
                        .attr("x1",(i*x)+(i*nW+(i+1)*gap)).attr("y1",(svgHeight*0.35))
                        .attr("x2",(i*x)+(i*nW+(i+1)*gap)).attr("y2",(svgHeight*0.4))
                        .attr("stroke","orange").attr("stroke-width",1);
                }*/
            }

            function out(str) {
                console.log(str);
            }
        }]
});