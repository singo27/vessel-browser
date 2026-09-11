import { createSignal, Show, type Component } from "solid-js";
import { Check, X } from "lucide-solid";
import type { ClearDataTimeRange } from "../../../../shared/types";
import { useI18n } from "../../stores/i18n";
import "./chrome.css";
import { useModalFocus } from "../../lib/useModalFocus";

const TIME_RANGE_KEYS: { value: ClearDataTimeRange; key: string }[] = [
  { value: "hour", key: "chrome.clearData.range.hour" },
  { value: "day", key: "chrome.clearData.range.day" },
  { value: "week", key: "chrome.clearData.range.week" },
  { value: "month", key: "chrome.clearData.range.month" },
  { value: "all", key: "chrome.clearData.range.all" },
];

const ClearBrowsingData: Component<{
  open: boolean;
  onClose: () => void;
}> = (props) => {
  const { t } = useI18n();
  const [cache, setCache] = createSignal(true);
  const [cookies, setCookies] = createSignal(false);
  const [history, setHistory] = createSignal(true);
  const [localStorage, setLocalStorage] = createSignal(false);
  const [timeRange, setTimeRange] = createSignal<ClearDataTimeRange>("all");
  const [clearing, setClearing] = createSignal(false);
  const [done, setDone] = createSignal(false);
  const [error, setError] = createSignal("");
  let dialogRef: HTMLDivElement | undefined;

  const handleClear = async () => {
    setClearing(true);
    setError("");
    try {
      await window.vessel.browsingData.clear({
        cache: cache(),
        cookies: cookies(),
        history: history(),
        localStorage: localStorage(),
        timeRange: timeRange(),
      });
      setDone(true);
      setTimeout(() => {
        props.onClose();
        setDone(false);
      }, 1500);
    } catch {
      setError(t("chrome.clearData.error"));
    } finally {
      setClearing(false);
    }
  };

  const reset = () => {
    setCache(true);
    setCookies(false);
    setHistory(true);
    setLocalStorage(false);
    setTimeRange("all");
    setDone(false);
    setError("");
  };
  const close = () => {
    reset();
    props.onClose();
  };
  useModalFocus(
    () => props.open,
    () => dialogRef,
    close,
  );

  return (
    <Show when={props.open}>
      <div class="clear-data-overlay" onClick={close}>
        <div
          ref={dialogRef}
          class="clear-data-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-data-title"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <Show
            when={!done()}
            fallback={
              <div class="clear-data-done" role="status" aria-live="polite">
                <Check size={20} stroke-width={2.5} />
                <span>{t("chrome.clearData.done")}</span>
              </div>
            }
          >
            <div class="clear-data-header">
              <h3 id="clear-data-title">{t("chrome.clearData.title")}</h3>
              <button
                class="clear-data-close"
                onClick={() => {
                  close();
                }}
                aria-label={t("chrome.clearData.closeAria")}
              >
                <X size={14} />
              </button>
            </div>

            <div class="clear-data-range">
              <label>{t("chrome.clearData.timeRange")}</label>
              <select
                value={timeRange()}
                onChange={(e) => setTimeRange(e.currentTarget.value as ClearDataTimeRange)}
                class="clear-data-select"
              >
                {TIME_RANGE_KEYS.map((r) => (
                  <option value={r.value}>{t(r.key)}</option>
                ))}
              </select>
            </div>

            <div class="clear-data-checks">
              <label class="clear-data-check">
                <input
                  type="checkbox"
                  checked={cache()}
                  onChange={(e) => setCache(e.currentTarget.checked)}
                />
                <span>{t("chrome.clearData.cache")}</span>
              </label>
              <label class="clear-data-check">
                <input
                  type="checkbox"
                  checked={cookies()}
                  onChange={(e) => setCookies(e.currentTarget.checked)}
                />
                <span>{t("chrome.clearData.cookies")}</span>
              </label>
              <label class="clear-data-check">
                <input
                  type="checkbox"
                  checked={history()}
                  onChange={(e) => setHistory(e.currentTarget.checked)}
                />
                <span>{t("chrome.clearData.history")}</span>
              </label>
              <label class="clear-data-check">
                <input
                  type="checkbox"
                  checked={localStorage()}
                  onChange={(e) => setLocalStorage(e.currentTarget.checked)}
                />
                <span>{t("chrome.clearData.localStorage")}</span>
              </label>
            </div>

            <Show when={error()}>
              <div class="clear-data-error" role="alert">
                {error()}
              </div>
            </Show>

            <div class="clear-data-actions">
              <button
                class="clear-data-cancel"
                onClick={() => {
                  close();
                }}
              >
                {t("chrome.clearData.cancel")}
              </button>
              <button
                class="clear-data-confirm"
                disabled={clearing() || (!cache() && !cookies() && !history() && !localStorage())}
                onClick={handleClear}
              >
                {clearing() ? t("chrome.clearData.clearing") : t("chrome.clearData.confirm")}
              </button>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default ClearBrowsingData;
