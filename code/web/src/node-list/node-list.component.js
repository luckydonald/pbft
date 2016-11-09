/**
 * Created by PlayingBacon on 27.10.2016.
 */
'use strict';

angular.
    module('nodeList').
    component('nodeList', {
        templateUrl: 'node-list/node-list.template.html',
        /*controller: ['Node',
            function NodeListController(Node) {
                this.nodes = Node.query();
            }
        ]*/
        controller: ['$http', function NodeListController($http) {
            this.summary = [];
            this.otherNodes = [];
            var self = this;

            $http.get('nodes.json').then(function (response) {
                self.nodes = response.data;
                for (var x in self.nodes) {
                    sortNode(x);
                }
            });

            function sortNode(x) {
                if (self.nodes[x].id == 'summary') {
                    self.summary.push(self.nodes[x]);
                } else {
                    self.otherNodes.push(self.nodes[x]);
                }
            }
        }]
    });
