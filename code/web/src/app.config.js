/**
 * Created by PlayingBacon on 27.10.2016.
 */
'use strict';

angular.
    module('pbftGui').
    config(['$locationProvider', '$routeProvider', 
        function($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider.
                when('/nodes', {
                    template: '<node-list-view></node-list-view>'
                }).
                when('/failures', {
                    template: '<failure-table-view></failure-table-view>'
                }).
                otherwise({redirectTo: '/nodes'});
}]);
