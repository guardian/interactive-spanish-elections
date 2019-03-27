import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as topojson from 'topojson'
import * as d3geo from 'd3-geo'
import diputadosCartogram from '../assets/diputados-merged'
import provinciasCartogram from '../assets/provincias-merged'
import comunidadesCartogram from '../assets/comunidades-merged'
import provincesVotesRaw from 'raw-loader!./../assets/Congreso _ Junio 2016 _ Resultados por circunscripción - Circunscripciones(1).csv'
import electoralData from '../assets/electoral-data'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3geo);

const atomEl = $('.interactive-wrapper')

let isMobile = window.matchMedia('(max-width: 980px)').matches;

let width = isMobile ? atomEl.getBoundingClientRect().width  : atomEl.getBoundingClientRect().width;
let height = isMobile ? width * 5 / 3 : (width * 3 / 5);

let svg = d3.select('.elections-map-wrapper').append('svg')
.attr('width', width)
.attr('height', height)

let projection = d3.geoAlbers()
.center([0,43])
.rotate([4,2])
.scale(4000)

let path = d3.geoPath()
.projection(projection)

projection.fitSize([width, height], topojson.feature(diputadosCartogram, diputadosCartogram.objects['diputados-merged']));

let deputiesCarto = svg.append('g').selectAll('path')
.data(topojson.feature(diputadosCartogram, diputadosCartogram.objects['diputados-merged']).features)
.enter()
.append('path')
.attr('d', path)
.attr('id', d => 'd' + d.properties.layer)
.attr('class', 'deputy')

let provincesCarto = svg.append('g').selectAll('path')
.data(topojson.feature(provinciasCartogram, provinciasCartogram.objects['provincias-merged']).features)
.enter()
.append('path')
.attr('d', path)
.attr('class', 'provincia')

let comunidadesCarto = svg.append('g').selectAll('path')
.data(topojson.feature(comunidadesCartogram, comunidadesCartogram.objects['comunidades-merged']).features)
.enter()
.append('path')
.attr('d', path)
.attr('class', 'comunidad')

let leabelsGroup = svg.append('g');

electoralData.mainProvinces.forEach(p => {

	leabelsGroup
	.append('text')
	.attr('class', 'map-label-outline')
	.attr('transform', "translate(" + projection(p.location)[0] + "," + (projection(p.location)[1] + 5) + ")")
	.text(d => p.province)

	leabelsGroup
	.append('text')
	.attr('class', 'map-label')
	.attr('transform', "translate(" + projection(p.location)[0] + "," + (projection(p.location)[1] + 5) + ")")
	.text(d => p.province)

})

let parsed = d3.csvParse(provincesVotesRaw)

let provincesVotes = parsed;
let deputiesByProvince = [];

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

