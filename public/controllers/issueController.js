(function () {
    'use strict';

    var module = angular.module('errorReporter');

    module.controller('ModalInstanceCtrl', function ($scope, $modalInstance, images) {
        $scope.images = images;
    });

    module.controller('IssueController', ['$scope', '$http', '$routeParams',
        function ($scope, $http, $routeParams) {
            $scope.data = {error: false, message: "", data: null};
            $scope.loading = true;
            $scope.images = [];
            $scope.issueDateTime = null;

            $scope.toggleLightbox = function(image) {
                image.lightBox = !image.lightBox;
            };

            $scope.setup = function () {
                var item = $scope.data.data,
                    d = new Date(item.dateTime),
                    date = ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear(),
                    time = d.getHours() + ":" + d.getMinutes() + "." + d.getMilliseconds();
                $scope.issueDateTime = date + " " + time;
                item.userDescription = decodeURIComponent(item.userDescription.replace(/\+/g, " "));

                $scope.images.push({
                    url: item.screenshot,
                    thumbUrl: item.screenshot,
                    lightBox: false
                });
            };

            $scope.getData = function () {
                var id = $routeParams.issueId;
                if (id == "") {
                    $scope.data = {
                        error: true,
                        message: "Did you forget to select an issue to view?"
                    };
                    return;
                }

                var url = "http://bugs.sws.nz/api/issue/" + id + "?callback=JSON_CALLBACK";
                $http.jsonp(url)
                    .success(function (data, status, headers, config) {
                        $scope.data = data;
                        if (!$scope.data.error) {
                            $scope.setup();
                        }
                        $scope.loading = false;
                    }).
                    error(function (data, status, headers, config) {
                        $scope.data = {
                            error: true,
                            message: "Data request failed. Perhaps the server is down?"
                        };
                        $scope.loading = false;
                    });
            };

            $scope.getData();

            $scope.isTrue = function (val) {
                return $scope.data.data[val] == true;
            };
        }
    ]);
}());