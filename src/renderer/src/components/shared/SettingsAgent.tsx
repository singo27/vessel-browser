import { createSignal, For, Show, type Component } from "solid-js";
import type { ProviderId, ReasoningEffortLevel } from "../../../../shared/types";
import type { AgentTranscriptDisplayMode } from "../../../../shared/types";
import { PROVIDERS } from "../../../../shared/providers";
import { useI18n } from "../../stores/i18n";
import type { SettingsAgentProps } from "./settingsTypes";

const CHAT_PROVIDERS = Object.values(PROVIDERS).map((p) => ({
  id: p.id,
  name: p.name,
  requiresKey: p.requiresApiKey,
  needsBaseUrl: p.id === "llama_cpp" || p.id === "custom",
  defaultBaseUrl: p.defaultBaseUrl,
  keyPlaceholder: p.apiKeyPlaceholder,
  defaultModel: p.defaultModel,
  models: p.models,
}));

const REASONING_EFFORT_VALUES: ReasoningEffortLevel[] = ["off", "low", "medium", "high", "max"];

const SettingsAgent: Component<SettingsAgentProps> = (props) => {
  const { t } = useI18n();
  const [mcpTokenMessage, setMcpTokenMessage] = createSignal<string | null>(null);
  const chatMeta = () =>
    CHAT_PROVIDERS.find((p) => p.id === props.chat.providerId()) ?? CHAT_PROVIDERS[0];
  const openRouterConnecting = () =>
    props.chat.openRouterAuthStatus() === "waiting" ||
    props.chat.openRouterAuthStatus() === "exchanging";

  const reasoningLabel = (value: ReasoningEffortLevel): string => {
    switch (value) {
      case "off":
        return t("settings.agent.reasoning.off");
      case "low":
        return t("settings.agent.reasoning.low");
      case "medium":
        return t("settings.agent.reasoning.medium");
      case "high":
        return t("settings.agent.reasoning.high");
      case "max":
        return t("settings.agent.reasoning.max");
    }
  };

  return (
    <div class="settings-category-panel">
      <div class="settings-callout">
        <div class="settings-callout-title">{t("settings.agent.externalControl.title")}</div>
        <p class="settings-callout-copy">{t("settings.agent.externalControl.body")}</p>
      </div>

      <Show
        when={
          !props.chat.enabled() ||
          (props.chat.providerId() === "openrouter" && !props.chat.hasStoredApiKey())
        }
      >
        <div class="settings-callout">
          <div class="settings-callout-title">{t("settings.agent.freeAi.title")}</div>
          <p class="settings-callout-copy">{t("settings.agent.freeAi.body")}</p>
          <div class="settings-inline-actions" style="margin-top:12px">
            <button
              type="button"
              class="settings-secondary-btn"
              disabled={openRouterConnecting()}
              onClick={() => props.chat.startOpenRouterAuth()}
            >
              <Show
                when={!openRouterConnecting()}
                fallback={
                  props.chat.openRouterAuthStatus() === "exchanging"
                    ? t("settings.agent.freeAi.finishing")
                    : t("settings.agent.freeAi.opening")
                }
              >
                {t("settings.agent.freeAi.connect")}
              </Show>
            </button>
          </div>
          <Show when={props.chat.openRouterAuthStatus() === "error"}>
            <p class="settings-hint" style="color:var(--error)">
              {props.chat.openRouterAuthError()}
            </p>
          </Show>
        </div>
      </Show>

      <div class="settings-field">
        <label class="settings-toggle">
          <button
            type="button"
            class="toggle-switch"
            classList={{ on: props.chat.enabled() }}
            onClick={() => props.chat.setEnabled(!props.chat.enabled())}
            role="switch"
            aria-checked={props.chat.enabled()}
          >
            <span class="toggle-switch-thumb" />
          </button>
          <span>{t("settings.agent.chatEnabled.label")}</span>
        </label>
        <p class="settings-hint">{t("settings.agent.chatEnabled.hint")}</p>
      </div>

      <Show when={props.chat.enabled()}>
        <div class="settings-field">
          <label class="settings-label" for="chat-provider">
            {t("settings.agent.provider.label")}
          </label>
          <select
            id="chat-provider"
            class="settings-input settings-select"
            value={props.chat.providerId()}
            onChange={(e) => {
              const id = e.currentTarget.value as ProviderId;
              props.chat.setProviderId(id);
              props.chat.setModel("");
              props.chat.setBaseUrl("");
              props.chat.setApiKey("");
              props.chat.setHasStoredApiKey(false);
              props.chat.resetProviderModels();
            }}
          >
            <For each={CHAT_PROVIDERS}>{(p) => <option value={p.id}>{p.name}</option>}</For>
          </select>
        </div>

        <Show when={props.chat.providerType() === "codex_oauth"}>
          <div class="settings-field">
            <label class="settings-label">{t("settings.agent.account.label")}</label>
            <Show
              when={props.chat.codexAuthStatus() === "connected"}
              fallback={
                <div>
                  <Show
                    when={
                      props.chat.codexAuthStatus() === "waiting" ||
                      props.chat.codexAuthStatus() === "exchanging"
                    }
                    fallback={
                      <Show
                        when={props.chat.codexAuthStatus() === "error"}
                        fallback={
                          <div>
                            <button
                              type="button"
                              class="settings-btn"
                              onClick={() => props.chat.startCodexAuth()}
                            >
                              {t("settings.agent.codex.connect")}
                            </button>
                            <p class="settings-hint">{t("settings.agent.codex.hint")}</p>
                          </div>
                        }
                      >
                        <p class="settings-hint" style="color:var(--error)">
                          {props.chat.codexAuthError()}
                        </p>
                        <button
                          type="button"
                          class="settings-btn"
                          onClick={() => props.chat.startCodexAuth()}
                        >
                          {t("settings.agent.codex.tryAgain")}
                        </button>
                      </Show>
                    }
                  >
                    <p class="settings-hint" style="color:var(--accent-primary)">
                      <Show
                        when={props.chat.codexAuthStatus() === "waiting"}
                        fallback={t("settings.agent.codex.exchanging")}
                      >
                        {t("settings.agent.codex.waiting")}
                      </Show>{" "}
                      <button
                        type="button"
                        class="settings-link-btn"
                        onClick={() => window.vessel.codex.cancelAuth()}
                      >
                        {t("settings.agent.codex.cancel")}
                      </button>
                    </p>
                  </Show>
                </div>
              }
            >
              <div style="display:flex;align-items:center;gap:8px">
                <span style="width:8px;height:8px;border-radius:50%;background:var(--success);display:inline-block" />
                <span>
                  {t("settings.agent.codex.connectedAs", {
                    email:
                      props.chat.codexAccountEmail() || t("settings.agent.codex.connectedFallback"),
                  })}
                </span>
              </div>
              <p class="settings-hint">
                <button
                  type="button"
                  class="settings-link-btn"
                  onClick={() => props.chat.disconnectCodex()}
                >
                  {t("settings.agent.codex.disconnect")}
                </button>
              </p>
            </Show>
          </div>
        </Show>

        <Show
          when={
            props.chat.providerType() !== "codex_oauth" &&
            (chatMeta().requiresKey || props.chat.providerId() === "custom")
          }
        >
          <div class="settings-field">
            <label class="settings-label" for="chat-api-key">
              {t("settings.agent.apiKey.label")}
              <Show when={!chatMeta().requiresKey}>
                <span class="settings-label-optional"> {t("settings.agent.apiKey.optional")}</span>
              </Show>
            </label>
            <input
              id="chat-api-key"
              class="settings-input"
              type="password"
              value={props.chat.apiKey()}
              onInput={(e) => {
                props.chat.setApiKey(e.currentTarget.value);
                if (e.currentTarget.value.trim()) {
                  props.chat.setHasStoredApiKey(true);
                }
              }}
              placeholder={
                props.chat.hasStoredApiKey() && !props.chat.apiKey().trim()
                  ? t("settings.agent.apiKey.storedPlaceholder")
                  : chatMeta().keyPlaceholder || t("settings.agent.apiKey.defaultPlaceholder")
              }
              spellcheck={false}
            />
            <Show when={props.chat.hasStoredApiKey() && !props.chat.apiKey().trim()}>
              <p class="settings-hint">{t("settings.agent.apiKey.storedHint")}</p>
            </Show>
            <Show when={props.chat.providerId() === "custom"}>
              <p class="settings-hint">{t("settings.agent.apiKey.customHint")}</p>
            </Show>
          </div>
        </Show>

        <div class="settings-field">
          <label class="settings-label" for="chat-model">
            {t("settings.agent.model.label")}
          </label>
          <div style="display:flex;gap:6px;align-items:center">
            <Show
              when={props.chat.providerModels().length > 0}
              fallback={
                <input
                  id="chat-model"
                  class="settings-input"
                  style="flex:1"
                  value={props.chat.model()}
                  onInput={(e) => props.chat.setModel(e.currentTarget.value)}
                  placeholder={
                    props.chat.modelFetchState() === "loading"
                      ? t("settings.agent.model.fetching")
                      : chatMeta().requiresKey &&
                          !props.chat.apiKey().trim() &&
                          !props.chat.hasStoredApiKey()
                        ? t("settings.agent.model.enterKey")
                        : chatMeta().defaultModel || t("settings.agent.model.namePlaceholder")
                  }
                  spellcheck={false}
                />
              }
            >
              <select
                id="chat-model"
                class="settings-input settings-select"
                style="flex:1"
                value={props.chat.model()}
                onChange={(e) => props.chat.setModel(e.currentTarget.value)}
              >
                <For each={props.chat.providerModels()}>
                  {(m) => <option value={m}>{m}</option>}
                </For>
              </select>
            </Show>
            <button
              type="button"
              class="settings-refresh-btn"
              title={t("settings.agent.model.refreshTitle")}
              disabled={props.chat.modelFetchState() === "loading"}
              onClick={() => props.chat.doFetchModels()}
            >
              ↺
            </button>
          </div>
          <Show when={props.chat.modelFetchState() === "error"}>
            <p class="settings-hint" style="color:var(--error)">
              {t("settings.agent.model.fetchError")}
            </p>
          </Show>
          <Show when={props.chat.modelFetchWarning()}>
            {(warning) => (
              <p class="settings-hint" style="color:var(--accent-primary)">
                {warning()}
              </p>
            )}
          </Show>
        </div>

        <Show when={chatMeta().needsBaseUrl || props.chat.providerId() === "custom"}>
          <div class="settings-field">
            <label class="settings-label" for="chat-base-url">
              {t("settings.agent.baseUrl.label")}
            </label>
            <input
              id="chat-base-url"
              class="settings-input"
              value={props.chat.baseUrl()}
              onInput={(e) => props.chat.setBaseUrl(e.currentTarget.value)}
              placeholder={chatMeta().defaultBaseUrl ?? "https://..."}
              spellcheck={false}
            />
          </div>
        </Show>
        <Show when={props.chat.providerId() === "llama_cpp"}>
          <p class="settings-hint">{t("settings.agent.llamaCpp.hint")}</p>
        </Show>

        <div class="settings-field">
          <label class="settings-label" for="chat-reasoning-effort">
            {t("settings.agent.reasoning.label")}
          </label>
          <select
            id="chat-reasoning-effort"
            class="settings-input settings-select"
            value={props.chat.reasoningEffort()}
            onChange={(e) =>
              props.chat.setReasoningEffort(e.currentTarget.value as ReasoningEffortLevel)
            }
          >
            <For each={REASONING_EFFORT_VALUES}>
              {(value) => <option value={value}>{reasoningLabel(value)}</option>}
            </For>
          </select>
          <p class="settings-hint">{t("settings.agent.reasoning.hint")}</p>
        </div>
      </Show>

      <div class="settings-field">
        <label class="settings-label" for="mcp-port">
          {t("settings.agent.mcpPort.label")}
        </label>
        <input
          id="mcp-port"
          class="settings-input"
          value={props.mcpPort()}
          onInput={(e) => props.setMcpPort(e.currentTarget.value)}
          placeholder="3100"
          spellcheck={false}
        />
        <p class="settings-hint">{t("settings.agent.mcpPort.hint")}</p>
        <div class="settings-inline-actions">
          <button
            type="button"
            class="settings-secondary-btn"
            onClick={async () => {
              const result = await window.vessel.settings.regenerateMcpToken();
              setMcpTokenMessage(
                result
                  ? t("settings.agent.mcpPort.tokenRegenerated")
                  : t("settings.agent.mcpPort.notRunning"),
              );
            }}
          >
            {t("settings.agent.mcpPort.regenerate")}
          </button>
        </div>
        <Show when={mcpTokenMessage()}>
          {(message) => <p class="settings-hint">{message()}</p>}
        </Show>
      </div>

      <div class="settings-field">
        <label class="settings-label" for="max-tool-iterations">
          {t("settings.agent.maxIterations.label")}
        </label>
        <Show
          when={props.premiumActive()}
          fallback={
            <div
              class="settings-input settings-input-disabled"
              title={t("settings.agent.maxIterations.premiumTitle")}
            >
              50
            </div>
          }
        >
          <input
            id="max-tool-iterations"
            class="settings-input"
            type="number"
            min="10"
            max="1000"
            value={props.maxToolIterations()}
            onInput={(e) => props.setMaxToolIterations(e.currentTarget.value)}
            placeholder="200"
          />
        </Show>
        <p class="settings-hint">
          <Show when={props.premiumActive()} fallback={t("settings.agent.maxIterations.freeHint")}>
            {t("settings.agent.maxIterations.premiumHint")}
          </Show>
        </p>
      </div>

      <div class="settings-field">
        <label class="settings-label" for="agent-transcript-mode">
          {t("settings.agent.transcript.label")}
        </label>
        <select
          id="agent-transcript-mode"
          class="settings-input settings-select"
          value={props.agentTranscriptMode()}
          onChange={(e) =>
            props.setAgentTranscriptMode(e.currentTarget.value as AgentTranscriptDisplayMode)
          }
        >
          <option value="off">{t("settings.agent.transcript.off")}</option>
          <option value="full">{t("settings.agent.transcript.full")}</option>
        </select>
        <p class="settings-hint">{t("settings.agent.transcript.hint")}</p>
      </div>

      <Show when={props.health()}>
        {(currentHealth) => (
          <div class="settings-health">
            <div class="settings-callout-title">{t("settings.agent.health.title")}</div>
            <p class="settings-hint">
              {t("settings.agent.health.mcpStatus")} <strong>{currentHealth().mcp.status}</strong>{" "}
              {currentHealth().mcp.message}
            </p>
            <Show when={currentHealth().mcp.endpoint}>
              {(endpoint) => (
                <p class="settings-hint">
                  {t("settings.agent.health.activeEndpoint")} <code>{endpoint()}</code>
                </p>
              )}
            </Show>
            <Show when={currentHealth().startupIssues.length > 0}>
              <div class="settings-health-issues">
                {currentHealth().startupIssues.map((issue) => (
                  <div
                    class="settings-health-issue"
                    classList={{
                      warning: issue.severity === "warning",
                      error: issue.severity === "error",
                    }}
                  >
                    <strong>{issue.title}</strong>
                    <div>{issue.detail}</div>
                    <Show when={issue.action}>{(action) => <div>{action()}</div>}</Show>
                  </div>
                ))}
              </div>
            </Show>
          </div>
        )}
      </Show>

      <div class="settings-field">
        <label class="settings-label" for="obsidian-vault-path">
          {t("settings.agent.obsidian.label")}
        </label>
        <input
          id="obsidian-vault-path"
          class="settings-input"
          value={props.obsidianVaultPath()}
          onInput={(e) => props.setObsidianVaultPath(e.currentTarget.value)}
          placeholder={t("settings.agent.obsidian.placeholder")}
          spellcheck={false}
        />
        <p class="settings-hint">{t("settings.agent.obsidian.hint")}</p>
      </div>
    </div>
  );
};

export default SettingsAgent;
