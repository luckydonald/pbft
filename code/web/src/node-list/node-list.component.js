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
            this.summary = [];
            this.otherNodes = [];
            var self = this;
            self.nodes = [];
            var touched = false;
            var url = _SECRET_URL; // definiert in secret.js, die absichtlich nicht im Git vorhanden ist

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
                $http.get(url+"/get_value/").then(function (json) {
                    /*self.nodes = response.data;
                     for (var x in self.nodes) {
                     sortNode(x);
                     }*/
                    console.log("JSON DATA:",json.data);
                    touched = (touched != true);
                    for (var node in json.data) {
                        if (json.data.hasOwnProperty(node)) {
                            /*for (var timestamp in json.data[node]) {
                                if (json.data[node].hasOwnProperty(timestamp)) {
                                    var value=json.data[node][timestamp];
                                    var searchedIndex = searchIndex(node);
                                    if (searchedIndex == -1) {
                                        self.nodes.push({id:node,value:value,touched:touched});
                                    } else {
                                        self.nodes[searchedIndex].value = value;
                                        self.nodes[searchedIndex].touched = touched;
                                        console.log("UPDATED!");
                                    }
                                    break;
                                }
                            }*/
                            var value=json.data[node];
                            if (node === 'summary') {
                                var searchedIndex = searchIndex(self.summary,node);
                                if (searchedIndex == -1) {
                                    self.summary.push({id:node,value:value,touched:touched});
                                } else {
                                    self.summary[searchedIndex].value = value;
                                    self.summary[searchedIndex].touched = touched;
                                    console.log("UPDATED!");
                                }
                            } else {
                                var searchedIndex = searchIndex(self.nodes,node);
                                if (searchedIndex == -1) {
                                    self.nodes.push({id:node,value:value,touched:touched});
                                } else {
                                    self.nodes[searchedIndex].value = value;
                                    self.nodes[searchedIndex].touched = touched;
                                    console.log("UPDATED!");
                                }
                            }
                        }
                    }

                    if (self.summary[0].touched != touched) {
                        self.summary.splice(0,1);
                    }

                    for (var i = 0; i < self.nodes.length; i++) {
                        if (self.nodes[i].touched != touched && self.nodes[i].id != 'summary') {
                            self.nodes.splice(i,1);
                        }
                    }

                    console.log(self.nodes.length);
                    //self.nodes = json[];
                    //self.summary = [];
                    //self.otherNodes = [];
                    sortNodes();
                    /*for (var i = 0; i < self.nodes.length; i++) {
                        console.log("i:"+i+",id:"+self.nodes[i].id+",value:"+self.nodes[i].value);
                        sortNode(i);
                    }*/
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
                /*if (self.nodes[x].id == 'summary') {
                    self.summary.push(self.nodes[x]);
                } else {
                    self.otherNodes.push(self.nodes[x]);
                }*/
                for (var i = 0; i < self.nodes.length; i++) {
                    if (self.nodes[i].id == 'summary') {
                        for (var j = i-1; j > 0; j--) {
                            var temp = self.nodes[j];
                            self.nodes[j] = self.nodes[j+1];
                            self.nodes[j+1] = temp;
                        }
                    }
                }
            }

            function searchIndex(arr, ele) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].id == ele) {
                        return i;
                    }
                }
                return -1;
            }
        }]
    });
