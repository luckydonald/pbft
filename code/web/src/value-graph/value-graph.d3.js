/**
 * Created by PlayingBacon on 15.11.2016.
 */
'use strict';

angular.
    module('valueGraph').
    component('valueGraphD3', {
        template: '',
        bindings: {
            data: '='
        },
        controller: ['d3Factory', function ValueGraphD3Controller(d3) {
            var vg = d3.select("div.value-graph")[0][0];
            var width = vg.offsetWidth;
            var height = vg.offsetHeight;
            var max = 30;
            var svg = d3.select("div.value-graph")
                .append("svg")
                .attr("width", "100%")
                .attr("height", "100%");

            var str = "### DATA :: ";
            for (var i = 0; i < this.data.length; i++) {
                str = str+ "(" +i+ ")->" +this.data[i]+ " ";
            }
            out(str);
            out("### MEASUREMENTS :: width " +width+ " height " +height);

            svg.append("rect").attr("width","100%").attr("height","100%").attr("fill","black");
            svg.selectAll("circle")
                .data(this.data)
                .enter()
                .append("circle")
                .attr("cx", function(){return 1000 * (max/width);})
                .attr("cy", function(){return height/2;})
                .attr("r", function(d){return d*30;})
                .attr("fill", "white");


            // I'm a lazy fuck.
            function out(str) {
                console.log(str);
            }
        }]
});