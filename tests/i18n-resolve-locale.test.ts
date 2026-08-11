import assert from "node:assert/strict";
import test from "node:test";
import { localeFromSystemTag, resolveLocale } from "../src/shared/i18n/resolve-locale";

test("localeFromSystemTag maps Chinese tags to zh-CN", () => {
  assert.equal(localeFromSystemTag("zh"), "zh-CN");
  assert.equal(localeFromSystemTag("zh-CN"), "zh-CN");
  assert.equal(localeFromSystemTag("zh-Hans-CN"), "zh-CN");
  assert.equal(localeFromSystemTag("zh_TW"), "zh-CN");
  assert.equal(localeFromSystemTag("ZH-cn"), "zh-CN");
});

test("localeFromSystemTag maps non-Chinese tags to en", () => {
  assert.equal(localeFromSystemTag("en"), "en");
  assert.equal(localeFromSystemTag("en-US"), "en");
  assert.equal(localeFromSystemTag("fr"), "en");
  assert.equal(localeFromSystemTag("ja-JP"), "en");
  assert.equal(localeFromSystemTag(""), "en");
});

test("resolveLocale honors explicit preferences", () => {
  assert.equal(resolveLocale("en", "zh-CN"), "en");
  assert.equal(resolveLocale("zh-CN", "en-US"), "zh-CN");
});

test("resolveLocale uses system tag when preference is system or missing", () => {
  assert.equal(resolveLocale("system", "zh-CN"), "zh-CN");
  assert.equal(resolveLocale("system", "en-GB"), "en");
  assert.equal(resolveLocale(undefined, "zh"), "zh-CN");
  assert.equal(resolveLocale(null, "fr-FR"), "en");
});
