/**
 * Created by PlayingBacon on 07.11.2016.
 */
'use strict';

angular.
    module('valueGraph').
    component('valueGraph', {
        templateUrl: 'value-graph/value-graph.template.html',
        controller: ['$http', function ValueGraphController($http) {
            // not implemented yet
            this.testValues = [
                'This is a test.',
                'If it´s shown..',
                'everything works fine!',
                ':)_____)'
                ]
        }]
    });
