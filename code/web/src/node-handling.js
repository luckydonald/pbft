/**
 * Created by PlayingBacon on 03.11.2016.
 */

function handleNodeScaling(element) {
    var classes = element.classList;
    if (!classes.contains('clicked')) {
        classes.add('clicked');
    }
    toggleBigSmall(element, getUnclickedNodes());
    classes.remove('clicked');
}

function toggleBigSmall(element, otherElements) {
    var classes = element.classList;
    if (classes.contains('reduced')) {
        return;
    }
    if (classes.contains('upscaled')) {
        var vl = getChildByClassName(element, 'value-graph');
        vl.removeChild(vl.getElementsByTagName("value-graph")[0]);
        classes.remove('upscaled');
        classes.add('non-upscaled');
        for (var i = 0; i < otherElements.length; i++) {
            otherClasses = otherElements[i].classList;
            if (!otherClasses.contains('reduced')) {
                return;
            } else {
                otherClasses.remove('reduced');
            }
        }
    } else {
        classes.add('upscaled');
        classes.remove('non-upscaled');
        var vl = getChildByClassName(element, 'value-graph');
        vl.appendChild(document.createElement("value-graph"));
        for (var i = 0; i < otherElements.length; i++) {
            otherClasses = otherElements[i].classList;
            if (otherClasses.contains('reduced')) {
                return;
            } else {
                otherClasses.add('reduced');
            }
        }
    }
}

function getUnclickedNodes() {
    var nodes = document.getElementsByClassName('node');
    var unclickedNodes = [];

    for (var i = 0; i < nodes.length; i++) {
        classes = nodes[i].classList;
        if (classes.contains('clicked')) {
            continue;
        } else {
            unclickedNodes.push(nodes[i]);
        }
    }

    return unclickedNodes;
}

function toggleVisibility(element) {
    if (element.parentNode.classList.contains('reduced')) {
        console.log("reduced, don't toggle.");
        return;
    } else if (!element.parentNode.classList.contains('non-upscaled')) {
        element.style.visibility = 'hidden';
    } else if (!element.style.length > 0) {
        element.style.visibility = 'visible';
    } else {
        element.style.visibility = (element.style.visibility === 'hidden' ? 'visible' : 'hidden');
    }
}

function toggleDisplay(element, defaultval) {
    if (!element.style.length > 0) {
        element.style.display = ''; //initialising
        console.log('setting to default.');
        element.style.display = defaultval;
    } else {
        console.log('toggling.');
        element.style.display = (element.style.display === 'none' ? 'block' : 'none');
    }
}

function toggleDisplayForChildren(parent) {
    children = parent.childNodes;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType != 1 || children[i].classList.contains('value-graph')) {
            continue;
        }
        if (!children[i].style.length > 0) {
            children[i].style.display = 'block';
        }
        children[i].style.display = (children[i].style.display === 'none' ? 'block' : 'none');
    }
}

function getChildByClassName(parent,className) {
    var children = parent.childNodes;
    var result = null;
    for (var i = 0; i < children.length && result == null; i++) {
        //console.log("element: " +children[i]);
        if (children[i].nodeType != 1) {
            continue;
        }
        var chClasses = children[i].classList;
        //console.log(" > classes: " +chClasses+ " :: requested class name: " +className);
        if (chClasses.contains(className)) {
            //console.log("found it!");
            return children[i];
        } else {
            //console.log("going deeper..");
            result = getChildByClassName(children[i],className);
        }
    }
    return result;
}
