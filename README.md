# myvalues

A single-page, no-build-step web app that walks someone through a values
self-assessment and shows them where their *ideal* life and their *actual*
life line up or diverge.

There is no framework, no bundler, no package manager. It's three files:

- `index.html` — the three screens (start, wizard, results) and all their DOM structure.
- `main.css` — all styling.
- `main.js` — all state, all logic, all rendering. Plain `var`/`function`, ES5-style, no modules.

## Running it

Any static file server works, since everything is client-side:

```bash
python3 -m http.server 8934
# then open http://localhost:8934/index.html
```

Opening `index.html` directly via `file://` also mostly works, but a local
server is safer (some browsers restrict `localStorage`/fetch-like behavior
under `file://`).

## The flow, in one paragraph

The user answers 32 statements on a −3..+3 scale: the same 16 value
statements asked twice, once framed as "in my ideal life" and once as "in my
life as it is now". From those 32 numbers, `main.js` derives everything on
the results screen — there is no other input.

## Data model

### `VALUES` (`main.js:16`)

The single source of truth for content. An array of 16 objects:

```js
{ name, statement, definition, deficitExplanation, excessExplanation }
```

- `statement` is the Likert-scale prompt shown twice (ideal/actual).
- `deficitExplanation` / `excessExplanation` are shown in the "Ideal vs.
  Actual Comparison" section — deficit when `actual < ideal`, excess when
  `actual > ideal` (see `buildComparisonResultItem`).

Order in this array is the *canonical* value order (index 0..15). It is not
the order questions are presented in — see `IDEAL_ORDER`/`ACTUAL_ORDER` below.

### `answers` (`main.js:240`)

A flat array of length `TOTAL_QUESTIONS` (32). Index `i` (0..15) is the
*ideal* score for `VALUES[i]`; index `i + 16` is the *actual* score for the
same value. Each entry is `null` (unanswered) or an integer in
`[SCALE_MIN, SCALE_MAX]` (−3..3).

### `steps` (`main.js:222`)

The wizard's presentation sequence, built once at load time by
`buildSteps()`. It interleaves two "intro" steps with 32 "question" steps,
each question step carrying:

- `questionIndex` — the index into `answers`/`VALUES` (0..31), used to read/write the actual data.
- `displayNumber` — the 1..32 sequential position *in presentation order*, used only for the "Statement X of 32" label.

These two numbers are **not the same**, and conflating them was a real bug
(see Edge cases below).

### `IDEAL_ORDER` / `ACTUAL_ORDER` (`main.js:219`)

Fixed, hardcoded shuffles of `[0..15]` — one for the ideal half, one for the
actual half. They exist purely so every visitor sees the same
non-sequential, decorrelated question order (so e.g. "Family" isn't always
immediately followed by "Service"), while still being deterministic/stable
across sessions and code reloads. They are not randomized per-visitor.

### `HARMONY_PAIRS` / `DISSONANCE_PAIRS` (`main.js:133`, `main.js:170`)

Flat arrays of `[nameA, nameB, explanation]` triples. This is the *only*
place value relationships are stored — values themselves carry no
`harmonies`/`dissonances` fields. A pair is inherently symmetric (if A
harmonizes with B, B harmonizes with A), so each unordered pair appears
exactly once.

## Derived data / algorithms

Everything below is computed fresh from `answers` every time `renderResults()`
runs — nothing is cached across renders.

### `computeResults()` (`main.js:543`)

Joins `answers` back onto `VALUES` to produce one object per value:
`{ name, definition, deficitExplanation, excessExplanation, ideal, actual }`.
Unanswered (`null`) scores are coerced to `0` — a safe default for
incomplete data, not a score a user can actually pick (0 sits at the
midpoint of −3..3, but nothing forces someone to answer every question, so
this only matters for partially-completed runs). Sorted by `ideal` desc,
then `actual` desc — this sort order is relied on by `selectTopIdealValues`
(it reads `results[0]` and `results[2]` assuming that order).

### `scoreToPercent(score)` (`main.js:564`)

