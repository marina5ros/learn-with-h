# Animal Farm — Chapter 3 (work in progress)

This lesson is implemented as separate static files to preserve the existing World History application and allow future books/lessons to be added through the root `lessons.js` catalog.

## Files
- `chapter-3.html` — accessible lesson entry point
- `chapter-3-data.js` — original simplified Chapter 3 reading sections, six characters, ten worksheet vocabulary words, ten worksheet fill-in sentences, six worksheet comprehension questions
- `chapter-3.css` — responsive appearance
- `chapter-3.js` — eight activities, menu, local saving, skip/resume, parent view and speech synthesis
- `../../learn.html` + `../../lessons.js` — reusable subject / topic / lesson navigation

## Student features
All eight activities can be opened in any order. Reading and vocabulary are one item at a time; matching is three pairs in rounds 1–3 and one pair in round 4. Words, directions, and typed work can be read aloud using the browser speech engine. A character-reference overlay returns to the same reading section. Correct and skipped items have separate status, with green (100%), blue (in progress), and orange (skipped) progress. Sentences and answers save as the student types. Start Again archives previous attempts for Parent Mode; Parent Mode can export the stored progress in JSON.

## Data / privacy
Progress uses the new browser-local key `lwh:animal-farm:chapter-3:v1` and does **not** overwrite World History's `lwh-progress`. This local data does not sync between devices and may disappear if browser data is cleared. Parent Mode is not password protected; do not treat it as an authentication boundary.

## Review and integration checklist
- [x] Verify JavaScript parses
- [x] Exercise basic state transitions: open / resume, matching incorrect + correct, fill-in, skip, writing, Start Again, review and Parent Mode using mocked DOM events
- [ ] Add individual, consistent approved storybook illustrations; current emoji scenes explicitly say **artwork placeholder**
- [ ] Replace the temporary scene placeholders with optimized local image assets and alt text
- [ ] Review passages and exact worksheet text against the original teacher photos when available
- [ ] Test with an actual browser and H's device: tap targets, narration, images, character gallery, progress persistence, history and accessibility
- [ ] Verify existing World History navigation and the previously reported **Start Matching** issue in the published v27.4 file
- [ ] Review how the new subject portal will become the default site entry point; current `index.html` is deliberately unchanged
- [ ] After review, merge the feature branch to publish

## Important
Do not merge this branch until approved visual art and browser testing are complete. A GitHub Pages deployment of `main` is **not** changed by this branch.
