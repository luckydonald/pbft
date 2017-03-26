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
            var url = _SECRET_URL;
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
            var EL_MAX = 50;

            var logInfoStore = [];
            var colors = ["#7cf1cb","#85b9f0","#ffcd83","#ffad83"];

            self.nodes = [/*1, 2, 3, 4*/]; // Nodes are added dynamically.

            var tlData = null;

            //$http.get('test_timeline.json').success(function(response){
            $http.get(url+"/api/v2/get_timeline/").success(function(response){
                tlData = response;
                self.nodes = tlData.nodes;
                self.startstamp = tlData.timestamps.min.unix;

                self.setupTimeline(null,false);
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
                handleTimelineInput(tlData);
            });

            /*var pollTimeline = function() {

            }*/

            // removes everything except the defs and arrows ^-^
            function clearSvg() {
                svg.selectAll("rect").remove();
                svg.selectAll("text").remove();
                svg.selectAll("circle").remove();
                svg.selectAll("line").remove();
                svg.selectAll("path:not(.norem)").remove();
            }

            function setupSvgDefs() {
                // I know that the following is extremely bad code, but
                // as of now it's not possible to reference the fill color
                // of the element from within the marker declaration

                var defs = svg.append("defs");
                defs.append("marker")
                    .attr("id","initArrow")
                    .attr("markerWidth",7)
                    .attr("markerHeight",7)
                    .attr("refX",0)
                    .attr("refY",2)
                    .attr("orient","auto")
                    .attr("markerUnits","strokeWidth")
                    .append("path")
                    .attr("class","norem")
                    .attr("d","M0,0 L0,4 L4,2 z")
                    .attr("fill",colors[0]);
                defs.append("marker")
                    .attr("id","proposeArrow")
                    .attr("markerWidth",7)
                    .attr("markerHeight",7)
                    .attr("refX",0)
                    .attr("refY",2)
                    .attr("orient","auto")
                    .attr("markerUnits","strokeWidth")
                    .append("path")
                    .attr("class","norem")
                    .attr("d","M0,0 L0,4 L4,2 z")
                    .attr("fill",colors[1]);
                defs.append("marker")
                    .attr("id","prevoteArrow")
                    .attr("markerWidth",7)
                    .attr("markerHeight",7)
                    .attr("refX",0)
                    .attr("refY",2)
                    .attr("orient","auto")
                    .attr("markerUnits","strokeWidth")
                    .append("path")
                    .attr("class","norem")
                    .attr("d","M0,0 L0,4 L4,2 z")
                    .attr("fill",colors[2]);
                defs.append("marker")
                    .attr("id","voteArrow")
                    .attr("markerWidth",7)
                    .attr("markerHeight",7)
                    .attr("refX",0)
                    .attr("refY",2)
                    .attr("orient","auto")
                    .attr("markerUnits","strokeWidth")
                    .append("path")
                    .attr("class","norem")
                    .attr("d","M0,0 L0,4 L4,2 z")
                    .attr("fill",colors[3]);
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
                    .attr("class","nodeLine")
                    .attr("x1",(x+(nW/2))).attr("y1",y+(nH/2))
                    .attr("x2",(x+(nW/2))).attr("y2",svg.attr("height"))
                    .attr("stroke",nC).attr("stroke-width",1).attr("stroke-linecap","round").attr("stroke-dasharray","1,5");
            }
            
            //TODO: Circle-Generierung optimieren; geht sicher auch ohne logInfoStore!
            function handleTimelineInput(data) {
                for (var i = 0; i < data.events.length; i++) {
                    var event = data.events[i];
                    //var yHeight = 0;

                    if (event.action === "acknowledge") {
                        if (((event.timestamps.send.unix-self.startstamp)*scale+yProgress) >= yProgress) {
                            drawEndLine(event);
                        }
                    } else {
                        drawStartingCircle(event);
                    }
                    
                    if(eHeight > parseInt(svg.attr("height"),10)) {
                        svg.attr("height",(eHeight+"px"));
                        setupBackground(eHeight);
                        var content = svg.selectAll("line.nodeLine");
                        for (var k = 0; k < self.nodes.length; k++) {
                            var line = content[0][k];
                            line.y2.baseVal.value = eHeight;
                        }
                    }
                    
                    circleLog = [];
                }

                var circles = svg.selectAll("circle.new");
                for (var j = 0; j < circles[0].length; j++) {
                    $compile(circles[0][j])($scope);
                    /*var cls = getAttrValue(circles[0][j],"class").split(" ");
                    setAttrValue(circles[0][j],"class",(cls[0]))*/
                }
                circles.classed("new","false");

            }

            function drawStartingCircle(data) {
                var color = "";
                switch (data.type) {
                    case "init":
                        color = colors[0];
                        break;
                    case "propose":
                        color = colors[1];
                        break;
                    case "prevote":
                        color = colors[2];
                        break;
                    case "vote":
                        color = colors[3];
                        break;
                }

                out("new startp circle for " +data.nodes.send+ ":: cx " +tlPositions[data.nodes.send]+ " cy " +((data.timestamps.send.unix-self.startstamp)*scale+yProgress));
                //if (circleLog[data.nodes.send] == null || circleLog[data.nodes.send] == 1) {
                    svg.append("circle")
                        .classed("startp","true")
                        .classed(("c_"+data.nodes.send),"true")
                        .classed("new","true")
                        .attr("cId",data.id.send)
                        .attr("cx",tlPositions[data.nodes.send])
                        .attr("cy",(data.timestamps.send.unix-self.startstamp)*scale+yProgress)
                        .attr("r",7)
                        .attr("fill",color)
                        .attr("ng-click","$ctrl.showLogInfo("+data.nodes.send+")");
                    //circleLog[data.nodes.send] = (circleLog[data.nodes.send] == null ? 0 : 2);
                //}
                
                var logInfoObj = {id:(""+data.id.send), cx:tlPositions[data.nodes.send], cy:(data.timestamps.send.unix-self.startstamp)*scale+yProgress, col:color, timestamp:(""+data.timestamps.send)};
                logInfoStore.push(logInfoObj);

                // eHeight + (margin from last phase or nodes) + (span of two circles) + (additional margin)
                eHeight = eHeight + ((data.timestamps.send.unix-self.startstamp)*scale-eHeight) + 28 + 50;
            }

            function drawEndLine(event) {
                var color = "";
                var arrow = event.type+"Arrow";
                switch (event.type) {
                    case "init":
                        color = colors[0];
                        break;
                    case "propose":
                        color = colors[1];
                        break;
                    case "prevote":
                        color = colors[2];
                        break;
                    case "vote":
                        color = colors[3];
                        break;
                }

                out("new endp circle for " +event.nodes.receive+ ":: cx " +tlPositions[event.nodes.receive]+ " cy " +((event.timestamps.receive.unix-self.startstamp)*scale+yProgress));
                //if (circleLog[data.nodes.send] == null || circleLog[data.nodes.send] == 0) {
                    var circle = svg.append("circle")
                        .classed("endp","true")
                        .classed(("c_"+event.nodes.receive),"true")
                        .classed("new","true")
                        .classed("tooltip","true")
                        .attr("cId",event.id.receive)
                        .attr("cx",tlPositions[event.nodes.receive])
                        .attr("cy",(event.timestamps.receive.unix-self.startstamp)*scale+yProgress)
                        .attr("r",7)
                        .attr("fill",color).attr("fill-opacity","0.0")
                        .attr("stroke",color).attr("stroke-width",3)
                        .attr("ng-click","$ctrl.showLogInfo("+event.nodes.receive+")")
                        .attr("data-meta", JSON.stringify(event))
                    ;
                    console.log("end_circle", circle, $(circle));
                    // $(circle).tooltipster({functionFormat: tooltipFormat});
                    $(circle).tooltipster({functionInit: tooltipContent, interactive: true});
                    //circleLog[data.nodes.send] = (circleLog[data.nodes.send] == null ? 1 : 2);
                    
                    var logInfoObj = {id:(""+event.id.receive), cx:tlPositions[event.nodes.receive], cy:(event.timestamps.receive.unix-self.startstamp)*scale+yProgress, col:color, timestamp:(""+event.timestamps.receive.string)};
                    logInfoStore.push(logInfoObj);
                //}

                var x1 = tlPositions[event.nodes.send];
                var x2 = tlPositions[event.nodes.receive];
                // +18 when line will go from right to left, -18 otherwise
                var actualX2 = 0;
                var y2 = 0;
                if (x1 == x2) {
                    y2 = (event.timestamps.receive.unix-self.startstamp)*scale+yProgress;
                    // create three lines that act as one line with two 90° angles
                    svg.append("line")
                        .attr("sId","i"+event.id.send).attr("rId","i"+event.id.receive)
                        .attr("x1",x1).attr("y1",(event.timestamps.send.unix-self.startstamp)*scale+yProgress)
                        .attr("x2",x1+30).attr("y2",(event.timestamps.send.unix-self.startstamp)*scale+yProgress)
                        .attr("stroke",color).attr("stroke-width",2);
                    svg.append("line")
                        .attr("sId","i"+event.id.send).attr("rId","i"+event.id.receive)
                        .attr("x1",x1+30).attr("y1",(event.timestamps.send.unix-self.startstamp)*scale+yProgress)
                        .attr("x2",x2+30).attr("y2",y2)
                        .attr("stroke",color).attr("stroke-width",2);
                    svg.append("line")
                        .attr("sId","i"+data.id.send).attr("rId","i"+data.id.receive)
                        .attr("x1",x1+30).attr("y1",y2)
                        .attr("x2",x2+arrowOffset).attr("y2",y2)
                        .attr("stroke",color).attr("stroke-width",2)
                        .attr("marker-end",("url(#"+arrow+")"));
                } else {
                    actualX2 = (x1 > x2 ? x2+arrowOffset : x2-arrowOffset);
                    y2 = calculateYCoordinate(
                        {"x":x1,"y":(event.timestamps.send.unix-self.startstamp)*scale+yProgress}, // starting point of line
                        {"x":x2,"y":(event.timestamps.receive.unix-self.startstamp)*scale+yProgress}, // ending point of line
                        actualX2  // x value to determine corresponding y
                    );
                    svg.append("line")
                        .attr("sId","i"+event.id.send).attr("rId","i"+event.id.receive)
                        .attr("x1",x1).attr("y1",(event.timestamps.send.unix-self.startstamp)*scale+yProgress)
                        .attr("x2",actualX2).attr("y2",y2)
                        .attr("stroke",color).attr("stroke-width",2)
                        .attr("marker-end",("url(#"+arrow+")"));
                }

                // eHeight + (margin from last phase or nodes) + (span of two circles) + (additional margin)
                eHeight = eHeight + ((event.timestamps.receive.unix-self.startstamp)*scale-eHeight) + 28 + 50;
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
                            if (content[0][i].attributes.class === undefined
                                || !(content[0][i].attributes.class.nodeValue === "nodeLine")) {
                                var line = content[0][i];
                                line.x1.baseVal.value = line.x1.baseVal.value * perc;
                                line.x2.baseVal.value = line.x2.baseVal.value * perc;
                            } else {
                                var line = content[0][i];
                                line.x1.baseVal.value = line.x1.baseVal.value * perc;
                                line.x2.baseVal.value = line.x2.baseVal.value * perc;
                            }
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

            self.setupSymbology = (function() {
                var sym = d3.select("div#timeline")
                    .append("svg")
                    .attr("width","100%").attr("height","100px");
                sym.append("circle");
            });

            self.showLogInfo = (function(id) {
                var element = null;
                for (var i = 0; i < logInfoStore.length; i++) {
                    if (logInfoStore[i].id === ""+id) {
                        element = logInfoStore[i];
                        break;
                    }
                }
                if (element === null) {
                    return;
                }
                //alert("cx:"+element.cx);

                svg.append("rect")
                    .classed(("r_"+element.id),"true")
                    .attr("x",element.cx-50).attr("y",element.cy+10)
                    .attr("width",100).attr("height",50)
                    .attr("fill",element.col)
                    .attr("ng-click","$ctrl.hideLogInfo("+element.id+");");
                var rects = svg.selectAll("rect.r_"+element.id);
                for (var i = 0; i < rects[0].length; i++) {
                    $compile(rects[0][i])($scope);
                }

            });

            self.hideLogInfo = (function(id) {
                svg.select("rect.r_"+id).remove();
            });

            function deOverflow(id) {
                if (idLog.length < EL_MAX) {
                    idLog.push("i"+id);
                } else {
                    var delId1 = idLog.shift();
                    var lines = svg.selectAll("[sId="+delId1+"]");
                    if (lines[0].length > 0) {
                        for (var i = 0; i < lines[0].length; i++) {
                            svg.selectAll("[cId="+lines[0][i].attributes[1].value+"]").remove();
                            lines[0][i].remove();
                            idLog.shift();
                        }
                    }
                    svg.selectAll("[cId="+delId1+"]").remove();
                    idLog.push("i"+id);
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