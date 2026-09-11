// Depends on globals from values-data.js and wizard.js: answers, showScreen,
// steps, persistState, resultsScreen, STATEMENT_KEYS, STATEMENTS_PER_PHASE,
// and the *ListEl/*SectionEl DOM refs.

// Each value has one answer per STATEMENT_KEYS entry (main statement plus
// alt phrasings); they count identically, so the value's score is their
// average, with unanswered (null) statements treated as 0.
function averagedScore(base) {
    var sum = 0;
    for (var k = 0; k < STATEMENT_KEYS.length; k++) {
        var a = answers[base + k];
        sum += (a === null ? 0 : a);
    }
    return sum / STATEMENT_KEYS.length;
}

function computeResults() {
    var results = VALUES.map(function (v, i) {
        var idealBase = i * STATEMENT_KEYS.length;
        var actualBase = STATEMENTS_PER_PHASE + idealBase;
        return {
            name: v.name,
            definition: v.definition,
            deficitExplanation: v.deficitExplanation,
            excessExplanation: v.excessExplanation,
            ideal: averagedScore(idealBase),
            actual: averagedScore(actualBase)
        };
    });

    results.sort(function (a, b) {
        return (b.ideal - a.ideal) || (b.actual - a.actual);
    });

    return results;
}

function scoreToPercent(score) {
    return ((score - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
}

function createMarkerPercentLabel(percent, className) {
    var label = document.createElement("div");
    label.className = "result-marker-percent " + className;
    label.style.setProperty("left", percent + "%");
    label.textContent = Math.round(percent) + "%";
    return label;
}

function buildResultItemBase(result) {
    var item = document.createElement("div");
    item.className = "result-item";

    var name = document.createElement("div");
    name.className = "result-item-name";
    name.textContent = result.name;

    var definition = document.createElement("div");
    definition.className = "result-item-definition";
    definition.textContent = result.definition;

    item.appendChild(name);
    item.appendChild(definition);
    return item;
}

// variant must match the CSS suffixes result-marker-<variant> and
// result-marker-percent-<variant>.
function appendResultMarker(track, percent, variant) {
    track.appendChild(createMarkerPercentLabel(percent, "result-marker-percent-" + variant));

    var marker = document.createElement("div");
    marker.className = "result-marker result-marker-" + variant;
    marker.style.setProperty("left", percent + "%");
    track.appendChild(marker);
}

function buildSingleScoreResultItem(scoreField) {
    return function (result) {
        var item = buildResultItemBase(result);

        var track = document.createElement("div");
        track.className = "result-track";
        appendResultMarker(track, scoreToPercent(result[scoreField]), scoreField);

        item.appendChild(track);
        return item;
    };
}

var buildIdealOnlyResultItem = buildSingleScoreResultItem("ideal");
var buildActualOnlyResultItem = buildSingleScoreResultItem("actual");

function buildDualScoreResultItem(result) {
    var item = buildResultItemBase(result);

    var track = document.createElement("div");
    track.className = "result-track";

    var idealPercent = scoreToPercent(result.ideal);
    var actualPercent = scoreToPercent(result.actual);

    var gapLine = document.createElement("div");
    gapLine.className = "result-gap-line";
    if (result.ideal > result.actual) {
        gapLine.classList.add("result-gap-line-ideal");
    } else if (result.ideal < result.actual) {
        gapLine.classList.add("result-gap-line-actual");
    }
    gapLine.style.setProperty("left", Math.min(idealPercent, actualPercent) + "%");
    gapLine.style.setProperty("width", Math.abs(idealPercent - actualPercent) + "%");

    track.appendChild(gapLine);

    if (result.ideal === result.actual) {
        appendResultMarker(track, idealPercent, "tied");
    } else {
        appendResultMarker(track, idealPercent, "ideal");
        appendResultMarker(track, actualPercent, "actual");
    }

    item.appendChild(track);
    return item;
}

function buildComparisonResultItem(result) {
    var item = buildDualScoreResultItem(result);

    var explanationText = null;
    if (result.actual > result.ideal) {
        explanationText = result.excessExplanation;
    } else if (result.actual < result.ideal) {
        explanationText = result.deficitExplanation;
    }

    if (explanationText) {
        var explanation = document.createElement("p");
        explanation.className = "result-item-explanation";
        explanation.textContent = explanationText;
        item.appendChild(explanation);
    }

    return item;
}

function renderResultsList(container, results, buildItem) {
    container.innerHTML = "";
    results.forEach(function (result) {
        container.appendChild(buildItem(result));
    });
}

// Shared by "Core Values" (scoreField "ideal") and "Current Focus" (scoreField
// "actual"):
//   1. The #1 value, and anything tied with it.
//   2. If that's fewer than 5, add every value at 80%+.
//   3. If still fewer than 3, fall back to top 3 (with ties at #3 included).
function selectTopValuesByScore(results, scoreField) {
    var sorted = results.slice().sort(function (a, b) {
        return b[scoreField] - a[scoreField];
    });

    var core = [];
    var coreNames = {};

    function add(r) {
        if (!coreNames[r.name]) {
            coreNames[r.name] = true;
            core.push(r);
        }
    }

    var topScore = sorted[0][scoreField];
    sorted.forEach(function (r) {
        if (r[scoreField] === topScore) {
            add(r);
        }
    });

    if (core.length < 5) {
        sorted.forEach(function (r) {
            if (scoreToPercent(r[scoreField]) >= 80) {
                add(r);
            }
        });
    }

    if (core.length < 3) {
        var thirdPlaceScore = sorted[2][scoreField];
        sorted.forEach(function (r) {
            if (r[scoreField] >= thirdPlaceScore) {
                add(r);
            }
        });
    }

    return core;
}

function selectTopIdealValues(results) {
    return selectTopValuesByScore(results, "ideal");
}

function selectTopActualValues(results) {
    return selectTopValuesByScore(results, "actual");
}

// Uses whichever score is greater, so a value you're living out strongly
// counts as much as one you aspire to strongly.
function computeWeight(result) {
    return Math.max(result.ideal, result.actual) - SCALE_MIN;
}

function computeDisconnectScore(result) {
    var diff = Math.abs(result.ideal - result.actual);
    return computeWeight(result) * diff;
}

function computeAuthenticityScore(results) {
    var maxDiff = SCALE_MAX - SCALE_MIN;
    var totalWeight = 0;
    var weightedDiffSum = 0;

    results.forEach(function (r) {
        totalWeight += computeWeight(r);
        weightedDiffSum += computeDisconnectScore(r);
    });

    var weightedAvgDiff = totalWeight > 0 ? weightedDiffSum / totalWeight : 0;
    var score = (1 - weightedAvgDiff / maxDiff) * 100;
    return Math.round(score);
}

var MAX_DISCONNECT_SCORE = (SCALE_MAX - SCALE_MIN) * (SCALE_MAX - SCALE_MIN);
var DISCONNECT_THRESHOLD_PERCENT = 30;

function computeDisconnectPercent(result) {
    return (computeDisconnectScore(result) / MAX_DISCONNECT_SCORE) * 100;
}

function selectGreatestDisconnects(results) {
    var sorted = results.slice().sort(function (a, b) {
        return (computeDisconnectScore(b) - computeDisconnectScore(a)) || (b.ideal - a.ideal);
    });
    return sorted.filter(function (r) {
        return computeDisconnectPercent(r) >= DISCONNECT_THRESHOLD_PERCENT;
    });
}

function computeCoreValuePairs(results, pairsList) {
    var resultsByName = {};
    results.forEach(function (r) {
        resultsByName[r.name] = r;
    });

    var eligibleNames = {};
    selectTopIdealValues(results).forEach(function (r) {
        eligibleNames[r.name] = true;
    });

    var pairs = [];
    pairsList.forEach(function (pair) {
        var nameA = pair[0];
        var nameB = pair[1];
        var explanation = pair[2];

        if (!eligibleNames[nameA] || !eligibleNames[nameB]) {
            return;
        }

        var a = resultsByName[nameA];
        var b = resultsByName[nameB];
        var left = a.ideal >= b.ideal ? a : b;
        var right = a.ideal >= b.ideal ? b : a;

        pairs.push({ left: left, right: right, explanation: explanation });
    });

    pairs.sort(function (p1, p2) {
        return (p2.left.ideal - p1.left.ideal) || (p2.right.ideal - p1.right.ideal);
    });

    return pairs;
}

function computeHarmonyPairs(results) {
    return computeCoreValuePairs(results, HARMONY_PAIRS);
}

function computeDissonancePairs(results) {
    return computeCoreValuePairs(results, DISSONANCE_PAIRS);
}

var AUTHENTICITY_TIERS = [
    {
        min: 80,
        definition: "You're living authentically. Your daily life is genuinely organized around the values that matter most to you, and that kind of alignment tends to bring a lasting sense of peace, clarity, and harmony. It's worth protecting as your life continues to change."
    },
    {
        min: 50,
        definition: "You're living with a mix of alignment and disconnects. A good amount of what matters most to you is already showing up in your daily life, which is real progress. With a few intentional changes, you can close the remaining gap and feel even more in sync."
    },
    {
        min: -Infinity,
        definition: "Right now, there's a significant gap between what matters most to you and how you're actually spending your life. That happens to almost everyone at some point, often without noticing it creeping up. The good news is that it's never too late to course-correct and start living your truth."
    }
];

function renderAuthenticityScore(results) {
    var score = computeAuthenticityScore(results);
    var tier = AUTHENTICITY_TIERS.find(function (t) {
        return score >= t.min;
    });

    authenticityFillEl.style.setProperty("width", score + "%");
    authenticityMarkerEl.style.setProperty("left", score + "%");
    authenticityPercentEl.textContent = score + "%";
    authenticityDefinitionEl.textContent = tier.definition;
}

function sortByNameAlphabetically(results) {
    return results.slice().sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });
}