`((score - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100` — maps −3..3 onto
0..100%. This is the only place raw scores become the percentages shown in
the UI.

### Core Values / Current Focus selection

`selectTopIdealValues` (`main.js:702`) and `selectTopActualValues`
(`main.js:743`) pick which values surface in the "Core Values" and "Current
Focus" sections. Both run the same 3-step algorithm, one keyed on `ideal`,
the other on `actual`:

1. Take the #1-ranked value, plus every value tied with it.
2. If that's fewer than 5 values, also add every value at ≥80% (`scoreToPercent(score) >= 80`).
3. If *still* fewer than 3 values, fall back to the top 3 by score, including ties at rank 3.

This is deliberately not "just top 3" or "just top 5" — it's a compromise
that (a) never arbitrarily excludes a tied value, (b) surfaces a natural
cluster of "clearly important" values when one exists, and (c) still
guarantees at least 3 results even when scores are flat/unanswered.

`selectTopActualValues` re-sorts `results` by `actual` locally (`results` is
only ever pre-sorted by `ideal`) — don't assume `results` is actual-sorted
anywhere else.

### Authenticity Score

- `computeWeight(result)` (`main.js:790`) = `max(ideal, actual) - SCALE_MIN`. A value is weighted by whichever of its two scores is *higher* — a value you're strongly living out counts as much as one you strongly aspire to, so the score isn't biased toward aspiration alone.
- `computeWeightedDiff(result)` (`main.js:797`) = `computeWeight(result) * abs(ideal - actual)`. Also known as the **"value disconnect score"** — this exact quantity feeds both the authenticity score and the comparison ranking below. Both names appear in the codebase; they mean the same number.
- `computeAuthenticityScore(results)` (`main.js:802`) is `(1 - weightedMeanAbsoluteDeviation / maxPossibleDiff) * 100`, rounded. 100 = every value's ideal and actual scores match exactly; 0 = maximum possible weighted disconnect across the board.
- The score always renders as the same purple (`#675FA9`) regardless of value — there is no tier-based color switching, only `AUTHENTICITY_TIERS` (`main.js:878`) picking which *sentence* of feedback to show, by score threshold (80 / 50 / else).

### Ideal vs. Actual Comparison

`selectGreatestDisconnects` (`main.js:824`) sorts all 16 values by
`computeWeightedDiff` descending (ties broken by higher `ideal`), then keeps
only those at or above `DISCONNECT_THRESHOLD_PERCENT` (30%) of the
*maximum possible* weighted diff (`MAX_WEIGHTED_DIFF = (SCALE_MAX-SCALE_MIN)^2`).
This is **not** "top N" — it's an absolute threshold, so it can return
anywhere from 0 to 16 values. If it returns 0, the whole "Ideal vs. Actual
Comparison" section is hidden (`comparisonSectionEl.style.display = "none"`
in `renderResults`).

### Harmonies / Dissonances

`computeCoreValuePairs(results, pairsList)` (`main.js:833`) is the shared
engine behind both sections:

1. Build the eligible set = exactly the output of `selectTopIdealValues(results)` (i.e. the same "Core Values" set shown earlier on the page — nothing else qualifies, there is no separate score threshold here anymore).
2. Walk `pairsList` (`HARMONY_PAIRS` or `DISSONANCE_PAIRS`); keep a pair only if **both** names are in the eligible set.
3. For each kept pair, put whichever side has the higher `ideal` score on the left.
4. Sort kept pairs by left `ideal` desc, then right `ideal` desc.

`computeHarmonyPairs`/`computeDissonancePairs` are one-line wrappers calling
this with the two different pair lists. If a section ends up with 0 pairs,
it's hidden the same way the Comparison section is (`renderCoreValuePairs`
sets `display: none` on the section element when `pairs.length === 0`).

