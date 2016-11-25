/**
 * Created by PlayingBacon on 27.10.2016.
 */
'use strict';

angular.
    module('pbftGui').
    config(['$locationProvider', '$routeProvider', 
        function($locationProvider, $routeProvider, $routeParams) {
            $locationProvider.hashPrefix('!');

            $routeProvider.
                when('/nodes', {
                    template: '<node-list-view></node-list-view>'
                }).
                when('/failures', {
                    template: '<failure-table-view></failure-table-view>'
                }).
                when('/nodes/:nodeid', {
                    template: function($routeParams) { return "<div>This is a detailed view of node " +$routeParams.nodeid+ "!</div><a href='#!/nodes'>Return</a>"; }
                }).
                otherwise({redirectTo: '/nodes'});
}]);
