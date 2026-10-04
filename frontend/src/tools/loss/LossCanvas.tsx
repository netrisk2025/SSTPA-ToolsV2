import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  applyNodeChanges,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  NODE_TYPES,
  type AttackTree,
  type TreeNode,
  type TreeEdge,
  type NodeType,
  type MetricRule,
} from "./domain/types";
import {
  validateGraph,
  graphStats,
  visibleNodes,
  descendants,
  indexGraph,
  allowedChildren,
  makeEdge,
  pruneBranch,
  normalizeSequences,
} from "./domain/graph";
import {
  evaluateMetrics,
  derivedMetricNames,
  validateMetricConfiguration,
  defaultMetricRules,
} from "./domain/metrics";
import { layoutTree, nodeSize } from "./domain/layout";
import {
  NODE_PROPERTY_OPTIONS,
  nodePropertyValue,
  selectedNodePropertyKeys,
  selectedMetricPropertyKeys,
} from "./domain/identity";
import { analyzePaths, type AttackPath } from "./domain/paths";
import { parseTree } from "./domain/storage";
import {
  diagramSVG,
  download,
  evidenceMarkdown,
  pathsCSV,
  formatMetric,
} from "./domain/export";
import { defaultStyles } from "./defaults";


type CardNode = Node<
  {
    node: TreeNode;
    tree: AttackTree;
    values: Record<string, number | null>;
    status: string;
    shared: boolean;
    folded: boolean;
    hidden: number;
    dim: boolean;
  },
  "card"
