import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(root, p));
const sha = (b) => createHash("sha256").update(b).digest("hex");
execFileSync(process.execPath, ["scripts/collect-licenses.mjs", "--check"], {
  cwd: root,
  stdio: "inherit",
});
const tauri = JSON.parse(read("src-tauri/tauri.conf.json"));
assert.match(tauri.app.security.csp, /(?:^|;)\s*worker-src\s+'self'(?:\s*;|$)/);
assert.equal(tauri.build.frontendDist, "../dist");
assert.equal(tauri.bundle.resources["../public/licenses/"], "licenses/");
assert.match(
  read("../installer/scripts/build-package.sh").toString(),
  /payload\/licenses/,
);
const files = (dir, prefix = "") =>
  readdirSync(resolve(root, dir, prefix), { withFileTypes: true }).flatMap(
    (e) =>
      e.isDirectory()
        ? files(dir, `${prefix}${e.name}/`)
        : [`${prefix}${e.name}`],
  );
const sourceFiles = files("public/licenses");
for (const file of sourceFiles)
  assert.equal(
    sha(read(`public/licenses/${file}`)),
    sha(read(`dist/licenses/${file}`)),
    `Built notice differs: ${file}`,
  );
const assetHashes = new Set(
  files("dist/assets").map((file) => sha(read(`dist/assets/${file}`))),
);
for (const font of JSON.parse(read("scripts/font-assets.json"))) {
  assert.ok(
    assetHashes.has(font.sha256),
    `Bundled font missing or changed: ${font.file}`,
  );
}
const manifest = JSON.parse(read("scripts/elk-sources.json"));
const worker = files("dist/assets").find((name) =>
  /^elk-worker\.min-.*\.js$/.test(name),
);
assert.ok(worker, "Missing local ELK worker asset");
assert.equal(
  sha(read(`dist/assets/${worker}`)),
  manifest.unmodifiedDistributionFiles.find((x) =>
    x.file.endsWith("/elk-worker.min.js"),
  ).sha256,
  "Bundled ELK worker is modified",
);
const packageArg = process.argv.indexOf("--package");
let installer = null;
if (packageArg >= 0) {
  assert.ok(
    process.argv[packageArg + 1],
    "--package requires the staged package directory",
  );
  const dir = resolve(process.argv[packageArg + 1]);
  for (const file of sourceFiles) {
    assert.equal(
      sha(readFileSync(resolve(dir, "payload/licenses", file))),
      sha(read(`public/licenses/${file}`)),
      `Installer license differs: ${file}`,
    );
  }
  const sums = readFileSync(resolve(dir, "SHA256SUMS"), "utf8")
    .trim()
    .split("\n");
  for (const line of sums) {
    const match = /^([a-f0-9]{64}) [ *](.+)$/.exec(line);
    assert.ok(match, `Invalid package checksum entry: ${line}`);
    assert.equal(
      sha(readFileSync(resolve(dir, match[2]))),
      match[1],
      `Package checksum mismatch: ${match[2]}`,
    );
  }
  if (process.argv.includes("--require-native")) {
    const frontendBinary = read("src-tauri/target/release/sstpa-tools-gui");
    for (const asset of [
      ...sourceFiles.map((file) => `licenses/${file}`),
      `assets/${worker}`,
    ]) {
      assert.ok(
        frontendBinary.includes(Buffer.from(asset)),
        `Native binary lacks embedded production asset: ${asset}; enable tauri/custom-protocol`,
      );
    }
    for (const [folder, binary] of [
      ["frontend", "sstpa-tools-gui"],
      ["startup", "sstpa-startup"],
    ]) {
      assert.equal(
        sha(
          readFileSync(resolve(dir, `payload/bundles/${folder}/bin/${binary}`)),
        ),
        sha(read(`../${folder}/src-tauri/target/release/${binary}`)),
        `Staged native binary differs: ${binary}`,
      );
    }
  }
  installer = {
    directory: dir,
    checksumEntries: sums.length,
    licenseFiles: sourceFiles.length,
    nativeBinariesVerified: process.argv.includes("--require-native"),
  };
}
console.log(
  JSON.stringify(
    {
      passed: true,
      verifiedAt: new Date().toISOString(),
      licenseFiles: sourceFiles.length,
      worker,
      workerBytes: read(`dist/assets/${worker}`).length,
      lockSha256: sha(read("package-lock.json")),
      installer,
      checks: [
        "current lock dependency notices",
        "matching corresponding source",
        "all built license files byte-identical",
        "local worker byte-identical",
        "Tauri resources and same-origin worker CSP",
        "installer explicit offline notice staging",
      ],
    },
    null,
    2,
  ),
);
