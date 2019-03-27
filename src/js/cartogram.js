import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as topojson from 'topojson'
import * as d3geo from 'd3-geo'
import provincesVotesRaw from 'raw-loader!./../assets/Congreso _ Junio 2016 _ Resultados por circunscripción - Circunscripciones(1).csv'
import provincesMap from '../assets/provincias'
import squaresCartogram from '../assets/spanish-congress-cartogram'
import centroids from '../assets/centroids-cartogram'
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

projection.fitSize([width, height], topojson.feature(centroids, centroids.objects["centroids-cartogram"]));

let provinces = topojson.mesh(provincesMap, provincesMap.objects.provincias).features;

let map = svg.append('g')
.append('path')
.attr('d', path(topojson.mesh(provincesMap,provincesMap.objects.provincias)))
.style('fill', 'none')
.style('stroke', '#B3B3B4')
.style('stroke-width', 0.5)

let carto = svg.append('g').selectAll('path')
.data(topojson.feature(squaresCartogram, squaresCartogram.objects['spanish-congress-cartogram']).features)
.enter()
.append('path')
.attr('d', path)
.attr('id', d => 'd' + d.properties.layer)
.attr('class', 'deputy')

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



svg.on("click", function() {
  console.log(projection.invert(d3.mouse(this)));
});


let labels = svg.append('g').selectAll('text')
.data(topojson.feature(centroids, centroids.objects["centroids-cartogram"]).features)
.enter()
.append('text')
.attr('name', d => console.log(d))
.attr('class', 'cartogram-label')
.attr('transform', d => "translate(" + (projection(d.geometry.coordinates)[0] - 5) + "," + projection(d.geometry.coordinates)[1] + ")")
.text(d => d.properties.name)

/*path(topojson.feature(municipalitiesMap, municipalitiesMap.objects['municipios_4326']));

context.fillStyle = 
*/

