(function () {
    'use strict';

    var module = angular.module('errorReporter');

    module.controller('BugController', ['$scope', '$http', '$routeParams', '$location',
        function ($scope, $http, $routeParams, $location) {
            $scope.data = {error:false,message:"",data:null};
            $scope.loading = true;
            $scope.images = [];
            $scope.osNames = [];
            $scope.osNumbers = [];
            $scope.occurrenceNumbers = [[]];
            $scope.occurrenceLabels = [];
            $scope.jdkLabels = [];
            $scope.jdkNumbers = [];
            $scope.argsLabels = [];
            $scope.argsNumbers = [];
            $scope.issueLinks = [];

            $scope.toggleLightbox = function(image) {
                image.lightBox = !image.lightBox;
            };

            $scope.setup = function() {
                for (var i = 0; i <= 30; i++) {
                    var d = new Date();
                    d.setDate(d.getDate() - 30 + i);
                    $scope.occurrenceLabels.push(("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2));
                    $scope.occurrenceNumbers[0].push(0);
                }

                var after = new Date();
                after.setDate(after.getDate() - 30);
                for (var i = 0; i < $scope.data.data.issues.length; i++) {
                    var item = $scope.data.data.issues[i];
                    item.userDescription = decodeURIComponent(item.userDescription.replace(/\+/g,  " "));
                    var osInd = $scope.osNames.indexOf(item.osName);
                    if (osInd >= 0) {
                        $scope.osNumbers[osInd]++;
                    }
                    else {
                        $scope.osNames.push(item.osName);
                        $scope.osNumbers.push(1);
                    }

                    var jdkInd = $scope.jdkLabels.indexOf(item.javaVersion);
                    if (jdkInd >= 0) {
                        $scope.jdkNumbers[jdkInd]++;
                    }
                    else {
                        $scope.jdkLabels.push(item.javaVersion);
                        $scope.jdkNumbers.push(1);
                    }

                    var argsInd = $scope.argsLabels.indexOf(item.args);
                    if (argsInd >= 0) {
                        $scope.argsNumbers[argsInd]++;
                    }
                    else {
                        $scope.argsLabels.push(item.args);
                        $scope.argsNumbers.push(1);
                    }

                    var occurredOn = new Date(item.dateTime);
                    if (occurredOn >= after) {
                        var dateInd = $scope.occurrenceNumbers[0].length - 1 - (after.getDate() - occurredOn.getDate());
                        $scope.occurrenceNumbers[0][dateInd]++;
                    }

                    $scope.images.push({
                        url: item.screenshot,
                        thumbUrl: item.screenshot,
                        lightBox: false
                    });

                    $scope.issueLinks.push(item._id);
                }
            };

            $scope.getData = function() {
                var id = $routeParams.bugId;
                if (id == "") {
                    $scope.data = {
                        error: true,
                        message: "Did you forget to select an bug to view?"
                    };
                    return;
                }

                var url = "http://bugs.sws.nz/api/bug/" + id + "?callback=JSON_CALLBACK";
                $http.jsonp(url)
                .success(function(data, status, headers, config) {
                        $scope.data = data;
                        if (!$scope.data.error) {
                            $scope.setup();
                        }
                        $scope.loading = false;
                    }).
                error(function(data, status, headers, config) {
                        $scope.data = {
                            error: true,
                            message: "Data request failed. Perhaps the server is down?"
                        };
                        $scope.loading = false;
                    });
            };

            $scope.getData();

            $scope.isTrue = function(val) {
                return $scope.data.data.issues[0][val] == true;
            };
        }
    ]);
}());