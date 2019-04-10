import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as topojson from 'topojson'
import * as d3geo from 'd3-geo'
import map from '../assets/admn1_admn2.json'
import electoralData from '../assets/electoral-data'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3geo);

const atomEl = $('.interactive-wrapper')

let isMobile = window.matchMedia('(max-width: 980px)').matches;

let width = isMobile ? atomEl.getBoundingClientRect().width  : atomEl.getBoundingClientRect().width ;
let height = isMobile ? width : (width * 3 / 5);

let svg = d3.select('#elections-andalusia').append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'geo-map')

let projection = d3.geoMercator()


let path = d3.geoPath()
.projection(projection)

fetch('<%= path %>/assets/municipios.json').then( municipios => {

	return municipios.json();	
})
.then(myJson => { drawMap(myJson);});

const drawMap = municipios => {

	let andalusia = topojson.feature(municipios, {
		type: "GeometryCollection",
		geometries: municipios.objects['municipios_4326'].geometries.filter(d => d.properties.Cod_CCAA == '01')
	})

	projection.fitSize([width, height], andalusia);

	let provincesMap = svg.append('g').selectAll('path')
	.data(andalusia.features)
	.enter()
	.append('path')
	.attr('d', path)
	.attr('class', d => {d.properties['2016-data-NATCODE_winner']})

}