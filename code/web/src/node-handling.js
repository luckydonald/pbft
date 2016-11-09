/**
 * Created by PlayingBacon on 03.11.2016.
 */

function handleNodeScaling(element) {
    var classes = element.classList;
    if (!classes.contains('clicked')) {
        classes.add('clicked');
    }
    toggleBigSmall(element,getUnclickedNodes());
    classes.remove('clicked');
}

function toggleBigSmall(element,otherElements) {
    var classes = element.classList;
    if (classes.contains('reduced')) {
        return;
    }
    if (classes.contains('upscaled')) {
        classes.remove('upscaled');
        classes.add('node-hover');
        toggleDisplay(getChildByClassName(element,'value'),'none');
        toggleDisplay(getChildByClassName(element,'value-label'),'none');
        toggleDisplay(getChildByClassName(element,'value-graph'),'block');
        toggleVisibility(getChildByClassName(element,'click-hint'));
        for (var i = 0; i < otherElements.length; i++) {
            otherClasses = otherElements[i].classList;
            if (!otherClasses.contains('reduced')) {
                return;
            } else {
                otherClasses.remove('reduced');
                toggleDisplayForChildren(otherElements[i]);
            }
        }
    } else {
        toggleVisibility(getChildByClassName(element,'click-hint'));
        toggleDisplay(getChildByClassName(element,'value'),'none');
        toggleDisplay(getChildByClassName(element,'value-label'),'none');
        toggleDisplay(getChildByClassName(element,'value-graph'),'block');
        classes.add('upscaled');
        classes.remove('node-hover');
        for (var i = 0; i < otherElements.length; i++) {
            otherClasses = otherElements[i].classList;
            if (otherClasses.contains('reduced')) {
                return;
            } else {
                otherClasses.add('reduced');
                toggleDisplayForChildren(otherElements[i]);
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
        console.log('reduced, dont toggle.');
        return;
    } else if (!element.parentNode.classList.contains('node-hover')) {
        element.style.visibility = 'hidden';
    } else if (!element.style.length > 0) {
        element.style.visibility = 'visible';
    } else {
        element.style.visibility = (element.style.visibility === 'hidden' ? 'visible' : 'hidden');
    }
}

function toggleDisplay(element,defaultval) {
    if (!element.style.length > 0) {
        console.log('initialising.');
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
    children = parent.childNodes;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType != 1) {
            continue;
        }
        chClasses = children[i].classList;
        if (chClasses.contains(className)) {
            return children[i];
        }
    }
    console.log('className not found, returning null..');
    return null;
}
