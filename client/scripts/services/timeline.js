'use strict';

angular.module('resourceTracker')
    .service('timelineService', function ($rootScope) {


      var timelineData = {};
      var grayColor = "#f9f9f9";
      var redColor = "#b22222";
      var yellowColor = "#E0D873";
      var reservationIdToConfirmedMap = {};
      var handler;
      var rowToStartAndEndDateMap = {};
      var rowToStartAndEndDateMapIndex = 0;

      var permissionLevelToNameMap = {
            0: 'view',
            1: 'reserve',
            2: 'manage',
            10: 'admin'
      };

      this.drawTimeline = function(dataResponse, timelineSelectHandler) {
        timelineData = dataResponse;
        preprocessData();
        handler = timelineSelectHandler;
        rowToStartAndEndDateMap = {};
        rowToStartAndEndDateMapIndex = 0;
        
        if ($rootScope.googleChartLoaded.value == false) {
            google.charts.load('current', {'packages':['timeline']});
            $rootScope.googleChartLoaded.value = true;
            google.charts.setOnLoadCallback(drawChart);
        } else {
            drawChart();
        }
      };


      // for each reservation, determine if it is fully confirmed
      var preprocessData = function() {
        reservationIdToConfirmedMap = {};

        timelineData.resources.forEach(function(resource) {
            resource.reservations.forEach(function(reservation) {
                if (reservationIdToConfirmedMap[reservation.reservation_id] === undefined) {
                    reservationIdToConfirmedMap[reservation.reservation_id] = 1;
                }
                reservationIdToConfirmedMap[reservation.reservation_id] = 
                    reservationIdToConfirmedMap[reservation.reservation_id] & reservation.is_confirmed;
            });
        });
      };

      var drawChart = function() {
        var container = document.getElementById('timeline');
        var chart = new google.visualization.Timeline(container);
        var dataTableRows = [];

        // schema definition
        dataTableRows[0] = [{ type: 'string', id: 'resource' },
        { type: 'string', id: 'dummy bar label' },
        { role: 'style'}, // for colors
        { type: 'string', role: 'tooltip', 'p': {'html': true}},
        { type: 'date', id: 'Start' },
        { type: 'date', id: 'End' }];

        var startTime = timelineData.startTime;
        var endTime = timelineData.endTime;

        var defaultDataDescription = "The reservation filter spans the time interval: " + startTime + " to " + endTime + ".";
        var defaultData = ['Request Information', '',  grayColor, defaultDataDescription, startTime, endTime];
        dataTableRows.push(defaultData);
        rowToStartAndEndDateMap[rowToStartAndEndDateMapIndex] = [startTime, endTime];
        rowToStartAndEndDateMapIndex++;


        timelineData.resources.forEach(function(resource) {
            var resourceSharing = (resource.sharing_level == 2147483647) ? 'Unlimited' : resource.sharing_level.toString();
            var existsReservation = false;
            resource.reservations.forEach(function(reservation) {
                existsReservation = true;
                var reservationStatus = '';
                if (reservationIdToConfirmedMap[reservation.reservation_id] == 1) {
                    reservationStatus = 'Confirmed';
                } else {
                    reservationStatus = 'Pending';
                }

                var resourceStatus = '';
                if (reservation.is_confirmed == 1) {
                    resourceStatus = 'Confirmed';
                } else {
                    resourceStatus = 'Pending';
                }

                var resourceTooltip = "<div>" + 
                                        "<b>Start Time: </b> " + new Date(reservation.start_time) + "<br>" + 
                                        "<b>End Time: </b> "   + new Date(reservation.end_time)   + "<br>" +  
                                        "<b>Resource Description: </b> " + resource.description            + "<br>" +
                                        "<b>Resource Status: </b> " + resourceStatus + "<br>" + 
                                        "<b>Resource Sharing Level: </b>" + resourceSharing + "<br>" +
                                        "<b>Reservation Title: </b> " + reservation.reservation_title + "<br>" + 
                                        "<b>Reservation Description: </b> " + reservation.reservation_description + "<br>" + 
                                        "<b>Reservation Status: </b> " + reservationStatus + "<br>" + 
                                        "<b>Reserved By: </b>"  + reservation.username            + "<br>" +  
                                     "</div>";

                var data = [];
                data.push(resource.name + " (" + permissionLevelToNameMap[resource.resource_permission] + " access)");
                data.push('');              // this is necessary... it is a column label, google charts is weird and requires it.

                if (reservationIdToConfirmedMap[reservation.reservation_id] == 1) {
                    data.push(redColor);
                } else {
                    data.push(yellowColor);
                }

                data.push(resourceTooltip);
                
                var resStartTime = new Date(reservation.start_time);
                var resEndTime  = new Date(reservation.end_time);

                var rowDateArray = [];


                if (resStartTime < startTime) {
                    data.push(startTime);
                } else {
                    data.push(resStartTime);
                }
                rowDateArray.push(resStartTime);

                if (resEndTime > endTime) {
                    data.push(endTime);
                } else {
                    data.push(resEndTime);
                }
                rowDateArray.push(resEndTime);

                dataTableRows.push(data);
                rowToStartAndEndDateMap[rowToStartAndEndDateMapIndex] = rowDateArray;
                rowToStartAndEndDateMapIndex++;

            });
            if (!existsReservation) {
                var data = [];
                data.push(resource.name + " (" + permissionLevelToNameMap[resource.resource_permission] + " access)");
                data.push(''); // title
                data.push(grayColor);

                data.push(''); // desc
                data.push(startTime);
                data.push(startTime);
                dataTableRows.push(data);
                rowToStartAndEndDateMap[rowToStartAndEndDateMapIndex] = [startTime, startTime];
                rowToStartAndEndDateMapIndex++;
            }
        });

        var padding = 40;
        var rowHeight = (dataTableRows.length - 1) * 60;
        var chartHeight = rowHeight + padding;

        var options = {
            width: 1400,
            tooltip: { isHtml: true },
            backgroundColor: grayColor,
            alternatingRowStyle: false,
            height: chartHeight,
            enableInteractivity: true,
        }

        var table = new google.visualization.arrayToDataTable(dataTableRows);
        google.visualization.events.addListener(chart, 'select', function() {
            var selection = chart.getSelection();
            var item = selection[0];
            console.log(item);
            var rowInfo = rowToStartAndEndDateMap[item.row];
            handler(rowInfo);
        });

        chart.draw(table, options);
      };


    });

