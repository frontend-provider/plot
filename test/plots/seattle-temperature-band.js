import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/seattle-weather.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      label: "↑ Temperature (°C)"
    },
    color: {
      scheme: "RdBu",
      invert: true
    },
    marks: [
      Plot.ruleX(
        data,
        {
          x: "date",
          y1: "temp_min",
          y2: "temp_max",
          stroke: "temp_min"
        }
      )
    ]
  });
}