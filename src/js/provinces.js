import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as topojson from 'topojson'
import * as d3geo from 'd3-geo'
import map from '../assets/admn1_admn2.json'
import provincesVotesRaw from 'raw-loader!./../assets/Congreso _ Junio 2016 _ Resultados por circunscripción - Circunscripciones(1).csv'
import electoralData from '../assets/electoral-data'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3geo);

let mainComunidades = [
	{"comunidad":"Madrid", "location":[-8.70896475056788, 40.43271083404107]},
	{"comunidad":"Catalonia", "location":[3.7021367134571945, 41.34055512450301]},
	{"comunidad":"Andalusia", "location":[-5.267693225114382, 35.4926181702362]},
	{"comunidad":"Basque Country", "location":[-2.593824346415369, 44.520148741647674]},
	{"comunidad":"Canary Islands", "location":[ 3.0210325043186224, 35.28300873163696]},
	{"comunidad":"Balearic Islands", "location":[3.379433880190461, 38.63271492904698]},
	{"comunidad":"Galicia", "location":[-8.468155410474292, 44.45544313728824]}
	]

let paths = [

{"from":[-7.0896475056788, 40.43271083404107], "to":[-4.4036897738022915, 40.43271083404107]},
{"from":[ -2.454628077533657, 43.47595745278307 ],"to":[ -2.454628077533657, 44.16995634597881 ]},
{"from":[ 2.7202042248160696, 41.35490023929793 ],"to":[ 2.256503477338289, 41.377328003798894 ]},
{"from":[ -4.667814675852475, 35.74605490215351 ],"to":[ -4.667814675852475, 36.51041049451024 ]},
{"from":[ -7.910904739716214, 44.12414412990034 ],"to":[ -7.910904739716214, 43.74134749305692 ]}

]

const atomEl = $('.interactive-wrapper')

let isMobile = window.matchMedia('(max-width: 620px)').matches;

let width = isMobile ? atomEl.getBoundingClientRect().width : 300;
let height = width;

let tooltip = d3.select("#elections-geographical .tooltip")

let padding = 80;

let svg = d3.select('#coropleth').append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'geo-map')

let projection = d3.geoMercator()
/*.center([0,43])
.rotate([4,2])
.scale(4000)*/

let path = d3.geoPath()
.projection(projection)

projection.fitSize([width, height], topojson.feature(map, map.objects.provincias));

let provincesMap = svg.append('g').selectAll('path')
.data(topojson.feature(map, map.objects.provincias).features)
.enter()
.append('path')
.attr('d', path)
.attr('id', d => 'p' + +String(d.properties.code).substr(4,5))
.attr('class', 'province')
.style('opacity', 1)


let provincesMapCover = svg.append('g').selectAll('path')
.data(topojson.feature(map, map.objects.provincias).features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => 'cover p' + +String(d.properties.code).substr(4,5))


provincesMap
.on('mouseover', mouseover)
.on('mouseout', mouseout)
.on('mousemove', mousemove)

let comunitiesMap = svg.append('g').selectAll('path')
.data(topojson.feature(map, map.objects.comunidades).features)
.enter()
.append('path')
.attr('d', path)
.attr('class', 'comunidad')

let provincesDeputies = svg.append('g').selectAll('text')
.data(topojson.feature(map, map.objects.provincias).features)
.enter()
.append('text')
.attr('class','map-label')
.attr('transform', d => "translate(" + path.centroid(d)[0] + "," + path.centroid(d)[1] + ")")
.text(d => d.properties.deputies)

let leabelsGroup = svg.append('g');

mainComunidades.forEach(p => {

	leabelsGroup
	.append('text')
	.attr('class', 'map-label')
	.attr('transform', "translate(" + (projection(p.location)[0] + 10) +"," + (projection(p.location)[1] + 5) + ")")
	.text(d => p.comunidad)

})

