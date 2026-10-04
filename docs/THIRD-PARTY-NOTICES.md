# SSTPA Tools — third-party notices and source availability

SSTPA Tools application code remains proprietary under the root `NOTICE`.
Third-party components retain their original copyrights and licenses. The global
**Product & license information** viewer is available independently of the Loss
Tool and reads its catalog, license texts and source links from bundled files.

## Verified frontend package

`frontend/scripts/collect-licenses.mjs` reads the actual frontend lockfile and
installed production dependency closure, checks installed versions, and copies
original LICENSE/COPYING/NOTICE/COPYRIGHT files. It fails for a missing package
or missing notice. This conservative closure includes production-declared type
packages whose types are erased from browser JavaScript. Exact versions,
upstream locations, package integrity hashes and files appear in
`frontend/public/licenses/npm-manifest.json`; `catalog.json` records the lockfile
SHA-256. Bundled IBM Plex Sans, JetBrains Mono and Libre Baskerville fonts are
covered by their upstream OFL-1.1 texts. Their displayed versions are extracted
from the actual font name tables, not inferred from current upstream releases.
`frontend/scripts/font-assets.json` binds those records to the seven bundled
WOFF2 file hashes; a changed font requires a reviewed notice/version refresh.

The npm distributions of `@tauri-apps/api` and `react-remove-scroll-bar` omit
license text. Their original upstream notices are pinned separately in
`frontend/scripts/supplemental-notices.json`, with URLs and SHA-256 checksums.
The latter package's npm gitHead is unavailable in its public repository; its
MIT declaration and pinned upstream repository notice are disclosed explicitly.
No guessed copyright text is substituted. Builds use the checked-in notices
and never fetch a replacement from the network.

## ELK corresponding source

The Loss Tool uses unmodified ELK.js **0.12.0** under the **Eclipse Public License
2.0** option. ELK.js offers `EPL-2.0 OR GPL-3.0-or-later`; this distribution elects
EPL-2.0. This election does not change ancillary components' own licenses.
Original ELK copyright/notice text and the EPL license are bundled. Matching
ELK.js sources and the Java Eclipse Layout Kernel source are available offline
in `licenses/sources/`, together with the EMF, Xtend/Xbase, GWT and Guava sources
identified by ELK.js's release build configuration. EMF components retain
EPL-1.0; the other components retain the licenses in the source manifest.

`frontend/scripts/elk-sources.json` records exact upstream revisions, artifact
URLs and SHA-256 hashes. The ELK.js revision is
`ff5771d7165445c42c408bb8a090c8035272218c`; Eclipse ELK is
`323312916048544e4e594eab3303cdb0d01e2929` (v0.12.0). All nine installed ELK
distribution library/declaration files are compared with release hashes. The
classic worker is emitted as a raw Vite URL asset so its bytes remain unchanged.
Source build instructions and original notices remain in the upstream archives.
This is source correspondence and byte identity verification of the distributed
ELK.js release, not a claim that we reproduced the upstream compiler output.
Optional libavoid mentioned in the complete ELK source archive is not an input
to the distributed ELK.js build.

EPL-covered source and any modifications remain available under their respective
EPL terms; no proprietary application-code license grant is implied. The source
archives are included rather than depending on continued access to external
websites. The Amenaza reference paper is not part of this package.

## Product-wide inventory and scope

`docs/SBOM.md` remains the broader inventory for Backend Go dependencies, Rust
native shells, build tooling, separate container services, sustainment Python
dependencies and reference data. The viewer exposes that inventory and the
product notice offline. The frontend notice verification is **not** a claim
that every Go module, Rust crate, container-image layer or Python transitive
dependency has been individually audited or had its license text collected.
Their authoritative manifests and existing scope qualifications remain visible.
Database-supplied Product component records are shown separately from the
verified bundled catalog, because database metadata does not prove packaging.

The previously used `cytoscape-svg` package declared GPLv3 and was absent from the
old SBOM. It has been replaced by original SSTPA vector serialization using only
the MIT Cytoscape.js public graph/style/geometry APIs. No code from that plugin is
included. `docs/SVG-EXPORT.md` records supported geometry and rendering limits.

## Offline distribution and verification

`npm run licenses` regenerates the catalog before each frontend build. The
`--check` collector mode verifies current generated files without rewriting
them. Vite includes `public/licenses` in `dist/licenses`; Tauri embeds the
frontend assets and also maps the folder to its native `licenses/` resources.
The installer separately stages `payload/licenses`, including source archives,
and covers it with the release SHA256SUMS. `node scripts/verify-license-package.mjs`
checks built assets against the source package and the raw ELK worker bytes.
No network is required to view notices or retrieve the bundled source archives.
External upstream URLs are supplemental provenance links only.
