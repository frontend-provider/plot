import {ascending} from "d3-array";
import {create} from "d3-selection";
import {filter, positive} from "../defined.js";
import {Mark, identity, first, second, maybeColor, maybeNumber, title} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

export class Dot extends Mark {
  constructor(
    data,
    {
      x,
      y,
      z,
      r,
      title,
      fill,
      stroke,
      ...options
    } = {}
  ) {
    const [vr, cr] = maybeNumber(r, 3);
    const [vfill, cfill] = maybeColor(fill, "none");
    const [vstroke, cstroke] = maybeColor(stroke, cfill === "none" ? "currentColor" : "none");
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "z", value: z, optional: true},
        {name: "r", value: vr, scale: "r", optional: true},
        {name: "title", value: title, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      options
    );
    this.r = cr;
    Style(this, {
      fill: cfill,
      stroke: cstroke,
      strokeWidth: cstroke === "none" ? undefined : 1.5,
      ...options
    });
  }
  render(
    I,
    {x, y, r, color},
    {x: X, y: Y, z: Z, r: R, title: L, fill: F, stroke: S},
    {width, height, marginTop, marginRight, marginBottom, marginLeft}
  ) {
    let index = filter(I, X, Y, F, S);
    if (R) index = index.filter(i => positive(R[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, 0.5, 0.5)
        .call(g => g.selectAll()
          .data(index)
          .join("circle")
            .call(applyDirectStyles, this)
            .attr("cx", X ? i => x(X[i]) : (marginLeft + width - marginRight) / 2)
            .attr("cy", Y ? i => y(Y[i]) : (marginTop + height - marginBottom) / 2)
            .attr("r", R ? i => r(R[i]) : this.r)
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i])))
            .call(title(L)))
      .node();
  }
}

export function dot(data, {x = first, y = second, ...options} = {}) {
  return new Dot(data, {...options, x, y});
}

export function dotX(data, {x = identity, ...options} = {}) {
  return new Dot(data, {...options, x});
}

export function dotY(data, {y = identity, ...options} = {}) {
  return new Dot(data, {...options, y});
}
