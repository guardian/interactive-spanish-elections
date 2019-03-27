import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as topojson from 'topojson'
import * as d3geo from 'd3-geo'
import comunidadesMap from '../assets/comunidades_4326'
import provincesMap from '../assets/provincias'
import electoralData from '../assets/electoral-data'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3geo);

const atomEl = $('.interactive-wrapper')

fetch('<%= path %>/assets/municipios.json').then( municipios => {

	return municipios.json();	
})
.then(myJson => { drawMap(myJson);});


let isMobile = window.matchMedia('(max-width: 980px)').matches;

let width = isMobile ? atomEl.getBoundingClientRect().width  : atomEl.getBoundingClientRect().width;
let height = isMobile ? width * 5 / 3 : (width * 3 / 5);

let canvas = d3.select('.elections-map-wrapper').append('canvas')
.attr('width', width)
.attr('height', height);

let context = canvas.node().getContext('2d')

let projection = d3.geoAlbers()
.center([0,43])
.rotate([4,2])
.scale(4000)

let path = d3.geoPath()
.projection(projection)
.context(context)

const drawMap = municipios => {

	projection.fitSize([width, height], topojson.feature(municipios, municipios.objects['municipios_4326']));

	let features = topojson.feature(municipios, municipios.objects['municipios_4326']).features

	features.map(f => {

		let color = electoralData.parties.find(w => w.party === f.properties["2016-data-NATCODE_winner"]).color;

		context.strokeStyle = color;
		context.lineWidth = .5;

		context.fillStyle = color;
		context.beginPath();
		path(f);
		context.fill();
		context.stroke();
	})

	let provincesFeatures = topojson.feature(provincesMap, provincesMap.objects.provincias).features;

	provincesFeatures.map(p => {

		if(p.properties.NAME_2 != "Las Palmas" && p.properties.NAME_2 != "Santa Cruz de Tenerife" && p.properties.NAME_2 != "Baleares")
		{
			context.beginPath();
			context.strokeStyle = "#FFFFFF";
			context.lineWidth = 1;
			path(p);
			context.stroke();
		}
		context.font = "14px Guardian Text Sans Web";
		context.textAlign = "center";
		context.fillStyle = '#333333';
		context.fillText(p.properties.NAME_2, path.centroid(p)[0], path.centroid(p)[1]);
		
	})

	context.beginPath();
	context.strokeStyle = '#333'
	context.lineWidth = 2;
	path(topojson.mesh(comunidadesMap));
	context.stroke();

}
