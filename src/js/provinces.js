import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as topojson from 'topojson'
import * as d3geo from 'd3-geo'
import map from '../assets/admn1_admn2.json'
import provincesVotesRaw from 'raw-loader!./../assets/Congreso _ Junio 2016 _ Resultados por circunscripción - Circunscripciones(1).csv'
import electoralData from '../assets/electoral-data'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3geo);

const atomEl = $('.interactive-wrapper')

let isMobile = window.matchMedia('(max-width: 980px)').matches;

let width = isMobile ? atomEl.getBoundingClientRect().width  : atomEl.getBoundingClientRect().width / 2;
let height = isMobile ? width : (width * 3 / 5);

let svg = d3.select('.elections-map-wrapper').append('svg')
.attr('width', width)
.attr('height', height)

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

let comunitiesMap = svg.append('g').selectAll('path')
.data(topojson.feature(map, map.objects.comunidades).features)
.enter()
.append('path')
.attr('d', path)
.attr('class', 'comunidad')

let leabelsGroup = svg.append('g');

electoralData.mainCities.forEach(p => {

	leabelsGroup
	.append('circle')
	.attr('class', 'map-label-circle')
	.attr('cx', projection(p.location)[0])
	.attr('cy', projection(p.location)[1])
	.attr('r' , 3)

	leabelsGroup
	.append('text')
	.attr('class', 'map-label-outline')
	.attr('transform', "translate(" + (projection(p.location)[0] + 5) + "," + (projection(p.location)[1] + 5) + ")")
	.text(d => p.city)

	leabelsGroup
	.append('text')
	.attr('class', 'map-label')
	.attr('transform', "translate(" + (projection(p.location)[0] + 5) + "," + (projection(p.location)[1] + 5) + ")")
	.text(d => p.city)

})

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


svg.on("click", function() {
  console.log(projection.invert(d3.mouse(this)));
});


