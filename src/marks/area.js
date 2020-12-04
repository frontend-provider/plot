import {group} from "d3-array";
import {create} from "d3-selection";
import {area as shapeArea} from "d3-shape";
import {Curve} from "../curve.js";
import {defined} from "../defined.js";
import {Mark, identity, indexOf, zero, maybeColor} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

export class Area extends Mark {
  constructor(
    data,
    {
      x1,
      y1,
      x2,
      y2,
      z, // optional grouping for multiple series
      fill,
      curve,
      transform,
      ...style
    } = {}
  ) {
    const [vfill, cfill] = maybeColor(fill);
    if (z === undefined && vfill != null) z = vfill;
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x"},
        {name: "y1", value: y1, scale: "y"},
        {name: "x2", value: x2, scale: "x", optional: true},
        {name: "y2", value: y2, scale: "y", optional: true},
        {name: "z", value: z, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true}
      ],
      transform
    );
    this.curve = Curve(curve);
    Style(this, {fill: cfill, ...style});
  }
  render(I, {x, y, color}, {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1, z: Z, fill: F}) {
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y)
        .call(g => g.selectAll()
          .data(Z ? group(I, i => Z[i]).values() : [I])
          .join("path")
            .call(applyDirectStyles, this)
            .attr("fill", F && (([i]) => color(F[i])))
            .attr("d", shapeArea()
              .curve(this.curve)
              .defined(i => defined(X1[i]) && defined(Y1[i]) && defined(X2[i]) && defined(Y2[i]))
              .x0(i => x(X1[i]))
              .y0(i => y(Y1[i]))
              .x1(i => x(X2[i]))
              .y1(i => y(Y2[i]))))
      .node();
  }
}

export function area(data, options) {
  return new Area(data, options);
}

export function areaX(data, {x, x1, x2, y = indexOf, ...options} = {}) {
  if (x1 === undefined && x2 === undefined) { // {x} or {}
    x1 = zero, x2 = x === undefined ? identity : x;
  } else if (x1 === undefined) { // {x, x2} or {x2}
    x1 = x === undefined ? zero : x;
  } else if (x2 === undefined) { // {x, x1} or {x1}
    x2 = x === undefined ? zero : x;
  }
  return new Area(data, {...options, x1, x2, y1: y, y2: undefined});
}

export function areaY(data, {x = indexOf, y, y1, y2, ...options} = {}) {
  if (y1 === undefined && y2 === undefined) { // {y} or {}
    y1 = zero, y2 = y === undefined ? identity : y;
  } else if (y1 === undefined) { // {y, y2} or {y2}
    y1 = y === undefined ? zero : y;
  } else if (y2 === undefined) { // {y, y1} or {y1}
    y2 = y === undefined ? zero : y;
  }
  return new Area(data, {...options, x1: x, x2: undefined, y1, y2});
}
