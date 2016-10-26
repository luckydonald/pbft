/**
 * Created by luckydonald on 25/10/16.
 */

$( document ).ready(function(){
    setInterval( function () {
        $.getJSON("http://localhost/get_value/", function (data) { //TODO host
            var container = $("#nodearea");
            container.empty();
            console.log(data);
            var node = $("<div>");
            node.addClass("node").addClass("summary");
            node.append($("<h3>").text("Summary"));
            node.append("<h5>Agreed Value:</h5>");
            if("summary" in data) {
                node.append($("<span>").text(data["summary"]).addClass("value"));
            } else {
                node.append($("<span>").text("No recent agreement").addClass("value"));
            }
            container.prepend(node);
            Object.keys(data).forEach(function (key, value) {
                if (key === "summary") {
                    return;
                }
                var node = $("<div>");
                node.addClass("node");
                node.append($("<h3>").text("Node " + key));
                node.append("<h5>Value:</h5>");
                node.append($("<span>").text(this[key]).addClass("value"));
                container.append(node);
            }, data);
        });
    }, 100);
});