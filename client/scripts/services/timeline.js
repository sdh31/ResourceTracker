'use strict';

angular.module('resourceTracker')
    .service('timelineService', function ($rootScope) {


      var timelineData = {};
      this.drawTimeline = function(dataResponse) {
        timelineData = dataResponse;
        
        if ($rootScope.googleChartLoaded.value == false) {
            google.charts.load('current', {'packages':['timeline']});
            $rootScope.googleChartLoaded.value = true;
            google.charts.setOnLoadCallback(drawChart);
        } else {
            drawChart();
        }
      };

      var drawChart = function() {
        var container = document.getElementById('timeline');
        var chart = new google.visualization.Timeline(container);
        var dataTable = new google.visualization.DataTable();

        dataTable.addColumn({ type: 'string', id: 'resource' });
        dataTable.addColumn({ type: 'string', id: 'dummy bar label' });
        dataTable.addColumn({ type: 'string', role: 'tooltip', 'p': {'html': true}});
        dataTable.addColumn({ type: 'date', id: 'Start' });
        dataTable.addColumn({ type: 'date', id: 'End' });

        var startTime = timelineData.startTime;
        var endTime = timelineData.endTime;

        var defaultDataDescription = "The reservation filter spans the time interval: " + startTime + " to " + endTime + ".";
        var defaultData = ['Request Information', '', defaultDataDescription, startTime, endTime];

        var dataTableRows = [];
        dataTableRows.push(defaultData);

        // index of empty rows in the table. needed to remove color from the row
        var emptyRows = [];
        var rowIndex = 0;
        timelineData.resources.forEach(function(resource) {
            var existsReservation = false;
            rowIndex++;
            resource.reservations.forEach(function(reservation) {
                existsReservation = true;

                var resourceTooltip = "<div>" + 
                                        "<b>Start Time: </b> " + new Date(reservation.start_time) + "<br>" + 
                                        "<b>End Time: </b> "   + new Date(reservation.end_time)   + "<br>" +  
                                        "<b>Description: </b> " + resource.description            + "<br>" +
                                        "<b>Reserved By: </b>"  + reservation.username            + "<br>" +  
                                     "</div>";

                var data = [];
                data.push(resource.name);
                data.push('');              // this is necessary... it is a column label, google charts is weird and requires it.
                data.push(resourceTooltip);
                
                var resStartTime = new Date(reservation.start_time);
                var resEndTime  = new Date(reservation.end_time);
                if (resStartTime < startTime) {
                    data.push(startTime);
                } else {
                    data.push(resStartTime);
                }
                if (resEndTime > endTime) {
                    data.push(endTime);
                } else {
                    data.push(resEndTime);
                }
                dataTableRows.push(data);
            });
            if (!existsReservation) {
                var data = [];
                data.push(resource.name);
                data.push('');
                data.push('');
                data.push(startTime);
                data.push(startTime);
                dataTableRows.push(data);
                emptyRows.push(rowIndex);
            }
        });


        dataTable.addRows(dataTableRows);
        var colorsChosen = [];
        var grayColor = "#f9f9f9";
        var redColor = "#b22222"
        // push default description color
        colorsChosen.push(grayColor);
        for (var index = 1; index < dataTable.getNumberOfRows(); index++) {
            if (emptyRows.indexOf(index) != -1) {
                colorsChosen.push(grayColor);
            } else {
                colorsChosen.push(redColor);
            }
        }

        var options = {
            timeline: { colorByRowLabel: false },
            avoidOverlappingGridLines: false,
            width: 1200,
            tooltip: { isHtml: true },
            colors: colorsChosen,
            backgroundColor: grayColor,
            alternatingRowStyle: false
        }

        chart.draw(dataTable, options);
      };

    });

