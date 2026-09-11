import { createMemo, createSignal, For, Show, type Component, onMount, onCleanup } from "solid-js";
import type { PermissionRecord, SecurityState } from "../../../../shared/types";
import { useI18n } from "../../stores/i18n";

interface SecurityPopupProps {
  state: SecurityState;
  tabId: string;
  onClose: () => void;
}

const SecurityPopup: Component<SecurityPopupProps> = (props) => {
  const { t } = useI18n();
  const statusText = () => {
    switch (props.state.status) {
      case "secure":
        return t("chrome.security.secure");
      case "insecure":
        return t("chrome.security.insecure");
      case "error":
        return t("chrome.security.certError", {
          message: props.state.errorMessage || t("chrome.security.unknownError"),
        });
      default:
        return t("chrome.security.noInfo");
    }
  };

  const [permissions, setPermissions] = createSignal<PermissionRecord[]>([]);
  const origin = createMemo(() => {
    try {
      return new URL(props.state.url).origin;
    } catch {
      return "";
    }
  });
  const sitePermissions = createMemo(() =>
    permissions().filter((item) => item.origin === origin()),
  );

  const loadPermissions = async () => {
    try {
      setPermissions(await window.vessel.permissions.getAll());
    } catch (err) {
      console.warn("Failed to load permissions:", err);
    }
  };

  const handleLearnMore = () => {
    window.vessel.security.showDetails(props.state);
    props.onClose();
  };

  const handleProceedAnyway = () => {
    window.vessel.security.proceedAnyway(props.tabId);
    props.onClose();
  };

  const handleGoBackToSafety = () => {
    window.vessel.security.goBackToSafety(props.tabId);
    props.onClose();
  };

  onMount(() => {
    void loadPermissions();
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".security-indicator-wrapper")) {
        props.onClose();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    onCleanup(() => document.removeEventListener("click", handleClickOutside, true));
  });

  return (
    <div class="security-popup" onClick={(e) => e.stopPropagation()}>
      <div class="security-popup-content">
        <p class="security-popup-text">{statusText()}</p>
        <button class="security-popup-link" onClick={handleLearnMore}>
          {t("chrome.security.learnMore")}
        </button>
        <div class="security-popup-section">
          <div class="security-popup-section-title">{t("chrome.security.sitePermissions")}</div>
          <Show
            when={sitePermissions().length > 0}
            fallback={<p class="security-popup-muted">{t("chrome.security.noSitePermissions")}</p>}
          >
            <For each={sitePermissions()}>
              {(item) => (
                <div class="security-popup-permission-row">
                  <span>{item.permission}</span>
                  <strong class={item.decision}>{item.decision}</strong>
                </div>
              )}
            </For>
            <button
              class="security-popup-link"
              onClick={async () => {
                await window.vessel.permissions.clearOrigin(origin());
                await loadPermissions();
              }}
            >
              {t("chrome.security.resetSite")}
            </button>
          </Show>
        </div>
        {props.state.canProceed && (
          <div class="security-popup-actions">
            <button class="security-popup-action-proceed" onClick={handleProceedAnyway}>
              {t("chrome.security.proceed")}
            </button>
            <button class="security-popup-action-back" onClick={handleGoBackToSafety}>
              {t("chrome.security.goBack")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityPopup;
