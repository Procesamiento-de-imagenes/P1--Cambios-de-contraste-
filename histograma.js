export default function graphHistogram(colourFrequencies) {
  var yR = colourFrequencies;
  var yG = [];
  var yB = [];
  var x = [];
  colourFrequencies.forEach(function (item, index, arr) {
    x.push(index);
  });

  console.log(x, colourFrequencies);

  
  var trace1 = {
    x: x,
    y: yR,
    name: "R",
    autobinx: false,
    histnorm: "count",
    marker: {
      color: "rgba(255, 100, 102, 0.7)",
      line: {
        color: "rgba(255, 100, 102, 1)",
        width: 1,
      },
    },
    opacity: 0.5,
    type: "histogram",
    xbins: {
      end: 255,
      size: 1,
      start: 0,
    },
    
  };
  var data = [trace1];
  var layout = {
    margin: {
      l: 30,
      r: 50,
      b: 20,
      t: 20,
      pad: 4,
    },
    bargap: 0.05,
    bargroupgap: 0.2,
    barmode: "overlay",
  };
  Plotly.newPlot("tester", data, layout);
}
