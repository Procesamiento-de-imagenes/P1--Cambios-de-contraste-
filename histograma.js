export default function graphHistogram(colourFrequencies) {
  let r = colourFrequencies.r;
  let g = colourFrequencies.g;
  let b = colourFrequencies.b;

  var red = {
    y: r,
    type: "bar",
    marker: {
      opacity: 0.8,
      color: 'rgb(255, 0, 0)',
    },
    name: "Red"

  };
  var green = {
    y: g,
    type: "bar",
    marker: {
      opacity: 0.8,
      color: 'rgb(0, 255, 0)',
    },
    name: "Green"
  };
  var blue = {
    y: b,
    type: "bar",
    marker: {
      opacity: 0.8,
      color: 'rgb(0, 0, 255)',
    },
    name: "Blue"
  };

  var data = [blue, green, red];
  var layout = { 
    margin: {
          l: 30,
          r: 10,
          b: 20,
          t: 20,
          pad: 4,
    },
    showlegend: false
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