<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import anscombe from "../data/anscombe.ts";
import barley from "../data/barley.ts";
import industries from "../data/bls-industry-unemployment.ts";
import penguins from "../data/penguins.ts";

const olympians = shallowRef([
  {weight: 31, height: 1.21, sex: "female"},
  {weight: 170, height: 2.21, sex: "male"}
]);

onMounted(() => {
  d3.csv("../data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
});

</script>

# Facets

:::danger TODO
This guide is still under construction. 🚧 Please come back when it’s finished.
:::

Faceting produces [small multiples](https://en.wikipedia.org/wiki/Small_multiple), partitioning data by ordinal or categorical value and then repeating a plot for each partition, allowing comparison. Faceting is typically enabled by declaring the horizontal↔︎ facet channel **fx**, the vertical↕︎ facet channel **fy**, or both for two-dimensional faceting.

For example, below we recreate the Trellis display (“reminiscent of garden trelliswork”) of [Becker *et al.*](https://hci.stanford.edu/courses/cs448b/papers/becker-trellis-jcgs.pdf) using the dot’s **fy** channel to declare vertical↕︎ facets, showing the yields of several varieties of barley across several sites for the years <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[0]}`}">1931</span> and <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[1]}`}">1932</span>.

:::plot
```js
Plot.plot({
  height: 800,
  marginRight: 90,
  marginLeft: 110,
  grid: true,
  x: {nice: true},
  y: {inset: 5},
  color: {type: "categorical"},
  marks: [
    Plot.frame(),
    Plot.dot(barley, {
      x: "yield",
      y: "variety",
      fy: "site",
      stroke: "year",
      sort: {y: "x", fy: "x", reduce: "median", reverse: true}
    })
  ]
})
```
:::

:::tip
This plot uses the [**sort** mark option](./scales.md#sort-option) to order the *y* and *fy* scale domains by descending median yield (the associated *x* values). Without this option, the domains would be sorted alphabetically.
:::

:::tip
Use the [frame mark](../marks/frame.md) for stronger visual separation of facets.
:::

The chart above reveals a likely data collection error: the years are likely reversed for the Morris site, as it is the only site where the yields for <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[1]}`}">1932</span> were all higher than for <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[0]}`}">1931</span>. The anomalous behavior of the Morris site is more apparent if we use directed arrows to show the year-over-year change in yield. The [group transform](../transforms/group.md) groups the observations by site and variety to compute the change.

:::plot defer
```js
Plot.plot({
  height: 800,
  marginLeft: 110,
  grid: true,
  x: {nice: true},
  y: {inset: 5},
  color: {scheme: "spectral", label: "Change in yield", tickFormat: "+f", legend: true},
  facet: {marginRight: 90},
  marks: [
    Plot.frame(),
    Plot.arrow(barley, Plot.groupY({
      x1: "first",
      x2: "last",
      stroke: ([x1, x2]) => x2 - x1 // year-over-year difference
    }, {
      x: "yield",
      y: "variety",
      fy: "site",
      stroke: "yield",
      strokeWidth: 2,
      sort: {y: "x1", fy: "x1", reduce: "median", reverse: true}
    }))
  ]
})
```
:::

:::info
Here the sort order has changed slightly: the *y* and *fy* domains are sorted by the median **x1** values, which are the yields for 1931.
:::

Faceting requires ordinal or categorical data because there are a discrete number of facets; the associated *fx* and *fy* scales are [band scales](./scales.md#discrete-position). Quantitative or temporal data can be manually binned for faceting, say by rounding. This can be done using the [**interval** scale option](../transforms/interval.md) on the *fx* or *fy* scale. Below, we show a box plot of Olympic athletes’ weights (in kilograms), faceted by binning height every 10cm (0.1 meters).

:::plot defer
```js
Plot.plot({
  fy: {
    grid: true,
    tickFormat: ".1f",
    interval: 0.1,
    reverse: true
  },
  marks: [
    Plot.boxX(olympians.filter((d) => d.height), {x: "weight", fy: "height"})
  ]
})
```
:::

:::tip
If you are interested in automatic faceting for quantitative data, please upvote [#14](https://github.com/observablehq/plot/issues/14).
:::

If both **fx** and **fy** channels are specified, two-dimensional faceting results, as in the faceted scatterplot of penguin culmen measurements below. The horizontal↔︎ facet shows sex (with the rightmost null column representing penguins lacking a recorded sex), while the vertical↕︎ facet shows species.

:::plot defer
```js
Plot.plot({
  grid: true,
  marks: [
    Plot.frame(),
    Plot.dot(penguins, {
      x: "culmen_length_mm",
      y: "culmen_depth_mm",
      fx: "sex",
      fy: "species"
    })
  ]
})
```
:::

TODO Using a non-faceted mark repeats across all facets. This is useful for showing context: the members in the current facet relative to the entire population.

:::plot defer
```js
Plot.plot({
  grid: true,
  marks: [
    Plot.frame(),
    Plot.dot(penguins, {
      x: "culmen_length_mm",
      y: "culmen_depth_mm",
      fill: "#aaa",
      r: 1
    }),
    Plot.dot(penguins, {
      x: "culmen_length_mm",
      y: "culmen_depth_mm",
      fx: "sex",
      fy: "species"
    })
  ]
})
```
:::

:::tip
Set the **facet** mark option to *exclude* to draw only the dots *not* in the current facet.
:::

TODO Simulating facet wrap with a row number facet.

:::plot defer https://observablehq.com/@observablehq/plot-facet-wrap
```js
Plot.plot((() => {
  const n = 3; // number of facet columns
  const keys = Array.from(d3.union(industries.map((d) => d.industry)));
  const index = new Map(keys.map((key, i) => [key, i]));
  const fx = (key) => index.get(key) % n;
  const fy = (key) => Math.floor(index.get(key) / n);
  return {
    height: 300,
    axis: null,
    y: {insetTop: 10},
    fx: {padding: 0.03},
    marks: [
      Plot.areaY(industries, Plot.normalizeY("extent", {
        x: "date",
        y: "unemployed",
        fx: (d) => fx(d.industry),
        fy: (d) => fy(d.industry)
      })),
      Plot.text(keys, {fx, fy, frameAnchor: "top-left", dx: 6, dy: 6}),
      Plot.frame()
    ]
  };
})())
```
:::

TODO Per-facet marks, say for annotations. This example uses the parallel array form of channel value specification.

:::plot defer
```js
Plot.plot({
  marginLeft: 60,
  marginRight: 60,
  grid: true,
  y: {label: null},
  fy: {label: null},
  marks: [
    Plot.barX(penguins, Plot.groupY({x: "count"}, {fy: "island", y: "species", fill: "sex"})),
    Plot.text([`While Chinstrap and Gentoo penguins were each observed on only one island, Adelie penguins were observed on all three islands.`], {
      fy: ["Torgersen"],
      frameAnchor: "top-right",
      lineWidth: 18,
      dx: -6,
      dy: 6
    }),
    Plot.frame()
  ]
})
```
:::

## Mark facet options

When specified at the mark level, facets can be defined for each mark via the *mark*.**fx** or *mark*.**fy** channel options.

(See the *mark*.**facet** option below for more).

And here is the equivalent mark-level faceting:

```js
Plot.plot({
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "sex", fy: "island"})
  ]
})
```

When mark-level faceting is used, the *fx* and *fy* channels are computed prior to the [mark’s transform](./transforms.md), if any (*i.e.*, facet channels are not transformed).

Faceting can be explicitly enabled or disabled on a mark with the *mark*.**facet** option, which accepts the following values:

* *auto* (default) - automatically determine if this mark should be faceted
* *include* (or true) - draw the subset of the mark’s data in the current facet
* *exclude* - draw the subset of the mark’s data *not* in the current facet
* *super* - draw this mark in a single frame that covers all facets
* null (or false) - repeat this mark’s data across all facets (*i.e.*, no faceting)

When a mark uses *super* faceting, it is not allowed to use position scales (*x*, *y*, *fx*, or *fy*); *super* faceting is intended for decorations, such as labels and legends.

When mark-level faceting is used, the default *auto* setting is equivalent to *include*: the mark will be faceted if either the *mark*.**fx** or *mark*.**fy** channel option (or both) is specified. The null or false option will disable faceting, while *exclude* draws the subset of the mark’s data *not* in the current facet.

The **facetAnchor** option controls the placement of the mark with respect to the facets. It supports the following settings:

* null - display the mark on each non-empty facet (default for all marks, with the exception of axis marks)
* *top*, *right*, *bottom*, or *left* - display the mark on facets on the specified side
* *top-empty*, *right-empty*, *bottom-empty*, or *left-empty* - display the mark on facets that have an empty space on the specified side (the empty space being either the margin, or an empty facet); this is the default for axis marks
* *empty* - display the mark on empty facets only

When using top-level faceting, if your data is parallel to the facet data (*i.e.*, the same length and order) but not strictly equal (`===`), you can enable faceting by specifying the *mark*.**facet** option to *include* (or equivalently true). Likewise you can disable faceting by setting the *mark*.**facet** option to null or false. Finally, the mark.**facet** option supports the _exclude_ option to select all data points that are _not_ part of the current facet, allowing “background” marks for context.

When top-level faceting is used, the default *auto* setting is equivalent to *include* when the mark data is strictly equal to the top-level facet data; otherwise it is equivalent to null. When the *include* or *exclude* facet mode is chosen, the mark data must be parallel to the top-level facet data: the data must have the same length and order. If the data are not parallel, then the wrong data may be shown in each facet. The default *auto* therefore requires strict equality (`===`) for safety, and using the facet data as mark data is recommended when using the *exclude* facet mode. (To construct parallel data safely, consider using [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) on the facet data.)

## Plot facet options

The top-level **facet** option is an alternative to the mark **fx** and **fy** option and is useful when multiple marks share the same data; the facet.**x** and facet.**y** channels are then shared by all marks that use the facet data. (Other marks will be repeated across facets.)

For example, we can visualize the famous [Anscombe’s quartet](https://en.wikipedia.org/wiki/Anscombe's_quartet) as a scatterplot with horizontal facets.

:::plot
```js
Plot.plot({
  grid: true,
  inset: 10,
  width: 928,
  height: 240,
  facet: {
    data: anscombe,
    x: "series"
  },
  marks: [
    Plot.frame(),
    Plot.line(anscombe, {x: "x", y: "y"}),
    Plot.dot(anscombe, {x: "x", y: "y"})
  ]
})
```
:::

Here is an example of top-level faceting:

```js
Plot.plot({
  facet: {
    data: penguins,
    x: "sex",
    y: "island"
  },
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
  ]
})
```

When specified at the top level, the following options indicate which data should be faceted, and how:

* facet.**data** - the data to be faceted
* facet.**x** - the horizontal position; bound to the *fx* scale, which must be *band*
* facet.**y** - the vertical position; bound to the *fy* scale, which must be *band*

With top-level faceting, any mark that uses the specified facet data will be faceted by default, whereas marks that use different data will be repeated across all facets.

To make room for the facet axes, you may need to specify the facet.**marginTop**, facet.**marginRight**, facet.**marginBottom**, or facet.**marginLeft** option.

The following top-level facet constant options are also supported:

* facet.**marginTop** - the top margin
* facet.**marginRight** - the right margin
* facet.**marginBottom** - the bottom margin
* facet.**marginLeft** - the left margin
* facet.**margin** - shorthand for the four margins
* facet.**grid** - if true, draw grid lines for each facet
* facet.**label** - if null, disable default facet axis labels

## Facet scales

When faceting, two additional band scales may be configured:

* *fx* - the horizontal position, a *band* scale
* *fy* - the vertical position, a *band* scale

When faceting, two additional band scales may be configured: _fx_ and _fy_. These are driven by the facet.**x** and facet.**y** channels, respectively, which must be supplied strictly ordinal (*i.e.*, discrete) values; each distinct value defines a facet.
