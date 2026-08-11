import { createSignal, For, Show, type Component } from "solid-js";
import { SEARCH_ENGINE_PRESETS } from "../../../../shared/types";
import type { LocalePreference, SearchEngineId, UpdateCheckResult } from "../../../../shared/types";
import { useI18n } from "../../stores/i18n";
import type { SettingsGeneralProps } from "./settingsTypes";

const SettingsGeneral: Component<SettingsGeneralProps> = (props) => {
  const { t } = useI18n();
  const [checkingUpdates, setCheckingUpdates] = createSignal(false);
  const [updateResult, setUpdateResult] = createSignal<UpdateCheckResult | null>(null);

  const checkUpdates = async () => {
    setCheckingUpdates(true);
    try {
      setUpdateResult(await window.vessel.updates.check());
    } finally {
      setCheckingUpdates(false);
    }
  };

  return (
    <div class="settings-category-panel">
      <Show when={props.welcomeBanner.show()}>
        <div class="welcome-banner">
          <div class="welcome-banner-header">
            <span class="welcome-banner-title">{t("settings.general.welcome.title")}</span>
            <button class="welcome-banner-dismiss" onClick={props.welcomeBanner.dismiss}>
              &times;
            </button>
          </div>
          <p class="welcome-banner-text">{t("settings.general.welcome.intro")}</p>
          <ol class="welcome-banner-steps">
            <li>
              <strong>{t("settings.general.welcome.step1Title")}</strong>
              {t("settings.general.welcome.step1Body")}
            </li>
            <li>
              <strong>{t("settings.general.welcome.step2Title")}</strong>
              {t("settings.general.welcome.step2Body")}
            </li>
            <li>
              <strong>{t("settings.general.welcome.step3Title")}</strong>
              {t("settings.general.welcome.step3Before")}
              <kbd>?</kbd>
              {t("settings.general.welcome.step3After")}
            </li>
          </ol>
          <Show when={!props.premiumActive()}>
            <div class="welcome-banner-actions">
              <button class="premium-btn premium-btn-upgrade" onClick={props.startPremiumCheckout}>
                {t("settings.general.welcome.premiumCta")}
              </button>
              <span class="welcome-banner-note">{t("settings.general.welcome.premiumNote")}</span>
            </div>
          </Show>
        </div>
      </Show>

      <div class="settings-field">
        <label class="settings-label" for="default-homepage">
          {t("settings.general.homepage.label")}
        </label>
        <input
          id="default-homepage"
          class="settings-input"
          value={props.defaultUrl()}
          onInput={(e) => props.setDefaultUrl(e.currentTarget.value)}
          placeholder="https://start.duckduckgo.com"
          spellcheck={false}
        />
        <p class="settings-hint">{t("settings.general.homepage.hint")}</p>
      </div>

      <div class="settings-field">
        <label class="settings-label" for="default-search-engine">
          {t("settings.general.searchEngine.label")}
        </label>
        <select
          id="default-search-engine"
          class="settings-input"
          value={props.defaultSearchEngine()}
          onChange={(e) => props.setDefaultSearchEngine(e.currentTarget.value as SearchEngineId)}
        >
          <For each={Object.entries(SEARCH_ENGINE_PRESETS)}>
            {([id, preset]) => <option value={id}>{preset.label}</option>}
          </For>
          <option value="none">{t("settings.general.searchEngine.none")}</option>
        </select>
        <p class="settings-hint">{t("settings.general.searchEngine.hint")}</p>
      </div>

      <div class="settings-field">
        <label class="settings-label" for="download-path">
          {t("settings.general.downloadPath.label")}
        </label>
        <input
          id="download-path"
          class="settings-input"
          value={props.downloadPath()}
          onInput={(e) => props.setDownloadPath(e.currentTarget.value)}
          placeholder={t("settings.general.downloadPath.placeholder")}
          spellcheck={false}
        />
        <p class="settings-hint">{t("settings.general.downloadPath.hint")}</p>
      </div>

      <div class="settings-field">
        <label class="settings-label" for="theme-select">
          {t("settings.general.theme.label")}
        </label>
        <select
          id="theme-select"
          class="settings-input settings-select"
          value={props.theme()}
          onChange={(e) => props.setTheme(e.currentTarget.value as "dark" | "light")}
        >
          <option value="dark">{t("settings.general.theme.dark")}</option>
          <option value="light">{t("settings.general.theme.light")}</option>
        </select>
        <p class="settings-hint">{t("settings.general.theme.hint")}</p>
      </div>

      <div class="settings-field">
        <label class="settings-label" for="locale-select">
          {t("settings.general.locale.label")}
        </label>
        <select
          id="locale-select"
          class="settings-input settings-select"
          value={props.locale()}
          onChange={(e) => props.setLocale(e.currentTarget.value as LocalePreference)}
        >
          <option value="system">{t("settings.general.locale.system")}</option>
          <option value="en">{t("settings.general.locale.en")}</option>
          <option value="zh-CN">{t("settings.general.locale.zhCN")}</option>
        </select>
        <p class="settings-hint">{t("settings.general.locale.hint")}</p>
      </div>

      <div class="settings-field">
        <label class="settings-label">{t("settings.general.updates.label")}</label>
        <div class="settings-inline-actions">
          <button
            type="button"
            class="settings-secondary-btn"
            disabled={checkingUpdates()}
            onClick={checkUpdates}
          >
            {checkingUpdates()
              ? t("settings.general.updates.checking")
              : t("settings.general.updates.check")}
          </button>
          <Show when={updateResult()?.updateAvailable}>
            <button
              type="button"
              class="settings-secondary-btn"
              onClick={() => window.vessel.updates.openDownload()}
            >
              {t("settings.general.updates.openRelease")}
            </button>
          </Show>
        </div>
        <Show when={updateResult()}>
          {(result) => (
            <p class="settings-hint">
              <Show
                when={!result().error}
                fallback={
                  <>
                    {t("settings.general.updates.error", {
                      error: result().error ?? "",
                    })}
                  </>
                }
              >
                <Show
                  when={result().updateAvailable}
                  fallback={
                    <>
                      {t("settings.general.updates.upToDate", {
                        version: result().currentVersion,
                      })}
                    </>
                  }
                >
                  {t("settings.general.updates.available", {
                    latest: result().latestVersion ?? "",
                    current: result().currentVersion,
                  })}
                </Show>
              </Show>
            </p>
          )}
        </Show>
        <p class="settings-hint">{t("settings.general.updates.hint")}</p>
      </div>

      <div class="settings-field">
        <label class="settings-toggle">
          <button
            type="button"
            class="toggle-switch"
            classList={{ on: props.autoRestoreSession() }}
            onClick={() => props.setAutoRestoreSession(!props.autoRestoreSession())}
            role="switch"
            aria-checked={props.autoRestoreSession()}
          >
            <span class="toggle-switch-thumb" />
          </button>
          <span>{t("settings.general.autoRestore.label")}</span>
        </label>
      </div>

      <div class="settings-field">
        <label class="settings-toggle">
          <button
            type="button"
            class="toggle-switch"
            classList={{ on: props.clearBookmarksOnLaunch() }}
            onClick={() => props.setClearBookmarksOnLaunch(!props.clearBookmarksOnLaunch())}
            role="switch"
            aria-checked={props.clearBookmarksOnLaunch()}
          >
            <span class="toggle-switch-thumb" />
          </button>
          <span>{t("settings.general.clearBookmarks.label")}</span>
        </label>
        <p class="settings-hint">{t("settings.general.clearBookmarks.hint")}</p>
      </div>
    </div>
  );
};

export default SettingsGeneral;