leabelsGroup.selectAll('path')
.data(paths)
.enter()
.append('path')
.attr('class', 'line')
.attr('d', d => lngLatToArc(d, 'from', 'to', 100))



let parsed = d3.csvParse(provincesVotesRaw)

let provincesVotes = parsed;

let deputiesByProvince = [];


provincesVotes.map(province => {

	let parties = []
		
	electoralData.parties.map(party => {
		
		if(+province[party.party + " Diputados"] > 0)
		{
			parties.push({
				party:party.party,
				deputies:+province[party.party + " Diputados"],
				votes:+province[ party.party + " Votos"].split(',').join('')
			})
		}

	})

	parties.sort((a,b) => (b.votes - a.votes));

	deputiesByProvince[province['Código de Provincia']] = parties;

	d3.select('#p' + province['Código de Provincia']).attr('class', 'provincia ' + parties[0].party)

})



svg.on("click", function() {
  console.log(projection.invert(d3.mouse(this)));
});


function mouseover(d){

	let cartoProvince = d3.select('.cartogram .p' + +String(d.properties.code).substr(4,5));
	let cartoProvinces = d3.selectAll('.cartogram .provincia-hex');

	cartoProvinces.style('fill-opacity', 1)
	cartoProvince.style('fill-opacity', 0)

	d3.selectAll('.cover').style('opacity', 1)
	d3.select('.p' + +String(d.properties.code).substr(4,5)).style('opacity',0)

	let province = electoralData.provinces.find(e => d.properties.code == e.code)

	tooltip.classed(" over", true)

	tooltip.select('.tooltip-province').html(province.name)

	deputiesByProvince[+String(d.properties.code).substr(4,5)].map(dep => {
		

		let row = tooltip.select('.tooltip-results')
		.append('div')
		.attr('class', 'tooltip-row')

		row
		.append('div')
		.attr('class','tooltip-party')
		.html(dep.party)

		row
		.append('div')
		.attr('class','tooltip-deputies')
		.html(dep.deputies)
	})

}


function mouseout(d){
	

	let provinces = d3.selectAll('.geo-map .cover');
	provinces.style('opacity', 1)

	let cartoProvinces = d3.selectAll('.cartogram .provincia-hex');
	cartoProvinces.style('fill-opacity', 0)
	
	tooltip.select('.tooltip-results').html('')

	tooltip.classed(" over", false)

}

function mousemove(d){

	let left = d3.mouse(this)[0] + padding;
	let top = d3.mouse(this)[1]  + padding;

	tooltip.style('top',  top + 'px')

	let tWidth = +tooltip.style("width").split('px')[0]

	if(left > width / 2)
	{
		tooltip.style('left', width - tWidth + 'px')
	}
	else{
		tooltip.style('left', 0 + 'px')
	}

	
}

function lngLatToArc(d, sourceName, targetName, bend){
		// If no bend is supplied, then do the plain square root
		bend = bend || 1;
		// `d[sourceName]` and `d[targetname]` are arrays of `[lng, lat]`
		// Note, people often put these in lat then lng, but mathematically we want x then y which is `lng,lat`

		var sourceLngLat = d[sourceName],
				targetLngLat = d[targetName];

		if (targetLngLat && sourceLngLat) {
			var sourceXY = projection( sourceLngLat ),
					targetXY = projection( targetLngLat );

			// Uncomment this for testing, useful to see if you have any null lng/lat values
			// if (!targetXY) console.log(d, targetLngLat, targetXY)
			var sourceX = sourceXY[0],
					sourceY = sourceXY[1];

			var targetX = targetXY[0],
					targetY = targetXY[1];

			var dx = targetX - sourceX,
					dy = targetY - sourceY,
					dr = Math.sqrt(dx * dx + dy * dy)*bend;

			// To avoid a whirlpool effect, make the bend direction consistent regardless of whether the source is east or west of the target
			var west_of_source = (targetX - sourceX) < 0;
			if (west_of_source) return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
			return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
			
		} else {
			return "M0,0,l0,0z";
		}
	}


