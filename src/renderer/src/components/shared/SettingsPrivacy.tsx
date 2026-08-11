import { createSignal, For, onMount, Show, type Component } from "solid-js";
import type { PermissionRecord } from "../../../../shared/types";
import { useI18n } from "../../stores/i18n";
import type { SettingsPrivacyProps } from "./settingsTypes";

const SettingsPrivacy: Component<SettingsPrivacyProps> = (props) => {
  const { t } = useI18n();
  const [permissions, setPermissions] = createSignal<PermissionRecord[]>([]);
  const loadPermissions = async () => setPermissions(await window.vessel.permissions.getAll());
  onMount(() => {
    void loadPermissions();
  });

  return (
    <div class="settings-category-panel">
      <div class="settings-field">
        <label class="settings-label" for="domain-policy-mode">
          {t("settings.privacy.domainRestrictions.label")}
        </label>
        <select
          id="domain-policy-mode"
          class="settings-input settings-select"
          value={props.domainMode()}
          onChange={(e) =>
            props.setDomainMode(e.currentTarget.value as "none" | "allowlist" | "blocklist")
          }
        >
          <option value="none">{t("settings.privacy.domainRestrictions.none")}</option>
          <option value="allowlist">{t("settings.privacy.domainRestrictions.allowlist")}</option>
          <option value="blocklist">{t("settings.privacy.domainRestrictions.blocklist")}</option>
        </select>
        <Show when={props.domainMode() !== "none"}>
          <textarea
            class="settings-input settings-textarea"
            rows={4}
            value={props.domainList()}
            onInput={(e) => props.setDomainList(e.currentTarget.value)}
            placeholder={
              props.domainMode() === "allowlist"
                ? "example.com\napi.example.com"
                : "ads.example.com\ntracker.io"
            }
            spellcheck={false}
          />
          <p class="settings-hint">
            {props.domainMode() === "allowlist"
              ? t("settings.privacy.domainRestrictions.allowlistHint")
              : t("settings.privacy.domainRestrictions.blocklistHint")}
          </p>
        </Show>
        <Show when={props.domainMode() === "none"}>
          <p class="settings-hint">{t("settings.privacy.domainRestrictions.noneHint")}</p>
        </Show>
      </div>

      <div class="settings-field">
        <label class="settings-label" for="source-do-not-allow-list">
          {t("settings.privacy.sourceBlocklist.label")}
        </label>
        <textarea
          id="source-do-not-allow-list"
          class="settings-input settings-textarea"
          rows={4}
          value={props.sourceDoNotAllowList()}
          onInput={(e) => props.setSourceDoNotAllowList(e.currentTarget.value)}
          placeholder={"example.com\nlow-quality-source.net"}
          spellcheck={false}
        />
        <p class="settings-hint">{t("settings.privacy.sourceBlocklist.hint")}</p>
      </div>

      <div class="settings-field">
        <label class="settings-label">{t("settings.privacy.permissions.label")}</label>
        <p class="settings-hint">{t("settings.privacy.permissions.hint")}</p>
        <div class="settings-list">
          <For
            each={permissions()}
            fallback={<p class="settings-hint">{t("settings.privacy.permissions.empty")}</p>}
          >
            {(item) => (
              <div class="settings-list-row">
                <span>{item.origin}</span>
                <span>
                  {item.permission}: {item.decision}
                </span>
              </div>
            )}
          </For>
        </div>
        <button
          type="button"
          class="settings-secondary-btn"
          onClick={async () => {
            await window.vessel.permissions.clear();
            await loadPermissions();
          }}
        >
          {t("settings.privacy.permissions.clear")}
        </button>
      </div>

      <div class="settings-field">
        <label class="settings-toggle">
          <button
            type="button"
            class="toggle-switch"
            classList={{ on: props.telemetryEnabled() }}
            onClick={() => props.setTelemetryEnabled(!props.telemetryEnabled())}
            role="switch"
            aria-checked={props.telemetryEnabled()}
          >
            <span class="toggle-switch-thumb" />
          </button>
          <span>{t("settings.privacy.telemetry.label")}</span>
        </label>
        <p class="settings-hint">{t("settings.privacy.telemetry.hint")}</p>
      </div>
    </div>
  );
};

export default SettingsPrivacy;
