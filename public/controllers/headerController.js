(function () {
    'use strict';

    var module = angular.module('errorReporter');

    module.controller('HeaderController', ['$scope', '$location',
        function ($scope, $location) {
            $scope.current = function (currLocation) {
                return $location.path() == currLocation;
            };
        }
    ]);
}());