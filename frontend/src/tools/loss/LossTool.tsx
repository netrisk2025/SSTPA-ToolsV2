// LossTool — interim scaffold; full implementation per its SRS §6.5 section.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { ToolScaffold } from "../ToolScaffold";
import type { ToolLaunchContext, ToolManifest } from "../manifest";

export default function LossTool(props: {
  ctx: ToolLaunchContext;
  manifest: ToolManifest;
}) {
  return <ToolScaffold {...props} note="Attack tree analysis per SRS §6.5.10 is being implemented." />;
}
