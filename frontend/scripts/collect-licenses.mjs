import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Offline distribution gate. Upstream notices/source are acquired and reviewed
// separately; ordinary builds neither download nor silently substitute them.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const read = (file) => readFileSync(resolve(root, file));
const json = (file) => JSON.parse(read(file));
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const write = (file, data) => {
  const dest = resolve(root, "public/licenses", file);
  if (check) {
    if (!existsSync(dest) || !readFileSync(dest).equals(Buffer.from(data)))
      throw new Error(`Stale license artifact: ${file}`);
  } else {
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, data);
  }
};
const writeJson = (file, value) =>
  write(file, JSON.stringify(value, null, 2) + "\n");
const source = json("scripts/elk-sources.json");
const supplemental = json("scripts/supplemental-notices.json");
const fontAssets = json("scripts/font-assets.json");
const lock = json("package-lock.json");
if (lock.packages["node_modules/elkjs"]?.version !== source.elkjsVersion)
  throw new Error("ELK version differs from corresponding-source manifest");
if (lock.packages["node_modules/cytoscape-svg"])
  throw new Error("Remove the superseded GPL SVG plugin before packaging");
for (const artifact of [
  ...source.sources,
  ...source.notices,
  ...supplemental,
]) {
  if (sha(read(`public/licenses/${artifact.file}`)) !== artifact.sha256)
    throw new Error(`Source/notice checksum mismatch: ${artifact.file}`);
}
for (const artifact of source.unmodifiedDistributionFiles) {
  if (sha(read(artifact.file)) !== artifact.sha256)
    throw new Error(
      `Modified ELK distribution requires matching reviewed source: ${artifact.file}`,
    );
}
for (const font of fontAssets) {
  if (sha(read(font.file)) !== font.sha256)
    throw new Error(
      `Bundled font changed; review its version and notice: ${font.file}`,
    );
}
if (!check)
  rmSync(resolve(root, "public/licenses/npm"), {
    recursive: true,
    force: true,
  });
const packages = [];
for (const [location, entry] of Object.entries(lock.packages)) {
  if (!location || entry.dev) continue;
  const pkg = json(`${location}/package.json`); // A missing runtime package fails the build.
  if (pkg.version !== entry.version)
    throw new Error(`Installed package differs from lock: ${location}`);
  const files = readdirSync(resolve(root, location), { withFileTypes: true })
    .filter(
      (f) =>
        f.isFile() &&
        /^(LICEN[CS]E|COPYING|NOTICE|COPYRIGHT)([._-].*)?$/i.test(f.name),
    )
    .map((f) => {
      const file = `npm/${pkg.name.replaceAll("/", "__")}@${pkg.version}/${f.name}`;
      write(file, read(`${location}/${f.name}`));
      return file;
    });
  const additions = supplemental.filter(
    (s) => s.name === pkg.name && s.version === pkg.version,
  );
  files.push(...additions.map((s) => s.file));
  if (!files.length)
    throw new Error(`Missing original notice for ${pkg.name}@${pkg.version}`);
  packages.push({
    name: pkg.name,
    version: pkg.version,
    license: pkg.name === "elkjs" ? "EPL-2.0 (elected)" : pkg.license,
    declaredLicense: pkg.license,
    category: "Frontend dependency",
    source:
      typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url,
    integrity: entry.integrity,
    files: [...new Set(files)],
    ...(additions.some((s) => s.note)
      ? {
          note: additions
            .map((s) => s.note)
            .filter(Boolean)
            .join(" "),
        }
      : {}),
  });
}
packages.sort((a, b) => a.name.localeCompare(b.name));
const fonts = supplemental
  .filter((s) => s.file.startsWith("fonts/"))
  .map((s) => ({
    name: s.name,
    version: s.version,
    license: s.license,
    source: s.url,
    category: "Bundled font",
    files: [s.file],
  }));
const embedded = source.sources.map((s) => ({
  name: s.component,
  version: s.version ?? "See source archive",
  license: s.license,
  source: s.url,
  category: "ELK corresponding source",
  files: source.notices.map((n) => n.file),
  archives: [s.file],
}));
const catalog = {
  schemaVersion: 1,
  scope:
    "Verified offline notices cover the installed npm production dependency closure, bundled fonts and ELK embedded components. The product SBOM separately inventories Backend, native shells, toolchains, services, sustainment and reference data; it is not a claim of complete per-artifact notice coverage for those systems.",
  lockSha256: sha(read("package-lock.json")),
  components: [...packages, ...fonts, ...embedded],
};
writeJson("catalog.json", catalog);
writeJson("npm-manifest.json", packages);
writeJson("source-manifest.json", source);
writeJson("supplemental-notices.json", supplemental);
writeJson("font-assets.json", fontAssets);
write("SBOM.md", read("../docs/SBOM.md"));
write("PRODUCT-NOTICE.txt", read("../NOTICE"));
write("THIRD-PARTY-NOTICES.md", read("../docs/THIRD-PARTY-NOTICES.md"));
const esc = (x) =>
  String(x)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
write(
  "index.html",
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SSTPA Tools licenses</title><style>body{max-width:1100px;margin:auto;padding:2rem;font:16px/1.5 system-ui}td,th{text-align:left;vertical-align:top;padding:.7rem;border-bottom:1px solid #bbb}table{border-collapse:collapse;width:100%}</style><h1>SSTPA Tools — third-party licenses</h1><p>${esc(catalog.scope)}</p><p><a href="SBOM.md">Full product SBOM</a> · <a href="THIRD-PARTY-NOTICES.md">Packaging details</a> · <a href="PRODUCT-NOTICE.txt">Product notice</a> · <a href="source-manifest.json">ELK source provenance</a></p><table><thead><tr><th>Component</th><th>License</th><th>Notices and source archives</th></tr></thead><tbody>${catalog.components.map((c) => `<tr><td>${esc(c.name)} ${esc(c.version)}<br><small>${esc(c.category)}</small></td><td>${esc(c.license)}</td><td>${[...c.files, ...(c.archives ?? [])].map((f) => `<a href="${esc(f)}">${esc(f.split("/").at(-1))}</a>`).join("<br>")}</td></tr>`).join("")}</tbody></table></html>\n`,
);
console.log(
  `${check ? "Checked" : "Generated"} offline notices: ${packages.length} npm packages, ${fonts.length} fonts, ${source.sources.length} matching ELK source archives.`,
);
