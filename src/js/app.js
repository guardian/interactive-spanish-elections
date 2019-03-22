import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as topojson from 'topojson'
import * as d3geo from 'd3-geo'
import municipalitiesMap from '../assets/municipios'
import comunidadesMap from '../assets/comunidades_4326'
import provincesMap from '../assets/provincias?1234'
import diputadosCartogram from '../assets/diputados-merged'
import provinciasCartogram from '../assets/provincias-merged'
import comunidadesCartogram from '../assets/comunidades-merged'
import squaresCartogram from '../assets/squares-cartogram?qq'
import provincesVotesRaw from 'raw-loader!./../assets/Congreso _ Junio 2016 _ Resultados por circunscripción - Circunscripciones(1).csv'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3geo);

const atomEl = $('.interactive-wrapper')

//const provincesVotesURL = "<%= path %>/assets/Congreso _ Junio 2016 _ Resultados por circunscripción - Circunscripciones(1).csv"

let isMobile = window.matchMedia('(max-width: 980px)').matches;

let width = isMobile ? atomEl.getBoundingClientRect().width  : atomEl.getBoundingClientRect().width;
let height = isMobile ? width * 5 / 3 : (width * 3 / 5);

let canvas = d3.select('.elections-map-wrapper').append('canvas')
.attr('width', width)
.attr('height', height)

let svg = d3.select('.elections-map-wrapper').append('svg')
.attr('width', width)
.attr('height', height)

let svgTest = d3.select('.elections-map-wrapper').append('svg')
.attr('width', width)
.attr('height', height)


let parties = [
{party:"C's",name:"CIUDADANOS-PARTIDO DE LA CIUDADANÍA",color:'#9c835f'},
{party:"CDC",name:"CONVERGÈNCIA DEMOCRÀTICA DE CATALUNYA",color:'#ffabdb'},
{party:"EAJ-PNV",name:"EUZKO ALDERDI JELTZALEA-PARTIDO NACIONALISTA VASCO",color:'#91b52d'},
{party:"ECP",name:"EN COMÚ PODEM-GUANYEM EL CANVI",color:'#5fd71f'},
{party:"EH Bildu",name:"EUSKAL HERRIA BILDU",color:'#004e3a'},
{party:"ERC-CATSÍ",name:"ESQUERRA REPUBLICANA/CATALUNYA SÍ",color:'#f5be2c'},
{party:"GBAI",name:"",color:'#ffe500'},
{party:"PCOE",name:"",color:'#0cdc78'},
{party:"PODEMOS-COMPROMÍS-EUPV",name:"COMPROMÍS-PODEMOS-EUPV: A LA VALENCIANA",color:'#951d7a'},
{party:"PODEMOS-EN MAREA-ANOVA-EU",name:"EN MAREA",color:'#951d7a'},
{party:"PODEMOS-IU-EQUO",name:"UNIDOS PODEMOS",color:'#951d7a'},
{party:"PP",name:"PARTIDO POPULAR",color:'#1896d7'},
{party:"PSOE",name:"PARTIDO SOCIALISTA OBRERO ESPAÑOL",color:'#c70000'},
{party:"CCa-PNC",name:"COALICIÓN CANARIA-PARTIDO NACIONALISTA CANARIO",color:'#FFE500'},
{party:null,name:"",color:'#b5b5b5'}
];

let mainProvinces = [
{province:'Madrid', location:[-3.8894228511345847, 40.5860619101293]},
{province:'Barcelona', location:[1.5166693791536057, 41.78779368771617]},
{province:'Valencia', location:[-1.4867151932287221, 39.836461861498826 ]},
{province:'Seville', location:[-5.33983783974849, 38.542035146043894]},
{province:'Zaragoza', location:[-1.6039204448338862, 41.36035103374516]},
{province:'Biscay', location:[-3.1275887157010187, 42.77414273010277]},
{province:'Coruña', location:[-8.167414534723072, 42.87085413018682]},
{province:'Las Palmas', location:[3.509158656441394, 35.644528481690436]},
{province:'Balearic Islands', location:[2.8352284597117006, 39.65622787603671]}
]

