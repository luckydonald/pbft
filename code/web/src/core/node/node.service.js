/**
 * Created by PlayingBacon on 28.10.2016.
 */
'use strict';

angular.
    module('core.node').
    factory('Node', ['$resource',
        function($resource) {
            return $resource('nodes.json'/*'http://HOSTNAME/get_value/'*/, {}, {
                query: {
                    method: 'GET',
                    //params: {nodeId: 'nodes'},
                    isArray: true
                }
            });
        }
    ]);
