(function () {
    'use strict';

    var module = angular.module('errorReporterControllers');

    module.controller('SearchController', ['$scope', '$http', '$routeParams', '$location',
        function ($scope, $http, $routeParams, $location) {
            $scope.filterText = "";
            $scope.typeSelect = 0;
            $scope.reportType = 0;
            $scope.undoPossible = 0;
            $scope.redoPossible = 0;
            $scope.navForwardPossible = 0;
            $scope.navBackwardPossible = 0;
            $scope.startDate = "";
            $scope.endDate = "";
            $scope.data = [];
            $scope.filterCount = 0;

            $scope.loadIssues = function(data) {
                for (var i = 0; i < data.length; i++) {
                    var item = data[i],
                        d = new Date(item.dateTime),
                        date = ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear(),
                        time = d.getHours() + ":" + d.getMinutes(),
                        tags = [],
                        summary = "",
                        undo = 2,
                        redo = 2,
                        navFor = 2,
                        navBack = 2,
                        report = -1;

                    item.userDescription = decodeURIComponent(item.userDescription.replace(/\+/g,  " "));

                    if (item.userDescription.trim() !== "" && item.userDescription !== "null") {
                        summary = item.userDescription.split('\n')[0].substr(0, 70);
                        if (item.userDescription.length > 70) {
                            summary += "...";
                        }
                        summary += "\n";
                    }

                    if (item.progDescription === "![MANUAL]") {
                        tags.push("manual");
                        report = 1;
                        summary = summary.slice(0,-1);
                    }
                    else if (item.progDescription === "![UNHANDLED]") {
                        tags.push("unhandled");
                        report = 2;
                        summary = summary.slice(0,-1); // remove me when below line is uncommented
                        //summary += summary = item.exception.split('\n')[0].substr(300) + "...";
                    }
                    else {
                        tags.push("exception");
                        report = 3;
                        summary += item.progDescription.split('\n')[0].substr(70) + "...";//\n";
                        //summary += item.exception.split('\n')[0].substr(300) + "...";
                    }

                    $scope.data.push({
                        type: 2,
                        report: report,
                        undo: undo,
                        redo: redo,
                        navFor: navFor,
                        navBack: navBack,
                        searchText: (item._id + " " + item.userDescription + " " + item.progDescription).toLowerCase(),
                        dateObj: d,
                        isToday: d.getDate() == new Date().getDate(),
                        id: item._id,
                        link: "/#/issue/" + item._id,
                        summary: summary,
                        date: date + " " + time,
                        tags: tags
                    });
                }
            };

            $scope.loadBugs = function() {
                var url = "http://bugs.sws.nz/api/bug/summary?callback=JSON_CALLBACK";
                $http.jsonp(url)
                .success(function(data) {
                    for (var i = 0; i < data.data.length; i++) {

                        $scope.loadIssues(data.data[i].issues);

                        var item = data.data[i].issues[0],
                            d = new Date(item.dateTime),
                            date = ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear(),
                            time = d.getHours() + ":" + d.getMinutes(),
                            tags = [],
                            summary = "",
                            undo = 2,
                            redo = 2,
                            navFor = 2,
                            navBack = 2,
                            report = -1;

                        item.userDescription = decodeURIComponent(item.userDescription.replace(/\+/g,  " "));

                        if (item.userDescription.trim() !== "" && item.userDescription !== "null") {
                            summary = item.userDescription.split('\n')[0].substr(0, 70);
                            if (item.userDescription.length > 70) {
                                summary += "...";
                            }
                            summary += "\n";
                        }

                        if (item.progDescription === "![MANUAL]") {
                            tags.push("manual");
                            report = 1;
                            summary = summary.slice(0,-1);
                        }
                        else if (item.progDescription === "![UNHANDLED]") {
                            tags.push("unhandled");
                            report = 2;
                            summary = summary.slice(0,-1); // remove me when below line is uncommented
                            //summary += summary = item.exception.split('\n')[0].substr(300) + "...";
                        }
                        else {
                            tags.push("exception");
                            report = 3;
                            summary += item.progDescription.split('\n')[0].substr(70) + "...";//\n";
                            //summary += item.exception.split('\n')[0].substr(300) + "...";
                        }

                        $scope.data.push({
                            type: 1,
                            report: report,
                            undo: undo,
                            redo: redo,
                            navFor: navFor,
                            navBack: navBack,
                            searchText: (data.data[i]._id + " " + item.userDescription + " " + item.progDescription).toLowerCase(),
                            dateObj: d,
                            isToday: d.getDate() == new Date().getDate(),
                            id: data.data[i]._id,
                            link: "/#/bug/" + data.data[i]._id,
                            summary: summary,
                            date: date + " " + time,
                            tags: tags
                        });
                    }
                });
            };

            $scope.loadData = function() {
                $scope.loadBugs();
                webshims.setOptions('forms-ext', {types: 'date'});
                webshims.polyfill('forms forms-ext');
            };

            $scope.loadData();

            $scope.toDate = function(dateStr) {
                var a = dateStr.split("/");

                if (a[0] > 1000) {  // ISO date format, yyyy-mm-dd
                    return new Date(dateStr);
                }

                var d = [a[1],a[0],a[2]].join("/"), // little endian format
                    date = new Date(d);

                if (date.getYear() < 1000) {
                    date.setYear(date.getYear() + 2000);
                }
                return date;
            };

            $scope.getItems = function() {
                var filteredData = [];
                if ($scope.data == []) return filteredData;

                var startDate = $scope.toDate($scope.startDate),
                    endDate = $scope.toDate($scope.endDate),
                    startFilter = startDate instanceof Date && !isNaN(startDate.valueOf()),
                    endFilter = endDate instanceof Date && !isNaN(endDate.valueOf()),
                    textFilter = $scope.filterText !== "" && $scope.filterText !== null;


                for (var i = 0; i < $scope.data.length; i++) {
                    var item = $scope.data[i];

                    if (textFilter && !item.searchText.trim().toLowerCase().contains($scope.filterText)) {
                        continue;
                    }

                    if ($scope.typeSelect != 0 && $scope.typeSelect != item.type) {
                        continue;
                    }

                    if ($scope.reportType != 0 && $scope.reportType != item.report) {
                        continue;
                    }

                    if ($scope.undoPossible != 0 && $scope.undoPossible != item.undo) {
                        continue;
                    }

                    if ($scope.redoPossible != 0 && $scope.redoPossible != item.redo) {
                        continue;
                    }

                    if ($scope.navForwardPossible != 0 && $scope.navForwardPossible != item.navFor) {
                        continue;
                    }

                    if ($scope.navBackwardPossible != 0 && $scope.navBackwardPossible != item.navBack) {
                        continue;
                    }

                    if (startFilter && item.dateObj.getTime() - startDate.getTime() < 0) {
                        continue;
                    }

                    if (endFilter && item.dateObj.getTime() - endDate.getTime() > 0) {
                        continue;
                    }

                    filteredData.push(item);
                }

                filteredData = filteredData.sort(function(a,b) {
                    return b.dateObj.getTime() - a.dateObj.getTime();
                });

                $scope.filterCount = filteredData.length;
                return filteredData;
            };
        }
    ]);
}());