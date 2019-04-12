import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import encuestasRaw from 'raw-loader!./../assets/encuestas.csv'
import promedioRaw from 'raw-loader!./../assets/promedio.csv'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select);

let parsed = d3.csvParse(encuestasRaw)
let encuestas = parsed;

parsed = d3.csvParse(promedioRaw)
let promedio = parsed;

/*let flags = []
let parties = []
let l = promedio.length


for( let i=0; i<l; i++) {
    if( flags[promedio[i].party]) continue;
    flags[promedio[i].party] = true;
    parties.push(promedio[i].party);
}


console.log(parties)
*/

let parties = ["PSOE", "PP", "Cs", "UP", "VOX"]

let margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let parseTime = d3.timeParse("%Y-%m-%d");

let x = d3.scaleTime().range([0, width]);
let y = d3.scaleLinear().range([height, 0]);

x.domain([parseTime('2016-06-26'), parseTime('2019-04-08')]);
y.domain([0, 40]);

let valueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.votes); });

let svg = d3.select('#elections-polls').append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

let results;
parties.map(party =>{


  results = promedio.filter(f => f.party == party)

  results.forEach(function(d) {
      d.date = parseTime(d.date);
      d.votes = parseFloat(d.votes);
  });

      svg.append("path")
      .data([results])
      .attr("class", d => 'line-' + d[0].party)
      .attr("d", valueline);
})





  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append("g")
      .call(d3.axisLeft(y));



 







  