let provinces = [
{name:"Almería",code:"340104",deputies:6},
{name:"Cádiz",code:"340111",deputies:9},
{name:"Córdoba",code:"340114",deputies:6},
{name:"Granada",code:"340118",deputies:7},
{name:"Huelva",code:"340121",deputies:5},
{name:"Jaén",code:"340123",deputies:5},
{name:"Málaga",code:"340129",deputies:11},
{name:"Sevilla",code:"340141",deputies:12},
{name:"Huesca",code:"340222",deputies:3},
{name:"Teruel",code:"340244",deputies:3},
{name:"Zaragoza",code:"340250",deputies:7},
{name:"Asturias",code:"340333",deputies:8},
{name:"Illes Balears",code:"340407",deputies:8},
{name:"Las Palmas",code:"340535",deputies:8},
{name:"Santa Cruz de Tenerife",code:"340538",deputies:7},
{name:"Cantabria",code:"340639",deputies:5},
{name:"Albacete",code:"340802",deputies:4},
{name:"Ciudad Real",code:"340813",deputies:5},
{name:"Cuenca",code:"340816",deputies:3},
{name:"Guadalajara",code:"340819",deputies:3},
{name:"Toledo",code:"340845",deputies:6},
{name:"Ávila",code:"340705",deputies:3},
{name:"Burgos",code:"340709",deputies:4},
{name:"León",code:"340724",deputies:4},
{name:"Palencia",code:"340734",deputies:3},
{name:"Salamanca",code:"340837",deputies:4},
{name:"Segovia",code:"340740",deputies:3},
{name:"Soria",code:"340742",deputies:2},
{name:"Valladolid",code:"340747",deputies:5},
{name:"Zamora",code:"340749",deputies:3},
{name:"Barcelona",code:"340908",deputies:31},
{name:"Girona",code:"340917",deputies:6},
{name:"Lleida",code:"340925",deputies:4},
{name:"Tarragona",code:"340943",deputies:6},
{name:"Badajoz",code:"341106",deputies:6},
{name:"Cáceres",code:"341110",deputies:4},
{name:"A Coruña",code:"341215",deputies:8},
{name:"Lugo",code:"341227",deputies:4},
{name:"Ourense",code:"341232",deputies:4},
{name:"Pontevedra",code:"341236",deputies:7},
{name:"Madrid",code:"341328",deputies:36},
{name:"Navarra",code:"341531",deputies:5},
{name:"Araba - Álava",code:"341601",deputies:4},
{name:"Gipuzkoa",code:"341620",deputies:6},
{name:"Bizkaia",code:"341648",deputies:8},
{name:"Murcia",code:"341430",deputies:10},
{name:"La Rioja",code:"341726",deputies:4},
{name:"Alicante / Alacant",code:"341003",deputies:12},
{name:"Castellón / Castelló",code:"341012",deputies:5},
{name:"Valencia / València",code:"341046",deputies:16},
{name:"Ceuta",code:"341851",deputies:1},
{name:"Melilla",code:"341952",deputies:1}
]

// let projection = d3.geoMercator()

var projection = d3.geoAlbers()
.center([0,43])
.rotate([4,2])
.scale(4000)

let context = canvas.node().getContext('2d')

let path = d3.geoPath()
.projection(projection)
.context(context)

let pathSvg = d3.geoPath()
.projection(projection)

projection.fitSize([width, height], topojson.feature(municipalitiesMap, municipalitiesMap.objects['municipios_4326']));

let features = topojson.feature(municipalitiesMap, municipalitiesMap.objects['municipios_4326']).features

features.map(f => {

	let color = parties.find(w => w.party === f.properties["2016-data-NATCODE_winner"]).color;

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



let deputiesCarto = svg.append('g').selectAll('path')
.data(topojson.feature(diputadosCartogram, diputadosCartogram.objects['diputados-merged']).features)
.enter()
.append('path')
.attr('d', pathSvg)
.attr('id', d => 'd' + d.properties.layer)
.attr('class', 'deputy')

let provincesCarto = svg.append('g').selectAll('path')
.data(topojson.feature(provinciasCartogram, provinciasCartogram.objects['provincias-merged']).features)
.enter()
.append('path')
.attr('d', pathSvg)
.attr('class', 'provincia')

let comunidadesCarto = svg.append('g').selectAll('path')
.data(topojson.feature(comunidadesCartogram, comunidadesCartogram.objects['comunidades-merged']).features)
.enter()
.append('path')
.attr('d', pathSvg)
.attr('class', 'comunidad')

let leabelsGroup = svg.append('g');

mainProvinces.forEach(p => {

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

projection.fitSize([width, height], topojson.feature(squaresCartogram, squaresCartogram.objects['squares-cartogram']));

let carto = svgTest.append('g').selectAll('path')
.data(topojson.feature(squaresCartogram, squaresCartogram.objects['squares-cartogram']).features)
.enter()
.append('path')
.attr('d', pathSvg)
.attr('id', d => 'd' + (parseInt(d.properties.layer) + 1))
.attr('class', 'deputy')

let parsed = d3.csvParse(provincesVotesRaw)

let provincesVotes = parsed;
let deputiesByProvince = [];

provinces.map(p => {

	let results = provincesVotes.find(v => +v['Código de Provincia'] === +p.code.substr(4,5));

	deputiesByProvince[p.code] = []

	parties.map(d => {
		if(results[d.party + " Diputados"] > 0){
			deputiesByProvince[p.code].push(
			{
				party:d.party,
				deputies: results[d.party + " Diputados"]
			})
		}
	})

	deputiesByProvince[p.code].sort( (a,b) => b.deputies - a.deputies);

	let accum = 0;

	deputiesByProvince[p.code].map(dep => {


		for (var j = 0; j < +dep.deputies; j++) {

			accum ++

			let number = accum;

			if(accum<10) number = '0' + accum;

			let s = svg.select('#d' + p.code + number)

			let name = dep.party;

			if(dep.party === "C's") name = 'Cs'

			s.attr('class', name)

			let sq = svgTest.select('#d' + p.code + number)

			sq.attr('class', name)

		}
	})
})



svg.on("click", function() {
  console.log(projection.invert(d3.mouse(this)));
});

/*path(topojson.feature(municipalitiesMap, municipalitiesMap.objects['municipios_4326']));

context.fillStyle = 
*/


