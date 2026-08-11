import { app, Menu } from "electron";
import { resolveLocale, t } from "../../shared/i18n";
import { loadSettings } from "../config/settings";

interface AppMenuHandlers {
  newWindow: () => void;
  reopenClosedTab: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  viewPageSource: () => void;
  savePageAs: () => void;
  clearBrowsingData: () => void;
  togglePictureInPicture: () => void;
}

let lastHandlers: AppMenuHandlers | null = null;

function resolveMenuLocale() {
  return resolveLocale(loadSettings().locale, app.getLocale());
}

function buildAppMenu(handlers: AppMenuHandlers): void {
  const locale = resolveMenuLocale();
  const appMenu = Menu.buildFromTemplate([
    {
      label: t(locale, "menu.file"),
      submenu: [
        {
          label: t(locale, "menu.file.newWindow"),
          accelerator: "CommandOrControl+N",
          click: handlers.newWindow,
        },
        {
          label: t(locale, "menu.file.savePageAs"),
          accelerator: "CommandOrControl+S",
          click: handlers.savePageAs,
        },
        {
          label: t(locale, "menu.file.clearBrowsingData"),
          accelerator: "CommandOrControl+Shift+Delete",
          click: handlers.clearBrowsingData,
        },
        {
          label: t(locale, "menu.file.reopenClosedTab"),
          accelerator: "CommandOrControl+Shift+T",
          click: handlers.reopenClosedTab,
        },
      ],
    },
    {
      label: t(locale, "menu.edit"),
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: t(locale, "menu.view"),
      submenu: [
        {
          label: t(locale, "menu.view.zoomIn"),
          accelerator: "CommandOrControl+Plus",
          click: handlers.zoomIn,
        },
        {
          label: t(locale, "menu.view.zoomOut"),
          accelerator: "CommandOrControl+-",
          click: handlers.zoomOut,
        },
        {
          label: t(locale, "menu.view.actualSize"),
          accelerator: "CommandOrControl+0",
          click: handlers.zoomReset,
        },
        { type: "separator" },
        {
          label: t(locale, "menu.view.viewPageSource"),
          accelerator: "CommandOrControl+U",
          click: handlers.viewPageSource,
        },
        {
          label: t(locale, "menu.view.togglePip"),
          accelerator: "CommandOrControl+Shift+I",
          click: handlers.togglePictureInPicture,
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(appMenu);
}

/** Builds and sets the application menu. */
export function setupAppMenu(handlers: AppMenuHandlers): void {
  lastHandlers = handlers;
  buildAppMenu(handlers);
}

/** Rebuild the application menu with the current locale (if menu was set up). */
export function refreshAppMenu(): void {
  if (!lastHandlers) return;
  buildAppMenu(lastHandlers);
}