function buildCoreValuePairSide(result) {
    var side = document.createElement("div");
    side.className = "value-pair-value";

    var name = document.createElement("div");
    name.className = "value-pair-name";
    name.textContent = result.name;

    var percent = document.createElement("div");
    percent.className = "value-pair-percent";
    percent.textContent = Math.round(scoreToPercent(result.ideal)) + "%";

    side.appendChild(name);
    side.appendChild(percent);
    return side;
}

function buildCoreValuePairItem(pairInfo, connectorSymbol) {
    var item = document.createElement("div");
    item.className = "value-pair";

    var valuesRow = document.createElement("div");
    valuesRow.className = "value-pair-values";

    var connector = document.createElement("div");
    connector.className = "value-pair-connector";
    connector.textContent = connectorSymbol;

    valuesRow.appendChild(buildCoreValuePairSide(pairInfo.left));
    valuesRow.appendChild(connector);
    valuesRow.appendChild(buildCoreValuePairSide(pairInfo.right));

    var explanation = document.createElement("p");
    explanation.className = "result-item-explanation";
    explanation.textContent = pairInfo.explanation;

    item.appendChild(valuesRow);
    item.appendChild(explanation);
    return item;
}

function renderCoreValuePairs(pairs, listEl, sectionEl, connectorSymbol) {
    listEl.innerHTML = "";
    pairs.forEach(function (pairInfo) {
        listEl.appendChild(buildCoreValuePairItem(pairInfo, connectorSymbol));
    });
    sectionEl.style.setProperty("display", pairs.length === 0 ? "none" : "block");
}

