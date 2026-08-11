import { createSignal, For, Show, type Component } from "solid-js";
import type { SettingsAccountProps } from "./settingsTypes";
import {
  STATUS_MESSAGE_CLEAR_MS,
  STATUS_MESSAGE_LONG_CLEAR_MS,
} from "../../../../shared/ui-constants";
import { useI18n } from "../../stores/i18n";

const SettingsAccount: Component<SettingsAccountProps> = (props) => {
  const { t } = useI18n();
  const p = props.premium;
  const s = props.sessions;
  const [feedbackExpanded, setFeedbackExpanded] = createSignal(false);
  const [feedbackEmail, setFeedbackEmail] = createSignal(p.state().email || "");
  const [feedbackMessage, setFeedbackMessage] = createSignal("");
  const [feedbackSending, setFeedbackSending] = createSignal(false);
  const [feedbackStatus, setFeedbackStatus] = createSignal<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmitFeedback = async () => {
    setFeedbackSending(true);
    setFeedbackStatus(null);
    try {
      const result = await window.vessel.support.submitFeedback(feedbackEmail(), feedbackMessage());
      if (result.ok) {
        setFeedbackMessage("");
        setFeedbackExpanded(false);
        setFeedbackStatus({
          kind: "success",
          text: t("settings.account.support.sent"),
        });
        return;
      }
      setFeedbackStatus({
        kind: "error",
        text: result.error || t("settings.account.support.failed"),
      });
    } finally {
      setFeedbackSending(false);
    }
  };

  return (
    <div class="settings-category-panel">
      {/* Support */}
      <div class="settings-field">
        <label class="settings-label">{t("settings.account.support.label")}</label>
        <div class="settings-inline-actions">
          <button
            class="settings-secondary-btn"
            onClick={() => {
              setFeedbackExpanded(!feedbackExpanded());
              setFeedbackStatus(null);
            }}
          >
            {feedbackExpanded()
              ? t("settings.account.support.cancel")
              : t("settings.account.support.submit")}
          </button>
        </div>
        <Show when={feedbackExpanded()}>
          <div class="settings-feedback-form">
            <input
              class="settings-input"
              type="email"
              placeholder={t("settings.account.support.emailPlaceholder")}
              value={feedbackEmail()}
              onInput={(event) => {
                setFeedbackEmail(event.currentTarget.value);
                setFeedbackStatus(null);
              }}
              spellcheck={false}
            />
            <textarea
              class="settings-textarea settings-feedback-textarea"
              placeholder={t("settings.account.support.messagePlaceholder")}
              value={feedbackMessage()}
              onInput={(event) => {
                setFeedbackMessage(event.currentTarget.value);
                setFeedbackStatus(null);
              }}
            />
            <div class="settings-inline-actions">
              <button
                class="settings-secondary-btn"
                disabled={feedbackSending() || !feedbackEmail().trim() || !feedbackMessage().trim()}
                onClick={handleSubmitFeedback}
              >
                {feedbackSending()
                  ? t("settings.account.support.sending")
                  : t("settings.account.support.send")}
              </button>
            </div>
          </div>
        </Show>
        <Show when={feedbackStatus()}>
          {(status) => (
            <p
              class="settings-status"
              classList={{
                success: status().kind === "success",
                error: status().kind === "error",
              }}
            >
              {status().text}
            </p>
          )}
        </Show>
      </div>

      {/* Vessel Premium */}
      <div class="settings-field">
        <label class="settings-label">{t("settings.account.premium.label")}</label>
        <Show
          when={p.active()}
          fallback={
            <div class="premium-section">
              <p class="premium-description">{t("settings.account.premium.description")}</p>
              <div class="premium-activate-row">
                <input
                  class="settings-input premium-email-input"
                  type="email"
                  placeholder={t("settings.account.premium.emailPlaceholder")}
                  value={p.email()}
                  onInput={(e) => {
                    const nextEmail = e.currentTarget.value;
                    if (nextEmail.trim().toLowerCase() !== p.email().trim().toLowerCase()) {
                      p.resetFlow();
                      p.setMessage(null);
                    }
                    p.setEmail(nextEmail);
                  }}
                  spellcheck={false}
                />
                <button
                  class="premium-btn premium-btn-activate"
                  disabled={p.loading() || !p.email().trim()}
                  onClick={async () => {
                    p.setLoading(true);
                    p.setMessage(null);
                    try {
                      const result = await window.vessel.premium.requestCode(p.email().trim());
                      if (result.ok) {
                        p.setChallengeToken(result.challengeToken ?? "");
                        p.setCodeSent(true);
                        p.setMessage({
                          kind: "success",
                          text: t("settings.account.premium.codeSent"),
                        });
                      } else {
                        p.resetFlow();
                        p.setMessage({
                          kind: "error",
                          text: result.error || t("settings.account.premium.codeFailed"),
                        });
                      }
                    } catch (err) {
                      p.resetFlow();
                      p.setMessage({
                        kind: "error",
                        text:
                          err instanceof Error
                            ? err.message
                            : t("settings.account.premium.codeFailed"),
                      });
                    } finally {
                      p.setLoading(false);
                    }
                  }}
                >
                  {p.loading()
                    ? t("settings.account.premium.sending")
                    : p.codeSent()
                      ? t("settings.account.premium.resendCode")
                      : t("settings.account.premium.sendCode")}
                </button>
              </div>
              <Show when={p.codeSent()}>
                <div class="premium-activate-row">
                  <input
                    class="settings-input premium-email-input"
                    inputmode="numeric"
                    maxLength={6}
                    placeholder={t("settings.account.premium.codePlaceholder")}
                    value={p.code()}
                    onInput={(e) => {
                      const nextCode = e.currentTarget.value.replace(/\D+/g, "").slice(0, 6);
                      p.setCode(nextCode);
                      p.setMessage(null);
                    }}
                    spellcheck={false}
                  />
                  <button
                    class="premium-btn premium-btn-activate"
                    disabled={
                      p.loading() ||
                      !p.email().trim() ||
                      p.code().trim().length !== 6 ||
                      !p.challengeToken()
                    }
                    onClick={async () => {
                      p.setLoading(true);
                      p.setMessage(null);
                      try {
                        const result = await window.vessel.premium.verifyCode(
                          p.email().trim(),
                          p.code().trim(),
                          p.challengeToken(),
                        );
                        p.setState(result.state);
                        if (result.ok) {
                          p.resetFlow();
                          p.setMessage({
                            kind: "success",
                            text: t("settings.account.premium.activated"),
                          });
                        } else {
                          p.setMessage({
                            kind: "error",
                            text: result.error || t("settings.account.premium.verifyFailed"),
                          });
                        }
                      } catch (err) {
                        p.setMessage({
                          kind: "error",
                          text:
                            err instanceof Error
                              ? err.message
                              : t("settings.account.premium.verifyFailed"),
                        });
                      } finally {
                        p.setLoading(false);
                      }
                    }}
                  >
                    {p.loading()
                      ? t("settings.account.premium.verifying")
                      : t("settings.account.premium.verifyCode")}
                  </button>
                </div>
              </Show>
              <button
                class="premium-btn premium-btn-upgrade"
                disabled={p.loading()}
                onClick={() => {
                  p.startCheckout();
                }}
              >
                {p.loading()
                  ? t("settings.account.premium.openingCheckout")
                  : t("settings.account.premium.subscribe")}
              </button>
              <Show when={p.message()}>
                {(msg) => (
                  <p
                    class="settings-status"
                    classList={{
                      success: msg().kind === "success",
                      error: msg().kind === "error",
                    }}
                  >
                    {msg().text}
                  </p>
                )}
              </Show>
              <Show when={p.state().email || p.email()}>
                <button
                  class="premium-btn premium-btn-reset"
                  onClick={async () => {
                    const nextState = await window.vessel.premium.reset();
                    p.setState(nextState);
                    p.setEmail("");
                    p.resetFlow();
                    p.setMessage(null);
                  }}
                >
                  {t("settings.account.premium.clearEmail")}
                </button>
              </Show>
            </div>
          }
        >
          <div class="premium-section">
            <div class="premium-active-badge">
              {t("settings.account.premium.active")}
              <Show when={p.state().status === "trialing"}>
                {" "}
                {t("settings.account.premium.trial")}
              </Show>
            </div>
            <p class="premium-detail">
              {p.state().email}
              <Show when={p.state().expiresAt}>
                {" "}
                &middot; {t("settings.account.premium.renews")}{" "}
                {new Date(p.state().expiresAt).toLocaleDateString()}
              </Show>
            </p>
            <div class="premium-actions-row">
              <button
                class="premium-btn premium-btn-manage"
                onClick={async () => {
                  const result = await window.vessel.premium.portal();
                  if (!result.ok) {
                    p.setMessage({
                      kind: "error",
                      text: result.error || t("settings.account.premium.portalFailed"),
                    });
                    setTimeout(() => p.setMessage(null), STATUS_MESSAGE_LONG_CLEAR_MS);
                  }
                }}
              >
                {t("settings.account.premium.manage")}
              </button>
              <button
                class="premium-btn premium-btn-reset"
                onClick={async () => {
                  const nextState = await window.vessel.premium.reset();
                  p.setState(nextState);
                  p.setEmail("");
                  p.resetFlow();
                  p.setMessage(null);
                }}
              >
                {t("settings.account.premium.signOut")}
              </button>
            </div>
            <Show when={p.message()}>
              {(msg) => (
                <p
                  class="settings-status"
                  classList={{
                    success: msg().kind === "success",
                    error: msg().kind === "error",
                  }}
                >
                  {msg().text}
                </p>
              )}
            </Show>
          </div>
        </Show>
      </div>

      {/* Saved Sessions */}
      <div class="settings-field">
        <label class="settings-label">{t("settings.account.sessions.label")}</label>
        <p class="settings-hint" style="margin-bottom: 10px">
          {t("settings.account.sessions.hint")}
        </p>
        <div class="premium-activate-row" style="margin-bottom: 8px">
          <input
            class="settings-input premium-email-input"
            placeholder={t("settings.account.sessions.namePlaceholder")}
            value={s.saveName()}
            onInput={(e) => s.setSaveName(e.currentTarget.value)}
            spellcheck={false}
          />
          <button
            class="premium-btn premium-btn-activate"
            disabled={!s.saveName().trim()}
            onClick={async () => {
              try {
                await window.vessel.sessions.save(s.saveName().trim());
                s.setSaveName("");
                await s.loadList();
                props.setStatus({ kind: "success", text: t("settings.account.sessions.saved") });
                setTimeout(() => props.setStatus(null), STATUS_MESSAGE_CLEAR_MS);
              } catch (err) {
                props.setStatus({ kind: "error", text: String(err) });
              }
            }}
          >
            {t("settings.account.sessions.saveCurrent")}
          </button>
        </div>
        <Show when={s.list().length > 0}>
          <div class="vault-entries">
            <For each={s.list()}>
              {(session) => (
                <div class="vault-entry">
                  <div class="vault-entry-info">
                    <span class="vault-entry-label">{session.name}</span>
                    <span class="vault-entry-detail">
                      {new Date(session.updatedAt).toLocaleDateString()} &middot;{" "}
                      {t("settings.account.sessions.cookies", { count: session.cookieCount })}{" "}
                      &middot;{" "}
                      {t("settings.account.sessions.domains", { count: session.domains.length })}
                    </span>
                  </div>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <button
                      class="premium-btn premium-btn-activate"
                      style="padding: 2px 10px; font-size: 12px;"
                      onClick={async () => {
                        try {
                          await window.vessel.sessions.load(session.name);
                          props.setStatus({
                            kind: "success",
                            text: t("settings.account.sessions.restored", { name: session.name }),
                          });
                          setTimeout(() => props.setStatus(null), STATUS_MESSAGE_CLEAR_MS);
                        } catch (err) {
                          props.setStatus({ kind: "error", text: String(err) });
                        }
                      }}
                      title={t("settings.account.sessions.loadTitle")}
                    >
                      {t("settings.account.sessions.load")}
                    </button>
                    <button
                      class="vault-entry-remove"
                      onClick={async () => {
                        await window.vessel.sessions.delete(session.name);
                        await s.loadList();
                      }}
                      title={t("settings.account.sessions.deleteTitle")}
                    >
                      &times;
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default SettingsAccount;
