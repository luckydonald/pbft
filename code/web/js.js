/**
 * Created by luckydonald on 25/10/16.
 */

$( document ).ready(function(){
    setInterval( function () {
        $.getJSON("http://localhost/get_value/", function (data) {
            var container = $("#nodearea");
            container.empty();
            console.log(data);
            Object.keys(data).forEach(function (key, value) {
                var node = $("<div>");
                node.addClass("node");
                if (key === "summary") {
                    node.addClass("summary");
                    node.append($("<h3>").text("Summary"));
                    node.append("<h5>Agreed Value:</h5>");
                } else {
                    node.append($("<h3>").text("Node " + key));
                    node.append("<h5>Value:</h5>");
                }
                node.append($("<span>").text(this[key]).addClass("value"));
                if (key === "summary") {
                    container.prepend(node);
                } else {
                    container.append(node);
                }
            }, data);
        });
    }, 1000);
});