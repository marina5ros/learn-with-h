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
  root.LWHProfiles = Object.freeze({active, select, scopedKey, getItem, setItem, removeItem});
})(window);
