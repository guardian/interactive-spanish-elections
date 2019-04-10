import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as topojson from 'topojson'
import * as d3geo from 'd3-geo'
import map from '../assets/admn1_admn2.json'
import provincesVotesRaw from 'raw-loader!./../assets/Congreso _ Junio 2016 _ Resultados por circunscripción - Circunscripciones(1).csv'
import electoralData from '../assets/electoral-data'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3geo);

let width = 300;
let height = 230;

let tooltip = d3.select("#elections-geographical .tooltip")

let padding = 30;

let svg = d3.select('#elections-geographical').append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'geo-map')

let projection = d3.geoAlbers()
.center([0,43])
.rotate([4,2])
.scale(4000)

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

let parsed = d3.csvParse(provincesVotesRaw)

let provincesVotes = parsed;

provincesVotes.map(province => {

	let parties = []
		
	electoralData.parties.map(party => {
		
		if(+province[party.party + " Diputados"] > 0)
		{
			parties.push({party:party.party, deputies:+province[party.party + " Diputados"], votes:+province[ party.party + " Votos"].split(',').join('')})
		}

	})

	parties.sort((a,b) => (b.votes - a.votes)); 

	d3.select('#p' + province['Código de Provincia']).attr('class', 'provincia ' + parties[0].party)
})


/*svg.on("click", function() {
  console.log(projection.invert(d3.mouse(this)));
});*/


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

}


function mouseout(d){
	

	let provinces = d3.selectAll('.geo-map .cover');
	provinces.style('opacity', 1)

	let cartoProvinces = d3.selectAll('.cartogram .provincia-hex');
	cartoProvinces.style('fill-opacity', 0)

	tooltip.classed(" over", false)

}

function mousemove(d){

	let left = d3.mouse(this)[0] + padding;
	let top = d3.mouse(this)[1]  + padding;

	tooltip.style('left', left + 'px')
	tooltip.style('top',  top + 'px')

	let tWidth = +tooltip.style("width").split('px')[0]
	let tHeight = +tooltip.style("height").split('px')[0]
	let tLeft = +tooltip.style("left").split('px')[0]

	if(left > width / 2)
	{
		tooltip.style('left', left - tWidth + 'px')
	}

	if(top  > height / 2)
	{
		tooltip.style('top', (top - tHeight) - 50 + 'px')
	}
	
}


