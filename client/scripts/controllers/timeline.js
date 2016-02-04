'use strict';

angular.module('resourceTracker')
    .controller('TimelineCtrl', function () {

      google.charts.load('current', {'packages':['timeline']});
      google.charts.setOnLoadCallback(drawChart);
      function drawChart() {
        var container = document.getElementById('timeline');
        var chart = new google.visualization.Timeline(container);
        var dataTable = new google.visualization.DataTable();

        dataTable.addColumn({ type: 'string', id: 'resource' });
        dataTable.addColumn({ type: 'string', id: 'dummy bar label' });
        dataTable.addColumn({ type: 'string', role: 'tooltip' });
        dataTable.addColumn({ type: 'date', id: 'Start' });
        dataTable.addColumn({ type: 'date', id: 'End' });

        var startDate = new Date(2015, 0, 1, 0, 0);
        var endDate = new Date(2015, 0, 15, 0, 0);

        var defaultData = ['Request Information', null, 'your filter request was ....', startDate, endDate];

        var sampleData = [ ['resource1', 'test', 'resource 1 desc', new Date(2015, 0, 1, 2, 15), new Date(2015, 0, 1, 2, 45)],
                           ['resource2', 'test', 'resource 2 desc', new Date(2015, 0, 1, 6, 30), new Date(2015, 0, 1, 7, 30)],
                           ['resource1', 'test', 'resource 1 desc', new Date(2015, 0, 1, 2, 50), new Date(2015, 0, 1, 2, 55)]
                         ];


        var sampleData2 = [ ['resource1', new Date(2016, 2, 4, 7, 15), new Date(2016, 2, 4, 8, 15)],
                           ['resource2', new Date(2020, 2, 6, 3, 30), new Date(2020, 2, 7, 10, 30)]
                         ];


        dataTable.addRows([defaultData, sampleData[0], sampleData[1], sampleData[2]]);

        var options = {
            timeline: { colorByRowLabel: false },
            avoidOverlappingGridLines: true,
        }


        chart.draw(dataTable, options);
      };

      function getTooltip() {


      };

    });

