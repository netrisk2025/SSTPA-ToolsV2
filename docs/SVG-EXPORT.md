# Shared SVG diagram export

Navigator, State, Requirements and Flow retain their existing full-graph and
viewport SVG commands. `frontend/src/tools/diagramSvg.ts` is original SSTPA
serialization through the documented Cytoscape.js public APIs. It replaces the
previous GPLv3 `cytoscape-svg` dependency; no implementation from that plugin was
copied. PNG export remains Cytoscape's existing PNG output.

The result is editable vector geometry and text, never an embedded raster.
It includes visible nodes, resolved type shapes/fills/borders, opacity, labels,
edge lines, quadratic Bézier control points, segment points, dash patterns and
source/target arrows. Full export uses model bounds including labels; viewport
export uses the current model extent as the SVG viewBox and the current canvas
pixel dimensions. SVG viewport clipping preserves pan/zoom scope. Hidden nodes
and edges are omitted. Labels, identifiers and attributes are XML-escaped and
invalid XML control characters are removed.

Rendering is a document snapshot, not a second Cytoscape renderer. Text wrapping
uses a deterministic width estimate; downstream SVG viewers may substitute
fonts, so line breaks and glyph widths can differ from the canvas. Rounded
polygon corners use proportional quadratic arcs. Supported node shapes cover
all current Navigator assignments; unrecognized polygons fall back to a
four-sided polygon. Current tools use triangle arrows; circle/diamond arrows
are also supported, and other non-none arrow styles use a triangle. Background
images, gradients, renderer selection overlays and interactive hover effects
are not exported. These limits do not remove any graph data or change model
positions. Headless callers lack renderer geometry and use straight edges;
normal browser exports use the public renderer points.

Verification: `frontend/tests/export-svg.test.ts` covers escaping, full/viewport
scope, current type shapes, hidden elements, empty graphs and unchanged graph
state. Browser release verification additionally opens Navigator SVG export
and checks a vector download with visible labels and connectors.

API sources: [Cytoscape edge points](https://js.cytoscape.org/#edge.controlPoints),
[bounding box](https://js.cytoscape.org/#eles.boundingBox),
[viewport extent](https://js.cytoscape.org/#cy.extent).
