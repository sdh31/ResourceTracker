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

        timelineData.resources.forEach(function(resource) {
            resource.reservations.forEach(function(reservation) {

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
                data.push(new Date(reservation.start_time));
                data.push(new Date(reservation.end_time));
                dataTableRows.push(data);
            });
        });


        dataTable.addRows(dataTableRows);

        var options = {
            timeline: { colorByRowLabel: false },
            avoidOverlappingGridLines: true,
            width: 1200,
            tooltip: { isHtml: true }
        }

        chart.draw(dataTable, options);
      };

    });
