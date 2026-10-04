import { useEffect, useMemo, useState } from "react";

interface ComponentNotice {
  name: string;
  version: string;
  category: string;
  license: string;
  source?: string;
  files: string[];
  archives?: string[];
  note?: string;
}
interface Catalog {
  scope: string;
  components: ComponentNotice[];
}
const base = `${import.meta.env.BASE_URL}licenses/`;
const local = (file: string) =>
  base + file.split("/").map(encodeURIComponent).join("/");
const upstream = (source: string | undefined) => {
  const url = source?.replace(/^git\+/, "").replace(/\.git$/, "");
  return url && /^https:\/\//.test(url) ? url : undefined;
};

/** Global, offline view: licensing does not depend on a Loss or DB record. */
export function ProductLicenses() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [failure, setFailure] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [file, setFile] = useState("THIRD-PARTY-NOTICES.md");
  const [text, setText] = useState("");
  const [pending, setPending] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    fetch(local("catalog.json"), { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Catalog unavailable (${r.status})`);
        return r.json();
      })
      .then(setCatalog)
      .catch((e) => {
        if (e.name !== "AbortError") setFailure(String(e));
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setPending(true);
    setText("");
    fetch(local(file), { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Notice unavailable (${r.status})`);
        return r.text();
      })
      .then((value) => {
        setText(value);
        setPending(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setText(String(e));
          setPending(false);
        }
      });
    return () => controller.abort();
  }, [file]);
  const components = useMemo(
    () =>
      (catalog?.components ?? []).filter((c) =>
        `${c.name} ${c.version} ${c.license} ${c.category}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [catalog, query],
  );
  const current = catalog?.components.find(
    (c) => JSON.stringify([c.category,c.name,c.version,c.files]) === selected,
  );
  return (
    <section className="sstpa-license-viewer" aria-label="Third-party licenses">
      <h2>Third-party licenses &amp; source</h2>
      <p className="sstpa-license-scope">
        {catalog?.scope ??
          "Bundled notices are available without a network connection or selected Loss."}
      </p>
      {failure && (
        <p className="sstpa-alert-error" role="alert">
          The bundled license catalog could not be loaded. Product documents
          remain available below.
        </p>
      )}
      <nav
        className="sstpa-license-documents"
        aria-label="Product license documents"
      >
        {[
          ["Packaging details", "THIRD-PARTY-NOTICES.md"],
          ["Full product SBOM", "SBOM.md"],
          ["Product notice", "PRODUCT-NOTICE.txt"],
          ["Source provenance", "source-manifest.json"],
        ].map(([title, name]) => (
          <button
            key={name}
            className="sstpa-button secondary"
            onClick={() => {
              setSelected("");
              setFile(name);
            }}
          >
            {title}
          </button>
        ))}
      </nav>
      <div className="sstpa-license-columns">
        <div className="sstpa-license-index">
          <label htmlFor="license-filter">Find a component</label>
          <input
            id="license-filter"
            className="sstpa-input"
            type="search"
            placeholder="Name or license…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <p className="sstpa-license-count">
            {components.length} bundled entries
          </p>
          <div
            className="sstpa-license-list"
            role="group"
            aria-label="Bundled components"
          >
            {components.map((c) => (
              <button
                className="sstpa-license-item"
                aria-current={
                  selected === JSON.stringify([c.category,c.name,c.version,c.files]) ? "true" : undefined
                }
                key={JSON.stringify([c.category,c.name,c.version,c.files])}
                onClick={() => {
                  setSelected(JSON.stringify([c.category,c.name,c.version,c.files]));
                  setFile(c.files[0]);
                }}
              >
                <strong>{c.name}</strong>
                <span>
                  {c.version} · {c.license}
                </span>
                <small>{c.category}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="sstpa-license-content">
          {current && (
            <div>
              <h3>
                {current.name} <small>{current.version}</small>
              </h3>
              <p>
                {current.license}
                {upstream(current.source) && (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      href={upstream(current.source)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Upstream source
                    </a>
                  </>
                )}
              </p>
              {current.note && <p>{current.note}</p>}
              <div className="sstpa-license-documents">
                {current.files.map((f) => (
                  <button
                    key={f}
                    className="sstpa-button secondary"
                    onClick={() => setFile(f)}
                  >
                    {f.split("/").at(-1)}
                  </button>
                ))}
              </div>
              {!!current.archives?.length && (
                <p>
                  Corresponding source, included offline:{" "}
                  {current.archives.map((f) => (
                    <a key={f} href={local(f)} download>
                      {f.split("/").at(-1)}
                    </a>
                  ))}
                </p>
              )}
            </div>
          )}
          <div className="sstpa-license-document-title">
            <strong>{file.split("/").at(-1)}</strong>
            <a href={local(file)} download>
              Save file
            </a>
          </div>
          <pre
            className="sstpa-license-text"
            tabIndex={0}
            aria-label="License document"
            aria-busy={pending}
          >
            {pending ? "Loading bundled document…" : text}
          </pre>
        </div>
      </div>
    </section>
  );
}
