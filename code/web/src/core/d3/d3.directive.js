/**
 * Created by PlayingBacon on 15.11.2016.
 */
'use strict';

angular.module('core.d3Directive')
    .directive('d3Directive', ['core.d3Factory', function(d3) {
        return {
            restrict: 'EA',
            // directive code
        };
    }]);
