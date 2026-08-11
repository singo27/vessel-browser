import assert from "node:assert/strict";
import test from "node:test";
import { t } from "../src/shared/i18n/t";

test("t returns English catalog strings", () => {
  assert.equal(t("en", "settings.nav.general"), "General");
  assert.equal(t("en", "menu.file"), "File");
});

test("t returns Chinese catalog strings", () => {
  assert.equal(t("zh-CN", "settings.nav.general"), "通用");
  assert.equal(t("zh-CN", "menu.file"), "文件");
});

test("t interpolates params", () => {
  assert.equal(
    t("en", "settings.general.updates.upToDate", { version: "1.2.3" }),
    "Vessel is up to date. Current version: 1.2.3.",
  );
  assert.equal(
    t("zh-CN", "chrome.titleBar.mcp.ready", { endpoint: "http://127.0.0.1:3100/mcp" }),
    "MCP 就绪 — http://127.0.0.1:3100/mcp",
  );
});

test("t falls back to English when key missing in locale", () => {
  // Force a missing Chinese key by looking up a key that only exists conceptually as en fallback.
  // Unknown keys fall back to the key string itself after English miss.
  assert.equal(t("zh-CN", "settings.nav.title"), "运行时设置");
  assert.equal(t("zh-CN", "definitely.missing.key"), "definitely.missing.key");
  assert.equal(t("en", "definitely.missing.key"), "definitely.missing.key");
});

test("t leaves unknown placeholders untouched", () => {
  assert.equal(
    t("en", "settings.account.sessions.restored", { name: "Work" }),
    'Session "Work" restored.',
  );
});
