/**
 * Created by PlayingBacon on 23.11.2016.
 */
'use strict';

angular.module('core.recompile')
    .directive('recompile', function($compile) {
        return {
            restrict: 'AE',
            link: function(scope, ele, attr) {
                /* this should watch if the state of an HTML object changes, f.e. when its inner text gets changed or
                 * the objects attributes get changed, and, if so, call a function to compile the new HTML for Angular
                 * execution.
                 * In our specific case: when a value graph object gets inserted into a node it should be set up for
                 * compilation by Angular.*/
                scope.$watch(/*<1st param: attribute, what should be watched>, <2nd param: function, what happens if watched stuff changes state>*/);
            }
        }
    });