>;
function PropertyCard({ data, selected }: NodeProps<CardNode>) {
  const { node, tree, values, folded, hidden } = data;
  const style = tree.root.AttackTreeJSON.nodeStyles[node.type];
  return (
    <div
      className={`property-card ${selected ? "selected" : ""} ${folded ? "folded" : ""} ${data.dim ? "dim" : ""}`}
      style={
        {
          width: nodeSize(tree).width,
          height: nodeSize(tree).height,
          color: style.font,
          background: style.box,
          borderColor: folded ? "#855da5" : style.border,
        } as CSSProperties
      }
    >
      <Handle type="target" position={tree.root.AttackTreeJSON.direction === "RIGHT" ? Position.Left : Position.Top} />
      <header>
        <div className="card-type">
          {node.type}
          {data.shared ? " · SHARED" : ""}
        </div>
        <strong title={node.label}>{node.label}</strong>
      </header>
      <div className="card-body">
        <code>{node.hid}</code>
        {selectedNodePropertyKeys(tree.root.AttackTreeJSON).map((key) => (
          <div
            className={`property-row ${key !== "provenance" ? "identity-row" : ""}`}
            key={`node:${key}`}
          >
            <span>
              {NODE_PROPERTY_OPTIONS.find((p) => p.key === key)!.label}
            </span>
            <b title={nodePropertyValue(node, key)}>
              {nodePropertyValue(node, key)}
            </b>
          </div>
        ))}
        {selectedMetricPropertyKeys(tree.root.AttackTreeJSON).map((key) => (
          <div className="property-row" key={key}>
            <span>
              {tree.root.MetricDefinitionsJSON.find((r) => r.id === key)
                ?.label ?? key}
            </span>
            <b>{formatMetric(values[key])}</b>
          </div>
        ))}
      </div>
      <div className="card-status">
        <span>
          {folded ? `ROLLED UP · ${hidden} descendants` : data.status}
        </span>
        {!node.authoritativeUuid && (
          <span className="uncommitted-status">not yet committed</span>
        )}
      </div>
      <Handle type="source" position={tree.root.AttackTreeJSON.direction === "RIGHT" ? Position.Right : Position.Bottom} />
      {folded && (
        <div className="fold-continuation">
          <i />
          <span>+ {hidden} descendants</span>
        </div>
      )}
    </div>
  );
}
const nodeTypes = { card: PropertyCard };
const clone = <T,>(v: T): T => structuredClone(v);
function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const old = document.activeElement as HTMLElement;
    ref.current?.focus();
    return () => old?.focus();
  }, []);
  return (
    <div
      className="modal-shade"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
          }
          if (e.key === "Tab") {
            const els = [
              ...ref.current!.querySelectorAll<HTMLElement>(
                "button,input,select,textarea,a[href]",
              ),
            ].filter((el) => !el.hasAttribute("disabled"));
            if (e.shiftKey && document.activeElement === els[0]) {
              e.preventDefault();
              els.at(-1)?.focus();
            } else if (!e.shiftKey && document.activeElement === els.at(-1)) {
              e.preventDefault();
              els[0]?.focus();
            }
          }
        }}
      >
        <header>
          <div>
            <span className="eyebrow">LOSS TOOL / ROOT SETTINGS</span>
            <h2>{title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
export interface LossCanvasProps {
  initialTree: AttackTree;
  onCommit: (draft: AttackTree) => Promise<AttackTree>;
  onImport: (tree: AttackTree) => AttackTree;
  onDirtyChange: (dirty: boolean) => void;
  candidates: TreeNode[];
  onOpenNode: (hid: string) => void;
  findings: { severity: string; type: string; nodeHid?: string; message: string }[];
}
export function LossCanvas(props: LossCanvasProps) {
  return <ReactFlowProvider><Workspace {...props} /></ReactFlowProvider>;
}
function Workspace({ initialTree, onCommit, onImport, onDirtyChange, candidates, onOpenNode, findings }: LossCanvasProps) {
  const [boot] = useState(() => ({tree:initialTree,error:""}));
  const [exportAcknowledged,setExportAcknowledged]=useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<AttackTree>(clone(boot.tree)),
    [committed, setCommitted] = useState<AttackTree>(clone(boot.tree));
  const [selected, setSelected] = useState<string | null>(draft.rootId),
    [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [mode, setMode] = useState<"construction" | "paths" | "findings">(
      "construction",
    ),
    [dialog, setDialog] = useState<string | null>(
      boot.error ? "message" : null,
    ),
    [message, setMessage] = useState(boot.error),
    [notice, setNotice] = useState(
      "Core model · changes are staged until Commit",
    );
  const [context, setContext] = useState<{
      x: number;
      y: number;
      id: string;
    } | null>(null),
    [search, setSearch] = useState(""),
    [path, setPath] = useState<AttackPath | null>(null),
    [busy, setBusy] = useState(false);
  const [pathFilter, setPathFilter] = useState("ALL"),
    [sortKey, setSortKey] = useState("AttackCost"),
    [sortAsc, setSortAsc] = useState(true),
    [page, setPage] = useState(0);
  const [colorType, setColorType] = useState<NodeType>("Attack"),
    [rules, setRules] = useState<(MetricRule & { originalId?: string })[]>([]),
    [profileText, setProfileText] = useState("");
  const [newLabel, setNewLabel] = useState(""),
    [newType, setNewType] = useState<NodeType>("Attack"),
    [linkId, setLinkId] = useState("");
  const [edgeDraft, setEdgeDraft] = useState<TreeEdge | null>(null),
    [nodeLabel, setNodeLabel] = useState(""),
    [leafInputs, setLeafInputs] = useState<Record<string, string>>({});
  const [ruleTextError, setRuleTextError] = useState("");
  const flow = useRef<ReactFlowInstance<CardNode, Edge> | null>(null),
    epoch = useRef(0),
    fileInput = useRef<HTMLInputElement>(null),
    latest = useRef(draft);
  latest.current = draft;
  // Keep semantic evaluation independent of camera-only edits.
  const model = useMemo(() => ({...initialTree, rootId:draft.rootId, nodes:draft.nodes, edges:draft.edges,
    root:{...initialTree.root, MetricDefinitionsJSON:draft.root.MetricDefinitionsJSON, AnalysisProfileJSON:draft.root.AnalysisProfileJSON}}),
    [initialTree,draft.rootId,draft.nodes,draft.edges,draft.root.MetricDefinitionsJSON,draft.root.AnalysisProfileJSON]);
  const view = draft.root.AttackTreeJSON;
  const stats=useMemo(()=>graphStats(model),[model]);
  const graphFindings=useMemo(()=>validateGraph(model),[model]);
  const metrics=useMemo(()=>evaluateMetrics(model),[model]);
  const paths=useMemo(()=>analyzePaths(model),[model]);
  const index=useMemo(()=>indexGraph(model),[model]);
  const shown=useMemo(()=>visibleNodes({...model,root:{...model.root,AttackTreeJSON:view}},path?.nodeIds),[model,view,path]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(committed);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => {
    const close=(e:Event)=>{if(dirty){e.preventDefault();setMessage("Commit or Revert staged changes before closing the Loss Tool.");setDialog("message");}};
    const unload=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue="";}};
    window.addEventListener("sstpa.loss.request-close",close);window.addEventListener("beforeunload",unload);
    return ()=>{window.removeEventListener("sstpa.loss.request-close",close);window.removeEventListener("beforeunload",unload);};
  },[dirty]);
  const node = selected ? index.nodes.get(selected) : undefined,
    edge = selectedEdge
      ? draft.edges.find((e) => e.id === selectedEdge)
      : undefined;
  const report = (text: string) => {
    setMessage(text);
    setDialog("message");
  };
  const update = useCallback(
    (edit: (t: AttackTree) => void, validate = true) => {
      const next = clone(latest.current);
      try {
        edit(next);
        if (validate) {
          const errors = validateGraph(next).filter(
            (f) => f.severity === "error",
          );
          if (errors.length)
            throw new Error(errors.map((f) => f.message).join("\n"));
          const errors2 = validateMetricConfiguration(
            next.root.MetricDefinitionsJSON,
            next.root.AnalysisProfileJSON,
          );
          if (errors2.length) throw new Error(errors2.join("\n"));
        }
        epoch.current++;
        setBusy(false);
        setDraft(next);
        return true;
      } catch (e) {
        report(String(e instanceof Error ? e.message : e));
        return false;
      }
    },
    [],
  );
  const arrange = useCallback(
    async (tree: AttackTree = latest.current, fit: boolean | "root" = true, asBaseline=false) => {
      const gen = ++epoch.current;
      setBusy(true);
      try {
        const positions = await layoutTree(tree);
        if (gen !== epoch.current) return;
        setDraft((prev) => ({
          ...prev,
          root: {
            ...prev.root,
            AttackTreeJSON: { ...prev.root.AttackTreeJSON, positions },
          },
        }));
        if(asBaseline) setCommitted(prev=>({...prev,root:{...prev.root,AttackTreeJSON:{...prev.root.AttackTreeJSON,positions}}}));
        setNotice(asBaseline ? "ELK generated the initial view" : "ELK arranged the tree · layout staged on root");
        if (fit)
          setTimeout(async () => {
            if (gen !== epoch.current) return;
            if (fit === "root") {
              const p = positions[tree.rootId];
              const width =
                document.querySelector(".sstpa-loss-workspace .canvas-wrap")?.clientWidth ?? 700;
              await flow.current?.setViewport(
                {
                  x: width / 2 - (p.x + 130) * 0.7,
                  y: 65 - p.y * 0.7,
                  zoom: 0.7,
                },
                { duration: 250 },
              );
            } else await flow.current?.fitView({ padding: 0.14, duration: 300 });
          }, 80);
      } catch (e) {
        if (gen === epoch.current) report(String(e));
      } finally {
        if (gen === epoch.current) setBusy(false);
      }
    },
    [],
  );
  useEffect(() => {
    if (boot.tree.nodes.some(n => !boot.tree.root.AttackTreeJSON.positions[n.id]))
      void arrange(boot.tree, boot.tree.root.AttackTreeJSON.legacyCenter ? false : "root", true);
    return () => {
      // This ref is a generation counter, not a DOM node; invalidate the current request on unmount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      epoch.current++;
    };
  }, [arrange, boot]);
  useEffect(() => {
    setNodeLabel(node?.label ?? "");
    setLeafInputs(
      Object.fromEntries(
        draft.root.MetricDefinitionsJSON.map((r) => [
          r.id,
          node?.metrics[r.id] === null || node?.metrics[r.id] === undefined
            ? ""
            : String(Number(node.metrics[r.id])),
        ]),
      ),
    );
  }, [selected, node?.label, node?.metrics, draft.root.MetricDefinitionsJSON]);
  useEffect(
    () => setEdgeDraft(edge ? clone(edge) : null),
    [edge],
  );
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContext(null);
        setPath(null);
        setSelected(null);
        setSelectedEdge(null);
        setDialog(null);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  const selectNode = (id: string) => {
    setSelected(id);
    setSelectedEdge(null);
    setContext(null);
  };
  const focus = (id: string) => {
    selectNode(id);
    const n = latest.current.nodes.find((n) => n.id === id);
    if (!n) return;
    const collapsed = latest.current.root.AttackTreeJSON.collapsed.filter(
      (c) => !descendants(latest.current, c).has(id),
    );
    if (
      collapsed.length !== latest.current.root.AttackTreeJSON.collapsed.length
    )
      update((t) => {
        t.root.AttackTreeJSON.collapsed = collapsed;
      }, false);
    const p = latest.current.root.AttackTreeJSON.positions[id];
    if (p)
      void flow.current?.setCenter(
        p.x + 130,
        p.y + nodeSize(latest.current).height / 2,
        { zoom: 0.85, duration: 300 },
      );
  };
  const toggleFold = (id: string, force?: boolean) => {
    update((t) => {
      const list = t.root.AttackTreeJSON.collapsed;
      const fold = force ?? !list.includes(id);
      t.root.AttackTreeJSON.collapsed = fold
        ? [...new Set([...list, id])]
        : list.filter((x) => x !== id);
    }, false);
    setContext(null);
    setPath(null);
  };
  const doCommit = async () => {
    setSaving(true);
    epoch.current++;
    try {
      const next = await onCommit(clone(latest.current));
      setCommitted(clone(next));
      setDraft(next);
      setNotice(`Committed revision ${next.revision} to Core database`);
    } catch (e) {
      report(`Staged changes have been retained. ${e instanceof Error ? e.message : String(e)}`);
    } finally { setSaving(false); }
  };
  const revert = () => {
    epoch.current++;
    setBusy(false);
    setDraft(clone(committed));
    setSelected(committed.rootId);
    setSelectedEdge(null);
    setPath(null);
    void flow.current?.setViewport(committed.root.AttackTreeJSON.viewport);
    if (!Object.keys(committed.root.AttackTreeJSON.positions).length)
      void arrange(committed);
    setNotice(`Reverted to revision ${committed.revision}`);
  };
  const nodes: CardNode[] = draft.nodes
    .filter((n) => shown.has(n.id))
    .map((n) => {
      const result = metrics.byNode[n.id];
      const leaf = !index.outgoing.get(n.id)?.length;
      const incoming = index.incoming.get(n.id) ?? [];
      const status =
        n.authoritativeUuid ? "CORE" : "STAGED";
      return {
        id: n.id,
        type: "card",
        width: nodeSize(draft).width,
        height: nodeSize(draft).height,
        position: view.positions[n.id] ?? { x: 0, y: 0 },
        selected: n.id === selected,
        data: {
          node: n,
          tree: draft,
          values: result?.values ?? {},
          status:
            incoming.length && incoming.every((e) => e.tailoredOut)
              ? "TAILORED OUT"
              : incoming.length && incoming.every((e) => e.completeBlock)
                ? "BLOCKED"
                : incoming.some((e) => e.completeBlock)
                  ? "BLOCKED BY EDGE"
                  : n.type === "Asset"
                    ? "DERIVED SCOPE"
                    : leaf && n.type === "Attack"
                      ? incoming.every((e) => e.allowedRV !== null)
                        ? "ALLOWED RV"
                        : incoming.some((e) => e.allowedRV !== null)
                          ? "RV / ALLOWED BY EDGE"
                          : "RV · UNADDRESSED"
                      : status,
          shared: incoming.length > 1,
          folded:
            view.collapsed.includes(n.id) && !path?.nodeIds.includes(n.id),
          hidden: [...descendants(draft, n.id)].filter((id) => !shown.has(id))
            .length,
          dim: !!path && !path.nodeIds.includes(n.id),
        },
        ariaLabel: `${n.type}: ${n.label}, ${n.hid}`,
        style: { opacity: busy ? 0.55 : 1 },
      };
    });
  const edges: Edge[] = draft.edges
    .filter(
      (e) =>
        shown.has(e.source) &&
        shown.has(e.target) &&
        (!view.collapsed.includes(e.source) ||
          path?.nodeIds.includes(e.source)),
    )
    .map((e) => {
      const highlighted = path?.edgeIds.includes(e.id),
        c = e.completeBlock
          ? "#477e70"
          : view.nodeStyles[index.nodes.get(e.source)!.type].line;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: "smoothstep",
        label: `${e.gate}${e.sequence !== null ? " " + e.sequence : ""}${e.tailoredOut ? " · TAILORED" : ""}${e.completeBlock ? " · BLOCKED" : ""}${e.allowedRV !== null ? " · ALLOWED RV" : ""}`,
        selected: e.id === selectedEdge,
        markerEnd: { type: MarkerType.ArrowClosed, color: c },
        style: {
          stroke: c,
          strokeWidth: highlighted ? 3 : 1.8,
          strokeDasharray: e.tailoredOut ? "7 5" : undefined,
          opacity: path && !highlighted ? 0.17 : e.tailoredOut ? 0.45 : 1,
        },
        labelStyle: {
          fill: view.theme === "nocturne" ? "#e8e2d6" : "#3d352b",
          fontSize: 11,
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: view.theme === "nocturne" ? "#232d3c" : "#ede4d4",
        },
        interactionWidth: 18,
      };
    });
  const filteredPaths = useMemo(
    () =>
      paths.paths
        .filter((p) => pathFilter === "ALL" || p.status === pathFilter)
        .sort((a, b) => {
          const av = metrics.byNode[a.terminalId]?.values[sortKey],
            bv = metrics.byNode[b.terminalId]?.values[sortKey];
          return (
            ((av ?? Number.POSITIVE_INFINITY) -
              (bv ?? Number.POSITIVE_INFINITY)) *
              (sortAsc ? 1 : -1) || a.id.localeCompare(b.id)
          );
        }),
    [paths, metrics, pathFilter, sortKey, sortAsc],
  );
  useEffect(
    () =>
      setPage((p) =>
        Math.min(p, Math.max(0, Math.ceil(filteredPaths.length / 100) - 1)),
      ),
    [filteredPaths.length, draft.id],
  );
  const warnings = graphFindings.filter((f) => f.code === "NEAR_LIMIT");
  const addNode = () => {
    if (!node) return;
    const id = crypto.randomUUID();
    if (
      update((t) => {
        const child: TreeNode = {
          id,
          hid: `LOCAL_${id}`,
          label: newLabel.trim() || `New ${newType}`,
          type: newType,
          description: "",
          provenance: "Not yet committed",
          authoritativeUuid: null,
          metrics: Object.fromEntries(
            latest.current.root.MetricDefinitionsJSON.map((r) => [
              r.id,
              r.defaultValue,
            ]),
          ),
          ...(newType === "Asset" ? { derived: true } : {}),
        };
        t.nodes.push(child);
        t.edges.push(makeEdge(t, node.id, id));
        normalizeSequences(t);
      })
    ) {
      setDialog(null);
      setSelected(id);
      setTimeout(() => void arrange(latest.current), 0);
    }
  };
  const rawInputs = () => {
    if (!node) return;
    const values: TreeNode["metrics"] = {};
    for (const r of draft.root.MetricDefinitionsJSON) {
      const raw = leafInputs[r.id] ?? "";
      const v = raw.trim() === "" ? null : Number(raw);
      if (
        v !== null &&
        (!Number.isFinite(v) ||
          (r.min !== undefined && v < r.min) ||
          (r.max !== undefined && v > r.max) ||
          (r.boolean && v !== 0 && v !== 1))
      ) {
        report(
          `Invalid ${r.label}. Enter a finite value within its domain${r.boolean ? " (0 or 1)" : ""}.`,
        );
        return;
      }
      values[r.id] = v;
    }
    if (
      update((t) => {
        t.nodes.find((n) => n.id === node.id)!.metrics = values;
      })
    )
      setNotice("Leaf inputs staged; parents and root recalculated");
  };
  return (
    <div className={`sstpa-loss-workspace ${view.theme}`} inert={saving || undefined}>
      <header className="brandbar">
        <div className="brand">
          <svg viewBox="0 0 44 44" aria-hidden="true">
            <path d="M22 3 40 13v19L22 42 4 32V13Z M22 3v39 M4 13l36 19 M40 13 4 32" />
          </svg>
          <div>
            <span className="eyebrow">SSTPA TOOLS · LOSS ANALYSIS</span>
            <h1>
              Loss Tool <span>/ Attack Tree</span>
            </h1>
          </div>
        </div>
        <div className="top-actions">
          <span className={`status-pill ${dirty ? "amber" : ""}`}>
            {dirty ? "STAGED CHANGES" : `REVISION ${draft.revision}`}
          </span>
          <button
            onClick={() =>
              update((t) => {
                t.root.AttackTreeJSON.theme =
                  view.theme === "parchment" ? "nocturne" : "parchment";
              }, false)
            }
          >
            {view.theme === "parchment" ? "Nocturne" : "Parchment"}
          </button>
          <a
            href={`${import.meta.env.BASE_URL}licenses/index.html`}
            target="_blank"
            rel="noreferrer"
          >
            Licenses
          </a>
        </div>
      </header>
      <section className="identity">
        <div className="loss-identity">
          <span className="eyebrow">SELECTED LOSS</span>
          <strong>{index.nodes.get(draft.rootId)?.label}</strong>
          <code>{index.nodes.get(draft.rootId)?.hid}</code>
        </div>
        <div>
          <span>Asset</span>
          <b>{draft.root.asset}</b>
        </div>
        <div>
          <span>Environment</span>
          <b>{draft.root.environment}</b>
        </div>
        <div>
          <span>Criticality / Assurance</span>
          <b>
            {draft.root.criticality} · {draft.root.assurance}
          </b>
        </div>
      </section>
      <div className="modebar">
        <nav aria-label="Workspace mode">
          <button
            className={mode === "construction" ? "active" : ""}
            onClick={() => setMode("construction")}
          >
            Attack tree construction
          </button>
          <button
            className={mode === "paths" ? "active" : ""}
            onClick={() => setMode("paths")}
          >
            Attack path analysis <small>{paths.total}</small>
          </button>
          <button
            className={mode === "findings" ? "active" : ""}
            onClick={() => setMode("findings")}
          >
            Validation{" "}
            <small>{graphFindings.length + metrics.warnings.length + findings.length}</small>
          </button>
        </nav>
        <div>
          <button onClick={revert} disabled={!dirty}>
            Revert
          </button>
          <button
            className="primary"
            onClick={doCommit}
            disabled={!dirty || busy}
          >
            Commit
          </button>
        </div>
      </div>
      {warnings.length > 0 && (
        <div className="warning" role="status">
          {warnings.map((f) => f.message).join(" ")}
        </div>
      )}
      <div className="toolbar">
        <div className="search">
          <input
            aria-label="Find node by name or HID"
            placeholder="Find node or HID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const found = draft.nodes.find((n) =>
                  `${n.label} ${n.hid}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                );
                if (found) focus(found.id);
                else setNotice("No matching node");
              }
            }}
          />
          <button
            onClick={() => {
              const found = draft.nodes.find((n) =>
                `${n.label} ${n.hid}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              );
              if (found) focus(found.id);
              else setNotice("No matching node");
            }}
          >
            Find
          </button>
        </div>
        <button
          onClick={() =>
            void flow.current?.fitView({ padding: 0.12, duration: 300 })
          }
        >
          Fit tree
        </button>
        <button onClick={() => focus(draft.rootId)}>Root</button>
        <button
          onClick={() => selected && focus(selected)}
          disabled={!selected}
        >
          Focus
        </button>
        <button onClick={() => void arrange()} disabled={busy}>
          {busy ? "Arranging…" : "Auto-arrange"}
        </button>
        <label className="layout-direction">Direction
          <select aria-label="Layout direction" value={view.direction} onChange={e => {
            const next=clone(latest.current);next.root.AttackTreeJSON.direction=e.target.value as "DOWN"|"RIGHT";
            update(t=>{t.root.AttackTreeJSON.direction=next.root.AttackTreeJSON.direction;},false);void arrange(next);
          }}><option value="DOWN">Top down</option><option value="RIGHT">Left to right</option></select>
        </label>
        <span className="spacer" />
        <button onClick={() => setDialog("properties")}>Properties</button>
        <button onClick={() => setDialog("colors")}>Colors</button>
        <button
          onClick={() => {
            setRules(
              clone(draft.root.MetricDefinitionsJSON).map((r) => ({
                ...r,
                originalId: r.id,
              })),
            );
            setProfileText(
              JSON.stringify(draft.root.AnalysisProfileJSON, null, 2),
            );
            setRuleTextError("");
            setDialog("rules");
          }}
        >
          Metric rules
        </button>
        <button onClick={() => {setExportAcknowledged(false);setDialog("export");}}>Export</button>
        <button onClick={() => fileInput.current?.click()}>Import</button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          hidden
          aria-label="Import tree JSON"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const t = onImport(parseTree(await file.text()));
              epoch.current++;
              setDraft(t);
              setSelected(t.rootId);
              setSelectedEdge(null);
              setPath(null);
              if (!Object.keys(t.root.AttackTreeJSON.positions).length)
                void arrange(t);
              else
                setTimeout(
                  () =>
                    void flow.current?.setViewport(
                      t.root.AttackTreeJSON.viewport,
                    ),
                  50,
                );
              setNotice("JSON imported as staged document; Commit to save");
            } catch (err) {
              report(String(err));
            }
            e.target.value = "";
          }}
        />
      </div>
      <main className="main-grid">
        <aside className="left-pane">
          {mode === "paths" ? (
            <>
              <span className="eyebrow">ATTACK PATH ANALYSIS</span>
              <h2>Follow a route</h2>
              <p className="subtle">
                A route is not a complete AND scenario. Values below project the
                terminal leaf.
              </p>
              <div className="path-controls">
                <label>
                  Status
                  <select
                    aria-label="Status"
                    value={pathFilter}
                    onChange={(e) => {
                      setPathFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    {["ALL", "RV", "ALLOWED", "BLOCKED", "DERIVED"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Sort metric
                  <select
                    aria-label="Sort metric"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                  >
                    {draft.root.MetricDefinitionsJSON.map((r) => (
                      <option value={r.id} key={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button onClick={() => setSortAsc((v) => !v)}>
                  {sortAsc ? "Ascending ↑" : "Descending ↓"}
                </button>
              </div>
              <p className="subtle">
                {paths.total} exact · {paths.paths.length} materialized
                {paths.truncated ? " · TRUNCATED" : ""}
              </p>
              {filteredPaths.slice(page * 100, (page + 1) * 100).map((p, i) => (
                <button
                  key={p.id}
                  className={`path-row ${path?.id === p.id ? "active" : ""}`}
                  onClick={() => {
                    setPath(p);
                    setSelected(p.terminalId);
                    setSelectedEdge(null);
                    setTimeout(
                      () =>
                        void flow.current?.fitView({
                          nodes: p.nodeIds.map((id) => ({ id })),
                          padding: 0.18,
                          duration: 300,
                        }),
                      40,
                    );
                  }}
                >
                  <span className="eyebrow">
                    PATH {page * 100 + i + 1} · {p.status}
                  </span>
                  <strong>{index.nodes.get(p.terminalId)?.label}</strong>
                  <small>
                    {p.nodeIds.length - 1} edges ·{" "}
                    {formatMetric(
                      metrics.byNode[p.terminalId]?.values[sortKey],
                    )}
                  </small>
                </button>
              ))}
              <div className="pagination">
                <button disabled={!page} onClick={() => setPage((v) => v - 1)}>
                  Previous
                </button>
                <span>
                  {page + 1} /{" "}
                  {Math.max(1, Math.ceil(filteredPaths.length / 100))}
                </span>
                <button
                  disabled={(page + 1) * 100 >= filteredPaths.length}
                  onClick={() => setPage((v) => v + 1)}
                >
                  Next
                </button>
              </div>
              <button onClick={() => setPath(null)}>Clear highlight</button>
            </>
          ) : (
            <>
              <span className="eyebrow">CURRENT LOSS</span>
              <h2>Explore the model</h2>
              <p className="subtle">Select a card to inspect its identity, evidence and calculated properties.</p>
              <div className="outline-title">
                <span className="eyebrow">MODEL OUTLINE</span>
                <b>{stats.nodes}</b>
              </div>
              <div className="outline">
                {draft.nodes
                  .filter(
                    (n) =>
                      !search ||
                      `${n.label} ${n.hid}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                  )
                  .map((n) => (
                    <button
                      className={selected === n.id ? "selected" : ""}
                      key={n.id}
                      onClick={() => focus(n.id)}
                    >
                      <i
                        style={{ background: view.nodeStyles[n.type].border }}
                      />
                      <span>
                        {n.label}
                        <small>{n.hid}</small>
                      </span>
                    </button>
                  ))}
              </div>
            </>
          )}
        </aside>
        <section className="canvas-wrap" aria-label="Attack tree canvas">
          <div className="canvas-caption">
            <span>STRUCTURED ATTACK TREE</span>
            <span>Pan · zoom · right-click to roll up</span>
          </div>
          <ReactFlow<CardNode, Edge>
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onInit={(instance) => {
              flow.current = instance;
              const camera=boot.tree.root.AttackTreeJSON.legacyCenter;
              if(camera) void instance.setCenter(camera.x,camera.y,{zoom:camera.zoom});
              else void instance.setViewport(view.viewport);
            }}
            onNodesChange={(changes) => {
              const moved = applyNodeChanges(changes, nodes);
              if (changes.some((c) => c.type === "position"))
                update((t) => {
                  for (const n of moved) {
                    const p = t.root.AttackTreeJSON.positions[n.id];
                    if (p)
                      t.root.AttackTreeJSON.positions[n.id] = {
                        x: view.direction === "RIGHT" ? p.x : n.position.x,
                        y: view.direction === "RIGHT" ? n.position.y : p.y,
                      };
                  }
                }, false);
            }}
            onNodeClick={(_, n) => selectNode(n.id)}
            onEdgeClick={(_, e) => {
              setSelectedEdge(e.id);
              setSelected(null);
              setContext(null);
            }}
            onPaneClick={() => {
              setContext(null);
              setSelected(null);
              setSelectedEdge(null);
            }}
            onNodeContextMenu={(e, n) => {
              e.preventDefault();
              setSelected(n.id);
              setSelectedEdge(null);
              setContext({
                id: n.id,
                x: Math.min(e.clientX, window.innerWidth - 235),
                y: Math.min(e.clientY, window.innerHeight - 190),
              });
            }}
            onMoveEnd={(event, viewport) => {
              const camera=(prev:AttackTree)=>{
                const next={...prev,root:{...prev.root,AttackTreeJSON:{...prev.root.AttackTreeJSON,viewport}}};
                delete next.root.AttackTreeJSON.legacyCenter;
                return next;
              };
              setDraft(camera);
              // Initial framing and focus animations are navigation, not edits. Keep
              // the saved comparison camera in step without copying staged content.
              if(!event) setCommitted(camera);
            }}
            minZoom={0.02}
            maxZoom={2.5}
            nodesConnectable={false}
            deleteKeyCode={null}
            fitView={false}
            onlyRenderVisibleElements={true}
            colorMode={view.theme === "nocturne" ? "dark" : "light"}
          >
            <Background
              color={view.theme === "nocturne" ? "#4a5361" : "#c9bba6"}
              gap={22}
              size={1}
            />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              nodeColor={(n) =>
                view.nodeStyles[(n.data.node as TreeNode).type].border
              }
              maskColor={view.theme === "nocturne" ? "#171f2ba8" : "#ede4d4ae"}
            />
          </ReactFlow>
          <div className="canvas-count">
            {shown.size} visible / {stats.nodes} nodes · depth {stats.depth}/20
            · width {stats.width}/50
          </div>
          {mode === "findings" && (
            <div className="findings-panel">
              <header>
                <h2>Validation findings</h2>
                <button
                  onClick={() => setMode("construction")}
                  aria-label="Close findings"
                >
                  ×
                </button>
              </header>
              <p>
                Graph validation and calculation status for the complete model.
              </p>
              {!graphFindings.length && !metrics.warnings.length && !findings.length ? (
                <p className="success">
                  No findings. Analysis status: {metrics.root.status}.
                </p>
              ) : (
                <ul>
                  {findings.map((f,i) => <li key={`core-${i}`}><button onClick={() => { const n = draft.nodes.find(n => n.hid === f.nodeHid); if(n) focus(n.id); }}><b>{f.severity} · {f.type}</b> {f.message}</button></li>)}
                  {graphFindings.map((f, i) => (
                    <li key={i}>
                      <button
                        onClick={() => {
                          if (f.nodeId) focus(f.nodeId);
                          else if (f.edgeId) {
                            setSelectedEdge(f.edgeId);
                            setSelected(null);
                          }
                        }}
                      >
                        <b>{f.code}</b> {f.message}
                      </button>
                    </li>
                  ))}
                  {metrics.warnings.map((w, i) => (
                    <li key={`m${i}`}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
        <aside className="inspector" aria-label="Selection inspector">
          {edge && edgeDraft ? (
            <>
              <span className="eyebrow">RELATIONSHIP INSPECTOR</span>
              <h2>
                {index.nodes.get(edge.source)?.label} <span>→</span>{" "}
                {index.nodes.get(edge.target)?.label}
              </h2>
              <code>{edge.id}</code>
              <p className="subtle">
                Decisions apply to this incoming relationship. Loss scope:{" "}
                {edge.lossId}.
              </p>
              <label>
                Sibling operator
                <select
                  aria-label="Sibling operator"
                  value={edgeDraft.gate}
                  onChange={(e) =>
                    setEdgeDraft({
                      ...edgeDraft,
                      gate: e.target.value as TreeEdge["gate"],
                    })
                  }
                >
                  {(index.nodes.get(edge.target)?.type === "Environment"
                    ? ["AND"]
                    : edge.source === draft.rootId
                      ? ["OR", "SAND"]
                      : ["AND", "OR", "SAND"]
                  ).map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </label>
              {edgeDraft.gate === "SAND" && (
                <label>
                  Sequence position
                  <input
                    aria-label="Sequence position"
                    type="number"
                    min={0}
                    value={edgeDraft.sequence ?? 0}
                    onChange={(e) =>
                      setEdgeDraft({
                        ...edgeDraft,
                        sequence: Number(e.target.value),
                      })
                    }
                  />
                </label>
              )}
              <label className="check">
                <input
                  type="checkbox"
                  checked={edgeDraft.tailoredOut}
                  onChange={(e) =>
                    setEdgeDraft({
                      ...edgeDraft,
                      tailoredOut: e.target.checked,
                      tailoredReason: e.target.checked
                        ? edgeDraft.tailoredReason
                        : "",
                    })
                  }
                />
                Tailored out
              </label>
              {edgeDraft.tailoredOut && (
                <textarea
                  aria-label="Tailoring reason"
                  placeholder="Reason for excluding traversal"
                  value={edgeDraft.tailoredReason}
                  onChange={(e) =>
                    setEdgeDraft({
                      ...edgeDraft,
                      tailoredReason: e.target.value,
                    })
                  }
                />
              )}
              <label className="check">
                <input
                  type="checkbox"
                  disabled={
                    index.nodes.get(edge.source)?.type !== "Attack" ||
                    index.nodes.get(edge.target)?.type !== "Countermeasure"
                  }
                  checked={edgeDraft.completeBlock}
                  onChange={(e) =>
                    setEdgeDraft({
                      ...edgeDraft,
                      completeBlock: e.target.checked,
                      blockReason: e.target.checked
                        ? edgeDraft.blockReason
                        : "",
                    })
                  }
                />
                Complete block
              </label>
              {edgeDraft.completeBlock && (
                <textarea
                  aria-label="Complete block reason"
                  value={edgeDraft.blockReason}
                  onChange={(e) =>
                    setEdgeDraft({ ...edgeDraft, blockReason: e.target.value })
                  }
                />
              )}
              <label className="check">
                <input
                  type="checkbox"
                  disabled={
                    index.nodes.get(edge.target)?.type !== "Attack" ||
                    !!index.outgoing.get(edge.target)?.length
                  }
                  checked={edgeDraft.allowedRV !== null}
                  onChange={(e) =>
                    setEdgeDraft({
                      ...edgeDraft,
                      allowedRV: e.target.checked ? 1 : null,
                      allowedReason: e.target.checked
                        ? edgeDraft.allowedReason
                        : "",
                    })
                  }
                />
                Allowed residual vulnerability
              </label>
              {edgeDraft.allowedRV !== null && (
                <>
                  <textarea
                    aria-label="Allowed RV reason"
                    placeholder="Reason (at least 20 characters)"
                    value={edgeDraft.allowedReason}
                    onChange={(e) =>
                      setEdgeDraft({
                        ...edgeDraft,
                        allowedReason: e.target.value,
                      })
                    }
                  />
                </>
              )}
              <button
                className="primary full"
                onClick={() =>
                  update((t) => {
                    Object.assign(
                      t.edges.find((e) => e.id === edge.id)!,
                      edgeDraft,
                    );
                    const group = t.edges.filter(
                      (e) =>
                        e.source === edge.source &&
                        t.nodes.find((n) => n.id === e.target)?.type !==
                          "Environment",
                    );
                    if (
                      t.nodes.find((n) => n.id === edge.target)?.type !==
                      "Environment"
                    )
                      for (const e of group) e.gate = edgeDraft.gate;
                    if (edgeDraft.gate === "SAND") {
                      const ordered = group
                        .filter((e) => !e.tailoredOut && e.id !== edge.id)
                        .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
                      if (!edgeDraft.tailoredOut)
                        ordered.splice(
                          Math.max(
                            0,
                            Math.min(edgeDraft.sequence ?? 0, ordered.length),
                          ),
                          0,
                          t.edges.find((e) => e.id === edge.id)!,
                        );
                      ordered.forEach((e, i) => (e.sequence = i));
                    }
                    normalizeSequences(t);
                  })
                }
              >
                Stage relationship
              </button>
            </>
          ) : node ? (
            <>
              <span className="eyebrow">
                {node.type} / DEPTH {stats.depths[node.id]}
              </span>
              <h2>{node.label}</h2>
              <code>{node.hid}</code>
              <p className="subtle">{node.description}</p>
              <div className="provenance">{node.provenance}</div>
              <dl className="node-identity" aria-label="Node identity">
                <dt>Node ID</dt>
                <dd>{node.id}</dd>
                <dt>Authoritative UUID</dt>
                <dd>{nodePropertyValue(node, "authoritativeUuid")}</dd>
              </dl>
              <label>
                Name
                <input
                  aria-label="Node name"
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                />
              </label>
              <button
                onClick={() =>
                  update((t) => {
                    t.nodes.find((n) => n.id === node.id)!.label = nodeLabel;
                  })
                }
              >
                Stage name
              </button>
              <button className="full" disabled={!node.authoritativeUuid} onClick={() => onOpenNode(node.hid)}>Open Core record</button>
              <div className="node-actions">
                <button
                  disabled={!allowedChildren[node.type].some(t => t === "Attack" || t === "Countermeasure")}
                  onClick={() => {
                    setNewType(allowedChildren[node.type].find(t => t === "Attack" || t === "Countermeasure") ?? "Attack");
                    setNewLabel("");
                    setDialog("add");
                  }}
                >
                  Add child
                </button>
                <button
                  disabled={!allowedChildren[node.type].length}
                  onClick={() => {
                    setLinkId("");
                    setDialog("link");
                  }}
                >
                  Link existing
                </button>
                <button
                  disabled={!index.outgoing.get(node.id)?.length}
                  onClick={() => toggleFold(node.id)}
                >
                  {view.collapsed.includes(node.id) ? "Roll down" : "Roll up"}
                </button>
                <button
                  className="danger"
                  disabled={node.id === draft.rootId}
                  onClick={() => {
                    if (update((t) => pruneBranch(t, node.id))) {
                      setSelected(draft.rootId);
                      setNotice(
                        "Branch removal staged; shared descendants remain",
                      );
                    }
                  }}
                >
                  Remove branch
                </button>
              </div>
              <div className="inspector-section">
                <span className="eyebrow">RELATIONSHIPS</span>
                {(index.incoming.get(node.id) ?? []).map((e) => (
                  <button
                    className="relationship"
                    key={e.id}
                    onClick={() => {
                      setSelectedEdge(e.id);
                      setSelected(null);
                    }}
                  >
                    ← {index.nodes.get(e.source)?.label}{" "}
                    <b>
                      {e.gate}
                      {e.sequence !== null ? " " + e.sequence : ""}
                    </b>
                  </button>
                ))}
                {(index.outgoing.get(node.id) ?? []).map((e) => (
                  <button
                    className="relationship"
                    key={e.id}
                    onClick={() => {
                      setSelectedEdge(e.id);
                      setSelected(null);
                    }}
                  >
                    → {index.nodes.get(e.target)?.label}{" "}
                    <b>
                      {e.gate}
                      {e.sequence !== null ? " " + e.sequence : ""}
                    </b>
                  </button>
                ))}
              </div>
              {node.type !== "Environment" && (
                <>
                  {node.type === "Attack" && <label>
                    Event kind
                    <select
                      aria-label="Event kind"
                      value={node.eventKind ?? "hostile"}
                      onChange={(e) =>
                        update((t) => {
                          t.nodes.find((n) => n.id === node.id)!.eventKind = e
                            .target.value as "hostile" | "stochastic";
                        })
                      }
                    >
                      <option value="hostile">Hostile action</option>
                      <option value="stochastic">Stochastic event</option>
                    </select>
                  </label>}
                  <div className="inspector-section">
                    <span className="eyebrow">
                      {index.outgoing.get(node.id)?.length
                        ? "CALCULATED PROPERTIES"
                        : "LEAF METRIC INPUTS"}
                    </span>
                    {!index.outgoing.get(node.id)?.length &&
                    ["Attack", "Asset"].includes(node.type) ? (
                      <>
                        {draft.root.MetricDefinitionsJSON.map((r) => (
                          <label className="metric-input" key={r.id}>
                            {r.label}
                            <small>
                              {r.unit} · {r.min ?? "−∞"}…{r.max ?? "∞"}
                            </small>
                            <input
                              aria-label={`Leaf ${r.id}`}
                              type="number"
                              min={r.min}
                              max={r.max}
                              step="any"
                              placeholder={
                                r.defaultValue === null
                                  ? "Unknown"
                                  : `Default: ${r.defaultValue}`
                              }
                              value={leafInputs[r.id] ?? ""}
                              onChange={(e) =>
                                setLeafInputs({
                                  ...leafInputs,
                                  [r.id]: e.target.value,
                                })
                              }
                            />
                          </label>
                        ))}
                        <button className="primary full" onClick={rawInputs}>
                          Stage leaf values
                        </button>
                      </>
                    ) : (
                      <p className="subtle">
                        Inputs belong to leaves. Rules are stored on the root.
                      </p>
                    )}
                    <dl className="metric-values">
                      {Object.entries(
                        metrics.byNode[node.id]?.values ?? {},
                      ).map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>
                            {formatMetric(v)}
                            {metrics.byNode[node.id]?.thresholds[k] !==
                              undefined && (
                              <b
                                className={
                                  metrics.byNode[node.id]?.thresholds[k]
                                    ? "success"
                                    : "danger"
                                }
                              >
                                {" "}
                                {metrics.byNode[node.id]?.thresholds[k] === null
                                  ? "UNKNOWN"
                                  : metrics.byNode[node.id]?.thresholds[k]
                                    ? "PASS"
                                    : "FAIL"}
                              </b>
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div className="notebox">
                      Status: {metrics.byNode[node.id]?.status}. Scenario:{" "}
                      {metrics.byNode[node.id]?.selectedScenarioId ?? "none"}.
                      <br />
                      Shared contribution or scenario limits are reported under
                      Validation.
                    </div>
                  </div>
                </>
              )}
              {path && (
                <div className="inspector-section">
                  <span className="eyebrow">FULL PATH · {path.status}</span>
                  <ol>
                    {path.nodeIds.map((id) => (
                      <li key={id}>
                        {index.nodes.get(id)?.label}
                        <code>{index.nodes.get(id)?.hid}</code>
                      </li>
                    ))}
                  </ol>
                  <p>{path.reason}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <span className="eyebrow">INSPECTOR</span>
              <h2>Select a card or connection</h2>
              <p className="subtle">
                Inspect identity, edit leaf inputs, or review the root’s
                calculated results.
              </p>
              <div className="notebox">
                Right-click a card to roll its branch up or down. Folding never
                changes metrics or model limits.
              </div>
            </>
          )}
        </aside>
      </main>
      <section className="summary-strip">
        <div>
          <span className="eyebrow">
            ROOT CALCULATION ·{" "}
            {draft.root.AnalysisProfileJSON.mode === "scenario"
              ? "COHERENT SCENARIO"
              : "INDEPENDENT SCALAR BOUNDS"}
          </span>
          <strong>
            {metrics.root.status === "blocked"
              ? "No successful scenario (blocked)"
              : metrics.complete
                ? "Complete calculation"
                : "Incomplete calculation"}
          </strong>
          <small>
            {metrics.scenarioCount} scenarios · {paths.rvCount} unaddressed RV
            routes
          </small>
        </div>
        {[
          "AttackCost",
          "AttackFeasibility",
          "Propensity",
          "RelativeRisk",
          "ALE",
        ].map((k) => (
          <div key={k}>
            <span>{k}</span>
            <strong>
              {draft.root.AnalysisProfileJSON.mode === "scalar" &&
              k !== "AttackCost"
                ? "Not applicable"
                : formatMetric(metrics.root.values[k])}
            </strong>
          </div>
        ))}
        <button onClick={() => focus(draft.rootId)}>Inspect root ↗</button>
      </section>
      <footer>
        <span role="status">{notice}</span>
        <span>Core: {draft.core?.status ?? "Unknown"} · {findings.length} findings</span>
        <span>ELK Layered · Core database · staged transaction</span>
      </footer>
      {context && (
        <div
          className="context-menu"
          role="menu"
          style={{ left: context.x, top: context.y }}
        >
          <span className="eyebrow">{index.nodes.get(context.id)?.label}</span>
          <button
            role="menuitem"
            disabled={!index.outgoing.get(context.id)?.length}
            onClick={() => toggleFold(context.id)}
          >
            {view.collapsed.includes(context.id)
              ? "Roll down branch"
              : "Roll up branch"}
          </button>
          <button
            role="menuitem"
            onClick={() => {
              focus(context.id);
              setContext(null);
            }}
          >
            Focus card
          </button>
          <button
            role="menuitem"
            onClick={() => {
              update((t) => {
                t.root.AttackTreeJSON.collapsed = [];
              }, false);
              setContext(null);
            }}
          >
            Roll down all
          </button>
        </div>
      )}
      {dialog === "message" && (
        <Modal title="Operation report" onClose={() => setDialog(null)}>
          <p className="dialog-message" role="alert">
            {message}
          </p>
          <button className="primary" onClick={() => setDialog(null)}>
            Understood
          </button>
        </Modal>
      )}
      {dialog === "properties" && (
        <Modal title="Displayed properties" onClose={() => setDialog(null)}>
          <p>
            Choose optional card body rows. Title, type and HID remain visible.
            Settings are stored on this Loss root.
          </p>
          <fieldset className="property-section">
            <legend>Node properties</legend>
            <p className="subtle">
              Node ID identifies a node within this attack tree. Authoritative
              UUID identifies its authoritative Neo4j record. New nodes are marked
              “not yet committed” until a successful Core database commit assigns
              their HID and UUID.
            </p>
            <div className="node-property-options">
              {NODE_PROPERTY_OPTIONS.map(({ key, label }) => (
                <label className="check" key={key}>
                  <input
                    type="checkbox"
                    checked={selectedNodePropertyKeys(view).includes(key)}
                    onChange={(e) => {
                      update((t) => {
                        const presentation = t.root.AttackTreeJSON;
                        const keys = selectedNodePropertyKeys(presentation);
                        presentation.selectedProperties =
                          selectedMetricPropertyKeys(presentation);
                        presentation.selectedNodeProperties = e.target.checked
                          ? [...keys, key]
                          : keys.filter((k) => k !== key);
                      }, false);
                      setTimeout(() => void arrange(latest.current, false), 0);
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="property-section">
            <legend>Attack metrics</legend>
            <div className="property-options">
              {[
                ...draft.root.MetricDefinitionsJSON.map((r) => r.id),
                ...derivedMetricNames,
              ].map((k) => (
                <label className="check" key={k}>
                  <input
                    type="checkbox"
                    checked={selectedMetricPropertyKeys(view).includes(k)}
                    onChange={(e) => {
                      update((t) => {
                        const nodeKeys = selectedNodePropertyKeys(
                          t.root.AttackTreeJSON,
                        );
                        const metricKeys = selectedMetricPropertyKeys(
                          t.root.AttackTreeJSON,
                        );
                        t.root.AttackTreeJSON.selectedNodeProperties = nodeKeys;
                        t.root.AttackTreeJSON.selectedProperties = e.target
                          .checked
                          ? [...metricKeys, k]
                          : metricKeys.filter((x) => x !== k);
                      }, false);
                      setTimeout(() => void arrange(latest.current, false), 0);
                    }}
                  />
                  {draft.root.MetricDefinitionsJSON.find((r) => r.id === k)
                    ?.label ?? k}
                </label>
              ))}
            </div>
          </fieldset>
          <button className="primary" onClick={() => setDialog(null)}>
            Done
          </button>
        </Modal>
      )}
      {dialog === "colors" && (
        <Modal title="Node type colors" onClose={() => setDialog(null)}>
          <p>
            Four color channels per node type. Outgoing lines use the source
            type’s line color.
          </p>
          <label>
            Node type
            <select
              aria-label="Color node type"
              value={colorType}
              onChange={(e) => setColorType(e.target.value as NodeType)}
            >
              {NODE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <div className="color-grid">
            {(["font", "box", "line", "border"] as const).map((key) => (
              <label key={key}>
                {key} color
                <input
                  type="color"
                  aria-label={`${key} color`}
                  value={view.nodeStyles[colorType][key]}
                  onInput={(e) => {
                    const color = e.currentTarget.value;
                    update((t) => {
                      t.root.AttackTreeJSON.nodeStyles[colorType][key] = color;
                    }, false);
                  }}
                  onChange={(e) => {
                    const color = e.target.value;
                    update((t) => {
                      t.root.AttackTreeJSON.nodeStyles[colorType][key] = color;
                    }, false);
                  }}
                />
                <code>{view.nodeStyles[colorType][key]}</code>
              </label>
            ))}
          </div>
          <button
            onClick={() =>
              update((t) => {
                t.root.AttackTreeJSON.nodeStyles = defaultStyles();
              }, false)
            }
          >
            Reset default colors
          </button>
          <button className="primary" onClick={() => setDialog(null)}>
            Done
          </button>
        </Modal>
      )}
      {dialog === "rules" && (
        <Modal title="Root metric rules" wide onClose={() => setDialog(null)}>
          <p>
            Controlled operators only. Leaf defaults are explicit; a blank
            default means unknown. Profile utilities and opportunity assumptions
            travel with this root.
          </p>
          <div className="rules-table">
            <table>
              <thead>
                <tr>
                  {[
                    "ID / Label",
                    "Unit / Description",
                    "AND",
                    "OR",
                    "SAND",
                    "Default / Min / Max",
                    "Threshold",
                    "Actions",
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rules.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        aria-label={`Metric ID ${i}`}
                        disabled={defaultMetricRules().some(
                          (p) => p.id === r.originalId,
                        )}
                        value={r.id}
                        onChange={(e) =>
                          setRules((rs) =>
                            rs.map((r, j) =>
                              j === i ? { ...r, id: e.target.value } : r,
                            ),
                          )
                        }
                      />
                      <input
                        aria-label={`Metric label ${i}`}
                        value={r.label}
                        onChange={(e) =>
                          setRules((rs) =>
                            rs.map((r, j) =>
                              j === i ? { ...r, label: e.target.value } : r,
                            ),
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        aria-label={`Metric unit ${i}`}
                        value={r.unit}
                        onChange={(e) =>
                          setRules((rs) =>
                            rs.map((r, j) =>
                              j === i ? { ...r, unit: e.target.value } : r,
                            ),
                          )
                        }
                      />
                      <input
                        aria-label={`Metric description ${i}`}
                        value={r.description ?? ""}
                        onChange={(e) =>
                          setRules((rs) =>
                            rs.map((r, j) =>
                              j === i
                                ? { ...r, description: e.target.value }
                                : r,
                            ),
                          )
                        }
                      />
                    </td>
                    {(["and", "or", "sand"] as const).map((g) => (
                      <td key={g}>
                        <select
                          aria-label={`${r.id} ${g}`}
                          value={r[g]}
                          onChange={(e) =>
                            setRules((rs) =>
                              rs.map((r, j) =>
                                j === i ? { ...r, [g]: e.target.value } : r,
                              ),
                            )
                          }
                        >
                          {["SUM", "PRODUCT", "MIN", "MAX"].map((op) => (
                            <option key={op}>{op}</option>
                          ))}
                        </select>
                      </td>
                    ))}
                    <td>
                      {(["defaultValue", "min", "max"] as const).map((k) => (
                        <input
                          key={k}
                          aria-label={`${r.id} ${k}`}
                          type="number"
                          step="any"
                          placeholder={k}
                          value={r[k] ?? ""}
                          onChange={(e) =>
                            setRules((rs) =>
                              rs.map((r, j) =>
                                j === i
                                  ? {
                                      ...r,
                                      [k]:
                                        e.target.value === ""
                                          ? k === "defaultValue"
                                            ? null
                                            : undefined
                                          : Number(e.target.value),
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      ))}
                    </td>
                    <td>
                      <input
                        aria-label={`${r.id} threshold`}
                        type="number"
                        step="any"
                        placeholder="None"
                        value={r.threshold ?? ""}
                        onChange={(e) =>
                          setRules((rs) =>
                            rs.map((r, j) =>
                              j === i
                                ? {
                                    ...r,
                                    threshold:
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value),
                                    thresholdDirection:
                                      r.thresholdDirection ?? "ABOVE",
                                  }
                                : r,
                            ),
                          )
                        }
                      />
                      <select
                        aria-label={`${r.id} threshold direction`}
                        value={r.thresholdDirection ?? "ABOVE"}
                        onChange={(e) =>
                          setRules((rs) =>
                            rs.map((r, j) =>
                              j === i
                                ? {
                                    ...r,
                                    thresholdDirection: e.target.value as
                                      | "ABOVE"
                                      | "BELOW",
                                  }
                                : r,
                            ),
                          )
                        }
                      >
                        <option>ABOVE</option>
                        <option>BELOW</option>
                      </select>
                    </td>
                    <td>
                      <button
                        aria-label={`Duplicate ${r.id}`}
                        onClick={() =>
                          setRules((rs) => [
                            ...rs,
                            {
                              ...r,
                              originalId: undefined,
                              id: `${r.id}Copy`,
                              label: `${r.label} copy`,
                            },
                          ])
                        }
                      >
                        Copy
                      </button>
                      <button
                        aria-label={`Delete ${r.id}`}
                        disabled={defaultMetricRules().some(
                          (p) => p.id === r.originalId,
                        )}
                        onClick={() =>
                          setRules((rs) => rs.filter((_, j) => j !== i))
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() =>
              setRules((rs) => [
                ...rs,
                {
                  id: `CustomMetric${rs.length}`,
                  label: "Custom property",
                  unit: "rating",
                  and: "SUM",
                  or: "MAX",
                  sand: "SUM",
                  defaultValue: null,
                  min: 0,
                },
              ])
            }
          >
            Add metric
          </button>
          <details>
            <summary>
              Actor, victim, utilities and opportunity configuration
            </summary>
            <p>
              JSON configuration uses named metric keys and piecewise linear
              curves; it is data, never executable code.
            </p>
            <textarea
              className="profile-json"
              aria-label="Analysis profile JSON"
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
            />
          </details>
          {ruleTextError && (
            <p className="danger" role="alert">
              {ruleTextError}
            </p>
          )}
          <div className="modal-actions">
            <button onClick={() => setDialog(null)}>Cancel</button>
            <button
              className="primary"
              onClick={() => {
                try {
                  const profile = JSON.parse(profileText);
                  const errors = validateMetricConfiguration(rules, profile);
                  if (errors.length) {
                    setRuleTextError(errors.join("\n"));
                    return;
                  }
                  if (
                    update((t) => {
                      const previous = t.root.MetricDefinitionsJSON;
                      for (const n of t.nodes) {
                        const next: TreeNode["metrics"] = {};
                        for (const r of rules) {
                          const before = previous.find(
                            (old) => old.id === r.id,
                          );
                          if (before && r.id in n.metrics)
                            next[r.id] = n.metrics[r.id];
                          else {
                            const old = previous.find(
                              (x) => x.id === r.originalId,
                            );
                            if (
                              old &&
                              old.id in n.metrics &&
                              !rules.some((x) => x.id === old.id)
                            )
                              next[r.id] = n.metrics[old.id];
                          }
                        }
                        n.metrics = next;
                      }
                      t.root.MetricDefinitionsJSON = rules.map(
                        ({ originalId: _originalId, ...r }) => r,
                      );
                      t.root.AnalysisProfileJSON = profile;
                    })
                  )
                    setDialog(null);
                } catch (e) {
                  setRuleTextError(String(e));
                }
              }}
            >
              Stage rules
            </button>
          </div>
        </Modal>
      )}
      {dialog === "add" && node && (
        <Modal title="Add child node" onClose={() => setDialog(null)}>
          <p>Parent: {node.label}. A new Attack or Countermeasure is staged for the Core database. Use the appropriate SSTPA tool to create structural entities.</p>
          <label>
            Type
            <select
              aria-label="New node type"
              value={newType}
              onChange={(e) => setNewType(e.target.value as NodeType)}
            >
              {allowedChildren[node.type].filter(t => t === "Attack" || t === "Countermeasure").map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Name
            <input
              autoFocus
              aria-label="New node name"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </label>
          <button className="primary" onClick={addNode}>
            Stage new node
          </button>
        </Modal>
      )}
      {dialog === "link" && node && (
        <Modal title="Link existing node" onClose={() => setDialog(null)}>
          <p>
            A shared node retains its identity and inputs. Cycles and over-limit
            links are rejected.
          </p>
          <label>
            Existing node
            <select
              aria-label="Existing node"
              value={linkId}
              onChange={(e) => setLinkId(e.target.value)}
            >
              <option value="">Select…</option>
              {[...draft.nodes, ...candidates.filter(n => !draft.nodes.some(d => d.hid === n.hid))]
                .filter((n) => allowedChildren[node.type].includes(n.type))
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label} · {n.hid}
                  </option>
                ))}
            </select>
          </label>
          <button
            className="primary"
            disabled={!linkId}
            onClick={() => {
              if (
                update((t) => {
                  const existing = t.nodes.find(n => n.id === linkId) ?? candidates.find(n => n.id === linkId);
                  if (!existing) throw new Error("Selected Core node is no longer available.");
                  if(!t.nodes.some(n => n.hid === existing.hid)) t.nodes.push(clone(existing));
                  t.edges.push(makeEdge(t, node.id, existing.id));
                  normalizeSequences(t);
                })
              ) {
                setDialog(null);
                setTimeout(() => void arrange(latest.current), 0);
              }
            }}
          >
            Stage connection
          </button>
        </Modal>
      )}
      {dialog === "export" && (
        <Modal
          title="Export analysis"
          onClose={() => setDialog(null)}
        >
          <p>
            Exports include the current staged revision. SVG includes the
            complete visible projection, including offscreen cards.
          </p>
          {(draft.core?.status === "INVALIDATED" || findings.some(f=>["ERROR","WARNING"].includes(f.severity))) && <div className="warning" role="alert">
            Core validation has unresolved findings. These exports contain staged analytical evidence and are not a validated baseline.
            <ul>{findings.filter(f=>["ERROR","WARNING"].includes(f.severity)).map((f,i)=><li key={i}>{f.type}: {f.message}</li>)}</ul>
            <label className="check"><input type="checkbox" checked={exportAcknowledged} onChange={e=>setExportAcknowledged(e.target.checked)}/>I acknowledge the Core findings and will retain the warnings with this export.</label>
          </div>}
          <fieldset disabled={(draft.core?.status === "INVALIDATED" || findings.some(f=>["ERROR","WARNING"].includes(f.severity))) && !exportAcknowledged} className="export-actions">
            <button
              onClick={() =>
                download(
                  "attack-tree.json",
                  JSON.stringify(draft, null, 2),
                  "application/json",
                )
              }
            >
              Tree JSON
            </button>
            <button
              onClick={() =>
                download("attack-paths.csv", pathsCSV(draft), "text/csv")
              }
            >
              Path CSV
            </button>
            <button
              onClick={() =>
                download("attack-tree.svg", diagramSVG(draft), "image/svg+xml")
              }
            >
              Visible diagram SVG
            </button>
            <button
              onClick={() =>
                download(
                  "loss-evidence.md",
                  evidenceMarkdown(draft),
                  "text/markdown",
                )
              }
            >
              RV evidence Markdown
            </button>
          </fieldset>

        </Modal>
      )}
    </div>
  );
}
