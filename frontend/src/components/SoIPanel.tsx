// System of Interest Panel (SRS §6.3.3): shows current SoI HID/Name/
// ShortDescription (not editable), Edit icon → Data Drawer, child SoI chips,
// and an up-arrow to the parent SoI. With no SoI selected, presents the
// (:Project) root and "Select a System of Interest".
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useDrawer, useSoI } from "../state/stores";

export function SoIPanel() {
  const { soiHid, setSoI } = useSoI();
  const openDrawer = useDrawer((s) => s.openDrawer);
  const drawerOpen = useDrawer((s) => s.open);

  const hierarchy = useQuery({
    queryKey: ["hierarchy"],
    queryFn: api.hierarchy,
    refetchInterval: 30000,
  });
  const entries = hierarchy.data?.entries ?? [];

  const soiNode = useQuery({
    queryKey: ["node", soiHid],
    queryFn: () => api.nodeByHid(soiHid!),
    enabled: !!soiHid,
  });

  // Children of the current SoI: systems whose parent Component lives in this
  // SoI, or tier-1 systems under the Project when no SoI is selected.
  const project = entries.find((e) => e.typeName === "Project");
  const soiIndex = soiHid ? soiHid.split("_")[1] : null;
  const children = entries.filter((e) => {
    if (e.typeName !== "System") return false;
    if (!soiHid) return e.parentHid === project?.hid;
    if (!e.parentHid) return false;
    // Parent is a Component in the current SoI: EL_<soiIndex>_n
    const parts = e.parentHid.split("_");
    return parts[0] === "EL" && parts[1] === soiIndex;
  });

  const parentOfSoI = (() => {
    if (!soiHid) return null;
    const me = entries.find((e) => e.hid === soiHid);
    if (!me?.parentHid) return null;
    if (me.parentHid.startsWith("CAP")) return { hid: null };
    // Parent component's SoI root system
    const parentIndex = me.parentHid.split("_")[1];
    return { hid: `SYS_${parentIndex}_0` };
  })();

  const props = soiNode.data?.properties ?? {};

  return (
    <section className="soi-panel sstpa-panel">
      {soiHid ? (
        <>
          <button
            className="icon-button"
            title="Navigate to parent System of Interest"
            disabled={!parentOfSoI && !soiHid}
            onClick={() => setSoI(parentOfSoI?.hid ?? null)}
            style={{ fontSize: "1.05rem" }}
          >
            ⬆
          </button>
          <div className="soi-identity">
            <div className="soi-hid">{soiHid}</div>
            <div className="soi-name">
              {String(props.Name ?? soiNode.data?.hid ?? "…")}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--sstpa-navy-muted)" }}>
              {String(props.ShortDescription ?? "") === "null"
                ? ""
                : String(props.ShortDescription ?? "")}
            </div>
          </div>
          <button
            className="icon-button"
            title="Edit System of Interest properties"
            disabled={drawerOpen}
            onClick={() => openDrawer({ mode: "edit", hid: soiHid })}
          >
            ✎ Edit
          </button>
        </>
      ) : (
        <div className="soi-identity">
          <div className="soi-hid">{project?.hid ?? "No Capability yet"}</div>
          <div className="soi-name">
            {project?.name ?? "SSTPA Tools"} — Select a System of Interest
          </div>
        </div>
      )}
      <div className="soi-children">
        {children.map((c) => (
          <button
            key={c.hid}
            className="soi-chip"
            title={`${c.hid} — make this the current SoI`}
            onClick={() => setSoI(c.hid)}
          >
            <span className="mono" style={{ fontSize: "0.68rem" }}>
              {c.hid}
            </span>{" "}
            {c.name}
          </button>
        ))}
        {children.length === 0 && soiHid && (
          <span
            style={{ fontSize: "0.78rem", color: "var(--sstpa-navy-muted)" }}
          >
            No child systems
          </span>
        )}
      </div>
    </section>
  );
}
