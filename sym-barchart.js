(function (PV) {
	'use strict';
	// Bar Chart symbol definition
	var customSymbol = {
		//Internal unique name of the symbol
		typeName: 'barchart',
		
		//Name shown in the symbol picker menu
		displayName: 'BarChart',
		
		//Mapping to the number of data sources the symbol accepts
		datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
		
		//Object holding symbol specific functionality
		visObjectType: symbolVis,
		
		//collection of parameters that should be serialized to the back end database
		getDefaultConfig: function () {
			return {
				
				DataShape: 'Table',
				Height: 200,
				Width: 500,
                textColor: "black",
				gridColor: "darkgray",
                backgroundColor: "rgb(46,46,46)", 
                plotAreaFillColor: "rgb(46,46,46)",
				axesColor: "white",
                dataColors: true,
                showLabels: true,
                width: 0.5,
                opacity: 1,
                graphType: "column",
				includeElementName: true,
				axisPosition: "left",
				showCategoryAxisLabels: true,
				fixedYMin: 0,
				fixedYMax: 1 
            };
		},
        configOptions: function () {
            return [{
				title: 'Format Symbol',
                mode: 'format'
            }];
        }
	};
	
	function symbolVis() { }
    PV.deriveVisualizationFromBase(symbolVis);
	
	/*symbol implementation, The init function takes two parameters, scope and element, 
	and optionally sets callback functions on the symbol container object to drive the symbol, such as data updates and resize events */
	symbolVis.prototype.init = function(scope, elem) {
        this.onDataUpdate = dataUpdate;
		this.onConfigChange = configChange;
		var labels = getLabels(scope.symbol.DataSources);
		var chart = initializeChart();
		
		//Bar Chart Initialization
		function initializeChart() {
            
			var symbolContainerDiv = elem.find('#container')[0];
			//Create unique ID for symbol
            symbolContainerDiv.id = "customSymbol_" + Math.random().toString(36).substr(2, 16);
            var chartconfig = defaultChartConfig();
			var customVisualizationObject = AmCharts.makeChart(symbolContainerDiv.id, chartconfig);
			return customVisualizationObject;
		}
        
       // Extract the label 
        function getLabels(datasources) {
			return datasources.map(function(item){
                var Attribute = /af:/.test(item);
                var label = Attribute ? item.match(/\w*\|.*$/)[0] : item.match(/\w+$/)[0];
                if (!scope.config.includeElementName && (label.indexOf("|") !== -1)) {
					label = label.split("|")[label.split("|").length - 1];
				}
				return {
					Label: label
				};
			});	
		} 
		
		// Data update 
		function dataUpdate(newdata) {
            if (!newdata || !chart) return;        
			if (!labels) {
                labels = getLabels(scope.symbol.DataSources);
            }
			
			if (newdata.Rows[0].Label) {
                labels = newdata.Rows.map(
                    function(item) {
                        var label = item.Label;
						if (!scope.config.includeElementName && (label.indexOf("|") !== -1)) {
							label = label.split("|")[label.split("|").length - 1];
						}
						return {
                            Label: label
                        };
                    }
                );
            }
            // Convert the new data into the amCharts format
			var dataprovider = convertToChart(newdata, labels);
			chart.dataProvider = dataprovider;
			chart.validateData();
        }
     
		//color palette
       var chartColors = ["rgb(219, 70, 70)","rgb(60, 191, 60)", "rgb(197, 86, 13)","rgb(46, 32, 238)","rgb(165, 32, 86)","rgb(62, 152, 211)", "rgb(224, 138, 0)", "rgb(178, 107, 255)", "rgb(47, 188, 184)","rgb(156, 128, 110)" ];
 
		// Convert the data from PI Vision into amCharts format
		
		function convertToChart(newdata, labels) {

			return newdata.Rows.map(
                function(item, index) {
                    return {
                        Value: item.Value,
                        Time: item.Time,
                        Name: labels[index].Label,
                        uniqueColor: chartColors[index]   
                    }
                }
            );
		 }

        //default chart formating
		function defaultChartConfig() {
            return {
						"type": "serial",
						"theme": "light",
						"angle": 30,
						"depth3D": 30,
						"backgroundAlpha": 1,
						"backgroundColor": scope.config.backgroundColor,
						"color": scope.config.textColor,
						"plotAreaFillAlphas": 1,
						"plotAreaFillColors": scope.config.plotAreaFillColor,
						"fontFamily": "Times New Roman",
						"creditsPosition": "top-right",
						"valueAxes": [{
							"position": scope.config.axisPosition,
                            "inside": false,
                            "axisAlpha": 1,
                            "axisColor": scope.config.axesColor,
                            "fillAlpha": 0.05,
                            "gridAlpha": 1,
                            "gridColor": scope.config.gridColor
						}],
						"categoryAxis": {
                            "axisAlpha": 1,
                            "axisColor": scope.config.axesColor,
                            "gridAlpha": 1,
                            "gridColor": scope.config.gridColor,
							"autoWrap": true,
							labelsEnabled: scope.config.showCategoryAxisLabels
						},
						"graphs": [{
							"type": scope.config.graphType,
							"fillAlphas": scope.config.opacity,
                            "lineAlpha": 1,
                            "lineColorField": "uniqueColor",
							"balloonText": "Value: [[Value]]<br/>Time: [[Time]]", 
							"valueField": "Value",
							"fillColorsField": "uniqueColor",
                            showAllValueLabels: true,
                            labelPosition: "top",
                            labelText: "[[Value]]",
                            labelColorField: "uniqueColor",
                            width: scope.config.width
						}],
						"dataProvider": "",
						"categoryField": "Name"	
					}
        }
        
        // custom changes apply
		var oldLabelSettings;
		function configChange(data) {
			if (oldLabelSettings != scope.config.includeElementName) {
				oldLabelSettings == scope.config.includeElementName;
				labels = getLabels(scope.symbol.DataSources);
			}
			// custom color apply for chart parameters
            if (chart) {
                chart.color = scope.config.textColor;
                chart.backgroundColor = scope.config.backgroundColor;
                chart.plotAreaFillColors = scope.config.plotAreaFillColor;
                chart.categoryAxis.gridColor = scope.config.gridColor;
				chart.categoryAxis.axisColor = scope.config.axesColor;
				chart.categoryAxis.labelsEnabled = scope.config.showCategoryAxisLabels;
                chart.valueAxes[0].gridColor = scope.config.gridColor;
				chart.valueAxes[0].position = scope.config.axisPosition;
				chart.valueAxes[0].axisColor = scope.config.axesColor;
                chart.graphs[0].width = scope.config.width;
                chart.graphs[0].fillAlphas = scope.config.opacity;
                chart.graphs[0].type = scope.config.graphType;
                if (scope.config.showLabels) {
                    chart.graphs[0].labelText = "[[Value]]";
                } else {
                    chart.graphs[0].labelText = null;
                }
                if (scope.config.dataColors) {
                    chart.graphs[0].fillColorsField = "uniqueColor";
                    chart.graphs[0].lineColorField  = "uniqueColor";
                    chart.graphs[0].labelColorField = "uniqueColor";
				} 
                chart.validateNow();
            }
		}

	}
	PV.symbolCatalog.register(customSymbol);
	
})(window.PIVisualization);