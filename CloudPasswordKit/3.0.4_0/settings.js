var pwlog = void 0,
  pwerror = void 0;
function isStringEmpty(e) {
  return !e || 0 === e.length;
}
function urlFromURLString(e) {
  try {
    return new URL(e);
  } catch {
    return null;
  }
}
const WindowsVersion = { Higher: "Higher", Eleven: "Eleven", Ten: "Ten", Vista: "Vista", XPOrLower: "XPOrLower", NotWindows: "NotWindows", Other: "Other" };
function versionOfWindowsFromUserAgentIfRunningOnWindows() {
  const e = new RegExp("\\(Windows\\s*\\w*\\s*(\\d*)\\.(\\d*)", "i").exec(navigator.userAgent);
  return null === e || 3 !== e.length
    ? WindowsVersion.NotWindows
    : e[1] > 11
    ? WindowsVersion.Higher
    : 11 === e[1]
    ? WindowsVersion.Eleven
    : 10 === e[1]
    ? WindowsVersion.Ten
    : e[1] < 6
    ? WindowsVersion.XPOrLower
    : e[2] < 1
    ? WindowsVersion.Vista
    : WindowsVersion.Other;
}
function humanReadableFormType(e) {
  switch (e) {
    case WBSAutoFillFormTypeUndetermined:
      return "Undetermined";
    case WBSAutoFillFormTypeAutoFillableStandard:
      return "AutoFillable:Standard";
    case WBSAutoFillFormTypeNonAutoFillable:
      return "NonAutoFillable";
    case WBSAutoFillFormTypeAutoFillableLogin:
      return "AutoFillable:Login";
    case WBSAutoFillFormTypeNewAccount:
      return "NewAccount";
    case WBSAutoFillFormTypeChangePassword:
      return "ChangePassword";
    case WBSAutoFillFormTypeFoundTOTPURI:
      return "FoundTOTPUri";
  }
  return "Unrecognized";
}
function domainsForDisplayFromUsernamesAndDomains(e, t) {
  const n = e.length;
  let o = t.map(function (e) {
      return e.replace(/^(www|m)\./, "");
    }),
    i = [];
  for (var s = 0; s < n; s++) i.push([e[s], o[s]]);
  for (s = 0; s < n; s++) {
    let e = [];
    for (var r = s + 1; r < n; r++) i[s].join("\n") === i[r].join("\n") && (e.length || e.push(s), e.push(r));
    for (let n of e) o[n] = t[n];
  }
  return o;
}
function urlIsBrowserURL(e) {
  const t = e.protocol;
  return "chrome:" === t || "edge:" === t || "about:" === t;
}
function isExtensionContextInvalidatedError(e) {
  return "Extension context invalidated." === e.message;
}
function capabilitiesDeclaresMacOS(e) {
  try {
    return "macos" === e.operatingSystem.name;
  } catch {
    return !1;
  }
}
class Localizer {
  static configureDocumentElementForLanguage(e, t) {
    switch (t) {
      case "he":
      case "ar":
      case "fa":
        e.setAttribute("dir", "rtl"), e.setAttribute("lang", t);
    }
  }
  #e = {};
  constructor(e) {
    e && (this.#e = e.operatingSystem);
  }
  getMessage(e, t, n) {
    const o = this.messageNamesToTry(e);
    for (let e of o) {
      let o;
      try {
        o = chrome.i18n.getMessage(e, t, n);
      } catch {
        o = chrome.i18n.getMessage(e, t);
      }
      if (o) return o;
    }
    return "";
  }
  messageNamesToTry(e) {
    let t = [];
    const n = this.#e,
      o = n ? n.name : void 0,
      i = n ? n.majorVersion : void 0,
      s = n ? n.minorVersion : void 0,
      r = void 0 !== i;
    return o && r && void 0 !== s && t.push(`${e}_${o}_${i}_${s}`), o && r && t.push(`${e}_${o}_${i}`), o ? t.push(`${e}_${o}`) : t.push(`${e}_${this.#t}`), t.push(e), t;
  }
  get #t() {
    return navigator.platform.startsWith("Mac") ? "macos" : "windows";
  }
}
class ExtensionSettings {
  #n = !1;
  #o = !0;
  #i = !0;
  eventTarget = new EventTarget();
  constructor(e = !1) {
    (this.#n = e), this.#s(), this.#r();
  }
  get enableInPageAutoFill() {
    return this.#o;
  }
  set enableInPageAutoFill(e) {
    (this.#o = e), this.#l();
  }
  get allowExtensionToControlAutoFillSettings() {
    return this.#i;
  }
  set allowExtensionToControlAutoFillSettings(e) {
    (this.#i = e), this.#a().then(this.#l.bind(this));
  }
  #a() {
    return this.#i ? this.attemptToControlBrowserAutoFillSettings() : this.clearControlOfBrowserAutoFillSettings();
  }
  async attemptToControlBrowserAutoFillSettings() {
    if (this.#n) throw new Error("This Settings instance does not allow writing browser settings");
    const e = await Promise.allSettled([this.#g(chrome.privacy.services.passwordSavingEnabled, !1), this.#g(chrome.privacy.services.autofillCreditCardEnabled, !1), this.#g(chrome.privacy.services.autofillAddressEnabled, !1)]);
    return this.#c(), e;
  }
  async clearControlOfBrowserAutoFillSettings() {
    if (this.#n) throw new Error("This Settings instance does not allow writing browser settings");
    const e = await Promise.allSettled([this.#u(chrome.privacy.services.passwordSavingEnabled), this.#u(chrome.privacy.services.autofillCreditCardEnabled), this.#u(chrome.privacy.services.autofillAddressEnabled)]);
    return this.#c(), e;
  }
  #s() {
    let e = new Promise((e) => {
      chrome.storage.sync.get({ enableInPageAutoFill: !0, allowExtensionToControlAutoFillSettings: !0 }, (t) => {
        (this.#o = t.enableInPageAutoFill), (this.#i = t.allowExtensionToControlAutoFillSettings), e();
      });
    });
    return this.#n || (e = e.then(this.#a.bind(this))), e.then(this.#c.bind(this));
  }
  #l() {
    return new Promise((e) => {
      chrome.storage.sync.set({ enableInPageAutoFill: this.#o, allowExtensionToControlAutoFillSettings: this.#i }, e);
    }).then(this.#c.bind(this));
  }
  #r() {
    this.#n ||
      (chrome.privacy.services.passwordSavingEnabled &&
        chrome.privacy.services.passwordSavingEnabled.onChange.addListener((e) => {
          this.#c();
        }),
      chrome.privacy.services.autofillCreditCardEnabled &&
        chrome.privacy.services.autofillCreditCardEnabled.onChange.addListener((e) => {
          this.#c();
        }),
      chrome.privacy.services.autofillAddressEnabled &&
        chrome.privacy.services.autofillAddressEnabled.onChange.addListener((e) => {
          this.#c();
        }));
  }
  #c() {
    const e = new CustomEvent("settingsChanged", { detail: { enableInPageAutoFill: this.#o } });
    this.eventTarget.dispatchEvent(e);
  }
  async #g(e, t) {
    let n;
    try {
      n = await this.#d(e);
    } catch (e) {
      return;
    }
    if (n) {
      if (n.value === t) return { details: n, newValue: t };
      try {
        n = await e.set({ value: t });
      } catch (e) {
        return;
      }
      return { details: n, newValue: t };
    }
  }
  async #d(e) {
    if (!e) throw new Error(`Unable to get ${e} setting.`);
    const t = await e.get({});
    if ("not_controllable" === t.levelOfControl) throw new Error(`Cannot control ${e} setting.`);
    return t;
  }
  async #u(e) {
    if (!e) throw new Error(`Unable to clear browser setting: ${e}.`);
    await e.clear({});
  }
}
let extensionSettings = new ExtensionSettings();
function localizeSettingsPage() {
  (document.title = chrome.i18n.getMessage("optionsTitle")),
    document.querySelectorAll(".localizedElement").forEach((e) => {
      const t = e.dataset.localizedMessage;
      if (!t) return;
      const n = chrome.i18n.getMessage(t);
      e.textContent = n;
    });
}
window.addEventListener("DOMContentLoaded", (e) => {
  Localizer.configureDocumentElementForLanguage(document.documentElement, chrome.i18n.getUILanguage()), localizeSettingsPage();
  const setUpCheckbox = (e, t, n) => {
    const o = document.getElementById(e);
    (o.checked = t),
      o.addEventListener("change", (e) => {
        const t = e.target.checked;
        n(t);
      });
  };
  setUpCheckbox("enable-inpage-autofill-checkbox", extensionSettings.enableInPageAutoFill, (e) => {
    extensionSettings.enableInPageAutoFill = e;
  }),
    setUpCheckbox("allow-extention-to-control-autofill-checkbox", extensionSettings.allowExtensionToControlAutoFillSettings, (e) => {
      extensionSettings.allowExtensionToControlAutoFillSettings = e;
    }),
    extensionSettings.eventTarget.addEventListener("settingsChanged", (e) => {
      const t = e.detail;
      void 0 !== t.enableInPageAutoFill && (document.getElementById("enable-inpage-autofill-checkbox").checked = t.enableInPageAutoFill),
        void 0 !== t.allowExtensionToControlAutoFillSettings && (document.getElementById("allow-extention-to-control-autofill-checkbox").checked = t.allowExtensionToControlAutoFillSettings);
    });
});
