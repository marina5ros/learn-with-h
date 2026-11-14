import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../profile-storage.js", import.meta.url), "utf8");
function storage() {
  const data = new Map();
  return {
    getItem: k => data.has(k) ? data.get(k) : null,
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: k => { data.delete(k); }
  };
}
function setup() {
  const localStorage = storage(), sessionStorage = storage();
  const window = {localStorage, sessionStorage};
  vm.runInNewContext(source, {window});
  return {api: window.LWHProfiles, localStorage, sessionStorage};
}
test("Student retains legacy keys and QA uses independent keys", () => {
  const {api,localStorage} = setup();
  localStorage.setItem("lwh-progress", "student-history");
  localStorage.setItem("lwh:animal-farm:chapter-3:v1", "student-english");
  localStorage.setItem("lwh-v26-state", "student-resume");
  assert.equal(api.active(), "student");
  assert.equal(api.getItem("lwh-progress"), "student-history");
  api.select("qa");
  assert.equal(api.getItem("lwh-progress"), null);
  assert.equal(api.getItem("lwh-v26-state"), null);
  api.setItem("lwh-v26-state", "qa-resume");
  api.setItem("lwh-progress", "qa-history");
  api.setItem("lwh:animal-farm:chapter-3:v1", "qa-english");
  assert.equal(localStorage.getItem("lwh-progress"), "student-history");
  api.select("student");
  assert.equal(api.getItem("lwh:animal-farm:chapter-3:v1"), "student-english");
  assert.equal(api.getItem("lwh-v26-state"), "student-resume");
  api.select("qa");
  assert.equal(api.getItem("lwh:animal-farm:chapter-3:v1"), "qa-english");
});
test("QA restart requests are isolated in session storage", () => {
  const {api,sessionStorage} = setup();
  api.setItem("lwh:animal-farm:chapter-3:restart-request", "yes");
  api.select("qa");
  assert.equal(api.getItem("lwh:animal-farm:chapter-3:restart-request"), null);
  api.setItem("lwh:animal-farm:chapter-3:restart-request", "yes");
  api.removeItem("lwh:animal-farm:chapter-3:restart-request");
  api.select("student");
  assert.equal(sessionStorage.getItem("lwh:animal-farm:chapter-3:restart-request"), "yes");
});
test("Narration settings remain shared", () => {
  const {api,localStorage} = setup();
  api.select("qa");
  api.setItem("lwh:parent:settings:v1", "voice");
  assert.equal(localStorage.getItem("lwh:parent:settings:v1"), "voice");
  api.select("student");
  assert.equal(api.getItem("lwh:parent:settings:v1"), "voice");
});
test("Rejects unsupported profiles", () => {
  const {api} = setup();
  assert.throws(() => api.select("admin"), /Unknown learning profile/);
});
