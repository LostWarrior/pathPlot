function initMap(zoneData,data,width,height){

	var colors = ['#b2b2b2','#65ac63','#332e60','#ad4742','#4558A7','#BCA230'];

	var minMax = getMinMax(data);

	var minCount = minMax['min'];

	var maxCount = minMax['max'];

	var imgData = [1];

	var markerWidth = 40;

	var svg = d3.select('#map-canvas').append("svg")
							  .attr({'width': width, 'height': height});

	var mapImage = svg.selectAll('.mapImage')
					  .data(imgData);

		mapImage.enter().append('svg:image')
				.attr({'xlink:href':'1floor.jpg','width':width, 'height':height,'class': 'mapImage','opacity':0.4});

	/* Plot zone names and markers */

	var zoneParent = svg.selectAll('.zoneParent').data([1]);

				zoneParent.enter().append('g').attr('class','zoneParent');

	var zones = zoneParent.selectAll(".zones")
						.data(zoneData, function(d){
							return d.name;
						});

		zones.enter().append("polygon")
			 .attr({
			 	'points': function(d){

			 			      var arr = d.points;

			 			      var str = '';

			 			      for(var i = 0; i < arr.length; i = i+2){

			 			      	str += arr[i] + "," + arr[i+1] + " ";

			 			      }

			 			      return str;
			 			  },
			 	'fill':'none',
			 	'stroke':'none',
			 	'class':'zones',
			 	'stroke-width':3,
			 	'opacity':0.1
			  });


	var centroids = calculateCentroids();

	var markerParent = svg.selectAll('.markerParent')
						  .data([1]);

					markerParent.enter().append('g').attr('class','markerParent');

	var markers = markerParent.selectAll('.markerG')
						.data(centroids, function(d){
							return d.name;
						});

		markers.enter().append('g')
			   .attr('class','markerG')
			   .append('svg:image')
			   .attr({
			  	'xlink:href': 'locationIcon.png',
			  	'width': markerWidth,
			  	'height': markerWidth,
			  	'x': function(d){
			  		return d['center'][0] - markerWidth/2;
			  	},
			  	'y': function(d){
			  		return d['center'][1] - markerWidth/2;
			  	},
			  	'zoneVal': function(d){
			  		return d.name;
			  	},
			  	'cursor': 'pointer',
			  	'class': 'markers'
			   })
			   .on('click', function(d){

			   		var paths = d3.selectAll('path');

				 	paths.attr({
				 	  	'opacity': 0.5,
				 	  	'stroke-width': function(d){
				 	  		return getLineWidth(d.value);
				 	  	}
				 	});

			   		var zoneName = d['name'];

			   	 	var zoneExists = [];

			   		for(var i in data){
			   			for(var j in data[i]['location']){
			   				if(data[i]['location'][j] == zoneName){
			   					zoneExists.push(data[i]['path']);
			   				}
			   			}
			   		}

			   		for(var m in zoneExists){

			   			var attrVal = '[pathId="' + zoneExists[m] + '"]';

				   		var len = paths[0].length;

				   		for(var l = 0; l < len; l++){

				   			if($(paths[0][l]).attr('pathId') == zoneExists[m]){

				   				var sel = $(paths[0][l]).attr('dataVal');

				   				d3.select(paths[0][l]).attr({
				   					'stroke-width': function(){

				   						return getLineWidthHighlighted(sel);
				   					},
				   					'opacity':1
				   				});

				   			}

				   		}

			   		}

			   		
			   });

		markers.append('text')
			   .attr({
			   	'x': function(d){
			   		return d['center'][0];
			   	},
			   	'y': function(d){
			   		return d['center'][1] + markerWidth;
			   	}

			   })
			   .text(function(d){
			   	 return d.name;
			   })
			   .style({
				'text-anchor': 'middle', 
				'fill':'#c0392b', 
				'stroke-width': 0.6, 
				'stroke': '#c0392b',
				'font-size': '12px'
			   });


		var centroidZoneVals = [];

		for(var i in centroids){

			centroidZoneVals[centroids[i]['name']] = centroids[i]['center'];

		}

	var lineFunction = d3.svg.line()
                         .x(function(d) { return d.x; })
                         .y(function(d) { return d.y; })
                         .interpolate("step-before");


	/* Plot paths */

	var pathGroup = svg.selectAll('.pathGroup')
					   .data([1]);

		pathGroup.enter().append('g').attr({'class': 'pathGroup'});


	var pathParent = pathGroup.selectAll('.pathParent')
						 .data(data);

		pathParent.enter().append('g')
			 .attr('class',  'pathParent')
			 .append('path')
			 .attr({
			 	'pathId': function(d){
			 		return d.path;
			 	},
			 	'class': 'path',	
			 	'dataVal': function(d){
			 		return d.value;
			 	},
			 	'stroke-width': function(d){
			 		var val = getLineWidth(d.value);
			 		return val;
			 	},
			 	'fill': 'none',
			 	'stroke': function(d){
			 		return colors[d.path];
			 	},
			 	'opacity': 0.5,
			 	'cursor':'pointer'
			 });


	var paths = svg.selectAll('.pathGroup').selectAll('.pathParent').selectAll('path')
				.data(function(d){
				 	var points = [];

				 	for(var i in d.location){
				 		var val = {};
				 		val['x'] = centroidZoneVals[d.location[i]][0];
				 		val['y'] = centroidZoneVals[d.location[i]][1];
				 		points.push(val);
				 	}

				 	return [points];

				 })
				 .attr('d', function(d){

				 	return lineFunction(d);
				 })
				 .on('click', function(){

				 	d3.selectAll('path')
				 	  .attr({
				 	  	'opacity': 0.5,
				 	  	'stroke-width': function(d){
				 	  		return getLineWidth(d.value);
				 	  	}
				 	  })

				 	d3.select(this).attr({
				 		'opacity': 1,

				 		'stroke-width': function(d){

				 			var sel = d3.select(this).attr('dataVal');

				 			return getLineWidthHighlighted(sel);
				 		}
				 	})

				 });





	function getLineWidth(count){

	 	var xScale = d3.scale.linear()
	 					.range([1,6])
	 					.domain([0, maxCount]);

	 	var width = xScale(count);

	 	return width;

	}

	function getLineWidthHighlighted(count){

		var xScaleHighlighted = d3.scale.linear()
								  .range([5,8])
								  .domain([0, maxCount]);

		var widthHighlighted = xScaleHighlighted(count);

		return widthHighlighted;
	}

	/* Calculate center points of polygon */

	function calculateCentroids(){

		var centroids = [];

		var sel = svg.selectAll('.zones')
					 .each(function(d,i){

					 	var obj = {};

					 	var bBoxVal = this.getBBox();

					 	var xyBox = [bBoxVal.x + bBoxVal.width/2, bBoxVal.y + bBoxVal.height/2];

					 	obj.center = xyBox;

					 	obj.name = d['name'];

					 	centroids.push(obj);

					 });

		return centroids;
	}

}


function getMinMax(data){

	var obj = {};

	var min = 0; var max = 0;

	for(var i in data){

		if(data[i]['count'] > max){
			max = data[i]['count'];
		}

	}

	min = max;

	for(var j in data){

		if(data[j]['count'] < min){
			min = data[j]['count'];
		}
	}

	obj['min'] = min;
	obj['max'] = max;

	return obj;
}