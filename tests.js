// Dependency-free test harness for main.js. Runs directly against the real
// globals main.js defines (answers, VALUES, computeResults, restoreState,
// etc.) — nothing is mocked. Open tests.html through a local server to run
// it; results render on the page and print to the console.

var TEST_CASES = [];

function test(name, fn) {
    TEST_CASES.push({ name: name, fn: fn });
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

function assertEqual(actual, expected, label) {
    if (actual !== expected) {
        throw new Error((label ? label + " — " : "") + "expected " + JSON.stringify(expected) + " but got " + JSON.stringify(actual));
    }
}

function assertArrayEqual(actual, expected, label) {
    assertEqual(JSON.stringify(actual), JSON.stringify(expected), label);
}

function assertNamesEqual(results, expectedNames, label) {
    var actualNames = results.map(function (r) { return r.name; }).slice().sort();
    var expected = expectedNames.slice().sort();
    assertArrayEqual(actualNames, expected, label);
}

function assertNamesInOrder(results, expectedNamesInOrder, label) {
    var actualNames = results.map(function (r) { return r.name; });
    assertArrayEqual(actualNames, expectedNamesInOrder, label);
}

function assertContainsPair(pairs, nameA, nameB, label) {
    var found = pairs.some(function (p) {
        return (p.left.name === nameA && p.right.name === nameB) || (p.left.name === nameB && p.right.name === nameA);
    });
    assert(found, (label || "") + " — expected pair [" + nameA + ", " + nameB + "] to be present");
}

function assertNotContainsPair(pairs, nameA, nameB, label) {
    var found = pairs.some(function (p) {
        return (p.left.name === nameA && p.right.name === nameB) || (p.left.name === nameB && p.right.name === nameA);
    });
    assert(!found, (label || "") + " — expected pair [" + nameA + ", " + nameB + "] to be absent");
}

var VALUE_INDEX_BY_NAME = {};
VALUES.forEach(function (v, i) {
    VALUE_INDEX_BY_NAME[v.name] = i;
});

// Sets ideal/actual answers by value name. Anything not mentioned defaults
// to defaultScore (SCALE_MIN unless given), for BOTH ideal and actual.
function setScores(scoresByName, defaultScore) {
    var fallback = defaultScore === undefined ? SCALE_MIN : defaultScore;
    answers = new Array(TOTAL_STATEMENTS).fill(fallback);
    Object.keys(scoresByName).forEach(function (name) {
        var idx = VALUE_INDEX_BY_NAME[name];
        var scores = scoresByName[name];
        if (scores.ideal !== undefined) {
            answers[idx] = scores.ideal;
        }
        if (scores.actual !== undefined) {
            answers[idx + VALUES.length] = scores.actual;
        }
    });
}

function clearPendingAdvance() {
    if (advanceTimeout) {
        clearTimeout(advanceTimeout);
        advanceTimeout = null;
    }
}

// ===========================================================================
// State <-> URL sync
// ===========================================================================

test("answering a statement updates the URL hash", function () {
    goToStart();
    startWizard();
    advanceStep();

    var hashBefore = location.hash;
    selectAnswer(2);
    clearPendingAdvance();
    var hashAfter = location.hash;

    assert(hashAfter !== hashBefore, "hash should change after answering a statement");
    var decoded = decodeState(hashAfter.slice(1));
    assertEqual(decoded.screen, "wizard", "decoded screen");
    assertEqual(decoded.currentStep, 1, "decoded currentStep");
    assertEqual(decoded.answers[steps[1].statementIndex], 2, "decoded answer for the statement just answered");

    goToStart();
});

test("loading a URL with a wizard-progress hash restores the wizard at the right step and answers", function () {
    var partialAnswers = new Array(TOTAL_STATEMENTS).fill(null);
    partialAnswers[steps[1].statementIndex] = 2;
    partialAnswers[steps[2].statementIndex] = -1;
    var encoded = encodeState({ screen: "wizard", currentStep: 3, answers: partialAnswers });

    goToStart();
    location.hash = "#" + encoded;
    var restored = restoreState();

    assert(restored, "restoreState should report success");
    assert(wizardScreen.classList.contains("active"), "wizard screen should be active");
    assertEqual(currentStep, 3, "currentStep restored from the hash");
    assertEqual(answers[steps[1].statementIndex], 2, "restored answer 1");
    assertEqual(answers[steps[2].statementIndex], -1, "restored answer 2");

    goToStart();
});

test("loading a URL with a results hash restores the results screen with computed results", function () {
    var fullAnswers = new Array(TOTAL_STATEMENTS).fill(1);
    var encoded = encodeState({ screen: "results", currentStep: steps.length - 1, answers: fullAnswers });

    goToStart();
    location.hash = "#" + encoded;
    var restored = restoreState();

    assert(restored, "restoreState should report success");
    assert(resultsScreen.classList.contains("active"), "results screen should be active");
    assertEqual(authenticityPercentEl.textContent, "100%", "ideal===actual everywhere should score 100%");

    goToStart();
});

test("a valid URL hash takes priority over localStorage when both are present", function () {
    goToStart();
    setScores({ Experiences: { ideal: 3, actual: 3 } }, 3);
    finishWizard();

    var otherAnswers = new Array(TOTAL_STATEMENTS).fill(null);
    var encoded = encodeState({ screen: "wizard", currentStep: 5, answers: otherAnswers });
    location.hash = "#" + encoded;

    var restored = restoreState();

    assert(restored, "restoreState should report success");
    assert(wizardScreen.classList.contains("active"), "the hash's wizard state should win over localStorage's results state");
    assertEqual(currentStep, 5, "currentStep should come from the hash, not localStorage");

    goToStart();
});

test("an invalid URL hash falls back to localStorage instead of failing", function () {
    goToStart();
    setScores({ Experiences: { ideal: 2, actual: 2 } }, 2);
    finishWizard();

    location.hash = "#not-a-valid-encoded-state!!!";
    var restored = restoreState();

    assert(restored, "restoreState should still report success via the localStorage fallback");
    assert(resultsScreen.classList.contains("active"), "should restore the results screen from localStorage");

    goToStart();
});

test("restoreState: rejects a wizard state whose currentStep is out of range instead of crashing or applying it", function () {
    var validAnswers = new Array(TOTAL_STATEMENTS).fill(null);
    var encoded = encodeState({ screen: "wizard", currentStep: steps.length + 5, answers: validAnswers });

    goToStart();
    location.hash = "#" + encoded;
    var restored = restoreState();

    assertEqual(restored, false, "restoreState should report failure for an out-of-range currentStep");
    assert(startScreen.classList.contains("active"), "should remain on the start screen, not switch into the wizard");

    goToStart();
});

// ===========================================================================
// Smoke test
// ===========================================================================

test("smoke test: progressing through all 32 statements sequentially reaches the results screen", function () {
    goToStart();
    startWizard();
    assertEqual(steps[currentStep].type, "intro", "wizard should start on the ideal intro");
    advanceStep();

    for (var count = 0; count < TOTAL_STATEMENTS; count++) {
        var step = steps[currentStep];
        assertEqual(step.type, "statement", "step " + currentStep + " (statement " + (count + 1) + ") should be a statement");
        answers[step.statementIndex] = (count % 7) - 3;
        advanceStep();
        if (steps[currentStep] && steps[currentStep].type === "intro") {
            advanceStep();
        }
    }

    assert(resultsScreen.classList.contains("active"), "results screen should be active after the last statement");
    assertEqual(answers.indexOf(null), -1, "every one of the 32 answers should have been recorded");

    goToStart();
});

// ===========================================================================
// Wizard navigation
// ===========================================================================

test("goBack: decrements currentStep and re-renders the previous step, but is a no-op at step 0", function () {
    goToStart();
    startWizard();
    assert(!backButton.classList.contains("visible"), "back button should be hidden at step 0");

    advanceStep();
    advanceStep();
    assertEqual(currentStep, 2, "sanity check before going back");
    assert(backButton.classList.contains("visible"), "back button should be visible once past step 0");

    goBack();
    assertEqual(currentStep, 1, "goBack decrements currentStep");

    goBack();
    assertEqual(currentStep, 0, "goBack decrements currentStep again");
    assert(!backButton.classList.contains("visible"), "back button should be hidden again at step 0");

    goBack();
    assertEqual(currentStep, 0, "goBack does nothing once already at step 0");

    goToStart();
});

test("wizard: shows the ideal framing for the first 16 statements and the actual framing for the last 16", function () {
    goToStart();
    startWizard();
    assertEqual(introTextEl.textContent, IDEAL_INTRO_TEXT, "first intro text");

    currentStep = 1;
    renderStep();
    assertEqual(statementContextEl.textContent, IDEAL_CONTEXT, "context on the first ideal statement");

    currentStep = 16;
    renderStep();
    assertEqual(statementContextEl.textContent, IDEAL_CONTEXT, "context on the last ideal statement");

    currentStep = 17;
    renderStep();
    assertEqual(introTextEl.textContent, ACTUAL_INTRO_TEXT, "second intro text");

    currentStep = 18;
    renderStep();
    assertEqual(statementContextEl.textContent, ACTUAL_CONTEXT, "context on the first actual statement");

    currentStep = 33;
    renderStep();
    assertEqual(statementContextEl.textContent, ACTUAL_CONTEXT, "context on the last actual statement");

    goToStart();
});

test("\"Statement X of Y\" label matches presentation order (displayNumber), not the VALUES index (statementIndex)", function () {
    steps.forEach(function (s, i) {
        if (s.type !== "statement") {
            return;
        }
        currentStep = i;
        renderStep();
        assertEqual(statementNumberEl.textContent, "Statement " + s.displayNumber + " of " + TOTAL_STATEMENTS, "step " + i);
    });
    goToStart();
});

// ===========================================================================
// Start Over
// ===========================================================================

test("Start Over clears answers, persisted state, and the URL, and returns to the start screen", function () {
    setScores({ Experiences: { ideal: 3, actual: -3 } }, 1);
    finishWizard();
    assert(localStorage.getItem(STORAGE_KEY) !== null, "localStorage should hold state before Start Over");
    assert(location.hash.length > 1, "URL hash should be set before Start Over");

    goToStart();

    assert(startScreen.classList.contains("active"), "start screen should be active");
    assertEqual(answers.every(function (a) { return a === null; }), true, "answers should all be reset to null");
    assertEqual(currentStep, 0, "currentStep should reset to 0");
    assertEqual(localStorage.getItem(STORAGE_KEY), null, "localStorage should be cleared");
    assert(location.hash === "" || location.hash === "#", "URL hash should be cleared");
});

// ===========================================================================
// Core Values section (selectTopIdealValues + rendering)
// ===========================================================================

test("Core Values: individual scores shown are scoreToPercent(ideal)", function () {
    setScores({ Experiences: { ideal: 3 }, Impact: { ideal: -3 }, Family: { ideal: 0 } }, -3);
    var results = computeResults();
    var byName = {};
    results.forEach(function (r) { byName[r.name] = r; });
    assertEqual(scoreToPercent(byName.Experiences.ideal), 100, "Experiences at ideal=3");
    assertEqual(scoreToPercent(byName.Impact.ideal), 0, "Impact at ideal=-3");
    assertEqual(scoreToPercent(byName.Family.ideal), 50, "Family at ideal=0");
});

test("Core Values: filters via the 3-step algorithm — a large #1 tie group short-circuits steps 2 and 3", function () {
    setScores({
        Experiences: { ideal: 3 }, Impact: { ideal: 3 }, Family: { ideal: 3 },
        Service: { ideal: 3 }, Fame: { ideal: 3 }, Agency: { ideal: 3 },
        Work: { ideal: 2 }, Achievement: { ideal: 2 }
    }, SCALE_MIN);
    var core = selectTopIdealValues(computeResults());
    assertNamesEqual(core, ["Experiences", "Impact", "Family", "Service", "Fame", "Agency"], "core values");
});

test("Core Values: filters via the 3-step algorithm — step 2 pulls in every 80%+ value when the #1 tie group is small", function () {
    setScores({
        Experiences: { ideal: 3 },
        Impact: { ideal: 2 }, Family: { ideal: 2 }, Service: { ideal: 2 }
    }, SCALE_MIN);
    var core = selectTopIdealValues(computeResults());
    assertNamesEqual(core, ["Experiences", "Impact", "Family", "Service"], "core values");
});

test("Core Values: filters via the 3-step algorithm — step 3 falls back to top 3 with ties at #3 when steps 1-2 leave fewer than 3", function () {
    setScores({
        Experiences: { ideal: 3, actual: 3 },
        Impact: { ideal: 1, actual: 1 },
        Family: { ideal: 0, actual: 0 }, Service: { ideal: 0, actual: 0 }, Fame: { ideal: 0, actual: 0 }
    }, -2);
    var core = selectTopIdealValues(computeResults());
    assertNamesEqual(core, ["Experiences", "Impact", "Family", "Service", "Fame"], "core values");
});

test("Core Values: sorted by ideal score descending", function () {
    setScores({
        Experiences: { ideal: 3 }, Impact: { ideal: 1 }, Family: { ideal: 0 }, Service: { ideal: 0 }
    }, -3);
    var core = selectTopIdealValues(computeResults());
    assertEqual(core[0].name, "Experiences", "rank 1");
    assertEqual(core[1].name, "Impact", "rank 2");
    assert(core[2].ideal === 0 && core[3].ideal === 0, "ranks 3-4 are the tied values");
});

// Core Values is never hidden — the 3-step algorithm always returns at least 3 values.

// ===========================================================================
// Current Focus section (selectTopActualValues + rendering)
// ===========================================================================

test("Current Focus: individual scores shown are scoreToPercent(actual)", function () {
    setScores({ Wealth: { actual: 3 }, Home: { actual: -3 } }, -3);
    var results = computeResults();
    var byName = {};
    results.forEach(function (r) { byName[r.name] = r; });
    assertEqual(scoreToPercent(byName.Wealth.actual), 100, "Wealth at actual=3");
    assertEqual(scoreToPercent(byName.Home.actual), 0, "Home at actual=-3");
});

test("Current Focus: mirrors the Core Values 3-step algorithm, keyed on actual score", function () {
    setScores({
        Wealth: { actual: 3 }, Aesthetic: { actual: 3 }, Home: { actual: 3 },
        Faith: { actual: 3 }, Companionship: { actual: 3 }, Community: { actual: 3 },
        Work: { actual: 2 }
    }, SCALE_MIN);
    var focus = selectTopActualValues(computeResults());
    assertNamesEqual(focus, ["Wealth", "Aesthetic", "Home", "Faith", "Companionship", "Community"], "current focus");
});

test("Current Focus: sorted by actual score descending", function () {
    setScores({ Wealth: { actual: 3 }, Home: { actual: 1 }, Faith: { actual: 0 }, Community: { actual: 0 } }, -3);
    var focus = selectTopActualValues(computeResults());
    assertEqual(focus[0].name, "Wealth", "rank 1");
    assertEqual(focus[1].name, "Home", "rank 2");
    assert(focus[2].actual === 0 && focus[3].actual === 0, "ranks 3-4 are the tied values");
});

// Current Focus is never hidden, for the same reason as Core Values.

// ===========================================================================
// Authenticity Score section
// ===========================================================================

test("Authenticity Score: 100 when every value's ideal matches its actual", function () {
    setScores({}, 2);
    assertEqual(computeAuthenticityScore(computeResults()), 100, "score");
});

test("Authenticity Score: 0 when every value is maximally split (ideal=3, actual=-3)", function () {
    var everyValue = {};
    VALUES.forEach(function (v) { everyValue[v.name] = { ideal: 3, actual: -3 }; });
    setScores(everyValue);
    assertEqual(computeAuthenticityScore(computeResults()), 0, "score");
});

test("Authenticity Score: a single maximally-split value among matched ones pulls the score down proportionally to its weight", function () {
    setScores({ Experiences: { ideal: 3, actual: -3 } }, 3);
    assertEqual(computeAuthenticityScore(computeResults()), 94, "score");
});

// Authenticity Score is a single number, not a filtered/sorted list, and is always shown.

// ===========================================================================
// Ideal vs. Actual Comparison section (selectGreatestDisconnects)
// ===========================================================================

test("Comparison: individual disconnect percent is weight-scaled, not a plain |ideal - actual| gap", function () {
    setScores({ Experiences: { ideal: 3, actual: -3 }, Impact: { ideal: -1, actual: -3 } }, 0);
    var results = computeResults();
    var byName = {};
    results.forEach(function (r) { byName[r.name] = r; });
    assertEqual(computeDisconnectPercent(byName.Experiences), 100, "Experiences disconnect percent");
    assert(Math.abs(computeDisconnectPercent(byName.Impact) - (4 / 36 * 100)) < 0.001, "Impact disconnect percent");
});

test("Comparison: filters to disconnect percent >= 30%, excluding everything below the threshold", function () {
    setScores({ Experiences: { ideal: 3, actual: -3 } }, 0);
    var disconnects = selectGreatestDisconnects(computeResults());
    assertNamesEqual(disconnects, ["Experiences"], "disconnects at/above 30%");
});

test("Comparison: a disconnect just below the 30% threshold is excluded", function () {
    setScores({ Experiences: { ideal: 0, actual: -3 } }, 0);
    var disconnects = selectGreatestDisconnects(computeResults());
    assertEqual(disconnects.length, 0, "25% disconnect should not qualify");
});

test("Comparison: sorted by disconnect score descending, ties broken by higher ideal score", function () {
    setScores({
        Experiences: { ideal: 3, actual: -3 },
        Impact: { ideal: 2, actual: -3 },
        Family: { ideal: 1, actual: -3 }
    }, 0);
    var disconnects = selectGreatestDisconnects(computeResults());
    assertNamesInOrder(disconnects, ["Experiences", "Impact", "Family"], "sort order");
});

test("Comparison: section hides when there are no qualifying disconnects, shows when there are", function () {
    setScores({}, 1);
    finishWizard();
    assertEqual(comparisonSectionEl.style.display, "none", "hidden when empty");

    setScores({ Experiences: { ideal: 3, actual: -3 } }, 1);
    finishWizard();
    assertEqual(comparisonSectionEl.style.display, "block", "visible when non-empty");

    goToStart();
});

// ===========================================================================
// Harmonies section (computeHarmonyPairs)
// ===========================================================================

test("Harmonies: individual percent shown for each side is always scoreToPercent(ideal), never actual", function () {
    setScores({ Experiences: { ideal: 3, actual: -3 }, Fame: { ideal: 3, actual: -3 } }, SCALE_MIN);
    var pair = computeHarmonyPairs(computeResults())[0];
    assertEqual(scoreToPercent(pair.left.ideal), 100, "left side percent uses ideal");
    assertEqual(scoreToPercent(pair.right.ideal), 100, "right side percent uses ideal");
});

test("Harmonies: filters to pairs where BOTH sides are Core Values, not just individually high-scoring", function () {
    setScores({
        Experiences: { ideal: 3 }, Impact: { ideal: 3 }, Family: { ideal: 3 },
        Service: { ideal: 3 }, Fame: { ideal: 3 }, Agency: { ideal: 3 },
        Work: { ideal: 2 }, Achievement: { ideal: 2 }
    }, SCALE_MIN);
    var pairs = computeHarmonyPairs(computeResults());

    assertNotContainsPair(pairs, "Work", "Achievement", "non-core high scorers");
    assertContainsPair(pairs, "Experiences", "Fame", "core pair");
    assertContainsPair(pairs, "Impact", "Fame", "core pair");
    assertContainsPair(pairs, "Family", "Service", "core pair");
});

test("Harmonies: higher-ideal side is always placed on the left, pairs sorted by left then right ideal descending", function () {
    setScores({
        Experiences: { ideal: 3 }, Fame: { ideal: 2 },
        Impact: { ideal: 2 }, Wealth: { ideal: 2 }, Agency: { ideal: 2 }
    }, SCALE_MIN);
    var pairs = computeHarmonyPairs(computeResults());

    var byLeftName = {};
    pairs.forEach(function (p) { byLeftName[p.left.name + "-" + p.right.name] = p; });
    assert(byLeftName["Experiences-Fame"], "Experiences (higher ideal) should be on the left of its pair with Fame");
    assert(byLeftName["Impact-Wealth"], "Impact and Wealth (tied) should still form a pair");

    var indexHigher = pairs.indexOf(byLeftName["Experiences-Fame"]);
    var indexLower = pairs.indexOf(byLeftName["Impact-Wealth"]);
    assert(indexHigher < indexLower, "the pair with the higher-scoring left side should sort first");
});

test("Harmonies: section hides when no eligible pairs exist, shows when at least one does", function () {
    setScores({ Faith: { ideal: 3 }, Achievement: { ideal: 1 }, "Self-Expression": { ideal: 0 } }, SCALE_MIN);
    finishWizard();
    assertEqual(harmoniesSectionEl.style.display, "none", "hidden when empty");

    setScores({ Experiences: { ideal: 3 }, Fame: { ideal: 3 } }, SCALE_MIN);
    finishWizard();
    assertEqual(harmoniesSectionEl.style.display, "block", "visible when non-empty");

    goToStart();
});

// ===========================================================================
// Dissonances section (computeDissonancePairs)
// ===========================================================================

test("Dissonances: filters to pairs where BOTH sides are Core Values, same rule as Harmonies", function () {
    setScores({
        Family: { ideal: 3 }, Service: { ideal: 3 }, Fame: { ideal: 3 },
        Agency: { ideal: 3 }, Work: { ideal: 3 }, Achievement: { ideal: 3 },
        Home: { ideal: 2 }
    }, SCALE_MIN);
    var pairs = computeDissonancePairs(computeResults());

    assertNotContainsPair(pairs, "Work", "Home", "non-core high scorer");
    assertContainsPair(pairs, "Family", "Fame", "core dissonance pair");
    assertContainsPair(pairs, "Family", "Agency", "core dissonance pair");
});

test("Dissonances: higher-ideal side on the left, sorted the same way as Harmonies", function () {
    setScores({ Family: { ideal: 3 }, Fame: { ideal: 1 } }, SCALE_MIN);
    var pairs = computeDissonancePairs(computeResults());
    assertEqual(pairs[0].left.name, "Family", "higher ideal on the left");
    assertEqual(pairs[0].right.name, "Fame", "lower ideal on the right");
});

test("Dissonances: section hides when no eligible pairs exist, shows when at least one does", function () {
    setScores({ Home: { ideal: 3 }, Aesthetic: { ideal: 1 }, "Self-Expression": { ideal: 0 } }, SCALE_MIN);
    finishWizard();
    assertEqual(dissonancesSectionEl.style.display, "none", "hidden when empty");

    setScores({ Family: { ideal: 3 }, Fame: { ideal: 3 } }, SCALE_MIN);
    finishWizard();
    assertEqual(dissonancesSectionEl.style.display, "block", "visible when non-empty");

    goToStart();
});

// ===========================================================================
// All Values section
// ===========================================================================

test("All Values: always includes all 16 values, unfiltered", function () {
    setScores({}, 0);
    var all = sortByNameAlphabetically(computeResults());
    assertEqual(all.length, 16, "value count");
});

test("All Values: sorted alphabetically by name", function () {
    setScores({}, 0);
    var all = sortByNameAlphabetically(computeResults());
    var expectedOrder = VALUES.map(function (v) { return v.name; }).slice().sort();
    assertNamesInOrder(all, expectedOrder, "alphabetical order");
});

// All Values is never hidden — it always has all 16 values regardless of answers.

// ===========================================================================
// Special algorithms & edge cases
// ===========================================================================

test("isValidAnswersArray: validates shape, length, and value range", function () {
    assertEqual(isValidAnswersArray(new Array(TOTAL_STATEMENTS).fill(null)), true, "all null is valid");
    assertEqual(isValidAnswersArray(new Array(TOTAL_STATEMENTS).fill(0)), true, "all zero is valid");
    assertEqual(isValidAnswersArray(new Array(TOTAL_STATEMENTS - 1).fill(null)), false, "wrong length is invalid");
    assertEqual(isValidAnswersArray(new Array(TOTAL_STATEMENTS).fill(SCALE_MAX + 1)), false, "above-range value is invalid");
    assertEqual(isValidAnswersArray(new Array(TOTAL_STATEMENTS).fill(SCALE_MIN - 1)), false, "below-range value is invalid");
    assertEqual(isValidAnswersArray("not an array"), false, "non-array is invalid");
    assertEqual(isValidAnswersArray(null), false, "null is invalid");
});

test("scoreToPercent maps the -3..3 scale onto 0..100 linearly", function () {
    assertEqual(scoreToPercent(SCALE_MIN), 0, "minimum score");
    assertEqual(scoreToPercent(SCALE_MAX), 100, "maximum score");
    assertEqual(scoreToPercent(0), 50, "midpoint score");
});

test("computeWeight uses whichever of ideal/actual is greater, symmetrically", function () {
    var weightWhenIdealHigher = computeWeight({ ideal: 3, actual: -1 });
    var weightWhenActualHigher = computeWeight({ ideal: -1, actual: 3 });
    assertEqual(weightWhenIdealHigher, 6, "weight when ideal is the higher score");
    assertEqual(weightWhenActualHigher, 6, "weight when actual is the higher score (same magnitude)");
});

test("computeDisconnectScore is weight times the absolute gap", function () {
    var result = { ideal: 2, actual: -1 };
    var expectedWeight = Math.max(2, -1) - SCALE_MIN;
    var expectedDiff = Math.abs(2 - (-1));
    assertEqual(computeDisconnectScore(result), expectedWeight * expectedDiff, "disconnect score");
});

test("computeResults defaults unanswered (null) scores to 0, not to SCALE_MIN or a crash", function () {
    answers = new Array(TOTAL_STATEMENTS).fill(null);
    var results = computeResults();
    results.forEach(function (r) {
        assertEqual(r.ideal, 0, r.name + " ideal default");
        assertEqual(r.actual, 0, r.name + " actual default");
    });
});

test("Harmony/Dissonance pair left/right assignment: an exact ideal tie keeps the pairs-list order (first name left)", function () {
    setScores({ Experiences: { ideal: 1 }, Fame: { ideal: 1 } }, SCALE_MIN);
    var pairs = computeHarmonyPairs(computeResults());
    assertEqual(pairs[0].left.name, "Experiences", "left side on an exact tie");
    assertEqual(pairs[0].right.name, "Fame", "right side on an exact tie");
});

test("encodeState/decodeState round-trips a wizard-in-progress state through the bit-packed URL format", function () {
    var original = {
        screen: "wizard",
        currentStep: 17,
        answers: new Array(TOTAL_STATEMENTS).fill(null).map(function (_, i) {
            return i % 3 === 0 ? null : (i % 7) - 3;
        })
    };
    var decoded = decodeState(encodeState(original));
    assertEqual(decoded.screen, "wizard", "screen");
    assertEqual(decoded.currentStep, 17, "currentStep");
    assertArrayEqual(decoded.answers, original.answers, "answers");
});

test("decodeState rejects garbage or truncated input instead of throwing", function () {
    assertEqual(decodeState("not valid base64url!!"), null, "invalid characters");
    assertEqual(decodeState("AA"), null, "too short to hold 32 answers");
});

// ===========================================================================
// Runner
// ===========================================================================

// The suite fires 100+ synchronous history.replaceState calls (persistState
// runs on every rendered statement). No test depends on real History API
// semantics — they only check the resulting location.hash — but that many
// calls during the browser's initial page-load parse has occasionally
// raced and left a stale hash behind. Writing to location.hash directly for
// the run's duration avoids this; the real replaceState is restored after.
function withStubbedHistory(fn) {
    var realReplaceState = history.replaceState.bind(history);
    history.replaceState = function (state, title, url) {
        var hashIndex = url.indexOf("#");
        location.hash = hashIndex === -1 ? "" : url.slice(hashIndex);
    };
    try {
        return fn();
    } finally {
        history.replaceState = realReplaceState;
    }
}

function runTests() {
    localStorage.clear();

    var results = withStubbedHistory(function () {
        goToStart();

        return TEST_CASES.map(function (testCase) {
            try {
                testCase.fn();
                return { name: testCase.name, pass: true };
            } catch (e) {
                return { name: testCase.name, pass: false, error: e.message };
            }
        });
    });

    goToStart();

    var passCount = results.filter(function (r) { return r.pass; }).length;
    var failCount = results.length - passCount;

    console.group("myvalues test suite");
    results.forEach(function (r) {
        if (r.pass) {
            console.log("%cPASS%c " + r.name, "color: #1a8a4a; font-weight: bold", "color: inherit");
        } else {
            console.error("FAIL " + r.name + " — " + r.error);
        }
    });
    console.log(passCount + "/" + results.length + " passed");
    console.groupEnd();

    var summaryEl = document.getElementById("test-summary");
    var casesEl = document.getElementById("test-cases");
    if (summaryEl && casesEl) {
        summaryEl.textContent = passCount + " / " + results.length + " passed" + (failCount > 0 ? " — " + failCount + " failing" : "");
        summaryEl.className = failCount > 0 ? "has-fail" : "all-pass";

        casesEl.innerHTML = "";
        results.forEach(function (r) {
            var caseEl = document.createElement("div");
            caseEl.className = "test-case " + (r.pass ? "pass" : "fail");

            var nameEl = document.createElement("div");
            nameEl.className = "test-case-name";
            nameEl.textContent = r.name;
            caseEl.appendChild(nameEl);

            if (!r.pass) {
                var errorEl = document.createElement("div");
                errorEl.className = "test-case-error";
                errorEl.textContent = r.error;
                caseEl.appendChild(errorEl);
            }

            casesEl.appendChild(caseEl);
        });
    }

    return results;
}

runTests();
