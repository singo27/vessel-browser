import { For, Show, createMemo, createSignal, type Component } from "solid-js";
import { LayersPlus, PanelTop, Plus, VenetianMask, Volume2, VolumeX } from "lucide-solid";
import { useTabs } from "../../stores/tabs";
import type { TabGroupColor, TabState } from "../../../../shared/types";
import { useNow } from "../../stores/clock";
import { useRuntime } from "../../stores/runtime";
import { useI18n } from "../../stores/i18n";
import { getAgentActiveTabIds } from "../../lib/agentActivity";
import { resolveTabNavigationIndex, type TabNavigationIntent } from "../../lib/tab-navigation";
import "./chrome.css";

const TAB_CLOSE_MS = 200;
const TAB_NAVIGATION_BY_KEY: Readonly<Record<string, TabNavigationIntent>> = {
  ArrowLeft: "previous",
  ArrowRight: "next",
  Home: "first",
  End: "last",
};

/** Generate a stable hue from a string (URL or title) for the avatar background. */
function stringToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ((hash % 360) + 360) % 360;
}

const TabFavicon = (props: {
  favicon?: string;
  title: string;
  url: string;
  newTabLabel: string;
}) => {
  const [failed, setFailed] = createSignal(false);
  const letter = () => {
    const title = props.title?.trim();
    if (title && title !== props.newTabLabel) return title[0].toUpperCase();
    try {
      return new URL(props.url).hostname[0]?.toUpperCase() || "?";
    } catch {
      return "?";
    }
  };
  const hue = () => stringToHue(props.url || props.title || "");

  return (
    <Show
      when={props.favicon && !failed()}
      fallback={
        <span class="tab-favicon-fallback" style={{ "--favicon-hue": `${hue()}` }}>
          {letter()}
        </span>
      }
    >
      <img class="tab-favicon" src={props.favicon} alt="" onError={() => setFailed(true)} />
    </Show>
  );
};

type TabBarEntry =
  | {
      type: "group";
      groupId: string;
      name: string;
      color: TabGroupColor;
      collapsed: boolean;
      count: number;
    }
  | { type: "tab"; tab: TabState };

