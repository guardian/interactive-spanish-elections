import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as topojson from 'topojson'
import * as d3geo from 'd3-geo'
import cartogram from '../assets/deputies-hex.json'
import provincesVotesRaw from 'raw-loader!./../assets/Congreso _ Junio 2016 _ Resultados por circunscripción - Circunscripciones(1).csv'
import electoralData from '../assets/electoral-data'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3geo);

const atomEl = $('.interactive-wrapper')

let isMobile = window.matchMedia('(max-width: 700px)').matches;

let maxWidth = 660;
let maxHeight = maxWidth - 100;

let width = isMobile ? atomEl.getBoundingClientRect().width : maxWidth;
let height = isMobile ? 400 : maxHeight;

let padding = 30;

let tooltip = d3.select("#elections-cartogram .tooltip")

let svg = d3.select('#elections-cartogram').append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'cartogram')

let projection = d3.geoAlbers()
.center([0,43])
.rotate([4,2])
.scale(4000)

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

electoralData.mainProvinces.forEach(p => {

	leabelsGroup
	.append('text')
	.attr('class', 'cartogram-label-outline')
	.attr('transform', "translate(" + (projection(p.location)[0] + 10) + "," + (projection(p.location)[1] + 5) + ")")
	.text(d => p.province)

	leabelsGroup
	.append('text')
	.attr('class', 'cartogram-label')
	.attr('transform', "translate(" + (projection(p.location)[0] + 10) +"," + (projection(p.location)[1] + 5) + ")")
	.text(d => p.province)

})


electoralData.provinces.map(p => {

	let results = provincesVotes.find(v => +v['Código de Provincia'] === +p.code.substr(4,5));

	deputiesByProvince[p.code] = []

	electoralData.parties.map(d => {
		if(results[d.party + " Diputados"] > 0){
			deputiesByProvince[p.code].push(
			{
				party:d.party,
				deputies: results[d.party + " Diputados"]
			})
		}
	})

	deputiesByProvince[p.code].sort( (a,b) => b.deputies - a.deputies);

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

