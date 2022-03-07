export default function graphHistogram(colourFrequencies, maxFrequency) {
  var yR = colourFrequencies;
  var yG = [];
  var yB = [];
  var x = [];
  colourFrequencies.forEach(function (item, index, arr) {
    x.push(index);
  });

  var trace1 = {
    x: x,
    type: "histogram",
  };

  var data = [trace1];
  var layout = { 
    barmode: "overlay",
    margin: {
          l: 30,
          r: 50,
          b: 20,
          t: 20,
          pad: 4,
    }
  }
  Plotly.newPlot("tester", data, layout);


}

// var layout = {
//   margin: {
//     l: 30,
//     r: 50,
//     b: 20,
//     t: 20,
//     pad: 4,
//   },
//   bargap: 0.05,
//   bargroupgap: 0.2,
//   barmode: "overlay",
// };
// Plotly.newPlot("tester", data, layout);