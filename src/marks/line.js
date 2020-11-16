import {group} from "d3-array";
import {create} from "d3-selection";
import {line} from "d3-shape";
import {indexOf, identity} from "../mark.js";
import {Curve} from "../curve.js";
import {defined} from "../defined.js";
import {Mark} from "../mark.js";

class Line extends Mark {
  constructor(
    data,
    {
      x,
      y,
      z, // grouping for multiple series
      curve,
      fill = "none",
      fillOpacity,
      stroke = "currentColor",
      strokeWidth = z ? 1 : 1.5,
      strokeMiterlimit = 1,
      strokeLinecap,
      strokeLinejoin,
      strokeDasharray,
      strokeOpacity,
      mixBlendMode
    } = {}
  ) {
    super(
      data,
      {
        x: {value: x, scale: "x"},
        y: {value: y, scale: "y"},
        z: z && {value: z}
      }
    );
    this.curve = Curve(curve);
    this.fill = fill;
    this.fillOpacity = fillOpacity;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.strokeMiterlimit = strokeMiterlimit;
    this.strokeLinecap = strokeLinecap;
    this.strokeLinejoin = strokeLinejoin;
    this.strokeDasharray = strokeDasharray;
    this.strokeOpacity = strokeOpacity;
    this.mixBlendMode = mixBlendMode;
  }
  render(I, {x: {scale: x}, y: {scale: y}}) {
    const {
      curve,
      fill,
      fillOpacity,
      stroke,
      strokeWidth,
      strokeMiterlimit,
      strokeLinecap,
      strokeLinejoin,
      strokeDasharray,
      strokeOpacity,
      mixBlendMode,
      channels: {
        x: {value: X},
        y: {value: Y},
        z: {value: Z} = {}
      }
    } = this;
    const {length} = X;
    if (length !== Y.length) throw new Error("X and Y are different length");
    if (Z && length !== Z.length) throw new Error("X and Z are different length");

    function style(selection) {
      selection
          .attr("fill", fill)
          .attr("fill-opacity", fillOpacity)
          .attr("stroke", stroke)
          .attr("stroke-width", strokeWidth)
          .attr("stroke-miterlimit", strokeMiterlimit)
          .attr("stroke-linecap", strokeLinecap)
          .attr("stroke-linejoin", strokeLinejoin)
          .attr("stroke-dasharray", strokeDasharray)
          .attr("stroke-opacity", strokeOpacity);
    }

    function path(selection) {
      selection
          .style("mix-blend-mode", mixBlendMode)
          .attr("d", line()
            .curve(curve)
            .defined(i => defined(X[i]) && defined(Y[i]))
            .x(i => x(X[i]))
            .y(i => y(Y[i])));
    }

    if (Z) {
      return create("svg:g")
          .call(style)
          .call(g => g.selectAll()
            .data(group(I, i => Z[i]).values())
            .join("path")
            .call(path))
        .node();
    }

    return create("svg:path")
        .datum(I)
        .call(style)
        .call(path)
      .node();
  }
}

export class LineX extends Line {
  constructor(data, {x = identity, y = indexOf, ...options} = {}) {
    super(data, {...options, x, y});
  }
}

export class LineY extends Line {
  constructor(data, {x = indexOf, y = identity, ...options} = {}) {
    super(data, {...options, x, y});
  }
}
