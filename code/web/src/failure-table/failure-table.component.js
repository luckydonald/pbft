/**
 * Created by PlayingBacon on 27.10.2016.
 */
'use strict';

angular.
    module('failureTable').
    component('failureTable', {
        templateUrl: 'failure-table/failure-table.template.html',
        controller: ['$http','$compile','$scope', function FailureTableController($http,$compile,$scope) {
            var self = this;
            var svg = null;
            var svgWidth = 0;
            var svgHeight = 0;
            var nW = 0;                 // node width, will be set in method setupNodeElements
            var nH = 50;                // node height
            var nC = "white";             // node color
            var gap = 0;                // gap between nodes, will be set in method setupNodeElements
            var tlPositions = [];
            var yProgress = 0;
            var arrowOffset = 18;       // offset for drawing arrowheads of lines correctly
            var eHeight = 0;            // height that gets occupied by all elements contained in the svg
            var logInfoStore = [];
            var colors = ["#7cf1cb","#85b9f0","#ffcd83","#ffad83"];

            //TODO: Nodes dynamisch hinzufügen?
            self.nodes = [{
                "id": "1"    
            }, {
                "id": "2"
            }, {
                "id": "3"
            }, {
                "id": "4"
            }];

            var tlData = null;

            //$http.get('test_timeline.json').then(function(response) {
            $http.get('test_timeline.json').success(function(response){
                tlData = response;
                var str = "### TL DATA :: ";
                for (var i = 0; i < tlData.length; i++) {
                    str = str+ "(" +i+ ")->[TYPE:"+tlData[i].type+"][DATA:";
                    for (var j = 0; j < tlData[i].data.length; j++) {
                        str = str+ "{node:" +tlData[i].data[j].node+ ";origin:" +tlData[i].data[j].origin+ ";value:" +tlData[i].data[j].value+ "}";
                    }
                    str = str+ "] "
                }
                out(str);

                self.setupTimeline(null,false);
            });

            self.setupTimeline = (function(data, help) {
                d3.select("div#timeline").select("*").remove();
                data = self.nodes;      // please remove later :X
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
                setupNodeElements(svgHeight);
                handleTimelineInput(tlData);
            });

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

            function setupNodeElements(svgHeight) {      //isAnim selects if node entry should be animated or not
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

                    var txtW = getTextWidth("Node " +self.nodes[i].id);
                    if (nW > txtW+10) {
                        var text = svg.append("text")
                            .text("Node " +self.nodes[i].id)
                            .attr("x",x+(nW/2-txtW/2)).attr("y",(y+nH/2))
                            .attr("fill"," #124")
                            .attr("font-family","Verdana")
                            .attr("font-weight","bold");
                    } else {
                        txtW = getTextWidth(self.nodes[i].id);
                        var text = svg.append("text")
                            .text(self.nodes[i].id)
                            .attr("x",x+(nW/2-txtW/2)).attr("y",(y+nH/2))
                            .attr("fill"," #124")
                            .attr("font-family","Verdana")
                            .attr("font-weight","bold");
                    }

                    tlPositions[self.nodes[i].id] = x+(nW/2);
                    yProgress = y+nH+30;

                    drawNodeLine(x,y);
                }

                eHeight = nH + y;
            }

            function drawNodeLine(x,y) {
                svg.append("line")
                    .attr("class","nodeLine")
                    .attr("x1",(x+(nW/2))).attr("y1",y+(nH/2))
                    .attr("x2",(x+(nW/2))).attr("y2",svg.attr("height"))
                    .attr("stroke",nC).attr("stroke-width",1).attr("stroke-linecap","round").attr("stroke-dasharray","1,5");
            }

            //TODO: Circle-Generierung optimieren; geht sicher auch ohne logInfoStore!
            function handleTimelineInput(data) {
                var color = null;
                var arrow = null;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type === "init") {
                        color = colors[0];
                        arrow = "initArrow";
                    } else if (data[i].type === "propose") {
                        color = colors[1];
                        arrow = "proposeArrow";
                    } else if (data[i].type === "prevote") {
                        color = colors[2];
                        arrow = "prevoteArrow";
                    } else if (data[i].type === "vote") {
                        color = colors[3];
                        arrow = "voteArrow";
                    } else {
                        out("Well, that was unexpected. (BAD TYPE)")
                        return;
                    }

                    var lineData = data[i].data;
                    var circleLog = [];
                    var yHeight = 0;
                    for (var j = 0; j < lineData.length; j++) {
                        if (circleLog[lineData[j].origin] == null || circleLog[lineData[j].origin] == 1) {
                            svg.append("circle")
                                .classed("startp","true")
                                .classed(("c_"+logInfoStore.length),"true")
                                .classed("new","true")
                                .attr("cx",tlPositions[lineData[j].origin])
                                .attr("cy",yProgress)
                                .attr("r",7)
                                .attr("fill",color)
                                .attr("ng-click","$ctrl.showLogInfo("+logInfoStore.length+")");
                            circleLog[lineData[j].origin] = (circleLog[lineData[j].origin] == null ? 0 : 2);
                            // maybe add else[...} to update log entry with every "double" circle?

                            // highly dependent on the yProgress value! REMEMBER WHEN APPLYING CHANGES!
                            var logInfoObj = {id:(""+logInfoStore.length), cx:tlPositions[lineData[j].origin], cy:yProgress, col:color, timestamp:(""+lineData[j].timestamp), log:(""+lineData[j].log)};
                            logInfoStore.push(logInfoObj);
                        }
                        if (circleLog[lineData[j].node] == null || circleLog[lineData[j].node] == 0) {
                            svg.append("circle")
                                .classed("endp","true")
                                .classed(("c_"+logInfoStore.length),"true")
                                .classed("new","true")
                                .attr("cx",tlPositions[lineData[j].node])
                                .attr("cy",yProgress+100)
                                .attr("r",7)
                                .attr("fill",color)
                                .attr("ng-click","$ctrl.showLogInfo("+logInfoStore.length+")");
                            circleLog[lineData[j].node] = (circleLog[lineData[j].node] == null ? 1 : 2);
                            // maybe add else[...} to update log entry with every "double" circle?

                            // highly dependent on the yProgress value! REMEBER WHEN APPLYING CHANGES!
                            var logInfoObj = {id:(""+logInfoStore.length), cx:tlPositions[lineData[j].node], cy:yProgress+100, col:color, timestamp:(""+lineData[j].timestamp), log:(""+lineData[j].log)};
                            logInfoStore.push(logInfoObj);
                        }

                        var x1 = tlPositions[lineData[j].origin];
                        var x2 = tlPositions[lineData[j].node];
                        // +18 when line will go from right to left, -18 otherwise
                        var actualX2 = (x1 > x2 ? x2+arrowOffset : x2-arrowOffset);
                        var y2 = calculateYCoordinate(
                            {"x":x1,"y":yProgress}, // starting point of line
                            {"x":x2,"y":yProgress+100}, // ending point of line
                            actualX2  // x value to determine corresponding y
                        );
                        svg.append("line")
                            .attr("x1",x1).attr("y1",yProgress)
                            .attr("x2",actualX2).attr("y2",y2)
                            .attr("stroke",color).attr("stroke-width",2)
                            .attr("marker-end",("url(#"+arrow+")"));

                        yHeight = y2 - yProgress;
                    }

                    eHeight = eHeight + (yProgress-eHeight) + 28 + yHeight + 50;             // eHeight + (margin from last phase or nodes) + (span of two circles) + (y height of the lines) + (additional margin)
                    if(eHeight > parseInt(svg.attr("height"),10)) {
                        svg.attr("height",(eHeight+"px"));
                        setupBackground(eHeight);
                        var content = svg.selectAll("line.nodeLine");
                        for (var k = 0; k < self.nodes.length; k++) {
                            var line = content[0][k];
                            line.y2.baseVal.value = eHeight;
                        }
                    }

                    yProgress = yProgress+150;
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
                    /*var content = svg.selectAll("rect:not(.svgBg)");
                    for (var i = 0; i < content[0].length; i++) {
                        var rect = content[0][i];
                        rect.x.baseVal.value = rect.x.baseVal.value * perc;
                        rect.width.baseVal.value = rect.width.baseVal.value * perc;
                        nW = rect.width.baseVal.value;
                    }
                    content = svg.selectAll("rect.svgBg");
                    for (var i = 0; i < content[0].length; i++) {
                        var bg = content[0][i];
                        bg.width.baseVal.value = bg.width.baseVal.value * perc;
                    }
                    var endps = svg.selectAll("circle.endp");     // end point circles before position shifting
                    var beforeShift = [];
                    out("beforeShift");
                    for (var i = 0; i < endps[0].length; i++) {
                        beforeShift[i] = endps[0][i].cx.baseVal.value;
                    }
                    content = svg.selectAll("circle");
                    out("afterShift");
                    for (var i = 0; i < content[0].length; i++) {
                        var circle = content[0][i];
                        circle.cx.baseVal.value = circle.cx.baseVal.value * perc;
                    }
                    endps = svg.selectAll("circle.endp");
                    content = svg.selectAll("line.nodeLine");
                    for (var i = 0; i < content[0].length; i++) {
                        var line = content[0][i];
                        line.x1.baseVal.value = line.x1.baseVal.value * perc;
                        line.x2.baseVal.value = line.x2.baseVal.value * perc;
                    }
                    content = svg.selectAll("line:not(.nodeLine)");
                    var endpCX = beforeShift[0];    // temp for checking if current line has same end point as previous line
                    var j = 0;
                    out("endpCX");
                    for (var i = 0; i < content[0].length; i++) {
                        //out("endps[0].length:"+endps[0].length);
                        var line = content[0][i];
                        line.x1.baseVal.value = line.x1.baseVal.value * perc;
                        //out("i:"+i+"; j:"+j+"; line.x2.baseVal.value:"+line.x2.baseVal.value+"; endpCX-arrowOffset:"+(endpCX-arrowOffset)+"; endpCX+arrowOffset:"+(endpCX+arrowOffset));
                        if (!(line.x2.baseVal.value == endpCX-arrowOffset) && !(line.x2.baseVal.value == endpCX+arrowOffset)) {
                            //out("J++!");
                            j++;
                            endpCX = beforeShift[j];
                        }
                        out("i:"+i);
                        if (line.x2.baseVal.value == endpCX-arrowOffset) {  // line goes from left to right
                            line.x2.baseVal.value = endps[0][j].cx.baseVal.value-arrowOffset;
                        } else {                                            //line goes from right to left
                            line.x2.baseVal.value = endps[0][j].cx.baseVal.value+arrowOffset;
                        }
                        //out("   |_> j:"+j+"; line.x2.baseVal.value:"+line.x2.baseVal.value+"; beforeShift[j]:"+beforeShift[j]+"; endps[0][j].cx.baseVal.value:"+endps[0][j].cx.baseVal.value);
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
                    }*/
                }
            }
            
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
                var m = (endP.y-startP.y)/(endP.x-startP.x);
                var b = startP.y - m*startP.x;
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