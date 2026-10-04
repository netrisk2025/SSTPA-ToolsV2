// Shared locally bundled ELK engine for Loss and Goal Keeper.
import ELK, { type ELK as ElkEngine } from "elkjs/lib/elk-api.js";
import elkWorkerUrl from "elkjs/lib/elk-worker.min.js?url";

export async function createLayoutEngine(): Promise<{
  engine: ElkEngine;
  dispose: () => void;
}> {
  if (import.meta.env.SSR) {
    // Vite removes this branch from the browser build: a second, unused engine is not shipped.
    const { default: BundledELK } = await import("elkjs/lib/elk.bundled.js");
    return {
      engine: new BundledELK({ algorithms: ["layered"] }),
      dispose: () => {},
    };
  }
  if (typeof Worker === "undefined")
    throw new Error("This browser does not support the layout worker.");
  // Vite emits the unmodified file as a local asset; the classic worker runs off-thread.
  // No third-party CDN or main-thread browser layout fallback is used.
  const engine = new ELK({
    workerFactory: () => new Worker(elkWorkerUrl),
    algorithms: ["layered"],
  });
  return { engine, dispose: () => engine.terminateWorker() };
}

