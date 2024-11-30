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
    for (var a = s + 1; a < n; a++) i[s].join("\n") === i[a].join("\n") && (e.length || e.push(s), e.push(a));
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
      a = void 0 !== i;
    return o && a && void 0 !== s && t.push(`${e}_${o}_${i}_${s}`), o && a && t.push(`${e}_${o}_${i}`), o ? t.push(`${e}_${o}`) : t.push(`${e}_${this.#t}`), t.push(e), t;
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
    (this.#n = e), this.#s(), this.#a();
  }
  get enableInPageAutoFill() {
    return this.#o;
  }
  set enableInPageAutoFill(e) {
    (this.#o = e), this.#r();
  }
  get allowExtensionToControlAutoFillSettings() {
    return this.#i;
  }
  set allowExtensionToControlAutoFillSettings(e) {
    (this.#i = e), this.#l().then(this.#r.bind(this));
  }
  #l() {
    return this.#i ? this.attemptToControlBrowserAutoFillSettings() : this.clearControlOfBrowserAutoFillSettings();
  }
  async attemptToControlBrowserAutoFillSettings() {
    if (this.#n) throw new Error("This Settings instance does not allow writing browser settings");
    const e = await Promise.allSettled([this.#d(chrome.privacy.services.passwordSavingEnabled, !1), this.#d(chrome.privacy.services.autofillCreditCardEnabled, !1), this.#d(chrome.privacy.services.autofillAddressEnabled, !1)]);
    return this.#c(), e;
  }
  async clearControlOfBrowserAutoFillSettings() {
    if (this.#n) throw new Error("This Settings instance does not allow writing browser settings");
    const e = await Promise.allSettled([this.#g(chrome.privacy.services.passwordSavingEnabled), this.#g(chrome.privacy.services.autofillCreditCardEnabled), this.#g(chrome.privacy.services.autofillAddressEnabled)]);
    return this.#c(), e;
  }
  #s() {
    let e = new Promise((e) => {
      chrome.storage.sync.get({ enableInPageAutoFill: !0, allowExtensionToControlAutoFillSettings: !0 }, (t) => {
        (this.#o = t.enableInPageAutoFill), (this.#i = t.allowExtensionToControlAutoFillSettings), e();
      });
    });
    return this.#n || (e = e.then(this.#l.bind(this))), e.then(this.#c.bind(this));
  }
  #r() {
    return new Promise((e) => {
      chrome.storage.sync.set({ enableInPageAutoFill: this.#o, allowExtensionToControlAutoFillSettings: this.#i }, e);
    }).then(this.#c.bind(this));
  }
  #a() {
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
      n = await this.#u(e);
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
  async #u(e) {
    if (!e) throw new Error(`Unable to get ${e} setting.`);
    const t = await e.get({});
    if ("not_controllable" === t.levelOfControl) throw new Error(`Cannot control ${e} setting.`);
    return t;
  }
  async #g(e) {
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
let g_presetUserName,
  g_theRememberICSelection,
  g_tabId,
  g_frameId,
  g_pageURL,
  g_username,
  g_portToBackgroundPage = null,
  g_LoginNames = [],
  g_HLDs = [],
  g_arrDates = [],
  g_requiresUserAuthenticationToFill = !1,
  g_canFillOneTimeCodes = !1,
  g_isIncognito = !1,
  g_oneTimeCodes = [],
  g_extensionSettings = new ExtensionSettings(!0);
const RequestDataState = { DoNotRequest: 0, WillOrAreRequesting: 1, RequestReturnedData: 2 };
let g_requestOneTimeCodesState = RequestDataState.DoNotRequest,
  g_requestLoginsState = RequestDataState.DoNotRequest,
  g_capabilities = null,
  g_localizer = new Localizer();
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
function listItemIsInView(e) {
  let t = e.getBoundingClientRect();
  return t.top >= 0 && t.bottom <= window.innerHeight;
}
function keyHandler(e) {
  let t = document.querySelector("li.active"),
    n = e.key,
    o = t ? t.previousElementSibling : null,
    i = t ? t.nextElementSibling : null;
  switch (n) {
    case "ArrowUp":
      if (!t) break;
      return e.preventDefault && e.preventDefault(), t.classList.remove("active"), o && (o.classList.add("active"), listItemIsInView(o) || o.scrollIntoView(!0)), !1;
    case "ArrowDown":
      if ((e.preventDefault && e.preventDefault(), !t)) {
        let e = document.querySelector("li.selectable");
        return e && (e.classList.add("active"), listItemIsInView(e) || e.scrollIntoView(!0)), !1;
      }
      return i && (t.classList.remove("active"), i.classList.add("active"), listItemIsInView(i) || i.scrollIntoView(!1)), !1;
    case "Enter":
      if (t) return e.preventDefault && e.preventDefault(), t.click(), !1;
  }
}
function showChoices(e, t, n, o, i, s, a, r, l, d, c, g) {
  let u = document.getElementById("credentialList"),
    m = document.querySelector("li.active");
  clearCredentialListContents(), addOneTimeCodeItemsToCompletionList(d, u, m);
  const p = (function () {
      const e = /(.*)@/.exec(l);
      return e ? e[1] : null;
    })(),
    h = domainsForDisplayFromUsernamesAndDomains(s, a),
    C = s.length;
  let w = [],
    S = [];
  for (var f = 0; f < C; f++) {
    let e = a[f],
      i = s[f],
      r = h[f];
    const d = i.toLowerCase().startsWith(l.toLowerCase()),
      c = d || i.toLowerCase().startsWith(p ? p.toLowerCase() : null);
    if (!d && !c) continue;
    let g = newCredentialListItem(),
      u = document.createElement("p");
    u.classList.add("name"), isStringEmpty(i) ? (u.classList.add("no-user-name"), (u.textContent = g_localizer.getMessage("NoUserName"))) : (u.textContent = i);
    let m = document.createElement("p");
    m.classList.add("website"), (m.textContent = r);
    let C = document.createElement("div");
    C.appendChild(u),
      C.appendChild(m),
      g.appendChild(C),
      g.addEventListener("click", function () {
        sendMessageToBackgroundPage({ from: "completionList", subject: "fillLoginIntoForm", theRememberICSelection: t, tabId: n, frameId: o, theLogin: i, theURL: e });
      }),
      d ? w.push(g) : c && S.push(g);
  }
  for (const e of w) u.appendChild(e);
  for (const e of S) u.appendChild(e);
  if (capabilitiesDeclaresMacOS(g_capabilities) && c) for (const e of strongPasswordSuggestionListItems(i)) u.appendChild(e);
  else if (u.children.length || !l.length) {
    const e = !u.children.length;
    u.appendChild(newOpenPasswordManagerButtonListItem(e));
  }
  const b = m && !c;
  u.children.length && (b || g) && u.children[0].classList.add("active"),
    1 === u.children.length ? (document.body.style.overflowY = "hidden") : (document.body.style.overflowY = "initial"),
    platformScrollbarWidth() > 0 && document.body.classList.add("visibleScroller"),
    u.children.length > 0 && u.insertBefore(iCloudPasswordsListItem(), u.children[0]),
    resizeCompletionList(calculateFittingSizeOfCompletionList(u));
}
function addOneTimeCodeItemsToCompletionList(e, t, n) {
  for (let n of e) {
    let e = newCredentialListItem();
    if ("totp" === n.source) {
      let t = n.domain ? g_localizer.getMessage("totpVerificationCodeNameWithDomain", [n.domain]) : g_localizer.getMessage("totpVerificationCodeName"),
        o = document.createElement("p");
      o.classList.add("name"), (o.textContent = t), e.appendChild(o), e.appendChild(document.createElement("br"));
      let i = n.username,
        s = i || n.code,
        a = document.createElement("p");
      a.classList.add("website"), (a.textContent = s), e.appendChild(a);
    }
    e.addEventListener("click", () => {
      sendMessageToBackgroundPage({ tabId: g_tabId, frameId: g_frameId, subject: "fillOneTimeCodeIntoForm", oneTimeCode: n });
    }),
      t.appendChild(e);
  }
}
function populateCompletionListWithCachedContentIfReady() {
  g_requestOneTimeCodesState !== RequestDataState.WillOrAreRequesting &&
    g_requestLoginsState !== RequestDataState.WillOrAreRequesting &&
    showChoices(g_presetUserName, g_theRememberICSelection, g_tabId, g_frameId, g_pageURL, g_LoginNames, g_HLDs, g_arrDates, g_username, g_oneTimeCodes, !1, g_requiresUserAuthenticationToFill);
}
function gotOneTimeCodeChoices(e) {
  (g_oneTimeCodes = e), (g_requestOneTimeCodesState = RequestDataState.RequestReturnedData), populateCompletionListWithCachedContentIfReady();
}
function scrollbarWidth() {
  return platformScrollbarWidth() > 0 ? 18 : 0;
}
function platformScrollbarWidth() {
  const e = document.createElement("div");
  (e.style.visibility = "hidden"), (e.style.overflow = "scroll"), document.body.appendChild(e);
  const t = document.createElement("div");
  e.appendChild(t);
  const n = e.offsetWidth - t.offsetWidth;
  return e.parentNode.removeChild(e), n;
}
function calculateFittingSizeOfCompletionList(e) {
  if (!g_extensionSettings.enableInPageAutoFill) return { width: 0, height: 0 };
  e.classList.add("inline");
  let t = 0;
  for (let n of e.children) {
    getComputedStyle(n);
    let e = Math.ceil(parseFloat(n.getBoundingClientRect().width));
    e > t && (t = e);
  }
  e.classList.remove("inline");
  let n = e.offsetHeight,
    o = 0;
  if (e.querySelectorAll(".credential").length > 4) {
    (n = parseFloat(e.children[0].getBoundingClientRect().height) + 4.5 * parseFloat(e.children[1].getBoundingClientRect().height)), (o = scrollbarWidth());
  }
  return { width: Math.max(t + o, 200), height: n };
}
function resizeCompletionList(e) {
  sendMessageToBackgroundPage({ subject: "resizeCompletionList", tabId: g_tabId, frameId: g_frameId, height: e.height, width: e.width });
}
function UpdateUserContents(e, t, n, o, i, s, a) {
  switch ((clearCredentialListContents(), e)) {
    case RememberIC.UnknownPage:
    case RememberIC.RememberLoginAndPassword: {
      (g_theRememberICSelection = e), (g_tabId = t), (g_frameId = n), (g_LoginNames = o), (g_HLDs = i), (g_arrDates = s), (g_requiresUserAuthenticationToFill = a);
      const r = new URLSearchParams(document.location.search).get("username");
      (g_username = r), (g_requestLoginsState = RequestDataState.RequestReturnedData), populateCompletionListWithCachedContentIfReady(), (divICs.style.display = "block");
    }
  }
}
function newCredentialListItem() {
  let e = document.createElement("li");
  e.classList.add("selectable"), e.classList.add("credential"), (e.onmouseover = listItemMouseOverHandler), (e.onmouseout = listItemMouseOutHandler);
  let t = document.createElement("img");
  return t.setAttribute("src", "images/key.svg"), e.appendChild(t), e;
}
function selectableAndHoverableListItem() {
  let e = document.createElement("li");
  return e.classList.add("selectable"), (e.onmouseover = listItemMouseOverHandler), (e.onmouseout = listItemMouseOutHandler), e;
}
function newOpenPasswordManagerButtonListItem(e) {
  let t = selectableAndHoverableListItem();
  t.classList.add("open-password-manager");
  let n = document.createElement("span"),
    o = document.createElement("p");
  if ((o.classList.add("title"), (o.textContent = g_localizer.getMessage("divOpenPasswords")), n.appendChild(o), e)) {
    let e = document.createElement("p");
    e.classList.add("subtitle"), (e.textContent = g_localizer.getMessage("divOpenPasswordsSubtitle")), n.appendChild(e);
  }
  return (
    t.appendChild(n),
    t.addEventListener("click", function () {
      sendMessageToBackgroundPage({ tabId: g_tabId, frameId: g_frameId, subject: "openPasswordManagerAndDismissCompletionList" });
    }),
    t
  );
}
function iCloudPasswordsListItem() {
  let e = document.createElement("li");
  e.classList.add("iCloudPasswords");
  let t = document.createElement("span");
  t.textContent = g_localizer.getMessage("extName");
  let n = document.createElement("picture"),
    o = document.createElement("source");
  o.setAttribute("srcset", "images/PasswordsToolbar-darkmode_icon32.png"), o.setAttribute("media", "(prefers-color-scheme: dark)"), n.appendChild(o);
  let i = document.createElement("img");
  return i.setAttribute("src", "images/PasswordsToolbar_icon32.png"), n.appendChild(i), i.classList.add("fromiCloudPasswordsMenuIcon"), e.appendChild(n), e.appendChild(t), e;
}
function strongPasswordSuggestionListItems(e) {
  let t = document.createElement("li");
  t.classList.add("strongPasswordSuggestion"), (t.innerHTML = `<p class="title">${g_localizer.getMessage("strongPasswordSuggestion")}</p>`);
  let n = selectableAndHoverableListItem();
  n.classList.add("open-password-manager"),
    (n.innerHTML = `<span><img src="images/PasswordsExtensionIcon_128.png" class="menuIcon">${g_localizer.getMessage("openPasswordsSettings")}</span>`),
    n.addEventListener("click", function () {
      sendMessageToBackgroundPage({ tabId: g_tabId, frameId: g_frameId, subject: "openPasswordManagerAndDismissCompletionList" });
    });
  let o = selectableAndHoverableListItem();
  return (
    o.classList.add("open-safari"),
    (o.innerHTML = `<span><img src="images/safari_macos.png" class="menuIcon" style="width: 26px; height: 26px; margin-left: -2px; margin-right: 5px; margin-top: 0px;">${g_localizer.getMessage("openThisPageInSafari")}</span>`),
    o.addEventListener("click", function () {
      sendMessageToBackgroundPage({ tabId: g_tabId, frameId: g_frameId, subject: "openURLInSafari", url: e });
    }),
    [t, n, o]
  );
}
function clearCredentialListContents() {
  let e = document.getElementById("credentialList");
  for (; e.firstChild; ) e.removeChild(e.lastChild);
}
document.documentElement.addEventListener("keydown", keyHandler);
const CompletionListActionWhenUnpaired = { OpenExtensionPopup: "OpenExtensionPopup", OpenPopupWindow: "OpenPopupWindow", InformUserToClickToolbarButton: "InformUserToClickToolbarButton" };
function completionListActionWhenUnpaired() {
  return chrome?.action?.openPopup ? CompletionListActionWhenUnpaired.OpenExtensionPopup : g_isIncognito ? CompletionListActionWhenUnpaired.InformUserToClickToolbarButton : CompletionListActionWhenUnpaired.OpenPopupWindow;
}
function openPopupWindowToPINPair() {
  let e;
  try {
    e = chrome.runtime.getURL("page_popup.html?popupWindow=1");
  } catch (e) {
    return;
  }
  const t = new URLSearchParams(document.location.search),
    n = parseInt(decodeURIComponent(t.get("screenX")), 10),
    o = parseInt(decodeURIComponent(t.get("screenY")), 10),
    i = parseInt(decodeURIComponent(t.get("effectiveWindowWidth")), 10),
    s = `popup, width=378, innerHeight=${capabilitiesDeclaresMacOS(g_capabilities) ? 150 : 120}, left=${n + i / 2 - 189}, top=${o + 46}, scrollbars=no, resizable=no, location=no, toolbar=no`;
  window.open(e, null, s);
}
function messageBoxToExplainPINPairing(e, t) {
  let n = document.createElement("li");
  n.id = "needToPairMessageBox";
  let o = document.createElement("div");
  o.classList.add("imageContainer");
  let i = document.createElement("img");
  i.setAttribute("src", "images/PasswordsExtensionIcon_128.png"), o.appendChild(i), n.appendChild(o);
  let s = document.createElement("div");
  s.classList.add("textContainer");
  let a = document.createElement("p");
  (a.id = "needToPairTitle"), (a.textContent = e), s.appendChild(a);
  let r = document.createElement("p");
  return (r.id = "needToPairMessage"), (r.textContent = t), s.appendChild(r), n.appendChild(s), n;
}
function updateCompletionList(e, t, n) {
  if (e === ContextState.NotInSession) {
    if (!isStringEmpty(t.ControlValue)) return;
    const e = completionListActionWhenUnpaired();
    let n,
      o,
      i = g_localizer.getMessage("enableAutoFillPasswordsTitle");
    e === CompletionListActionWhenUnpaired.InformUserToClickToolbarButton
      ? ((o = g_localizer.getMessage("enableAutoFillPasswordsMessageToolbarButton")), (n = messageBoxToExplainPINPairing(i, o)))
      : ((o = g_localizer.getMessage("enableAutoFillPasswordsMessageActivateCompletionList")),
        (n = messageBoxToExplainPINPairing(i, o)),
        n.classList.add("selectable"),
        n.classList.add("active"),
        (n.onmouseover = listItemMouseOverHandler),
        (n.onmouseout = listItemMouseOutHandler)),
      document.getElementById("credentialList").appendChild(n),
      (n.style.display = "flex");
    const s = n.getBoundingClientRect();
    return (
      resizeCompletionList({ width: s.width, height: s.height }),
      void (
        e !== CompletionListActionWhenUnpaired.InformUserToClickToolbarButton &&
        n.addEventListener("click", function () {
          switch (e) {
            case CompletionListActionWhenUnpaired.OpenExtensionPopup:
              return void chrome.action.openPopup();
            case CompletionListActionWhenUnpaired.OpenPopupWindow:
              return void openPopupWindowToPINPair();
          }
        })
      )
    );
  }
  (g_requestOneTimeCodesState = RequestDataState.DoNotRequest), (g_requestLoginsState = RequestDataState.DoNotRequest);
  let o = n ? n.AutoFillFormType : WBSAutoFillFormTypeUndetermined;
  switch ((g_canFillOneTimeCodes && t && t.ControlLooksLikeOneTimeCodeField && (g_requestOneTimeCodesState = RequestDataState.WillOrAreRequesting), o)) {
    case WBSAutoFillFormTypeAutoFillableLogin:
      g_requestLoginsState = RequestDataState.WillOrAreRequesting;
      break;
    case WBSAutoFillFormTypeChangePassword:
    case WBSAutoFillFormTypeNewAccount:
      if (t.ControlUniqueID === n.UsernameElementUniqueID || t.ControlUniqueID === n.OldPasswordElementUniqueID) {
        g_requestLoginsState = RequestDataState.WillOrAreRequesting;
        break;
      }
      if (t.ControlUniqueID === n.PasswordElementUniqueID || t.ControlUniqueID === n.ConfirmPasswordElementUniqueID)
        return void showChoices(g_presetUserName, g_theRememberICSelection, g_tabId, g_frameId, g_pageURL, [], [], [], "", [], !0, g_requiresUserAuthenticationToFill);
    default:
      (t.ControlIsSecureTextField || t.ControlClaimsToBeUsernameViaAutocompleteAttribute || t.ControlIsLabeledUsernameField) && (g_hostname, (g_requestLoginsState = RequestDataState.WillOrAreRequesting));
  }
  g_requestOneTimeCodesState === RequestDataState.WillOrAreRequesting && sendMessageToBackgroundPage({ subject: "getOneTimeCodes", tabId: g_tabId, frameId: g_frameId, username: g_presetUserName }),
    g_requestLoginsState === RequestDataState.WillOrAreRequesting && sendMessageToBackgroundPage({ subject: "GetLoginNames4URL", hostname: g_hostname, tabId: g_tabId, frameId: g_frameId });
}
function setUpPortToBackgroundPageIfNeeded() {
  g_portToBackgroundPage ||
    ((g_portToBackgroundPage = chrome.runtime.connect({ name: "completionList" })),
    g_portToBackgroundPage.onMessage.addListener(function (e) {
      switch (e.subject) {
        case "hello":
          (g_capabilities = e.capabilities), (g_localizer = new Localizer(e.capabilities));
          break;
        case "replyForGetContextAndMetadataFromContent":
          (g_tabId = e.tabId), (g_frameId = e.frameId), (g_pageURL = e.url), (g_hostname = e.hostname), (g_presetUserName = e.presetUserName), (g_canFillOneTimeCodes = e.canFillOneTimeCodes), (g_isIncognito = e.isIncognito);
          updateCompletionList(e.state, e.textFieldMetadata, e.formMetadata);
          break;
        case "users":
          UpdateUserContents(e.theRememberICSelection, e.tabId, e.frameId, e.arrLoginNames, e.arrHLDs, e.arrDates, e.requiresUserAuthenticationToFill);
          break;
        case "oneTimeCodes":
          (g_requiresUserAuthenticationToFill = e.requiresUserAuthenticationToFill), gotOneTimeCodeChoices(e.oneTimeCodes);
          break;
        case "keydown":
          keyHandler(e.event);
          break;
        case "typedUserNameChanged":
          if (!g_LoginNames.length) {
            sendMessageToBackgroundPage({ tabId: g_tabId, frameId: g_frameId, subject: "dismissCompletionList" });
            break;
          }
          showChoices(g_presetUserName, g_theRememberICSelection, g_tabId, g_frameId, g_pageURL, g_LoginNames, g_HLDs, g_arrDates, e.username, g_oneTimeCodes, !1, g_requiresUserAuthenticationToFill);
      }
    }),
    g_portToBackgroundPage.onDisconnect.addListener((e) => {
      e === g_portToBackgroundPage && (g_portToBackgroundPage = null);
    }),
    sendMessageToBackgroundPage({ subject: "getContextAndMetadataFromContent" }));
}
function sendMessageToBackgroundPage(e) {
  if (g_portToBackgroundPage)
    try {
      g_portToBackgroundPage.postMessage(e);
    } catch (e) {}
}
window.onload = function () {
  Localizer.configureDocumentElementForLanguage(document.documentElement, chrome.i18n.getUILanguage()), setUpPortToBackgroundPageIfNeeded();
  const e = new URLSearchParams(document.location.search),
    t = decodeURIComponent(e.get("colorScheme"));
  if (t && !document.querySelector("head meta[name=color-scheme]")) {
    let e = document.createElement("meta");
    e.setAttribute("name", "color-scheme"), e.setAttribute("content", t), document.head.appendChild(e);
  }
};
