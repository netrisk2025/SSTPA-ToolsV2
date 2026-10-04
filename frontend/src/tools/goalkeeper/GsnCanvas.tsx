import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { GoalStructure, NodePosition, ViewportState } from "./domain/model/types";
import { boundsFor } from "./domain/presentation/geometry";
import { renderDiagram } from "./domain/presentation/svg";


type CanvasBounds = ReturnType<typeof boundsFor>;
// Scroll gutters keep the camera movable in both directions even for a tiny branch.
// Persisted viewport x/y stay relative to the argument, independent of this UI gutter.
const SCROLL_GUTTER = 4096;


interface Props {
  structure: GoalStructure; positions: Record<string, NodePosition>; selectedId: string | null;
  revealToken: number; graphEpoch: number; errorIds: Set<string>;
  onSelect: (id: string | null) => void; onDrag: (id: string, x: number, y: number) => void;
  projection?: boolean; disabled?: boolean; restoreViewport?: boolean; viewport: ViewportState; setViewport: (v: ViewportState) => void;
  theme: "light" | "dark"; onInteraction: () => void;
}
export function GsnCanvas({ structure, positions, selectedId, revealToken, errorIds, onSelect, onDrag, projection = false, disabled = false, restoreViewport = true, viewport, setViewport, theme, onInteraction }: Props) {
  const initialViewport = useRef(viewport);
  const [zoom, setZoom] = useState(projection ? 0.6 : viewport.zoom || 1);
  const sessionKey = JSON.stringify([structure.rootDir, revealToken]);
  const [focus, setFocus] = useState<string | null>(() => !projection && viewport.focusId && structure.elements.has(viewport.focusId) ? viewport.focusId : null);
  const [dragFrame, setDragFrame] = useState<CanvasBounds | null>(null);
  const previousFocus = useRef(focus);
  const restoringFocus = useRef<{ id: string | null } | null>(null);
  const size = useRef<HTMLDivElement>(null);
  const previousFrame = useRef<{ key: string; bounds: CanvasBounds; zoom: number; insetX: number; insetY: number } | null>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string | null; x: number; y: number; startX: number; startY: number; moved: boolean } | null>(null);
  const elements = useMemo(() => {
    if (!focus || !structure.elements.has(focus)) return structure.elements;
    const ids = new Set<string>(), queue = [focus];
    while (queue.length) { const id = queue.shift()!; if (ids.has(id)) continue; ids.add(id); const el = structure.elements.get(id); if (el) queue.push(...el.supportedBy, ...el.inContextOf); }
    return new Map([...structure.elements].filter(([id]) => ids.has(id)));
  }, [structure.elements, focus]);
  const rendered = useMemo(() => ({ ...structure, rootId: focus && elements.has(focus) ? focus : structure.rootId, elements }), [structure, elements, focus]);
  // boundsFor consumes only elements: sidecar/camera updates must not rebuild the measured frame.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bounds = useMemo(() => boundsFor({ ...structure, elements }, positions), [elements, positions]);
  const paddedBounds = useMemo(() => {
    const inset = SCROLL_GUTTER / zoom;
    return { x: bounds.x - inset, y: bounds.y - inset, width: bounds.width + inset * 2, height: bounds.height + inset * 2 };
  }, [bounds, zoom]);
  const frame = dragFrame ?? paddedBounds;
  // The SVG still has its canonical viewBox. Its offset within a frozen frame cancels
  // origin changes while an outermost node is dragged, so that node follows the pointer.
  const nodeStyles = structure.layout.display?.nodeStyles;
  const html = useMemo(() => renderDiagram(rendered, positions, { theme, selectedId, errorIds, projection, interactive: !projection && !disabled, nodeStyles, markerPrefix: projection ? "model" : "gsn" }), [rendered, positions, theme, selectedId, errorIds, projection, disabled, nodeStyles]);
  const publish = (z = zoom, branch = focus) => { if (!projection && !disabled && scroll.current) setViewport({ x: scroll.current.scrollLeft - SCROLL_GUTTER, y: scroll.current.scrollTop - SCROLL_GUTTER, zoom: z, ...(branch ? { focusId: branch } : {}) }); };
  const centerSelected = (id: string | null = selectedId, z = 1) => {
    const pos = id ? positions[id] : undefined;
    if (!pos || !scroll.current) return;
    const el = scroll.current;
    el.scrollTo(Math.max(0, SCROLL_GUTTER + (pos.x - bounds.x) * z - el.clientWidth / 2), Math.max(0, SCROLL_GUTTER + (pos.y - bounds.y) * z - 200));
  };
  const changeZoom = (z: number, branch = focus) => { if (disabled) return; if (!projection) onInteraction(); const next = Math.min(2, Math.max(0.12, z)); setZoom(next); publish(next, branch); };
  const fit = () => {
    if (disabled) return;
    const container = scroll.current;
    if (!container) return;
    const next = Math.min(1, Math.max(0.12, Math.min((container.clientWidth - 32) / bounds.width, (container.clientHeight - 32) / bounds.height)));
    setZoom(next);
    requestAnimationFrame(() => {
      container.scrollTo(SCROLL_GUTTER - Math.max(0, (container.clientWidth - bounds.width * next) / 2), SCROLL_GUTTER - Math.max(0, (container.clientHeight - bounds.height * next) / 2));
      publish(next);
    });
  };
  useLayoutEffect(() => {
    const container = scroll.current, content = size.current;
    if (!container || !content) return;
    const outer = container.getBoundingClientRect(), inner = content.getBoundingClientRect();
    const insetX = inner.left - outer.left + container.scrollLeft;
    const insetY = inner.top - outer.top + container.scrollTop;
    const key = `${sessionKey}:${focus ?? ""}:${projection}`;
    const previous = previousFrame.current;
    if (previous?.key === key && previous.zoom === zoom) {
      // On release the canonical frame may grow or move. Compensate its origin and
      // centering margin before paint; otherwise the complete diagram jumps.
      const dx = (previous.bounds.x - frame.x) * zoom + insetX - previous.insetX;
      const dy = (previous.bounds.y - frame.y) * zoom + insetY - previous.insetY;
      if (dx || dy) {
        container.scrollTo(container.scrollLeft + dx, container.scrollTop + dy);
        if (!projection && !disabled) setViewport({ x: container.scrollLeft - SCROLL_GUTTER, y: container.scrollTop - SCROLL_GUTTER, zoom, ...(focus ? { focusId: focus } : {}) });
      }
    }
    previousFrame.current = { key, bounds: frame, zoom, insetX, insetY };
  }, [frame, zoom, sessionKey, focus, projection, disabled, setViewport]);
  // Restore only when the host opens/restores a session; camera publications must not restore again.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    drag.current = null;
    setDragFrame(null);
    if (!projection) {
      const saved: ViewportState = initialViewport.current;
      const savedFocus = saved.focusId && structure.elements.has(saved.focusId) ? saved.focusId : null;
      restoringFocus.current = { id: savedFocus };
      setFocus(savedFocus);
      setZoom(saved.zoom || 1);
      const callback = requestAnimationFrame(() => {
        if (restoreViewport || savedFocus) scroll.current?.scrollTo(saved.x + SCROLL_GUTTER, saved.y + SCROLL_GUTTER);
        else centerSelected(structure.rootId, saved.zoom || 1);

        publish(saved.zoom || 1, savedFocus);
      });
      return () => cancelAnimationFrame(callback);
    }
    setFocus(null);
  }, [structure.rootDir, revealToken, projection, sessionKey]);
  /* eslint-enable react-hooks/exhaustive-deps */
  // Fit the projection on opening it, preserving the reader’s later zoom and pan.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (projection) fit(); }, [projection, structure.rootDir]);
  // Recenter once for a branch transition, not for subsequent zoom, pan or sidecar updates.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const changed = previousFocus.current !== focus;
    previousFocus.current = focus;
    if (restoringFocus.current) {
      if (focus === restoringFocus.current.id) restoringFocus.current = null;
      return;
    }
    if (changed) {
      const callback = requestAnimationFrame(() => {
        centerSelected(focus ?? structure.rootId, zoom);
        publish(zoom, focus);
      });
      return () => cancelAnimationFrame(callback);
    }
  }, [focus, projection, sessionKey]);
  /* eslint-enable react-hooks/exhaustive-deps */
  useEffect(() => { if (disabled) { drag.current = null; setDragFrame(null); } }, [disabled]);
  const nodeFrom = (target: EventTarget | null) => (target as Element)?.closest?.("[data-node-id]")?.getAttribute("data-node-id") ?? null;
  return <div className="sstpa-gk-diagram-shell" aria-busy={disabled}>
    <div className="sstpa-gk-navigation" aria-label="Diagram navigation">
      <button className="sstpa-button secondary" disabled={disabled} onClick={() => { if (!projection) onInteraction(); fit(); }}>Fit argument</button>
      <button className="sstpa-button secondary" disabled={disabled} onClick={() => { changeZoom(1); requestAnimationFrame(() => centerSelected(selectedId, 1)); }}>100%</button>
      <button className="sstpa-button secondary" aria-label="Zoom out" disabled={disabled} onClick={() => changeZoom(zoom / 1.2)}>−</button>
      <output aria-label="Diagram zoom">{Math.round(zoom * 100)}%</output>
      <button className="sstpa-button secondary" aria-label="Zoom in" disabled={disabled} onClick={() => changeZoom(zoom * 1.2)}>+</button>
      {!projection && <><span className="sstpa-gk-toolbar-divider"/><button className="sstpa-button secondary" disabled={disabled || !selectedId} onClick={() => { setFocus(selectedId); changeZoom(1, selectedId); }}>Read selected branch</button>{focus && <button className="sstpa-button secondary" disabled={disabled} onClick={() => { onInteraction(); setFocus(null); publish(zoom, null); }}>Whole argument</button>}</>}
      <span className="sstpa-gk-navigation-hint">{focus ? `Branch ${focus}` : zoom < 0.75 ? "Overview · use 100% to read" : "Drag the page to pan · select a symbol to inspect"}</span>
    </div>
    <div className="sstpa-gk-canvas-scroll" ref={scroll} style={disabled ? { overflow: "hidden", touchAction: "none" } : undefined} data-testid={projection ? "model-canvas" : "gsn-canvas"} onScroll={() => publish()} onWheel={event => { if (disabled) { event.preventDefault(); return; } if (!projection) onInteraction(); }}
      onPointerDown={event => {
        if (disabled || event.button !== 0) return;
        const id = nodeFrom(event.target), pos = id && !projection ? positions[id] : undefined;
        drag.current = { id: projection ? null : id, x: event.clientX, y: event.clientY, startX: pos?.x ?? scroll.current!.scrollLeft, startY: pos?.y ?? scroll.current!.scrollTop, moved: false };
        if (pos) setDragFrame({ ...paddedBounds });
        if (!projection && id) onSelect(id);
        event.currentTarget.setPointerCapture(event.pointerId);
      }} onPointerMove={event => {
        const d = drag.current; if (disabled || !d) return;
        const dx = event.clientX - d.x, dy = event.clientY - d.y;
        if (Math.abs(dx) + Math.abs(dy) < 4 && !d.moved) return;
        d.moved = true; if (!projection) onInteraction();
        if (d.id) onDrag(d.id, d.startX + dx / zoom, d.startY + dy / zoom);
        else scroll.current?.scrollTo(d.startX - dx, d.startY - dy);
      }} onPointerUp={event => { drag.current = null; setDragFrame(null); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => { drag.current = null; setDragFrame(null); }}
      onKeyDown={event => { if (disabled) { event.preventDefault(); return; } const id = nodeFrom(event.target); if (id && ["Enter", " "].includes(event.key)) { event.preventDefault(); if (!projection) onSelect(id); } }}>
      <div className="sstpa-gk-svg-size" ref={size} style={{ width: frame.width * zoom, height: frame.height * zoom, margin: 0 }}>
        <div className="sstpa-gk-svg-stage" style={{ position: "relative", transform: `scale(${zoom})`, width: frame.width, height: frame.height }}>
          <div style={{ position: "absolute", left: bounds.x - frame.x, top: bounds.y - frame.y }} dangerouslySetInnerHTML={{ __html: html }}/>
        </div>
      </div>
    </div>
    {!projection && <div className="sstpa-gk-legend"><span>GSN v3 · core notation</span><span>Strategy: parallelogram</span><span>Solution: circle</span><span>Diamond: undeveloped</span><span>Filled arrow: support</span><span>Hollow arrow: context</span></div>}
  </div>;
}
