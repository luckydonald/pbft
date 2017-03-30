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
        controller: ['$http','$scope','$interval', function ValueGraphController($http,$scope,$interval) {
            var self = this;
            self.nodeData = {};
            var myChart = null;
            self.series = null;

            var pollGraphs = function() {
                var url;
                if (self.nodeid === 'summary' || self.nodeid == undefined) {
                    url = _API_URL + "/get_data/?limit=40";
                } else {
                    url = _API_URL + "/get_data/?limit=10&node="+self.nodeid;
                }

                $http.get(url).then(function (json) {
                    /*var str = "### DATA :: ";
                     for (var i = 0; i < nodeData.length; i++) {
                     str = str+ "(" +i+ ")->" +nodeData[i]+ " ";
                     }
                     out(str);*/

                    for (var node in json.data) {
                        if (json.data.hasOwnProperty(node)) {
                            self.nodeData[node] = [];
                            for (var timestamp in json.data[node]) {
                                if (json.data[node].hasOwnProperty(timestamp)) {
                                    var value=json.data[node][timestamp];
                                    self.nodeData[node][self.nodeData[node].length] = {timestamp:timestamp,value:value};
                                }
                            }
                        }
                    }
                    /*
                     for (var node in json.data) {
                     if (json.data.hasOwnProperty(node)) {
                     for (var timestamp in json.data[node]) {
                     if (json.data[node].hasOwnProperty(timestamp)) {
                     var value=json.data[node][timestamp];
                     self.nodeData.push({id:node,timestamp:timestamp,value:value});
                     }
                     }
                     }
                     }*/

                    if (myChart == null) {
                        constructVG(self.nodeData);
                    }
                    drawGraphs(self.nodeData);
                }, function(json) {
                    out("Yeah, that did not work, at all.");
                }, function(json) {
                    out("What does this even do?");
                })
            };

            var promise = $interval(pollGraphs, 5000);
            $scope.$on('$destroy',function(){
                if(promise)
                    $interval.cancel(promise);
            });

            out("data outer :: " +self.nodeData);

            function dataToValues(nodeData){
                var list = [];
                for (var node in nodeData) {
                    if (!nodeData.hasOwnProperty(node)) {
                        continue;
                    }
                    list[list.length] = {
                        name: 'Node ' + node,
                        data: [nodeData[node]]
                    }
                }
                return list;
            }

            function constructVG(data) {
                console.log("CONSTRUCT STUFF: ",data);
                setHighchartsTheme();
                var chart_data = dataToValues(data);
                myChart = Highcharts.chart('value-graph-container', {
                    chart: {
                        type: 'spline',
                        events: {
                            load: function() {
                                self.series = this.series;
                            }
                        }
                    },
                    title: {
                        text: 'Values over Time'
                    },
                    xAxis: {
                        type: 'datetime',
                        title: {
                            text: 'time'
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'values'
                        }
                    },
                    series: chart_data
                    /*[{
                        name: 'Node 1',
                        data: [1, 2.5, 2, 1.5, 2, 3, 2]
                    }, {
                        name: 'Node 2',
                        data: [1.5, 2.5, 2, 1.5, 1, 2, 1.5]
                    }, {
                        name: 'Node 3',
                        data: [1.75, 2.75, 2, 1.5, 3, 2, 1.5]
                    }, {
                        name: 'Node 4',
                        data: [1, 2.5, 2, 1.5, 2, 2, 2.5]
                    }]*/
                });
                d3.select("text.highcharts-credits").remove();

                /*var svg = d3.select("div.value-graph")
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
                    drawGraphs(null);
                    console.log("resize!");
                });*/

                /*var xScale = d3.scale.linear()
                    .domain([0,d3.max()])
                    .range();
                var yScale = d3.scale.linear()
                    .domain()
                    .range();*/
            }

            function drawGraphs(nodes) {
                for (var node in nodes) {
                    var d = [];
                    for (var i = 0; i < nodes[node].length; i++) {
                        var date = new Date(parseInt(nodes[node][i].timestamp,10)*1000);
                        d[i] = [date, nodes[node][i].value];
                    }
                    for (var i = 0; i < self.series.length; i++) {
                        if (self.series[i].name === 'Node ' + node) {
                            self.series[i].update({data: d}, true);
                        }
                    }
                }

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
                /*var lineFunction = d3.svg.line()
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
                */
            }

            function setHighchartsTheme() {
                Highcharts.theme = {
                    colors: ['#ffffff', '#fff3e2', '#ffcd83', '#ffad32', 'ffa51f', '#ff0066', '#eeaaee',
                        '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
                    chart: {
                        backgroundColor: 'transparent',
                        style: {
                            fontFamily: '\'Unica One\', sans-serif'
                        },
                        plotBorderColor: '#606063'
                    },
                    title: {
                        style: {
                            color: '#124',
                            fontSize: '20px'
                        }
                    },
                    subtitle: {
                        style: {
                            color: '#323d51'
                        }
                    },
                    xAxis: {
                        gridLineColor: '#323d51',
                        labels: {
                            style: {
                                color: '#124'
                            }
                        },
                        lineColor: '#323d51',
                        minorGridLineColor: '#124',
                        tickColor: '#323d51',
                        title: {
                            style: {
                                color: '#124'

                            }
                        }
                    },
                    yAxis: {
                        gridLineColor: '#323d51',
                        labels: {
                            style: {
                                color: '#124'
                            }
                        },
                        lineColor: '#323d51',
                        minorGridLineColor: '#124',
                        tickColor: '#323d51',
                        tickWidth: 1,
                        title: {
                            style: {
                                color: '#124'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#124',
                        style: {
                            color: '#F0F0F0'
                        }
                    }
                };

                // Apply the theme
                Highcharts.setOptions(Highcharts.theme);
            }

            // I'm a lazy fuck.
            function out(str) {
                console.log(str);
            }
        }]
    });
