import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 70,
    x: {
      round: true,
      label: "Body mass (g) →"
    },
    facet: {
      data,
      y: "sex"
    },
    marks: [
      Plot.binX(data, {x: "body_mass_g"}),
      Plot.ruleY([0])
    ]
  });
}
