import {ascending} from "d3-array";
import {create} from "d3-selection";
import {defined} from "../defined.js";
import {Mark, maybeColor} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles} from "../style.js";

export class Link extends Mark {
  constructor(
    data,
    {
      x1,
      y1,
      x2,
      y2,
      z,
      stroke,
      transform,
      ...style
    } = {}
  ) {
    const [vstroke, cstroke = vstroke == null ? "currentColor" : undefined] = maybeColor(stroke);
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x", label: x1.label},
        {name: "y1", value: y1, scale: "y", label: y1.label},
        {name: "x2", value: x2, scale: "x", label: x2.label},
        {name: "y2", value: y2, scale: "y", label: y2.label},
        {name: "z", value: z, optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      transform
    );
    Object.assign(this, Style({stroke: cstroke, ...style}));
  }
  render(
    I,
    {x, y, color},
    {x1: X1, y1: Y1, x2: X2, y2: Y2, z: Z, stroke: S}
  ) {
    let index = I.filter(i => defined(X1[i]) && defined(Y1[i]) && defined(X2[i]) && defined(Y2[i]));
    if (S) index = index.filter(i => defined(S[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(g => g.selectAll()
          .data(index)
          .join("line")
            .call(applyDirectStyles, this)
            .attr("x1", i => x(X1[i]))
            .attr("y1", i => y(Y1[i]))
            .attr("x2", i => x(X2[i]))
            .attr("y2", i => y(Y2[i]))
            .attr("stroke", S && (i => color(S[i]))))
      .node();
  }
}

export function link(data, options) {
  return new Link(data, options);
}
