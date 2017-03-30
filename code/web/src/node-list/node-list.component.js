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
        controller: ['$http','$scope','$interval', function NodeListController($http,$scope,$interval) {
            var self = this;
            self.summary = null;
            self.nodes = [];
            self.leader = -1;
            var touched = false;

            /*
            $scope.intervalFunction = function(){
                $timeout(function() {
                    $scope.pollValues();
                    $scope.intervalFunction();
                }, 5000)
            };

            // Kick off the interval
            $scope.intervalFunction();
            */
            var pollValues = function() {
                $http.get(_API_URL+"/api/v2/get_value/").success(function (json) {
                    var data = {
                        "summary":  0.5,  // or null
                        "leader": 1,
                        "nodes": [
                            {"node": "1", "value": 0.5},
                            {"node": "2", "value": 0.6},
                            {"node": "5", "value": 0.5},
                            {"node": "6", "value": 0.5},
                            {"node": "5", "value": 0.5}
                        ]
                    };
                    console.log("JSON:", json);
                    data = json;
                    touched = !touched;  // this is a flag to check if it was updated yet (?)

                    self.summary = data.summary;
                    self.leader = data.leader;
                    for (var i = 0; i < data.nodes.length; i++) {
                        var node = data.nodes[i];
                        var searchedIndex;
                        searchedIndex = searchIndex(self.nodes,node.node);  // check if already exists.
                        if (searchedIndex == -1) {  // does not exists.
                            self.nodes.push({
                                id:node.node,
                                value:node.value,
                                name:node.id,
                                touched:touched
                            });
                            console.log("Added", node.node);
                        } else {
                            self.nodes[searchedIndex].value = node.value;
                            self.nodes[searchedIndex].touched = touched;
                            console.log("Updated", node.node);
                        }
                    }

                    for (var i = 0; i < self.nodes.length; i++) {
                        if (self.nodes[i].touched != touched) {
                            self.nodes.splice(i,1);  // delete 1 element at index i.
                            console.log("Removed", self.nodes[i].id);

                        }
                    }

                    console.log(self.nodes.length);
                    sortNodes();
                });
            };

            var promise = $interval(pollValues, 5000);
            $scope.$on('$destroy',function(){
                if(promise)
                    $interval.cancel(promise);
            });

            /*$.getJSON(url+"/get_data/?limit=10").done(function (json) {
                // do stuff
                self.nodes = [];
                for (var node in json) {
                    if (json.hasOwnProperty(node)) {
                        for (var timestamp in json[node]) {
                            if (json[node].hasOwnProperty(timestamp)) {
                                var value=json[node][timestamp];
                                self.nodes.push({id:node,value:value});
                                break;
                            }
                        }
                    }
                }
                console.log(self.nodes.length);
                //self.nodes = json[];
                for (var i = 0; i < self.nodes.length; i++) {
                    console.log("i:"+i+",id:"+self.nodes[i].id+",value:"+self.nodes[i].value);
                    sortNode(i);
                }
            }).fail(console.error);*/

            function sortNodes() {
                /**
                 * Sorts the nodes (in self.nodes) by their ID, ascending.
                 */
                for (var i = 0; i < self.nodes.length-1; i++) {
                    for (var j = 0; j < self.nodes.length-1; j++) {
                        if (self.nodes[j].id > self.nodes[j+1].id) {
                            var temp = self.nodes[j];
                            self.nodes[j] = self.nodes[j+1];
                            self.nodes[j+1] = temp;
                        }
                    }
                }
            }

            function searchIndex(arr, id) {
                /**
                 * searches array arr for an element with given (node) id.
                 *
                 * @returns Element index of array, or -1 if not found.
                 **/
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].id === id) {
                        return i;
                    }
                }
                return -1;
            }
        }]
    });
