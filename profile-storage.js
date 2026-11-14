/* Learn with H — profile-aware progress storage.
 * Safe foundation: does not change existing data until explicitly integrated.
 * Student mode uses the original keys, preserving existing browser progress.
 * QA mode uses separate keys; shared narration preferences remain global.
 */
(function (root) {
  "use strict";
  const PROFILE_KEY = "lwh:active-profile:v1";
  const QA_PREFIX = "lwh:qa:v1:";
  const PROGRESS_KEYS = new Set([
    "lwh-progress",
    "lwh:history:attempts:v1",
    "lwh:animal-farm:chapter-3:v1",
    "lwh:animal-farm:chapter-3:restart-request"
  ]);
  function active() {
    try { return root.localStorage.getItem(PROFILE_KEY) === "qa" ? "qa" : "student"; }
    catch (_) { return "student"; }
  }
  function scopedKey(key, profile) {
    if (!PROGRESS_KEYS.has(key)) return key;
    return profile === "qa" ? QA_PREFIX + key : key;
  }
  function storeFor(key) {
    return key === "lwh:animal-farm:chapter-3:restart-request" ? root.sessionStorage : root.localStorage;
  }
  function getItem(key) { return storeFor(key).getItem(scopedKey(key, active())); }
  function setItem(key, value) { storeFor(key).setItem(scopedKey(key, active()), String(value)); }
  function removeItem(key) { storeFor(key).removeItem(scopedKey(key, active())); }
  function select(profile) {
    if (profile !== "student" && profile !== "qa") throw new Error("Unknown learning profile");
    root.localStorage.setItem(PROFILE_KEY, profile);
    return profile;
  }
  function mountProfileControl() {
    if (!root.document || root.document.getElementById("lwh-profile-control")) return;
    const isParent = root.location.pathname.endsWith("/parent.html");
    const bar = root.document.createElement("section");
    bar.id = "lwh-profile-control";
    bar.setAttribute("aria-label", "Active learning profile");
    bar.style.cssText = "display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;padding:10px 16px;background:#edf3fc;color:#18365c;border-bottom:1px solid #cbd9ee;font:600 15px system-ui,sans-serif";
    const title = root.document.createElement("span");
    title.textContent = "Learning profile: " + (active() === "qa" ? "QA Testing" : "Student");
    bar.appendChild(title);
    if (isParent) {
      const button = root.document.createElement("button");
      button.type = "button";
      button.textContent = active() === "qa" ? "Switch to Student" : "Switch to QA Testing";
      button.style.cssText = "border:2px solid #245ca5;background:white;color:#18365c;border-radius:10px;padding:8px 12px;font:600 14px system-ui,sans-serif;cursor:pointer";
      button.addEventListener("click", function () {
        const next = active() === "qa" ? "student" : "qa";
        if (!root.confirm("Switch to " + (next === "qa" ? "QA Testing" : "Student") + "? Progress stays separate. The page will reload.")) return;
        try { select(next); root.location.reload(); }
        catch (e) { root.alert("Unable to switch profiles. Browser storage may be unavailable."); }
      });
      bar.appendChild(button);
    }
    const header = root.document.querySelector("header");
    if (header && header.parentNode) header.parentNode.insertBefore(bar, header.nextSibling);
    else root.document.body.prepend(bar);
  }
  root.LWHProfiles = Object.freeze({active, select, scopedKey, getItem, setItem, removeItem});
  if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", mountProfileControl);
  else mountProfileControl();
})(window);
