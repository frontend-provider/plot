import {ascending} from "d3-array";
import {create} from "d3-selection";
import {zero} from "../mark.js";
import {defined} from "../defined.js";
import {Mark, number} from "../mark.js";
import {Style, applyIndirectStyles, applyDirectStyles} from "../style.js";

export class Rect extends Mark {
  constructor(
    data,
    {
      x1,
      y1,
      x2,
      y2,
      z,
      fill,
      stroke,
      style,
      insetTop = 0,
      insetRight = 0,
      insetBottom = 0,
      insetLeft = 0
    } = {}
  ) {
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x", label: x1.label},
        {name: "y1", value: y1, scale: "y", label: y1.label},
        {name: "x2", value: x2, scale: "x", label: x2.label},
        {name: "y2", value: y2, scale: "y", label: y2.label},
        {name: "z", value: z, optional: true},
        {name: "fill", value: fill, scale: "color", optional: true},
        {name: "stroke", value: stroke, scale: "color", optional: true}
      ]
    );
    this.style = Style(style);
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
  }
  render(
    I,
    {x, y, color},
    {x1: X1, y1: Y1, x2: X2, y2: Y2, z: Z, fill: F, stroke: S}
  ) {
    const {style, insetTop, insetRight, insetBottom, insetLeft} = this;
    const index = I.filter(i => defined(X1[i]) && defined(Y1[i]) && defined(X2[i]) && defined(Y2[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, style)
        .call(g => g.selectAll()
          .data(index)
          .join("rect")
            .call(applyDirectStyles, style)
            .attr("x", i => Math.min(x(X1[i]), x(X2[i])) + insetLeft)
            .attr("y", i => Math.min(y(Y1[i]), y(Y2[i])) + insetTop)
            .attr("width", i => Math.max(0, Math.abs(x(X2[i]) - x(X1[i])) - insetLeft - insetRight))
            .attr("height", i => Math.max(0, Math.abs(y(Y1[i]) - y(Y2[i])) - insetTop - insetBottom))
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i]))))
      .node();
  }
}

export function rectX(data, {x, y1, y2} = {}, style) {
  return new Rect(data, {x1: zero, x2: x, y1, y2}, style);
}

export function rectY(data, {x1, x2, y} = {}, style) {
  return new Rect(data, {x1, x2, y1: zero, y2: y}, style);
}

export function rect(data, channels, style) {
  return new Rect(data, channels, style);
}
