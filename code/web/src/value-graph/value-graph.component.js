/**
 * Created by PlayingBacon on 07.11.2016.
 */
'use strict';

angular.
    module('valueGraph').
    component('valueGraph', {
        templateUrl: 'value-graph/value-graph.template.html',
        bindings: {
            nodeid: '='
        },
        controller: ['$http', function ValueGraphController($http) {
            /*function increment() {
                this.id++;
                console.log(this.id);
            }
            
            function decrement() {
                this.id--;
                console.log(this.id);
            }

            this.increment = increment;
            this.decrement = decrement;*/
        }]
    });
