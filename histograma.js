export default function graphHistogram(colourFrequencies, div) {
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
          l: 35,
          r: 50,
          b: 20,
          t: 20,
          pad: 4,
    },
  }
  Plotly.newPlot(div, data, layout);
}