**Important edge case this design intentionally allows:** because the
eligible set is *exactly* "Core Values" (not "Core Values plus anything else
above some threshold"), a value that's individually high-scoring but didn't
make the Core Values cut (e.g. because the #1-tie group at step 1 already had
≥5 members, so step 2 of `selectTopIdealValues` never ran) will **not**
appear in Harmonies/Dissonances even at 100% ideal. This was a deliberate
simplification requested over an earlier, more permissive version — see git
history / prior design notes if this behavior is ever questioned.

## State persistence (why the URL looks like that)

`persistState()` (`main.js:380`) writes state to **two** places on every
question answered and on entering results:

1. `localStorage` (`STORAGE_KEY = "myvalues-state-v1"`), as plain JSON.
2. The URL hash, bit-packed and base64url-encoded (`encodeState`/`decodeState`, `main.js:292`-`378`), so a results/progress link is shareable and short.

The bit layout is fixed: 1 bit for screen (wizard vs results) + 6 bits for
`currentStep` + 3 bits per answer × 32 answers = 103 bits, padded to a byte
boundary before base64url encoding. **3 bits per answer is load-bearing**:
it needs to represent 8 states (`null` + 7 possible scores from −3..3
inclusive) — if the scale range ever changes, `ANSWER_BITS` must be revisited.

On load, `restoreState()` (`main.js:395`) prefers the URL hash over
`localStorage` if both are present and the hash parses successfully;
`localStorage` is the fallback for a bare URL with no hash (e.g. after
closing and reopening the tab).

## The results-page nav box

`initResultsNav()` (`main.js:1041`) builds a small always-visible nav
listing every results section. Two things it does that aren't obvious from
the markup:

- **Hiding links for hidden sections**: `updateVisibility()` checks each linked section's *inline* `style.display` (set by `renderResults`/`renderCoreValuePairs` when a section has nothing to show) and hides the corresponding nav link to match. It does not use `getComputedStyle` — if a section is ever hidden via a CSS class instead of inline style, this check needs to change too.
- **Scroll-spy timing**: `resultsNav.refresh()` must be called *after* the results screen is actually visible (`showScreen(resultsScreen)`), not before — `updateActiveLink()` reads `getBoundingClientRect()`, which returns all-zero rects for anything still `display: none`. Both call sites (`finishWizard`, `restoreState`) call `showScreen` first, then `resultsNav.refresh()`. If you add a third call site, keep that order.

## Other things worth knowing

- **Debug shortcut**: `Ctrl+Alt+R` (or `Cmd+Option+R` on Mac) fills all 32 answers randomly and jumps straight to results, with a toast confirmation. It's a capture-phase `window` keydown listener (`main.js:1132`) checking both `e.code` and `e.key` for cross-layout robustness. Intended for local testing only — there's no way to disable it in a "production" sense, so don't be surprised if it fires during a demo.
- **Upload/Download**: "Download results" exports `{ version: 1, exportedAt, answers, results }` as JSON. "Upload previous results" only reads back `answers` (via `isValidAnswersArray`) and recomputes everything else — the exported `results` blob is for the user's own reference, not re-imported.
- **Fonts**: `Work Sans` and `Ubuntu Mono` are self-hosted (`fonts/`), both under licenses that permit redistribution (SIL OFL / Ubuntu Font Licence — see `fonts/UFL.txt`). Font Awesome (`fontawesome/`) is Free, CC BY 4.0 + SIL OFL. Don't add a font here without checking its license permits bundling the actual font file in the repo.
- **No build step, no linter config** — but there is a small test suite: `tests.html` + `tests.js`. It's a dependency-free harness that loads the real `main.js` against a DOM that mirrors `index.html`, then drives the actual global functions (`computeResults`, `selectTopIdealValues`, `computeHarmonyPairs`, `encodeState`/`decodeState`, etc.) with hand-picked scenarios and asserts on the results — nothing is mocked. Run it via a local server (`python3 -m http.server 8934`, then open `http://localhost:8934/tests.html`); results render on the page and print to the console. If you change `index.html`'s structure (add/remove/rename an id `main.js` looks up), mirror that change in `tests.html` too, or it'll throw on load instead of running anything.
