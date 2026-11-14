# Learn with H — QA profile implementation plan

## Scope and safeguards
- Work only in `feature/qa-profile-isolation` until reviewed. Do not deploy or merge automatically.
- Keep all existing Student progress keys unchanged. Do **not** migrate, clear, or relabel historical QA answers as H's answers.
- Add an explicit **Student / QA** profile indicator and switch in Parent Mode, with a confirmation before switching and a page reload.
- Load `profile-storage.js` before any lesson/Parent Mode script that reads or writes progress.
- Replace direct progress-key storage access with `LWHProfiles.getItem/setItem/removeItem` in `index.html`, `parent.html`, and `english/animal-farm/chapter-3.js`; include History attempts and restart-request session state.
- Keep shared settings such as narration preferences global unless separately approved.
- QA results must be labeled QA in Parent Mode; Student views must never display QA progress or writing.
- Save exact answer selections, feedback, retries, and hints in new attempt records **going forward**, with an explicit "not captured" label for older records.
- Never silently copy or delete Student or QA data.

## Existing source layout
- World History: `index.html` (large single-file app).
- Animal Farm: `english/animal-farm/chapter-3.html`, `chapter-3.js`, `chapter-3-data.js`, `chapter-3.css`.
- Parent Mode: `parent.html`.
- Subject catalog: `lessons.js`.
- Existing original artwork: `assets/history/` and `english/animal-farm/assets/`.

## QA verification gates
1. Before switch, export or back up existing browser progress where possible.
2. Student mode displays pre-existing World History and Animal Farm progress unchanged.
3. Switch to QA, submit a wrong answer, correct answer, and a writing draft.
4. QA progress appears only in QA mode; Student progress is identical to the pre-test snapshot.
5. Reload and navigate across World History, Animal Farm, Parent Mode; profile persists.
6. Restart a QA lesson; Student attempts and progress remain unchanged.
7. Switching back restores the correct Student view without copying data.
8. Check browser storage-denied or quota errors; show a clear save failure rather than implying success.
9. Recheck narration settings, lesson completion, Review Words, Previous Attempts, and iPad navigation.

## Follow-up defect work (not part of profile foundation)
- UI-101, UI-102, QA-07: feedback and selection states.
- VIS-05, VIS-06: original artwork visibility and preservation.
- UI-06, CONTENT-02, ENH-01, ENH-02: matching layout, cause/effect clarity, vocabulary interaction and visuals.

**Current status:** Profile-aware progress reads/writes are integrated into World History, Animal Farm, and Parent Mode. Parent Mode has a confirmed Student/QA switch and the pages display the active profile. Automated Node tests are committed but have **not been executed** in this review. Browser regression, deployed preview, and iPad verification are still required before merge or deployment. Existing legacy Student records may include earlier QA activity and cannot be retrospectively distinguished without historical attribution.
