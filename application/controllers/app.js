(function () {
    'use strict';

    var module = angular.module('errorReporter', [
        'ngRoute',
        'errorReporterControllers'
    ]);

    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'application/views/search.html',
                controller: 'SearchController'
            })
            .when('/bug/:bugId', {
                templateUrl: 'application/views/bug.html',
                controller: 'BugController'
            })
            .when('/issue/:issueId', {
                templateUrl: 'application/views/issue.html',
                controller: 'IssueController'
            })
            .otherwise({
               redirectTo: '/'
            });
      }]);
}());
