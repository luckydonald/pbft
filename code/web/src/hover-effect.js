/**
 * Created by PlayingBacon on 01.11.2016.
 */

/*$(document).ready(function() {
    $('.node').hover(function() {
        $('.click-hint').show();
    }, function() {
        $('.click-hint').hide();
    });
});*/

function toggleDisplay(elements) {
    var element;

    elements = elements.length ? elements : [elements];
    for (var i = 0; i < elements.length; i++) {
        element = elements[i];

        if (isHidden(element)) {
            element.style.display = 'block';
            //element.style.visibility = 'visible';
        } else {
            element.style.display = 'none';
            //element.style.visibility = 'hidden';
        }
    }

    function isHidden(element) {
        return window.getComputedStyle(element, null).getPropertyValue('visibility') === 'hidden';
    }
}

function getClickHintElement(element) {
    var childs = element.childNodes;
    for (var x in childs) {
        if (x.classList.item(0) === 'click-hint') {
            alert('Eyup.');
        }
    }
    //return element.getElementsByClassName('click-hint')[0];
}
