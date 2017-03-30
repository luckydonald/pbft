/**
 * Created by PlayingBacon on 27.10.2016.
 */
'use strict';

angular.
    module('failureTable').
    component('failureTable', {
        templateUrl: 'failure-table/failure-table.template.html',
        controller: ['$http','$compile','$scope', '$interval', function FailureTableController($http,$compile,$scope,$interval) {
            var self = this;
            var svg = null;
            var svgWidth = 0;
            var svgHeight = 0;
            var nW = 0;                 // node width, will be set in method setupNodeElements
            var nH = 50;                // node height
            var nC = "white";             // node color
            var gap = 0;                // gap between nodes, will be set in method setupNodeElements
            var tlPositions = [];
            var circleLog = [];         // logs at which position there have already been drawn circles to prevent stacking them
            var idLog = [];
            self.startstamp = 0;         // first timestamp that appears in the timeline
            var yProgress = 0;
            var arrowOffset = 18;       // offset for drawing arrowheads of lines correctly
            var eHeight = 0;            // height that gets occupied by all elements contained in the svg
            var scale = 1000;
            var EL_MAX = 100;           // maximum of how many elements can be present in the svg at the same time
            var isSetup = false;

            //var logInfoStore = [];
            var colors = ["#7cf1cb","#85b9f0","#ffcd83","#ffad83"];

            self.nodes = [/*1, 2, 3, 4*/]; // Nodes are added dynamically.

            var tlData = null;

            var pollValues = function() {
                //$http.get('../example/api/v2/get_timeline/index.html').success(function(response){
                $http.get(_API_URL+"/api/v2/get_timeline/").success(function(response){
                    tlData = response;
                    self.startstamp = tlData.timestamps.min.unix;
                    if (!isSetup) {
                        self.nodes = tlData.nodes;
                        self.setupTimeline(null,false);
                    }
                    handleTimelineInput(tlData);
                });
            }

            var promise = $interval(pollValues, 10000);
            $scope.$on('$destroy',function(){
                if(promise)
                    $interval.cancel(promise);
            });

            self.setupTimeline = (function(data, help) {
                d3.select("div#timeline").select("*").remove();
                data = self.nodes;
                svg = d3.select("div#timeline")
                    .append("svg")
                    .attr("width","100%").attr("height","400px");

                setupSvgDefs(svg);

                var minW = data.length*80;
                var tl = d3.select("div#timeline")[0][0];
                var width = tl.offsetWidth;
                svgWidth = maxVal(minW,width);
                svgHeight = tl.offsetHeight;

                window.onresize = (function() {
                    var oldWidth = svgWidth;
                    width = tl.offsetWidth;
                    svgWidth = maxVal(minW,width);
                    repositionSvgContent(oldWidth,svgWidth);
                    svgHeight = tl.offsetHeight;
                });
                setupBackground(parseInt(svg.attr("height"),10));
                if (help) {
                    setupHelpMeasurements(svgHeight);
                }
                self.setupNodeElements(svgHeight);
                isSetup = true;
            });

            // removes everything except the defs and arrows ^-^
            function clearSvg() {
                svg.selectAll("rect").remove();
                svg.selectAll("text").remove();
                svg.selectAll("circle").remove();
                svg.selectAll("line").remove();
                svg.selectAll("path:not(.norem)").remove();
            }

            function setupSvgDefs(svg) {
                // as of now it's not possible to reference the fill color
                // of the element from within the marker declaration
                // http://bl.ocks.org/mbostock/1153292
                var lel = {init: 0, propose: 1, prevote: 2, vote: 3};
                svg.append("defs").selectAll("marker")
                  .data(Object.keys(lel))
                    .enter().append("marker")
                      .attr("id", function(d) { return d + "Arrow"; })
                      .attr("viewBox", "0 -5 10 10")
                      .attr("refX", 15)
                      .attr("refY", 0)
                      .attr("markerWidth", 6)
                      .attr("markerHeight", 6)
                      .attr("orient", "auto")
                    .append("path")
                      .attr("d", "M0,-5L10,0L0,5")
                      .attr("fill", function(d) { return colors[lel[d]]; });
            }


            function setupBackground(svgHeight) {
                out("### SVG HEIGHT FOR BG: " +svgHeight);
                var selection = svg.select("rect.svgBg");
                if (selection[0][0] != undefined && selection[0][0] != null) {
                    //selection[0][0].height.baseVal.value = Math.floor(svgHeight);
                    selection[0][0].height.baseVal.newValueSpecifiedUnits(1,svgHeight);
                } else {
                    svg.append("rect")
                        .attr("class","svgBg")
                        .attr("x",0).attr("y",0)
                        .attr("width",svgWidth).attr("height",svgHeight)
                        .attr("fill","transparent");
                }
            }

            self.setupNodeElements = function (svgHeight) {      //isAnim selects if node entry should be animated or not
                var len = self.nodes.length;
                nW = svgWidth/(len*len); // node width
                gap = (svgWidth-(nW*len))/(len+1);  // one gap := (<width of svg> - <width of all nodes combined>) / (<number of gaps present in the svg>)
                                                        // NOTE: every node has one gap to it's left and right
                var y = svgHeight*0.1;
                for (var i = 0; i < len; i++) {
                    var x = i*nW+(i+1)*gap;
                    svg.append("rect")
                        .attr("x",x).attr("y",y)
                        .attr("width",nW).attr("height",nH)
                        .attr("fill",nC);

                    var txtW = getTextWidth("Node " +self.nodes);
                    if (nW > txtW+10) {
                        var text = svg.append("text")
                            .text("Node " +self.nodes)
                            .attr("x",x+(nW/2-txtW/2)).attr("y",(y+nH/2))
                            .attr("fill"," #124")
                            .attr("font-family","Verdana")
                            .attr("font-weight","bold");
                    } else {
                        txtW = getTextWidth(self.nodes[i]);
                        var text = svg.append("text")
                            .text(self.nodes[i])
                            .attr("x",x+(nW/2-txtW/2)).attr("y",(y+nH/2))
                            .attr("fill"," #124")
                            .attr("font-family","Verdana")
                            .attr("font-weight","bold");
                    }

                    tlPositions[self.nodes[i]] = x+(nW/2);
                    yProgress = y+nH+30;

                    drawNodeLine(x,y);
                }

                eHeight = nH + y;
            };

            function drawNodeLine(x,y) {
                svg.append("line")
                    .classed("nodeLine","true")
                    .attr("x1",(x+(nW/2))).attr("y1",y+(nH/2))
                    .attr("x2",(x+(nW/2))).attr("y2",svg.attr("height"))
                    .attr("stroke",nC).attr("stroke-width",1).attr("stroke-linecap","round").attr("stroke-dasharray","1,5");
            }

            function handleTimelineInput(data) {
                for (var i = 0; i < data.events.length; i++) {
                    var event = data.events[i];
                    //var yHeight = 0;
                    if (event.action === "acknowledge") {
                        if (((event.timestamps.send.unix-self.startstamp)*scale+yProgress) >= yProgress
                            && !(areIn(idLog,event.id.send,event.id.receive))) {
                            drawEndLine(event);
                        }
                    } else {
                        if (!(isIn(idLog,event.id.send))) {
                            drawStartingCircle(event);
                        }
                    }
                    
                    circleLog = [];
                }
                //printIdLog();
                deOverflow();

                var circles = svg.selectAll("circle");
                eHeight = circles[0][circles[0].length-1].cy.baseVal.value + 28 + 50;
                // eHeight + (margin from last phase or nodes) + (span of two circles) + (additional margin)
                //eHeight = eHeight + ((data.events[data.events.length-1].timestamps.receive.unix-self.startstamp)*scale-eHeight) + 28 + 50;
                if(eHeight > parseInt(svg.attr("height"),10)) {
                    svg.attr("height",(eHeight+"px"));
                    setupBackground(eHeight);
                    var content = svg.selectAll("line.nodeLine");
                    for (var k = 0; k < self.nodes.length; k++) {
                        var line = content[0][k];
                        line.y2.baseVal.value = eHeight;
                    }
                }

                /*var circles = svg.selectAll("circle.new");
                for (var j = 0; j < circles[0].length; j++) {
                    $compile(circles[0][j])($scope);
                    //var cls = getAttrValue(circles[0][j],"class").split(" ");
                    //setAttrValue(circles[0][j],"class",(cls[0]))
                }
                circles.classed("new","false");*/

            }

            function drawStartingCircle(event) {
                var cy = (event.timestamps.send.unix-self.startstamp)*scale+yProgress;
                if (!(isIn(idLog,"i"+event.id.send)) && cy > yProgress) {
                    out("new startp circle with id " +event.id.send);

                    svg.append("circle")
                        .classed("action-"+event.action, "true").classed("type-"+event.type, "true")
                        .attr("cId","i"+event.id.send)
                        .attr("tSt","t"+event.timestamps.send.unix)
                        .attr("cx",tlPositions[event.nodes.send])
                        .attr("cy",cy)
                        .attr("r",7);

                    idLog.push("i"+event.id.send);
                }

                //var logInfoObj = {id:(""+event.id.send), cx:tlPositions[event.nodes.send], cy:(event.timestamps.send.unix-self.startstamp)*scale+yProgress, timestamp:(""+event.timestamps.send)};
                //logInfoStore.push(logInfoObj);

                // eHeight + (margin from last phase or nodes) + (span of two circles) + (additional margin)
                //eHeight = eHeight + ((event.timestamps.send.unix-self.startstamp)*scale-eHeight) + 28 + 50;
            }

            function drawEndLine(event) {
                var arrow = event.type+"Arrow";
                var cy = (event.timestamps.receive.unix-self.startstamp)*scale+yProgress;
                if (!(isIn(idLog,"i"+event.id.receive)) && cy > yProgress) {
                    out("new endp circle with id " +event.id.receive);
                    var circle = svg.append("circle")
                            .classed("action-"+event.action, "true").classed("type-"+event.type, "true")
                            .classed("tooltip","true")
                            .attr("cId","i"+event.id.receive)
                            .attr("tSt","t"+event.timestamps.receive.unix)
                            .attr("cx",tlPositions[event.nodes.receive])
                            .attr("cy",cy)
                            .attr("r",7)
                            // end
                            .attr("data-meta", JSON.stringify(event));
                    $(circle).tooltipster({functionInit: tooltipContent, interactive: true, theme: ['tooltipster-punk', 'tooltipster-punk-' + event.action + '-' + event.type], trigger: 'click'});

                    var x_send = tlPositions[event.nodes.send];
                    var x_receive = tlPositions[event.nodes.receive];
                    var y_send = (event.timestamps.send.unix-self.startstamp)*scale+yProgress;
                    var y_receive = (event.timestamps.receive.unix-self.startstamp)*scale+yProgress;
                    if (x_send == x_receive) {
                        // create three lines that act as one line with two 90° angles
                        svg.append("polyline")
                            .attr("points",
                                (x_send   ) +","+ y_send +" "+
                                (x_send+30) +","+ y_send +" "+
                                (x_send+30) +","+ y_receive +" "+
                                (x_send   ) +","+ y_receive +" "
                            )
                            .attr("sId","i"+event.id.send).attr("rId","i"+event.id.receive)
                            .classed("arrow", true).classed("type-" + event.type, true)
                            .attr("marker-end",("url(#"+arrow+")"));
                    } else {
                        svg.append("line")
                            .classed("arrow", true).classed("type-" + event.type, true)
                            .attr("sId","i"+event.id.send).attr("rId","i"+event.id.receive)
                            .attr("x1",x_send).attr("y1",y_send)
                            .attr("x2",x_receive).attr("y2",y_receive)
                            .attr("marker-end",("url(#"+arrow+")"));
                    }

                    idLog.push("i"+event.id.receive);
                }

                // eHeight + (margin from last phase or nodes) + (span of two circles) + (additional margin)
                //eHeight = eHeight + ((event.timestamps.receive.unix-self.startstamp)*scale-eHeight) + 28 + 50;
            }

            function repositionSvgContent(oldWidth,newWidth) {
                //out("old width:"+oldWidth+" -> new width:"+newWidth);
                if (oldWidth != newWidth) {
                    var perc = (newWidth/(oldWidth/100))/100; //percentage where 1.0 equals 100%, how many % is newWidth to oldWidth
                    gap = gap*perc;
                    var content = svg.selectAll("*:not(text)");
                    for (var i = 0; i < content[0].length; i++) {
                        if (content[0][i].tagName === "rect") {
                            if (content[0][i].attributes.class === undefined
                                || !(content[0][i].attributes.class.nodeValue === "svgBg")) {
                                var rect = content[0][i];
                                rect.x.baseVal.value = rect.x.baseVal.value * perc;
                                rect.width.baseVal.value = rect.width.baseVal.value * perc;
                                nW = rect.width.baseVal.value;
                            } else {
                                var bg = content[0][i];
                                bg.width.baseVal.value = bg.width.baseVal.value * perc;
                            }
                        } else if (content[0][i].tagName === "circle") {
                            var circle = content[0][i];
                            circle.cx.baseVal.value = circle.cx.baseVal.value * perc;
                            // change cx value in log info store too!
                            var classes = circle.attributes.class.nodeValue.split(" ");
                            for (var j = 0; j < classes.length; j++) {
                                if (classes[j][0] === "c") {
                                    var cid = parseInt(classes[j].split("_")[1]);
                                    logInfoStore[cid].cx = circle.cx.baseVal.value;
                                }
                            }
                        } else if (content[0][i].tagName === "line") {
                            var line = content[0][i];
                            if (content[0][i].attributes.class === undefined
                                || !(content[0][i].attributes.class.nodeValue === "nodeLine")) {
                                line.x1.baseVal.value = line.x1.baseVal.value * perc;
                                line.x2.baseVal.value = line.x2.baseVal.value * perc;
                            } else {
                                line.x1.baseVal.value = line.x1.baseVal.value * perc;
                                line.x2.baseVal.value = line.x2.baseVal.value * perc;
                            }
                        } else if (content[0][i].tagName === "polyline") {
                            var polyline = content[0][i];
                            //var classes = polyline.attributes.class.nodeValue.split(" ");
                            var points = polyline.attributes.points.nodeValue.split(" ");
                            var new_points = [];
                            for (var j = 0; j < points.length; j++) {
                                var coords = points[j].split(",");
                                if (coords[0].length == 0) {
                                    continue;
                                }
                                var new_x = parseFloat(coords[0]) * perc;
                                if (new_x == 0 || isNaN(new_x)) {
                                    console.log("new_x", new_x)
                                }
                                coords[0] = "" + (new_x);  // change x coordinate
                                new_points.push(coords.join(","));
                            }
                            polyline.attributes.points.nodeValue = new_points.join(" ");
                        }
                    }
                    content = svg.selectAll("text");
                    for (var i = 0; i < content[0].length; i++) {
                        var text = content[0][i];
                        //var x = i*nW+(i+1)*gap;
                        //x+(nW/2-txtW/2)
                        if (getTextWidth((text.innerHTML.length > 1 ? text.innerHTML : "Node "+text.innerHTML))+10 >= nW) {
                            text.innerHTML = delFromString(text.innerHTML,"Node ");
                        } else {
                            text.innerHTML = (text.innerHTML.length > 1 ? text.innerHTML : "Node "+text.innerHTML);
                        }
                        var x = i*nW+(i+1)*gap;
                        text.x.baseVal[0].value = x+(nW/2-getTextWidth(text.innerHTML)/2);
                    }
                }
            }

            function deOverflow() {
                out("idLog length " +idLog.length);
                if (idLog.length < EL_MAX) {
                    return;
                } else {
                    do {
                        var delId = idLog.shift();
                        svg.selectAll("[cId="+delId+"]").remove();
                        svg.selectAll("[rId="+delId+"]").remove();
                        var lines = svg.selectAll("[sId="+delId+"]");
                        if (lines[0].length > 0) {
                            for (var i = 0; i < lines[0].length; i++) {
                                var receiver = lines[0][i].attributes[2].value;
                                svg.selectAll("[cId="+receiver+"]").remove();
                                lines[0][i].remove();
                                idLog.splice(idLog.indexOf(receiver),1);
                            }
                        }
                    } while (idLog.length >= EL_MAX);

                    var circles = svg.selectAll("circle");
                    var nonpoly = svg.selectAll("line:not(.nodeLine)");
                    var poly = svg.selectAll("polyline");
                    var len = maxVal(maxVal(circles[0].length,nonpoly[0].length),poly[0].length);
                    var offset = circles[0][0].attributes[4].value-yProgress;
                    for (var j = 0; j < len; j++) {
                        if (j < circles[0].length) {
                            out("---\noffset:"+offset+"\nold circle cy:"+circles[0][j].cy.baseVal.value
                                +" ; new circle cy:"+(circles[0][j].cy.baseVal.value-offset)+"\ntstmp:"+circles[0][j].attributes[2].value+" ; startstamp:"+self.startstamp+"\n---");
                            circles[0][j].cy.baseVal.value = circles[0][j].cy.baseVal.value - offset;
                            if (j === circles[0].length-1) {
                                self.startstamp = (circles[0][j].attributes[2].value).split("t")[1]; // new startstamp = tSt (timestamp) of last circle
                            }
                        }
                        if (j < nonpoly[0].length) {
                            nonpoly[0][j].y1.baseVal.value = nonpoly[0][j].y1.baseVal.value - offset;
                            nonpoly[0][j].y2.baseVal.value = nonpoly[0][j].y2.baseVal.value - offset;
                        }
                        if (j < poly[0].length) {
                            poly[0][j].points[0].y = poly[0][j].points[0].y - offset;
                            poly[0][j].points[1].y = poly[0][j].points[1].y - offset;
                            poly[0][j].points[2].y = poly[0][j].points[2].y - offset;
                            poly[0][j].points[3].y = poly[0][j].points[3].y - offset;
                        }
                    }



                    /*out("to high, do shifting!");
                    var delId = idLog.shift();
                    var lines = svg.selectAll("[sId="+delId+"]");
                    if (lines[0].length > 0) {
                        for (var i = 0; i < lines[0].length; i++) {
                            out("currently:: lines with "+delId+" ; deleting circles "+lines[0][i].attributes[1].value+" and "+lines[0][i].attributes[2].value);
                            svg.selectAll("[cId="+lines[0][i].attributes[1].value+"]").remove();
                            svg.selectAll("[cId="+lines[0][i].attributes[2].value+"]").remove();
                            lines[0][i].remove();
                            idLog.shift();
                        }
                    }
                    if (!(isIn(idLog,"i"+id))) {
                        idLog.push("i"+id);
                    }*/
                }
            }

            function getTextWidth(str) {
                var temp = d3.select("body")
                    .append("svg");
                temp.append("text").text(str).attr("x",0).attr("y",20).attr("font-family","Verdana").attr("font-weight","bold");
                var tW = temp.node().getBBox().width;
                temp.remove();

                return tW;
            }

            function getAttrValue(elem,attr) {
                for (var i = 0; i < elem.attributes.length; i++) {
                    var splitted = elem.attributes[i].split("=");
                    if (splitted[0] === attr) {
                        return splitted[1];
                    }
                }
                return "NOTFOUND";
            }

            function setAttrValue(elem,attr,val) {
                for (var i = 0; i < elem.attributes.length; i++) {
                    if (elem.attributes[i].split("=")[0] === attr) {
                        elem.attributes[i].value = val;
                    }
                }
            }

            function setupHelpMeasurements(svgHeight) {
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

            function calculateYCoordinate(startP,endP,x) {
                // y = m*x+b
                out("start-x: " +startP.x+ "; start-y: " +startP.y+ "; end-x: " +endP.x+ "; end-y: " +endP.y);
                var m = (endP.y-startP.y)/(endP.x-startP.x);
                if (isNaN(m)) {
                    console.log(NaN)
                }
                var b = startP.y - m*startP.x;
                if (isNaN(b)) {
                    console.log(NaN)
                }
                if (isNaN(m*x+b)) {
                    console.log(NaN)
                }
                return (m*x+b);
            }

            function isIn(arr,val) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] === val) {
                        return true;
                    }
                }
                return false;
            }

            function areIn(arr,val1,val2) {
                var bool1, bool2;
                for (var i = 0; i < arr.length; i++) {
                    bool1 = (arr[i] === val1);
                    bool2 = (arr[i] === val2);
                    if (bool1 && bool2) {
                        return true;
                    }
                }
                return false;
            }

            function isAtIndex(arr,val) {
                for (var i = 0; i < arr.val; i++) {
                    if (arr[i] === val) {
                        return i;
                    }
                }
                return undefined;
            }

            function printIdLog() {
                out("length:"+idLog.length);
                for (var i = 0; i < idLog.length; i++) {
                    out("[i:"+i+"]-> id:"+idLog[i]+"\n");
                }
            }

            function maxVal(n1,n2) {
                return n1 <= n2 ? n2 : n1;
            }

            function delFromString(str,substr) {
                var res = "";
                for (var i = 0; i < str.length; i++) {
                    if (str[i] == substr[0]) {
                        var k = i+1;
                        for (var j = 1; j < substr.length; j++) {
                            if (str[k] == substr[j]) {
                                if (j == substr.length-1) {
                                    i = k;
                                    break;
                                }
                                k++;
                            } else {
                                break;
                            }
                        }
                    } else {
                        res = res+str[i];
                    }
                }
                return res;
            }

            function printArray(array) {
                var str = "";
                for (var i = 0; i < array.length; i++) {
                    str = str +array[i]+ " "
                }
                return str;
            }

            function out(str) {
                console.log(str);
            }
        }]
});