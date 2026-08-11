import { For, Show, type Component } from "solid-js";
import { useI18n } from "../../stores/i18n";
import type { SettingsVaultsProps } from "./settingsTypes";

const SettingsVaults: Component<SettingsVaultsProps> = (props) => {
  const { t } = useI18n();
  const v = props.vault;
  const h = props.humanVault;
  const a = props.autofill;

  return (
    <div class="settings-category-panel">
      {/* Agent Credential Vault */}
      <div class="settings-field">
        <label class="settings-label">
          {t("settings.vaults.agentVault.label")}
          <Show when={!props.premiumActive()}>
            <span class="vault-premium-badge">{t("settings.vaults.badge.premium")}</span>
          </Show>
        </label>
        <Show
          when={props.premiumActive()}
          fallback={<p class="settings-hint">{t("settings.vaults.agentVault.lockedHint")}</p>}
        >
          <p class="settings-hint" style="margin-bottom: 10px">
            {t("settings.vaults.agentVault.hint")}
          </p>

          <Show when={v.entries().length > 0}>
            <div class="vault-entries">
              <For each={v.entries()}>
                {(entry) => (
                  <div class="vault-entry">
                    <div class="vault-entry-info">
                      <span class="vault-entry-label">{entry.label}</span>
                      <span class="vault-entry-detail">
                        {entry.username} &middot; {entry.domainPattern}
                        <Show when={entry.useCount > 0}>
                          {" "}
                          &middot;{" "}
                          {t("settings.vaults.agentVault.usedCount", { count: entry.useCount })}
                        </Show>
                      </span>
                    </div>
                    <button
                      class="vault-entry-remove"
                      onClick={() => v.handleRemove(entry.id)}
                      title={t("settings.vaults.agentVault.removeTitle")}
                    >
                      &times;
                    </button>
                  </div>
                )}
              </For>
            </div>
          </Show>

          <Show when={!v.adding()}>
            <button
              class="vault-add-btn"
              onClick={() => {
                v.setAdding(true);
                v.setMessage(null);
              }}
            >
              {t("settings.vaults.agentVault.add")}
            </button>
          </Show>

          <Show when={v.adding()}>
            <div class="vault-add-form">
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.label")}
                value={v.newLabel()}
                onInput={(e) => v.setNewLabel(e.currentTarget.value)}
                spellcheck={false}
              />
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.domain")}
                value={v.newDomain()}
                onInput={(e) => v.setNewDomain(e.currentTarget.value)}
                spellcheck={false}
              />
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.username")}
                value={v.newUsername()}
                onInput={(e) => v.setNewUsername(e.currentTarget.value)}
                spellcheck={false}
              />
              <input
                class="settings-input"
                type="password"
                placeholder={t("settings.vaults.placeholders.password")}
                value={v.newPassword()}
                onInput={(e) => v.setNewPassword(e.currentTarget.value)}
              />
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.totp")}
                value={v.newTotp()}
                onInput={(e) => v.setNewTotp(e.currentTarget.value)}
                spellcheck={false}
              />
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.notes")}
                value={v.newNotes()}
                onInput={(e) => v.setNewNotes(e.currentTarget.value)}
                spellcheck={false}
              />
              <div class="vault-add-actions">
                <button class="premium-btn premium-btn-activate" onClick={() => v.handleAdd()}>
                  {t("settings.vaults.agentVault.save")}
                </button>
                <button
                  class="premium-btn premium-btn-reset"
                  onClick={() => {
                    v.setAdding(false);
                    v.setNewLabel("");
                    v.setNewDomain("");
                    v.setNewUsername("");
                    v.setNewPassword("");
                    v.setNewTotp("");
                    v.setNewNotes("");
                  }}
                >
                  {t("settings.vaults.agentVault.cancel")}
                </button>
              </div>
            </div>
          </Show>

          <Show when={v.message()}>
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
        </Show>
      </div>

      {/* Human Password Manager */}
      <div class="settings-field">
        <label class="settings-label">
          {t("settings.vaults.passwords.label")}
          <Show when={!props.premiumActive()}>
            <span class="vault-premium-badge">{t("settings.vaults.badge.premium")}</span>
          </Show>
        </label>
        <Show
          when={props.premiumActive()}
          fallback={<p class="settings-hint">{t("settings.vaults.passwords.lockedHint")}</p>}
        >
          <p class="settings-hint" style="margin-bottom: 10px">
            {t("settings.vaults.passwords.hint")}
          </p>

          <Show when={h.entries().length > 0}>
            <div class="vault-entries">
              <For each={h.entries()}>
                {(entry) => (
                  <div class="vault-entry">
                    <div class="vault-entry-info">
                      <span class="vault-entry-label">{entry.title}</span>
                      <span class="vault-entry-detail">
                        {entry.username} &middot; {entry.domain}
                        <Show when={entry.category && entry.category !== "login"}>
                          {" "}
                          &middot; {entry.category}
                        </Show>
                        <Show when={entry.useCount > 0}>
                          {" "}
                          &middot;{" "}
                          {t("settings.vaults.agentVault.usedCount", { count: entry.useCount })}
                        </Show>
                      </span>
                    </div>
                    <button
                      class="vault-entry-remove"
                      onClick={() => h.handleRemove(entry.id)}
                      title={t("settings.vaults.passwords.removeTitle")}
                    >
                      &times;
                    </button>
                  </div>
                )}
              </For>
            </div>
          </Show>

          <Show when={!h.adding()}>
            <button
              class="vault-add-btn"
              onClick={() => {
                h.setAdding(true);
              }}
            >
              {t("settings.vaults.passwords.add")}
            </button>
          </Show>

          <Show when={h.adding()}>
            <div class="vault-add-form">
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.title")}
                value={h.newTitle()}
                onInput={(e) => h.setNewTitle(e.currentTarget.value)}
                spellcheck={false}
              />
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.url")}
                value={h.newUrl()}
                onInput={(e) => h.setNewUrl(e.currentTarget.value)}
                spellcheck={false}
              />
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.username")}
                value={h.newUsername()}
                onInput={(e) => h.setNewUsername(e.currentTarget.value)}
                spellcheck={false}
              />
              <input
                class="settings-input"
                type="password"
                placeholder={t("settings.vaults.placeholders.password")}
                value={h.newPassword()}
                onInput={(e) => h.setNewPassword(e.currentTarget.value)}
              />
              <select
                class="settings-input settings-select"
                value={h.newCategory()}
                onChange={(e) => h.setNewCategory(e.currentTarget.value)}
              >
                <option value="login">{t("settings.vaults.passwords.category.login")}</option>
                <option value="credit_card">
                  {t("settings.vaults.passwords.category.creditCard")}
                </option>
                <option value="identity">{t("settings.vaults.passwords.category.identity")}</option>
                <option value="secure_note">
                  {t("settings.vaults.passwords.category.secureNote")}
                </option>
              </select>
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.notes")}
                value={h.newNotes()}
                onInput={(e) => h.setNewNotes(e.currentTarget.value)}
                spellcheck={false}
              />
              <div class="vault-add-actions">
                <button class="premium-btn premium-btn-activate" onClick={() => h.handleAdd()}>
                  {t("settings.vaults.passwords.save")}
                </button>
                <button
                  class="premium-btn premium-btn-reset"
                  onClick={() => {
                    h.setAdding(false);
                    h.setNewTitle("");
                    h.setNewUrl("");
                    h.setNewUsername("");
                    h.setNewPassword("");
                    h.setNewNotes("");
                    h.setNewCategory("login");
                  }}
                >
                  {t("settings.vaults.agentVault.cancel")}
                </button>
              </div>
            </div>
          </Show>

          <Show when={h.message()}>
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
        </Show>
      </div>

      {/* Form Autofill */}
      <div class="settings-field">
        <label class="settings-label">{t("settings.vaults.autofill.label")}</label>
        <p class="settings-hint" style="margin-bottom: 10px">
          {t("settings.vaults.autofill.hint")}
        </p>

        <Show when={a.profiles().length > 0}>
          <div class="vault-entries">
            <For each={a.profiles()}>
              {(profile) => (
                <div class="vault-entry">
                  <div class="vault-entry-info">
                    <span class="vault-entry-label">{profile.label}</span>
                    <span class="vault-entry-detail">
                      {profile.firstName}
                      {profile.lastName ? ` ${profile.lastName}` : ""}
                      {profile.email ? ` · ${profile.email}` : ""}
                    </span>
                  </div>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <button
                      class="premium-btn premium-btn-activate"
                      style="padding: 2px 10px; font-size: 12px;"
                      onClick={() => a.handleFill(profile.id)}
                      title={t("settings.vaults.autofill.fillTitle")}
                    >
                      {t("settings.vaults.autofill.fill")}
                    </button>
                    <button
                      class="vault-entry-remove"
                      onClick={() => a.handleRemove(profile.id)}
                      title={t("settings.vaults.autofill.removeTitle")}
                    >
                      &times;
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>

        <Show when={!a.adding()}>
          <button
            class="vault-add-btn"
            onClick={() => {
              a.setAdding(true);
            }}
          >
            {t("settings.vaults.autofill.add")}
          </button>
        </Show>

        <Show when={a.adding()}>
          <div class="vault-add-form">
            <input
              class="settings-input"
              placeholder={t("settings.vaults.placeholders.profileName")}
              value={a.label()}
              onInput={(e) => a.setLabel(e.currentTarget.value)}
              spellcheck={false}
            />
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.firstName")}
                value={a.firstName()}
                onInput={(e) => a.setFirstName(e.currentTarget.value)}
              />
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.lastName")}
                value={a.lastName()}
                onInput={(e) => a.setLastName(e.currentTarget.value)}
              />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.email")}
                value={a.email()}
                onInput={(e) => a.setEmail(e.currentTarget.value)}
                spellcheck={false}
              />
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.phone")}
                value={a.phone()}
                onInput={(e) => a.setPhone(e.currentTarget.value)}
              />
            </div>
            <input
              class="settings-input"
              placeholder={t("settings.vaults.placeholders.organization")}
              value={a.organization()}
              onInput={(e) => a.setOrganization(e.currentTarget.value)}
            />
            <input
              class="settings-input"
              placeholder={t("settings.vaults.placeholders.address1")}
              value={a.addressLine1()}
              onInput={(e) => a.setAddressLine1(e.currentTarget.value)}
            />
            <input
              class="settings-input"
              placeholder={t("settings.vaults.placeholders.address2")}
              value={a.addressLine2()}
              onInput={(e) => a.setAddressLine2(e.currentTarget.value)}
            />
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.city")}
                value={a.city()}
                onInput={(e) => a.setCity(e.currentTarget.value)}
              />
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.state")}
                value={a.state()}
                onInput={(e) => a.setState(e.currentTarget.value)}
              />
              <input
                class="settings-input"
                placeholder={t("settings.vaults.placeholders.postal")}
                value={a.postalCode()}
                onInput={(e) => a.setPostalCode(e.currentTarget.value)}
              />
            </div>
            <input
              class="settings-input"
              placeholder={t("settings.vaults.placeholders.country")}
              value={a.country()}
              onInput={(e) => a.setCountry(e.currentTarget.value)}
            />
            <div class="vault-add-actions">
              <button class="premium-btn premium-btn-activate" onClick={() => a.handleAdd()}>
                {t("settings.vaults.autofill.save")}
              </button>
              <button
                class="premium-btn premium-btn-reset"
                onClick={() => {
                  a.setAdding(false);
                  a.setLabel("");
                  a.setFirstName("");
                  a.setLastName("");
                  a.setEmail("");
                  a.setPhone("");
                  a.setOrganization("");
                  a.setAddressLine1("");
                  a.setAddressLine2("");
                  a.setCity("");
                  a.setState("");
                  a.setPostalCode("");
                  a.setCountry("");
                }}
              >
                {t("settings.vaults.agentVault.cancel")}
              </button>
            </div>
          </div>
        </Show>

        <Show when={a.message()}>
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
    </div>
  );
};

export default SettingsVaults;
