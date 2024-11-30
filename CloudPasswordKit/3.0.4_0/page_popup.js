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
    s = [];
  for (var a = 0; a < n; a++) s.push([e[a], o[a]]);
  for (a = 0; a < n; a++) {
    let e = [];
    for (var i = a + 1; i < n; i++) s[a].join("\n") === s[i].join("\n") && (e.length || e.push(a), e.push(i));
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
      s = n ? n.majorVersion : void 0,
      a = n ? n.minorVersion : void 0,
      i = void 0 !== s;
    return o && i && void 0 !== a && t.push(`${e}_${o}_${s}_${a}`), o && i && t.push(`${e}_${o}_${s}`), o ? t.push(`${e}_${o}`) : t.push(`${e}_${this.#t}`), t.push(e), t;
  }
  get #t() {
    return navigator.platform.startsWith("Mac") ? "macos" : "windows";
  }
}
class ExtensionSettings {
  #n = !1;
  #o = !0;
  #s = !0;
  eventTarget = new EventTarget();
  constructor(e = !1) {
    (this.#n = e), this.#a(), this.#i();
  }
  get enableInPageAutoFill() {
    return this.#o;
  }
  set enableInPageAutoFill(e) {
    (this.#o = e), this.#r();
  }
  get allowExtensionToControlAutoFillSettings() {
    return this.#s;
  }
  set allowExtensionToControlAutoFillSettings(e) {
    (this.#s = e), this.#l().then(this.#r.bind(this));
  }
  #l() {
    return this.#s ? this.attemptToControlBrowserAutoFillSettings() : this.clearControlOfBrowserAutoFillSettings();
  }
  async attemptToControlBrowserAutoFillSettings() {
    if (this.#n) throw new Error("This Settings instance does not allow writing browser settings");
    const e = await Promise.allSettled([this.#d(chrome.privacy.services.passwordSavingEnabled, !1), this.#d(chrome.privacy.services.autofillCreditCardEnabled, !1), this.#d(chrome.privacy.services.autofillAddressEnabled, !1)]);
    return this.#c(), e;
  }
  async clearControlOfBrowserAutoFillSettings() {
    if (this.#n) throw new Error("This Settings instance does not allow writing browser settings");
    const e = await Promise.allSettled([this.#u(chrome.privacy.services.passwordSavingEnabled), this.#u(chrome.privacy.services.autofillCreditCardEnabled), this.#u(chrome.privacy.services.autofillAddressEnabled)]);
    return this.#c(), e;
  }
  #a() {
    let e = new Promise((e) => {
      chrome.storage.sync.get({ enableInPageAutoFill: !0, allowExtensionToControlAutoFillSettings: !0 }, (t) => {
        (this.#o = t.enableInPageAutoFill), (this.#s = t.allowExtensionToControlAutoFillSettings), e();
      });
    });
    return this.#n || (e = e.then(this.#l.bind(this))), e.then(this.#c.bind(this));
  }
  #r() {
    return new Promise((e) => {
      chrome.storage.sync.set({ enableInPageAutoFill: this.#o, allowExtensionToControlAutoFillSettings: this.#s }, e);
    }).then(this.#c.bind(this));
  }
  #i() {
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
  async #d(e, t) {
    let n;
    try {
      n = await this.#g(e);
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
  async #g(e) {
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
const ContextState = {
    IncompatibleOS: "IncompatibleOS",
    NotInSession: "NotInSession",
    NativeSupportNotInstalled: "NativeSupportNotInstalled",
    CheckEngine: "CheckEngine",
    ChallengeSent: "ChallengeSent",
    MSG1Set: "MSG1Set",
    SessionKeySet: "SessionKeySet",
  },
  DataState = { Initial: "Initial", Frame0Processed: "Frame0Processed", DataProcessed: "DataProcessed" },
  RememberIC = { NoValueSet: "NoValueSet", UnknownPage: "UnknownPage", DoNotRemember: "DoNotRemember", RememberLoginAndPassword: "RememberLoginAndPassword" },
  WBSAutoFillFormTypeUndetermined = 0,
  WBSAutoFillFormTypeAutoFillableStandard = 1,
  WBSAutoFillFormTypeNonAutoFillable = 2,
  WBSAutoFillFormTypeAutoFillableLogin = 3,
  WBSAutoFillFormTypeNewAccount = 4,
  WBSAutoFillFormTypeChangePassword = 5,
  WBSAutoFillFormTypeFoundTOTPURI = 6;
var g_lastUpdatedPopupContentsState,
  g_portToBackgroundPage = null,
  g_appStoreURL = null,
  g_capabilities = null,
  g_localizer = new Localizer();
function setControlText(e, t) {
  var n = document.getElementById(e);
  n && ((n.textContent = g_localizer.getMessage(t)), n.textContent);
}
function setMessageTitle(e) {
  var t = document.getElementById("divMessageBoardTitle");
  t && ((t.textContent = g_localizer.getMessage(e)), t.textContent);
}
function setMessageSubtitle(e) {
  var t = document.getElementById("divMessageBoardMessage");
  t && ((t.textContent = g_localizer.getMessage(e)), t.textContent);
}
function showMessage(e, t, n) {
  (document.querySelector("#iCloudIconId").style.display = n ? "block" : "none"), setMessageTitle(e), setMessageSubtitle(t);
  let o = document.getElementById("divMessageBoard");
  (o.style.display = "block"), n ? o.classList.add("logo-is-present") : o.classList.remove("logo-is-present");
}
function showMessageWithOpenPasswordManagerButton(e, t, n) {
  showMessage(e, t);
  let o = document.querySelector("#openPasswordManagerList");
  if (!o.children.length) {
    o.appendChild(listItemForOpenPasswordManager());
    capabilitiesDeclaresMacOS(g_capabilities) && n && o.appendChild(listItemForOpenPageInSafari());
  }
}
function SetOpeniC4WTitleText(e) {
  var t = document.getElementById("idOpeniC4WTitle");
  t && ((t.textContent = g_localizer.getMessage(e)), t.textContent);
}
function SetOpeniC4WButtonText(e) {
  var t = document.getElementById("idOpeniC4WButton");
  t && ((t.textContent = g_localizer.getMessage(e)), t.textContent);
}
function clearCredentialListContents() {
  let e = document.getElementById("credentialList");
  for (; e.firstChild; ) e.removeChild(e.lastChild);
}
function tryToEstablishNativeConnectionInResponseToUserActivatingPopupAfterDelay() {
  setTimeout(function () {
    sendMessageToBackgroundPage({ subject: "tryToEstablishNativeConnectionInResponseToUserActivatingPopup" });
  }, 50);
}
function updatePopupContents(e) {
  const t = /firefox/i.test(navigator.userAgent) && versionOfWindowsFromUserAgentIfRunningOnWindows() !== WindowsVersion.NotWindows;
  if (!t && g_lastUpdatedPopupContentsState && g_lastUpdatedPopupContentsState === ContextState.NativeSupportNotInstalled && e === ContextState.NativeSupportNotInstalled) return;
  g_lastUpdatedPopupContentsState = e;
  let n = document.getElementById("divPIN"),
    o = document.getElementById("divMessageBoard"),
    s = document.getElementById("divICs"),
    a = document.getElementById("divDownloadPage"),
    i = document.getElementById("divOpeniC4WPage");
  for (let e of [n, o, s, a, i]) e.style.display = "none";
  chrome.tabs.query({ active: !0, currentWindow: !0 }, function (o) {
    switch (e) {
      case ContextState.IncompatibleOS:
        document.querySelector("#openPasswordManagerList").remove(), showMessage("extName", "unsupportedOS", !0);
        break;
      case ContextState.NativeSupportNotInstalled:
        setControlText("downloadMessage", t ? "firefoxAvailabilityMessage" : "downloadMessage"),
          (document.querySelector("#iCloudIconId").style.display = "block"),
          a.classList.add("logo-is-present"),
          (a.style.display = "block"),
          g_appStoreURL && !t ? setControlText("downloadButton", "downloadButton") : document.getElementById("downloadButton").remove(),
          tryToEstablishNativeConnectionInResponseToUserActivatingPopupAfterDelay();
        break;
      case ContextState.NotInSession:
        showMessage("extName", "GettingPasswords"), sendMessageToBackgroundPage({ subject: "challengePIN" });
        break;
      case ContextState.CheckEngine:
        SetOpeniC4WTitleText("CheckEngineMessage"), SetOpeniC4WButtonText("openiCloudForWindowsButtonText"), (i.style.display = "block");
        break;
      case ContextState.ChallengeSent:
      case ContextState.MSG1Set:
        setControlText("divPINTitle", "enableAutoFillPasswordsTitle"),
          setControlText("divPINMessage", "divPINMessage"),
          mapOverPINFields(function (e) {
            (e.value = ""), (e.onkeydown = pinKeyHandler);
          }),
          (n.style.display = "block"),
          (document.querySelector("#iCloudIconId").style.display = "block"),
          document.getElementById("PIN0").focus(),
          isInPopupWindow() && document.body.classList.add("popupWindow");
        break;
      case ContextState.SessionKeySet: {
        if (isInPopupWindow()) return void window.close();
        setMessageTitle("extName", "GettingPasswords"), setControlText("divICsMessage", "divICsMessage"), clearCredentialListContents();
        const e = o[0].id;
        chrome.webNavigation.getAllFrames({ tabId: e }, (t) => {
          t.forEach(async (t, n) => {
            JSON.stringify(t);
            const s = t.frameId,
              a = new URL(t.url),
              i = a.protocol;
            if ("http:" !== i && "https:" !== i) return t.url, void showMessageWithOpenPasswordManagerButton("GenericPopupTitle", "divNoPasswordsMessage", !1);
            let r;
            try {
              r = await chrome.tabs.sendMessage(e, { from: "popup", subject: "getPageType", URL: a.hostname, tabId: e, frameId: s }, { frameId: s });
            } catch (e) {
              e.message, (r = WBSAutoFillFormTypeUndetermined);
            }
            switch ((r || (a.hostname, o[0].id, t.frameId, (r = WBSAutoFillFormTypeUndetermined)), a.hostname, o[0].id, t.frameId, humanReadableFormType(r), humanReadableFormType(r), r)) {
              case WBSAutoFillFormTypeUndetermined:
              case WBSAutoFillFormTypeAutoFillableStandard:
              case WBSAutoFillFormTypeNonAutoFillable:
                showMessageWithOpenPasswordManagerButton("GenericPopupTitle", "divNoPasswordsMessage", !0);
                break;
              case WBSAutoFillFormTypeAutoFillableLogin:
              case WBSAutoFillFormTypeChangePassword:
              case WBSAutoFillFormTypeNewAccount:
                showMessage("extName", "GettingPasswords"), sendMessageToBackgroundPage({ subject: "GetLoginNames4URL", hostname: a.hostname, tabId: o[0].id, frameId: t.frameId });
                break;
              case WBSAutoFillFormTypeFoundTOTPURI: {
                let e;
                try {
                  e = await chrome.tabs.sendMessage(o[0].id, { from: "popup", subject: "getTOTPSetupInfo", URL: a.hostname, tabId: o[0].id, frameId: t.frameId }, { frameId: t.frameId });
                } catch (e) {
                  break;
                }
                updatePopupContentsWithTOTPSetupInfo(e, a.hostname, o[0].id, t.frameId);
                break;
              }
            }
          });
        });
        break;
      }
      default:
        n.style.display = "block";
    }
  });
}
function listItemMouseOverHandler(e) {
  let t = e.target.closest("li");
  if (!t) return;
  let n = t.closest("ul");
  if (n) {
    for (let e of n.querySelectorAll("li")) e.classList.remove("active");
    t.classList.add("active");
  }
}
function listItemMouseOutHandler(e) {
  let t = e.target.closest("li");
  t && t.classList.remove("active");
}
function isInPopupWindow() {
  return !!new URLSearchParams(document.location.search).get("popupWindow");
}
function canDoOneTimeReload() {
  return "1" !== new URLSearchParams(document.location.search).get("hasAlreadyReloaded");
}
function updatePopupContentsWithTOTPSetupInfo(e, t, n, o) {
  let s = document.getElementById("divPIN"),
    a = document.getElementById("divMessageBoard"),
    i = document.getElementById("divICs"),
    r = document.getElementById("divDownloadPage"),
    l = document.getElementById("divOpeniC4WPage");
  for (let e of [s, a, i, r, l]) e.style.display = "none";
  let d = document.getElementById("credentialList");
  try {
    (document.querySelector("#iCloudIconId").style.display = "none"), clearCredentialListContents();
    for (const [n, o] of Object.entries(e)) {
      let e = document.createElement("li");
      e.classList.add("selectable"), e.classList.add("credential"), (e.onmouseover = listItemMouseOverHandler), (e.onmouseout = listItemMouseOutHandler);
      let n = document.createElement("img");
      n.setAttribute("src", "images/key.svg"), e.appendChild(n);
      let s = document.createElement("p");
      s.classList.add("totpwebsite"),
        (s.textContent = t),
        e.appendChild(s),
        e.addEventListener("click", function () {
          chrome.tabs.query({ active: !0, currentWindow: !0 }, function (e) {
            sendMessageToBackgroundPage({ subject: "SetUpTOTP", theURL: t, theTOTPURI: o }), window.close();
          });
        }),
        d.appendChild(e);
    }
    d.appendChild(listItemForOpenPasswordManager());
  } catch (e) {
    e.message;
  }
  let c = document.querySelector("#divMessageBoard .credential-list");
  c && c.remove(), setControlText("divICsMessage", "divTOTPTitle"), (i.style.display = "block");
}
async function updatePopupContents_ICs(e, t, n, o, s, a) {
  var i = document.getElementById("divPIN"),
    r = document.getElementById("divMessageBoard"),
    l = document.getElementById("divICs"),
    d = document.getElementById("divDownloadPage"),
    c = document.getElementById("divOpeniC4WPage");
  for (let e of [i, r, l, d, c]) e.style.display = "none";
  let u = document.getElementById("credentialList");
  switch (e) {
    case RememberIC.UnknownPage:
      showMessageWithOpenPasswordManagerButton("GenericPopupTitle", "divNoPasswordsMessage", !0);
      break;
    case RememberIC.DoNotRemember:
      showMessageWithOpenPasswordManagerButton("divDoNotRememberTitle", "divDoNotRememberMessage", !0);
      break;
    case RememberIC.RememberLoginAndPassword: {
      let a;
      try {
        a = await chrome.tabs.sendMessage(t, { from: "popup", subject: "getPresetUserNameAndURL", tabId: t, frameId: n }, { frameId: n });
      } catch (e) {
        return;
      }
      JSON.stringify(a), (document.querySelector("#iCloudIconId").style.display = "none"), clearCredentialListContents();
      let i = "";
      a.isPresetUserNamePresent && (i = a.presetUserName);
      const r = (function () {
          const e = /(.*)@/.exec(i);
          return e ? e[1] : null;
        })(),
        d = domainsForDisplayFromUsernamesAndDomains(o, s),
        c = o.length;
      let m = [],
        p = [],
        h = [];
      for (var g = 0; g < c; g++) {
        let a = s[g],
          l = o[g],
          c = d[g];
        const u = l.toLowerCase().startsWith(i.toLowerCase()),
          w = u || l.toLowerCase().startsWith(r ? r.toLowerCase() : null);
        let S = document.createElement("li");
        S.classList.add("selectable"), S.classList.add("credential"), (S.onmouseover = listItemMouseOverHandler), (S.onmouseout = listItemMouseOutHandler);
        let y = document.createElement("img");
        y.setAttribute("src", "images/key.svg"), S.appendChild(y);
        let f = document.createElement("p");
        f.classList.add("name"), isStringEmpty(l) ? (f.classList.add("no-user-name"), (f.textContent = g_localizer.getMessage("NoUserName"))) : (f.textContent = l), S.appendChild(f);
        let v = document.createElement("p");
        v.classList.add("website"),
          (v.textContent = c),
          S.appendChild(v),
          S.addEventListener("click", async function () {
            try {
              await chrome.tabs.sendMessage(t, { from: "popup", subject: "fillLoginIntoForm", theRememberICSelection: e, tabId: t, frameId: n, theLogin: l, theURL: a }, { frameId: n });
            } catch (e) {
              return;
            }
            window.close();
          }),
          u ? m.push(S) : w ? p.push(S) : h.push(S);
      }
      for (const e of m) u.appendChild(e);
      for (const e of p) u.appendChild(e);
      for (const e of h) u.appendChild(e);
      u.appendChild(listItemForOpenPasswordManager());
      const w = capabilitiesDeclaresMacOS(g_capabilities),
        S = !urlIsBrowserURL(new URL(a.url));
      w && S && u.appendChild(listItemForOpenPageInSafari());
      let y = document.querySelector("#divMessageBoard .credential-list");
      y && y.remove(), (l.style.display = "block");
      break;
    }
  }
}
function listItemForOpenPasswordManager() {
  let e = document.createElement("li");
  return (
    e.classList.add("selectable"),
    e.classList.add("open-password-manager"),
    (e.onmouseover = listItemMouseOverHandler),
    (e.onmouseout = listItemMouseOutHandler),
    (e.textContent = g_localizer.getMessage("divOpenPasswords")),
    e.addEventListener("click", openPasswordsButtonHandler),
    e
  );
}
function listItemForOpenPageInSafari() {
  let e = document.createElement("li");
  return (
    e.classList.add("selectable"),
    e.classList.add("open-safari"),
    (e.onmouseover = listItemMouseOverHandler),
    (e.onmouseout = listItemMouseOutHandler),
    (e.textContent = g_localizer.getMessage("openThisPageInSafari")),
    e.addEventListener("click", openThisPageInSafariButtonHandler),
    e
  );
}
function sendMessageToBackgroundPage(e) {
  if (g_portToBackgroundPage)
    try {
      g_portToBackgroundPage.postMessage(e);
    } catch (e) {}
}
function mapOverPINFields(e) {
  return [document.getElementById("PIN0"), document.getElementById("PIN1"), document.getElementById("PIN2"), document.getElementById("PIN3"), document.getElementById("PIN4"), document.getElementById("PIN5")].map(e);
}
function pinKeyHandler(e) {
  let t = e.target,
    n = t ? t.previousElementSibling : null,
    o = t ? t.nextElementSibling : null,
    s = e.keyCode || e.charCode;
  switch (s) {
    case 46:
      (t.value = ""), e.preventDefault();
      break;
    case 8:
      return (t.value = ""), e.preventDefault(), n && (n.focus(), n.select()), !1;
    case 37:
      n && (e.preventDefault(), n.focus(), n.select());
      break;
    case 39:
      o && (e.preventDefault(), o.focus(), o.select());
      break;
    default:
      if ((e.preventDefault(), !((s >= 48 && s <= 57) || (s >= 96 && s <= 105)))) {
        t.value = "";
        break;
      }
      if (((this.value = e.key), o)) {
        o.focus();
        break;
      }
      let a = mapOverPINFields(function (e) {
        return (e.onkeydown = null), e.value.trim();
      }).join("");
      sendMessageToBackgroundPage({ subject: "userEnteredPIN", pin: a });
  }
}
function openPasswordsButtonHandler(e) {
  sendMessageToBackgroundPage({ subject: "openPasswordManager" }), window.close();
}
function openThisPageInSafariButtonHandler(e) {
  chrome.tabs.query({ active: !0, currentWindow: !0 }, (e) => {
    sendMessageToBackgroundPage({ subject: "openURLInSafari", url: e[0].url }), window.close();
  });
}
//document.documentElement.addEventListener("keydown", function (e) {
//  let t = document.querySelector("li.active"),
//    n = e.key,
//    o = t ? t.previousElementSibling : null,
//    s = t ? t.nextElementSibling : null;
//  switch (n) {
//    case "ArrowUp":
//      if (!t) break;
//      return e.preventDefault(), t.classList.remove("active"), o && o.classList.add("active"), !1;
//    case "ArrowDown":
//      if ((e.preventDefault(), !t)) {
//        let e = document.querySelector("li");
//        return e && e.classList.add("active"), !1;
//      }
//      return s && (t.classList.remove("active"), s.classList.add("active")), !1;
//    case "Enter":
//      if (t) return e.preventDefault(), t.click(), !1;
//    case "Escape":
//      return void window.close();
//  }
//}),
//  window.addEventListener("load", (e) => {
//    let t = chrome.i18n.getUILanguage();
//    Localizer.configureDocumentElementForLanguage(document.documentElement, t);
//    try {
//      (g_portToBackgroundPage = chrome.runtime.connect({ name: "popup" })).onMessage.addListener(function (e, t, n) {
//        switch ((JSON.stringify(e), e.subject)) {
//          case "hello":
//            (g_capabilities = e.capabilities), (g_localizer = new Localizer(e.capabilities));
//            break;
//          case "nativeConnectionStateChanged":
//            (g_appStoreURL = e.appStoreURL), updatePopupContents(e.state);
//            break;
//          case "users":
//            chrome.tabs.query({ active: !0, currentWindow: !0 }, async function (t) {
//              t[0].id === e.tabId && (await updatePopupContents_ICs(e.theRememberICSelection, e.tabId, e.frameId, e.arrLoginNames, e.arrHLDs, e.arrDates));
//            });
//            break;
//          case "oneTimeCodes":
//            break;
//          default:
//            e.from, e.subject;
//        }
//      }),
//        g_portToBackgroundPage.onDisconnect.addListener(() => {
//          g_portToBackgroundPage = null;
//        }),
//        sendMessageToBackgroundPage({ subject: "getInitialPopupState" });
//      let e = document.createElement("span");
//      e.textContent = g_localizer.getMessage("extName");
//      let t = document.createElement("picture"),
//        n = document.createElement("source");
//      n.setAttribute("srcset", "images/PasswordsToolbar-darkmode_icon32.png"), n.setAttribute("media", "(prefers-color-scheme: dark)"), t.appendChild(n);
//      let o = document.createElement("img");
//      o.setAttribute("src", "images/PasswordsToolbar_icon32.png"), t.appendChild(o), o.classList.add("fromiCloudPasswordsMenuIcon"), e.appendChild(t), document.querySelector("#fromiCloudPasswords").appendChild(e);
//    } catch (e) {
//      e.message;
//    }
//  }),
//  (document.getElementById("downloadButton").onclick = function (e) {
//    chrome.tabs.create({ url: g_appStoreURL });
//  }),
//  (document.getElementById("idOpeniC4WButton").onclick = function () {
//    sendMessageToBackgroundPage({ subject: "startiCloudControlPanel" }), window.close();
//  }),
//  (document.getElementById("dismiss").onclick = function () {
//    window.close();
//  }),
//  (window.onfocus = () => {
//    sendMessageToBackgroundPage({ subject: "getInitialPopupState" });
//  });
//try {
//  chrome.runtime.onMessage.addListener((e, t, n) => {
//    e.from, e.subject;
//  });
//} catch (e) {
//  if (isInPopupWindow() && canDoOneTimeReload()) {
//    let e = document.location + "&hasAlreadyReloaded=1";
//    document.location = e;
//  } else alert("Error: iCloud Passwords pairing failed. Try to pair by clicking on the toolbar button.");
//}
//document.title = g_localizer.getMessage("extName");