const TabBar: Component = () => {
  const {
    tabs,
    activeTabId,
    switchTab,
    closeTab,
    createTab,
    createGroup,
    toggleGroupCollapsed,
    toggleMute,
  } = useTabs();
  const { runtimeState } = useRuntime();
  const { t } = useI18n();
  const now = useNow();
  const [closingTabIds, setClosingTabIds] = createSignal<Set<string>>(new Set());
  const newTabLabel = () => t("chrome.tabBar.newTab");

  const modelActiveTabIds = createMemo(() => getAgentActiveTabIds(runtimeState(), now()));

  const tabEntries = createMemo<TabBarEntry[]>(() => {
    const groupCounts = new Map<string, number>();
    for (const tab of tabs()) {
      if (tab.groupId) {
        groupCounts.set(tab.groupId, (groupCounts.get(tab.groupId) ?? 0) + 1);
      }
    }

    const seenGroups = new Set<string>();
    const groupDefault = t("chrome.tabBar.groupDefault");
    return tabs().flatMap((tab) => {
      const entries: TabBarEntry[] = [];
      if (tab.groupId && !seenGroups.has(tab.groupId)) {
        seenGroups.add(tab.groupId);
        entries.push({
          type: "group",
          groupId: tab.groupId,
          name: tab.groupName || groupDefault,
          color: tab.groupColor || "blue",
          collapsed: !!tab.groupCollapsed,
          count: groupCounts.get(tab.groupId) ?? 0,
        });
      }
      if (!tab.groupCollapsed || tab.id === activeTabId()) {
        entries.push({ type: "tab", tab });
      }
      return entries;
    });
  });

  const handleClose = (id: string) => {
    setClosingTabIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      closeTab(id);
      setClosingTabIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, TAB_CLOSE_MS);
  };

  const focusTab = (currentId: string, intent: TabNavigationIntent) => {
    const visibleTabs = tabEntries()
      .filter((entry): entry is Extract<TabBarEntry, { type: "tab" }> => entry.type === "tab")
      .map((entry) => entry.tab);
    const currentIndex = visibleTabs.findIndex((tab) => tab.id === currentId);
    const nextIndex = resolveTabNavigationIndex(currentIndex, visibleTabs.length, intent);
    if (nextIndex == null) return;
    const nextTab = visibleTabs[nextIndex];
    switchTab(nextTab.id);
    document.getElementById(`browser-tab-${nextTab.id}`)?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent, tabId: string) => {
    const navigationIntent = TAB_NAVIGATION_BY_KEY[event.key];
    if (navigationIntent) {
      event.preventDefault();
      focusTab(tabId, navigationIntent);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      switchTab(tabId);
    }
  };

  return (
    <div class="tab-bar">
      <div class="tab-list" role="tablist" aria-label={t("chrome.tabBar.ariaLabel")}>
        <For each={tabEntries()}>
          {(entry) => (
            <Show
              when={entry.type === "tab"}
              fallback={
                entry.type === "group" && (
                  <button
                    class={`tab-group-chip group-${entry.color}`}
                    classList={{ collapsed: entry.collapsed }}
                    onClick={() => void toggleGroupCollapsed(entry.groupId)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      window.vessel.tabs.showGroupContextMenu(entry.groupId);
                    }}
                    title={t("chrome.tabBar.groupTitle", { name: entry.name, count: entry.count })}
                  >
                    <span class="tab-group-dot" />
                    <span class="tab-group-name">{entry.name}</span>
                    <span class="tab-group-count">{entry.count}</span>
                  </button>
                )
              }
            >
              {entry.type === "tab" &&
                (() => {
                  const tab = entry.tab;
                  const tabTitle = tab.title || newTabLabel();
                  return (
                    <div
                      id={`browser-tab-${tab.id}`}
                      class={`tab-item ${tab.isPinned ? "pinned" : ""} ${tab.id === activeTabId() ? "active" : ""} ${
                        modelActiveTabIds().has(tab.id) ? "model-active" : ""
                      } ${tab.groupId ? `group-${tab.groupColor || "blue"}` : ""}`}
                      classList={{ closing: closingTabIds().has(tab.id) }}
                      onClick={() => switchTab(tab.id)}
                      onAuxClick={(e) => {
                        if (e.button === 1 && !tab.isPinned) handleClose(tab.id);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        window.vessel.tabs.showContextMenu(tab.id);
                      }}
                      title={
                        tab.isPinned
                          ? tab.title || tab.url
                          : modelActiveTabIds().has(tab.id)
                            ? t("chrome.tabBar.agentActiveTitle", { title: tabTitle })
                            : tab.title
                      }
                      role="tab"
                      aria-selected={tab.id === activeTabId()}
                      aria-label={tab.title || tab.url || newTabLabel()}
                      tabIndex={tab.id === activeTabId() ? 0 : -1}
                      onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
                    >
                      <TabFavicon
                        favicon={tab.favicon}
                        title={tabTitle}
                        url={tab.url}
                        newTabLabel={newTabLabel()}
                      />
                      <Show when={tab.isPinned && (tab.isAudible || tab.isMuted)}>
                        <button
                          class="tab-audio tab-audio-pinned"
                          onClick={(e) => {
                            e.stopPropagation();
                            void toggleMute(tab.id);
                          }}
                          title={tab.isMuted ? t("chrome.tabBar.unmute") : t("chrome.tabBar.mute")}
                          aria-label={
                            tab.isMuted
                              ? t("chrome.tabBar.unmuteAria", { title: tab.title })
                              : t("chrome.tabBar.muteAria", { title: tab.title })
                          }
                        >
                          <Show when={tab.isMuted} fallback={<Volume2 size={11} />}>
                            <VolumeX size={11} />
                          </Show>
                        </button>
                      </Show>
                      {!tab.isPinned && (
                        <>
                          {modelActiveTabIds().has(tab.id) && (
                            <span
                              class="tab-agent-indicator"
                              aria-hidden="true"
                              title={t("chrome.tabBar.agentActive")}
                            />
                          )}
                          <span class="tab-title">{tabTitle}</span>
                          <Show when={tab.isAudible || tab.isMuted}>
                            <button
                              class="tab-audio"
                              onClick={(e) => {
                                e.stopPropagation();
                                void toggleMute(tab.id);
                              }}
                              title={
                                tab.isMuted ? t("chrome.tabBar.unmute") : t("chrome.tabBar.mute")
                              }
                              aria-label={
                                tab.isMuted
                                  ? t("chrome.tabBar.unmuteAria", { title: tab.title })
                                  : t("chrome.tabBar.muteAria", { title: tab.title })
                              }
                            >
                              <Show when={tab.isMuted} fallback={<Volume2 size={12} />}>
                                <VolumeX size={12} />
                              </Show>
                            </button>
                          </Show>
                          {tab.isLoading && <span class="tab-loading" />}
                          <button
                            class="tab-close"
                            aria-label={
                              tab.title
                                ? t("chrome.tabBar.closeAria", { title: tab.title })
                                : t("chrome.tabBar.closeTab")
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClose(tab.id);
                            }}
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  );
                })()}
            </Show>
          )}
        </For>
      </div>
      <div class="tab-actions">
        <button
          class="tab-new"
          aria-label={t("chrome.tabBar.newWindow")}
          onClick={() => window.vessel.tabs.openNewWindow()}
          data-tooltip={t("chrome.tabBar.newWindow")}
          data-tooltip-pos="left"
        >
          <PanelTop size={14} />
        </button>
        <button
          class="tab-new"
          aria-label={t("chrome.tabBar.addToGroup")}
          onClick={() => {
            const id = activeTabId();
            if (id) void createGroup(id);
          }}
          data-tooltip={t("chrome.tabBar.addToGroup")}
          data-tooltip-pos="left"
        >
          <LayersPlus size={14} />
        </button>
        <button
          class="tab-new"
          aria-label={t("chrome.tabBar.newTabAction")}
          onClick={() => createTab()}
          data-tooltip={t("chrome.tabBar.newTabAction")}
          data-tooltip-pos="left"
        >
          <Plus size={15} />
        </button>
        <button
          class="tab-new tab-new-private"
          aria-label={t("chrome.tabBar.privateWindow")}
          onClick={() => window.vessel.tabs.openPrivateWindow()}
          data-tooltip={t("chrome.tabBar.privateWindow")}
          data-tooltip-pos="left"
        >
          <VenetianMask size={12} />
        </button>
      </div>
    </div>
  );
};

export default TabBar;