function renderHarmonyPairs(results) {
    renderCoreValuePairs(computeHarmonyPairs(results), harmonyPairsListEl, harmoniesSectionEl, "&");
}

function renderDissonancePairs(results) {
    renderCoreValuePairs(computeDissonancePairs(results), dissonancePairsListEl, dissonancesSectionEl, "✕");
}

function renderResults() {
    var results = computeResults();
    renderResultsList(resultsListEl, sortByNameAlphabetically(results), buildDualScoreResultItem);
    renderResultsList(topValuesListEl, selectTopIdealValues(results), buildIdealOnlyResultItem);
    renderResultsList(topActualValuesListEl, selectTopActualValues(results), buildActualOnlyResultItem);
    renderAuthenticityScore(results);

    var disconnects = selectGreatestDisconnects(results);
    renderResultsList(disconnectsListEl, disconnects, buildComparisonResultItem);
    comparisonSectionEl.style.setProperty("display", disconnects.length === 0 ? "none" : "block");

    renderHarmonyPairs(results);
    renderDissonancePairs(results);
}

function showResults() {
    currentStep = steps.length - 1;
    renderResults();
    showScreen(resultsScreen);
    resultsNav.refresh();
}

function finishWizard() {
    showResults();
    persistState("results");
}

function initResultsNav() {
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".results-nav-link"));

    function visibleLinks() {
        return navLinks.filter(function (link) {
            return !link.classList.contains("hidden");
        });
    }

    function updateVisibility() {
        navLinks.forEach(function (link) {
            var section = document.getElementById(link.dataset.section);
            var isHidden = !section || section.style.display === "none";
            link.classList.toggle("hidden", isHidden);
        });
    }

    function updateActiveLink() {
        var links = visibleLinks();
        var current = null;
        links.forEach(function (link) {
            var section = document.getElementById(link.dataset.section);
            if (section.getBoundingClientRect().top <= 120) {
                current = link;
            }
        });
        if (!current) {
            current = links[0];
        }
        navLinks.forEach(function (link) {
            link.classList.toggle("active", link === current);
        });
    }

    navLinks.forEach(function (link) {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            var section = document.getElementById(link.dataset.section);
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    window.addEventListener("scroll", updateActiveLink);

    return {
        refresh: function () {
            updateVisibility();
            updateActiveLink();
        }
    };
}

var resultsNav = initResultsNav();
