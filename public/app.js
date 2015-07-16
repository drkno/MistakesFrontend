(function () {
    'use strict';

    var module = angular.module('errorReporter', [
        'ngRoute',
        'ui.bootstrap',
        'bootstrapLightbox',
        'chart.js'
    ]);

    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/views/search.html',
                controller: 'SearchController'
            })
            .when('/bug/:bugId', {
                templateUrl: '/views/bug.html',
                controller: 'BugController'
            })
            .when('/issue/:issueId', {
                templateUrl: '/views/issue.html',
                controller: 'IssueController'
            })
            .otherwise({
               redirectTo: '/'
            });
      }]);
}());
