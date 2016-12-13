/**
 * Created by PlayingBacon on 15.11.2016.
 */
(function() {
    'use strict';

    angular.module('core.d3Directive')
        .directive('d3Directive', ['d3Factory', function (d3) {
            return {
                restrict: 'EA',
                scope: {},
                link: function (scope, iElement, iAttrs) {
                    var svg = d3.select(iElement[0])
                        .append("svg")
                        .attr("width", "100%")
                        .attr("height", "100%");

                    // dummy data
                    scope.data = [
                        /*{name: "Greg", score: 98},
                        {name: "Ari", score: 96},
                        {name: "Loser", score: 48},
                        {name: "Me", score: 66},
                        {name: "Rita", score: 20},
                        {name: "Nameless", score: 75}*/
                        0.5, 0.6, 0.5, 3.0, 0.4, 0.5, 0.5, 0.6, 0.5, 1.0, 0.5, 0.5, 0.4, 0.7
                    ];

                    // on window resize, re-render d3 canvas
                    window.onresize = function () {
                        return scope.$apply();
                    };
                    scope.$watch(function () {
                        return angular.element(window)[0].innerWidth;
                    }, function () {
                        return scope.render(scope.data);
                    });

                    // define render function
                    scope.render = function (data) {
                        // remove all previous items before render
                        svg.selectAll("*").remove();

                        // setup variables
                        var str = "Output |";
                        /*var classes = d3.select(iElement[0]).attr("class");
                        for (var i = 0; i < classes.length; i++) {
                            str = str+ "| " +classes[i]+ " ";
                        }
                        console.log(str);*/
                        /*
                        var elements = d3.select(iElement[0]);
                        for (var i = 0; i < elements.length; i++) {
                            str = str + "| ::(" +i+ ") "
                            for (var j = 0; j < elements[i].length; j++) {
                                str = str + "| " +elements[i][j]+ " ";
                            }
                        }
                        console.log(str);*/
                        console.log("Bounding rect (div): " +d3.select(iElement[0]).node().getBoundingClientRect().width);
                        console.log("svg.width: " +svg.select("svg").offsetWidth);
                        var divs = d3.selectAll("div");
                        for (var i = 0; i < divs.length; i++) {
                            console.log(divs.attr("class"));
                            /*for (var j = 0; j < divs[i].length; j++) {
                                console.log("(" +i+ ") Class: " +divs[i][j].attr("class")+ " || Width: " +divs[i][j].node().getBoundingClientRect().width);
                            }*/
                        }

                        var width, height, max;
                        width = d3.select(iElement[0])[0][0];/*d3.select(iElement[0])[0][0].offsetWidth - 20;*/ // 20 is for margins
                        console.log("iElement[0]: " +d3.select(iElement[0])+ " | offsetWidth: " +d3.select(iElement[0]).offsetWidth);
                        console.log("(iElement[0])[0][0]: " +d3.select(iElement[0])[0][0]+ " | (iElement[0])[0][0].offsetWidth: " +d3.select(iElement[0])[0][0].offsetWidth);
                        height = scope.data.length * 35; // 35 = bar height (30) + margin (5)
                        max = 98; // just some value

                        var parent = svg.node().parentNode;
                        console.log("PARENT :: element : " +parent+ " ; offsetWidth : " +parent.offsetWidth+ " ; clientWidth : " +parent.clientWidth+ " ; scrollWidth : " +parent.scrollWidth);

                        var xScale = d3.scale.linear()
                            .domain([0,d3.max(scope.data,function(d){return d;})])
                            .range([0,/*WIDTH, die ich nicht berechnet kriege! WAH!*/]);
                        var yScale = d3.scale.linear()
                            .domain([0,d3.max(scope.data,function(d){return d;})])
                            .range([0,height]);

                        svg.attr("height", height);
                        svg.selectAll("circle")
                            .data(data)
                            .enter()
                            /*.append("rect")
                            .attr("height", 30)
                            .attr("width", 0)
                            .attr("x", 10)
                            .attr("y", function (d, i) {
                                return i * 35;
                            })*/
                            .append("circle")
                            .attr("cx",function(d,i){return i*100+100;})
                            .attr("cy",function(d,i){return ;})
                            .attr("r",10)
                            .attr("fill",function(d){return "rgb(" +(d+100)+ "," +(d+50)+ "," +d+ ")";});
                            /*.transition()
                            .duration(1000)
                            .attr("width", function (d) {
                                return d.score / (max / width);
                            })*/
                        svg.append("text")
                            .text("D3 funktioniert! Theoretisch!")
                            .attr("x","0px")
                            .attr("y","100px")
                            .attr("font-family","sans-serif")
                            .attr("font-size","20px")
                            .attr("color", "white");

                        console.log("NACH APPEND :: (iElement[0])[0][0]: " +d3.select(iElement[0])[0][0]+ " | (iElement[0])[0][0].offsetWidth: " +d3.select(iElement[0])[0][0].offsetWidth);
                    }
                }
                // directive code
            };
        }]);
}());