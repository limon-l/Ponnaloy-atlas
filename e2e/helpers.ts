import type { Page } from "@playwright/test";

/**
 * The demo store hydrates from localStorage in a mount effect. The motion
 * provider writes `data-motion` in the same commit, so it is a reliable
 * "client is interactive" signal without adding test-only markers to the UI.
 */
export async function waitForAtlas(page: Page) {
  await page.waitForFunction(() => document.documentElement.dataset.motion !== undefined);
}

/** Read the persisted demo snapshot (version-gated, same key as the app). */
export async function readDemoState(page: Page) {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem("ponnaloy.atlas.state.v1");
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  });
}
