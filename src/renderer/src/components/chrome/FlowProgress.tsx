import { For, Show, createMemo, type Component } from "solid-js";
import { useRuntime } from "../../stores/runtime";
import { useI18n } from "../../stores/i18n";
import "./chrome.css";

const statusIcon: Record<string, string> = {
  active: "\u25B6",
  completed: "\u2713",
  abandoned: "\u2717",
  blocked: "\u23F8",
};

const FlowProgress: Component = () => {
  const { runtimeState } = useRuntime();
  const { t } = useI18n();

  const statusLabel = (status: string) => {
    switch (status) {
      case "active":
        return t("chrome.flowProgress.status.active");
      case "completed":
        return t("chrome.flowProgress.status.completed");
      case "abandoned":
        return t("chrome.flowProgress.status.abandoned");
      case "blocked":
        return t("chrome.flowProgress.status.blocked");
      default:
        return status;
    }
  };

  const flow = createMemo(() => runtimeState().flowState);
  const tracker = createMemo(() => runtimeState().taskTracker);
  const taskMemory = createMemo(() => runtimeState().taskMemory);

  const stepStatusClass = (status: string) => {
    switch (status) {
      case "done":
        return "flow-step-done";
      case "active":
        return "flow-step-active";
      case "failed":
        return "flow-step-failed";
      case "skipped":
        return "flow-step-skipped";
      default:
        return "flow-step-pending";
    }
  };

  const progressPercent = (steps: { status: string }[]) => {
    if (steps.length === 0) return 0;
    const done = steps.filter((s) => s.status === "done" || s.status === "skipped").length;
    return Math.round((done / steps.length) * 100);
  };

  return (
    <Show when={flow() || tracker() || taskMemory()}>
      <div class="flow-progress">
        <Show when={taskMemory()}>
          {(tm) => (
            <div
              class="flow-progress-section"
              style={{ "margin-bottom": tracker() || flow() ? "12px" : "0" }}
            >
              <div class="flow-progress-header">
                <span class="flow-progress-goal">
                  {statusIcon[tm().status]} {tm().goal}
                </span>
                <span class={`task-memory-status task-memory-status-${tm().status}`}>
                  {statusLabel(tm().status)}
                </span>
              </div>
              <Show when={tm().blocker}>
                <div class="task-memory-blocker">
                  {t("chrome.flowProgress.blocked", { reason: tm().blocker! })}
                </div>
              </Show>
              <Show when={tm().nextStep}>
                <div class="task-memory-next-step">
                  {t("chrome.flowProgress.next", { step: tm().nextStep! })}
                </div>
              </Show>
              <Show when={Object.keys(tm().facts).length > 0}>
                <div class="task-memory-facts">
                  <For each={Object.entries(tm().facts)}>
                    {([key, value]) => (
                      <div class="task-memory-fact">
                        <span class="task-memory-fact-key">{key}</span>
                        <span class="task-memory-fact-value">{value}</span>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
              <Show when={tm().notes.length > 0}>
                <div class="task-memory-notes">
                  <For each={tm().notes.slice(-3)}>
                    {(note) => (
                      <div class="task-memory-note">
                        <span class="task-memory-note-time">{note.createdAt.slice(11, 16)}</span>
                        <span class="task-memory-note-text">{note.text}</span>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          )}
        </Show>
        <Show when={tracker()}>
          {(trackerState) => (
            <div class="flow-progress-section">
              <div class="flow-progress-header">
                <span class="flow-progress-goal">{trackerState().goal}</span>
                <span class="flow-progress-pct">{progressPercent(trackerState().steps)}%</span>
              </div>
              <div class="flow-progress-bar-track">
                <div
                  class="flow-progress-bar-fill"
                  style={{ width: `${progressPercent(trackerState().steps)}%` }}
                />
              </div>
              <div class="flow-steps">
                <For each={trackerState().steps}>
                  {(step) => (
                    <div class={`flow-step ${stepStatusClass(step.status)}`}>
                      <span class="flow-step-dot" />
                      <span class="flow-step-label">{step.label}</span>
                    </div>
                  )}
                </For>
              </div>
              <Show when={trackerState().lastAction}>
                <div class="flow-progress-hint">
                  {t("chrome.flowProgress.last", { action: trackerState().lastAction! })}
                </div>
              </Show>
              <Show
                when={
                  trackerState().nextHint && !trackerState().steps.every((s) => s.status === "done")
                }
              >
                <div class="flow-progress-hint">
                  {t("chrome.flowProgress.next", { step: trackerState().nextHint! })}
                </div>
              </Show>
            </div>
          )}
        </Show>
        <Show when={flow() && !tracker()}>
          {(f) => (
            <div class="flow-progress-section">
              <div class="flow-progress-header">
                <span class="flow-progress-goal">{f().goal}</span>
                <span class="flow-progress-pct">{progressPercent(f().steps)}%</span>
              </div>
              <div class="flow-progress-bar-track">
                <div
                  class="flow-progress-bar-fill"
                  style={{ width: `${progressPercent(f().steps)}%` }}
                />
              </div>
              <div class="flow-steps">
                <For each={f().steps}>
                  {(step) => (
                    <div class={`flow-step ${stepStatusClass(step.status)}`}>
                      <span class="flow-step-dot" />
                      <span class="flow-step-label">{step.label}</span>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </Show>
      </div>
    </Show>
  );
};

export default FlowProgress;
