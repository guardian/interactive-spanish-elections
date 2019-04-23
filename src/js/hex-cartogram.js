import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as topojson from 'topojson'
import * as d3geo from 'd3-geo'
import {event as currentEvent} from 'd3-selection';
import cartogram from '../assets/deputies-hex.json'
import provincesVotesRaw from 'raw-loader!./../assets/Congreso _ Junio 2016 _ Resultados por circunscripción - Circunscripciones(1).csv'
import electoralData from '../assets/electoral-data'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3geo);

const atomEl = $('.interactive-wrapper')

let isMobile = window.matchMedia('(max-width: 700px)').matches;

let maxWidth = 660;
let maxHeight = maxWidth - 100;

atomEl.style.height = maxWidth + "px";

let width = isMobile ? atomEl.getBoundingClientRect().width : maxWidth;
let height = isMobile ? width : maxHeight;

let padding = 20;

let tooltip = d3.select("#elections-cartogram .tooltip")

let svg = d3.select('#elections-cartogram #cartogram').append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'cartogram')

let projection = d3.geoMercator()
/*.center([0,43])
.rotate([4,2])
.scale(4000)
*/
let path = d3.geoPath()
.projection(projection)

let parsed = d3.csvParse(provincesVotesRaw)
let provincesVotes = parsed;
let deputiesByProvince = [];

projection.fitSize([width, height], topojson.feature(cartogram, cartogram.objects['deputies-hex']));

let provincesFeatures = topojson.feature(cartogram, cartogram.objects['deputies-hex']).features

let deputiesCarto = svg.append('g').selectAll('path')
.data(topojson.feature(cartogram, cartogram.objects['deputies-hex']).features)
.enter()
.append('path')
.attr('d', path)
.attr('id', d => 'd' + d.properties.layer)
.attr('class', 'deputy')


let provincesCarto = svg.append('g').selectAll('path')
.data(topojson.feature(cartogram, cartogram.objects['provincias-hex']).features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => 'provincia-hex p' + +String(d.properties.layer).substr(4,5))
.on('mouseover', mouseover)
.on('mouseout', mouseout)
.on("mousemove", mousemove)

let comunidadesCarto = svg.append('g').selectAll('path')
.data(topojson.feature(cartogram, cartogram.objects['comunidades-hex']).features)
.enter()
.append('path')
.attr('d', path)
.attr('class', 'comunidad')


let leabelsGroup = svg.append('g');

electoralData.mainComunidades.forEach(p => {

	leabelsGroup
	.append('text')
	.attr('class', 'cartogram-label-outline')
	.attr('transform', "translate(" + (projection(p.location)[0] + 10) + "," + (projection(p.location)[1] + 5) + ")")
	.text(d => p.comunidad)

	leabelsGroup
	.append('text')
	.attr('class', 'cartogram-label')
	.attr('transform', "translate(" + (projection(p.location)[0] + 10) +"," + (projection(p.location)[1] + 5) + ")")
	.text(d => p.comunidad)

})


electoralData.provinces.map(p => {

	let results = provincesVotes.find(v => +v['Código de Provincia'] === +p.code.substr(4,5));

	deputiesByProvince[p.code] = []

	electoralData.parties.map(d => {

		let partyName = d.party;

		if(partyName == "PODEMOS-COMPROMÍS-EUPV")partyName = "Podemos-COMPROMÍS-EUPV"
		if(partyName == "PODEMOS-EN MAREA-ANOVA-EU")partyName = "Podemos-EN MAREA-ANOVA-EU"
		if(partyName == "PODEMOS-IU-EQUO")partyName = "Podemos-IU-EQUO"
		if(partyName == "C's")partyName = "Citizens"

		if(results[d.party + " Diputados"] > 0){
			deputiesByProvince[p.code].push(
			{
				party:partyName,
				deputies: results[d.party + " Diputados"],
				votes:parseInt(results[d.party + " Votos"].split(',').join(''))
			})
		}
	})

	deputiesByProvince[p.code].sort( (a,b) => b.votes - a.votes);

	let accum = 1;

	deputiesByProvince[p.code].map(dep => {

		for (let i = 0; i < +dep.deputies; i++) {


			let number = accum;

			if(accum<10) number = '0' + accum;

			let s = svg.select('#d' + p.code + number)

			let name = dep.party;

			if(dep.party === "C's") name = 'Cs'

				s.attr('class', name)

			let sq = svg.select('#d' + p.code + number)

			sq.attr('class', name)

			accum ++
			
		}
	})

	accum = 0;
})




function mouseover(d){

	d3.selectAll('.provincia-hex').style('fill-opacity',1)
	d3.select(this).style('fill-opacity',0)

	d3.selectAll('.geo-map .cover').style('opacity', 1)

	d3.select('.geo-map .cover.' + d3.select(this).attr('class').split(' ')[1]).style('opacity',0)

	
	let province = electoralData.provinces.find(e => d.properties.layer == e.code)

	tooltip.classed(" over", true)

	tooltip.select('.tooltip-province').html(province.name)

	deputiesByProvince[d.properties.layer].map(dep => {
		

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

	tooltip.classed(" over", false)
	
	d3.selectAll('.provincia-hex').style('fill-opacity',0)

	d3.selectAll('.geo-map .cover').style('opacity', 1)

	tooltip.select('.tooltip-results').html('')

	tooltip.style('left', 1000 + 'px')
}

function mousemove(d){


	let left = document.getElementById('elections-cartogram').getBoundingClientRect().x;
	let top = document.getElementById('cartogram').getBoundingClientRect().y;

	let tWidth = +tooltip.style("width").split('px')[0]
	let tHeight = +tooltip.style("height").split('px')[0]

	let posX = 0;
	let posY = currentEvent.clientY - top + padding

	if(currentEvent.clientX - left > width /2){
		posX += width - tWidth
	}

	if(currentEvent.clientY - top > height /2){
		posY -= tHeight + padding * 2
	}

	tooltip.style('top', posY + 'px')
	tooltip.style('left', posX + 'px')
	
}

/*svg.on("click", function() {
  console.log(projection.invert(d3.mouse(this)));
});
*/


if(isMobile)
{

	let mainComunidades = [
	{"comunidad":"Madrid", "location":[-7.907373222825101, 40.44]},
	{"comunidad":"Catalonia", "location":[1.8517667305883931, 43.846563304934755]},
	{"comunidad":"Andalusia", "location":[-4.041508566088886, 36.297753886976146]},
	{"comunidad":"Basque Country", "location":[-2.471860305570312, 43.846563304934755]},
	{"comunidad":"Canary Islands", "location":[ 1.9651972192386167, 36.35804576123051]},
	{"comunidad":"Balearic Islands", "location":[2.7383503261472213, 39.1090350573891]},
	{"comunidad":"Galicia", "location":[-8.02631985465719, 43.846563304934755]}
	]



	let paths = [

	{"from":[ -6.8282224882214635, 40.38930306353237], "to":[-5.260810664561033, 40.38930306353237]},
	{"from":[ -2.310799659349214, 43.28778915512214 ],"to":[ -2.310799659349214, 43.646875860789585 ]},
	{"from":[ 2.1136821408956274, 43.646875860789585 ],"to":[  2.1136821408956274, 42.72531740122323]},
	{"from":[ -4.647601668029822, 36.943870391913876 ],"to":[  -4.647601668029822, 36.545091849925655 ]},
	{"from":[ -7.910904739716214, 43.646875860789585 ],"to":[ -7.910904739716214, 43.20404486041459 ]}

	]

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



}


