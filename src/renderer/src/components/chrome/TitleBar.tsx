import { createMemo, createSignal, onCleanup, onMount, type Component } from "solid-js";
import type { RuntimeHealthState } from "../../../../shared/types";
import { useUI } from "../../stores/ui";
import { useI18n } from "../../stores/i18n";
import "./chrome.css";

const TitleBar: Component<{ onOpenDownloads?: () => void }> = (props) => {
  const { openSettings } = useUI();
  const { t } = useI18n();
  const isPrivateWindow = new URLSearchParams(window.location.search).get("private") === "1";
  const [mcpStatus, setMcpStatus] = createSignal<"ready" | "error" | "starting" | "stopped">(
    "starting",
  );
  const [mcpEndpoint, setMcpEndpoint] = createSignal("");
  const [mcpMessage, setMcpMessage] = createSignal("");
  const [healthUnavailable, setHealthUnavailable] = createSignal(false);

  const mcpTooltip = createMemo(() => {
    if (healthUnavailable()) return t("chrome.titleBar.mcp.unavailable");
    const status = mcpStatus();
    if (status === "ready") {
      return t("chrome.titleBar.mcp.ready", { endpoint: mcpEndpoint() });
    }
    if (status === "error") {
      return t("chrome.titleBar.mcp.error", { message: mcpMessage() });
    }
    if (status === "starting") {
      return t("chrome.titleBar.mcp.starting");
    }
    return t("chrome.titleBar.mcp.status", { status });
  });

  const applyHealth = (health: RuntimeHealthState) => {
    setHealthUnavailable(false);
    setMcpStatus(health.mcp.status as "ready" | "error" | "starting" | "stopped");
    setMcpEndpoint(health.mcp.endpoint ?? "");
    setMcpMessage(health.mcp.message ?? "");
  };

  const loadHealth = async () => {
    try {
      applyHealth(await window.vessel.settings.getHealth());
    } catch {
      setMcpStatus("error");
      setHealthUnavailable(true);
    }
  };

  onMount(() => {
    void loadHealth();
    const unsubscribe = window.vessel.settings.onHealthUpdate(applyHealth);
    onCleanup(unsubscribe);
  });

  const handleMcpClick = () => {
    if (isPrivateWindow) return;
    void openSettings();
  };

  return (
    <div class="title-bar">
      <div class="title-bar-drag" />
      <div class="mcp-status-area">
        <button
          class="mcp-status-indicator"
          classList={{
            "mcp-ready": mcpStatus() === "ready",
            "mcp-error": mcpStatus() === "error",
            "mcp-starting": mcpStatus() === "starting" || mcpStatus() === "stopped",
          }}
          onClick={handleMcpClick}
          title={mcpTooltip()}
        >
          <span class="mcp-dot" />
          <span class="mcp-label">{t("chrome.titleBar.mcp.label")}</span>
        </button>
      </div>
      <div class="window-controls">
        <button
          class="window-btn"
          onClick={() => props.onOpenDownloads?.()}
          data-tooltip={t("chrome.titleBar.downloads")}
        >
          ↓
        </button>
        <button
          class="window-btn"
          onClick={() => window.vessel.window.minimize()}
          data-tooltip={t("chrome.titleBar.minimize")}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect x="1" y="5" width="8" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          class="window-btn"
          onClick={() => window.vessel.window.maximize()}
          data-tooltip={t("chrome.titleBar.maximize")}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect
              x="1"
              y="1"
              width="8"
              height="8"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
            />
          </svg>
        </button>
        <button
          class="window-btn window-btn-close"
          onClick={() => window.vessel.window.close()}
          data-tooltip={t("chrome.titleBar.close")}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" stroke-width="1.2" />
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" stroke-width="1.2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
