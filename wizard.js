// Statement sequencing, state persistence (URL hash + localStorage), and
// wizard screen mechanics. Depends on values-data.js. Calls into results.js
// (showResults, finishWizard, computeResults) only from inside function
// bodies, so load order just needs results.js loaded before those functions
// are actually invoked, not before this file parses.

var IDEAL_CONTEXT = "In my ideal life...";
var ACTUAL_CONTEXT = "In my life as it is now...";

var statements = VALUES.map(function (v) {
    return v.statement;
});

var statementTexts = statements.concat(statements);
var statementContexts = [];
statements.forEach(function () {
    statementContexts.push(IDEAL_CONTEXT);
});
statements.forEach(function () {
    statementContexts.push(ACTUAL_CONTEXT);
});

var IDEAL_INTRO_TEXT = "Imagine your ideal life, the life you'd build for yourself if you could be however you wanted, with no constraints. Keep that ideal life in mind as you answer the next set of statements.";
var ACTUAL_INTRO_TEXT = "Now come back to reality. Think about your life as it actually is today, how you spend your time and energy, and how you currently organize your life. Keep that in mind as you answer the next set of statements.";

// Shuffled presentation orders (indices into VALUES). Hardcoded rather than
// randomized so every visitor sees the same order within each half.
var IDEAL_ORDER = [0, 15, 10, 14, 13, 7, 12, 6, 5, 1, 2, 9, 11, 4, 8, 3];
var ACTUAL_ORDER = [15, 14, 7, 5, 13, 0, 10, 1, 3, 11, 9, 12, 6, 4, 2, 8];

var steps = [];
(function buildSteps() {
    var statementNumber = 0;

    steps.push({ type: "intro", text: IDEAL_INTRO_TEXT });
    IDEAL_ORDER.forEach(function (valueIndex) {
        statementNumber++;
        steps.push({ type: "statement", statementIndex: valueIndex, displayNumber: statementNumber });
    });
    steps.push({ type: "intro", text: ACTUAL_INTRO_TEXT });
    ACTUAL_ORDER.forEach(function (valueIndex) {
        statementNumber++;
        steps.push({ type: "statement", statementIndex: valueIndex + VALUES.length, displayNumber: statementNumber });
    });
})();

var STORAGE_KEY = "myvalues-state-v1";

var answers = new Array(TOTAL_STATEMENTS).fill(null);
var currentStep = 0;
var advanceTimeout = null;

var startScreen = document.getElementById("start-screen");
var wizardScreen = document.getElementById("wizard-screen");
var resultsScreen = document.getElementById("results-screen");

var startButton = document.getElementById("start-button");
var restartButton = document.getElementById("restart-button");
var downloadButton = document.getElementById("download-button");
var backButton = document.getElementById("back-button");
var continueButton = document.getElementById("continue-button");
var uploadButton = document.getElementById("upload-button");
var uploadInput = document.getElementById("upload-input");
var uploadErrorEl = document.getElementById("upload-error");

var progressFill = document.getElementById("progress-fill");
var introBlock = document.getElementById("intro-block");
var introTextEl = document.getElementById("intro-text");
var statementBlock = document.getElementById("statement-block");
var statementNumberEl = document.getElementById("statement-number");
var statementContextEl = document.getElementById("statement-context");
var statementTextEl = document.getElementById("statement-text");
var scaleEl = document.getElementById("scale");
var resultsListEl = document.getElementById("results-list");
var topValuesListEl = document.getElementById("top-values-list");
var topActualValuesListEl = document.getElementById("top-actual-values-list");
var disconnectsListEl = document.getElementById("disconnects-list");
var comparisonSectionEl = document.getElementById("comparison-section");
var harmoniesSectionEl = document.getElementById("harmonies-section");
var harmonyPairsListEl = document.getElementById("harmony-pairs-list");
var dissonancesSectionEl = document.getElementById("dissonances-section");
var dissonancePairsListEl = document.getElementById("dissonance-pairs-list");
var authenticityFillEl = document.getElementById("authenticity-fill");
var authenticityMarkerEl = document.getElementById("authenticity-marker");
var authenticityPercentEl = document.getElementById("authenticity-percent");
var authenticityDefinitionEl = document.getElementById("authenticity-definition");

function isValidAnswersArray(candidate) {
    return Array.isArray(candidate)
        && candidate.length === TOTAL_STATEMENTS
        && candidate.every(function (value) {
            return value === null || (typeof value === "number" && value >= SCALE_MIN && value <= SCALE_MAX);
        });
}

// State is bit-packed (1 bit screen + 6 bits step + 3 bits per answer) and
// base64url-encoded, to keep the URL hash as short as possible.
var STEP_BITS = 6;
var ANSWER_BITS = 3;

function bitsToBase64Url(bits) {
    while (bits.length % 8 !== 0) {
        bits.push(0);
    }
    var bytes = [];
    for (var i = 0; i < bits.length; i += 8) {
        var byte = 0;
        for (var j = 0; j < 8; j++) {
            byte = (byte << 1) | bits[i + j];
        }
        bytes.push(byte);
    }
    var binaryString = bytes.map(function (b) {
        return String.fromCharCode(b);
    }).join("");
    return btoa(binaryString).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBits(encoded) {
    var b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4 !== 0) {
        b64 += "=";
    }
    var binaryString;
    try {
        binaryString = atob(b64);
    } catch (e) {
        return null;
    }
    var bits = [];
    for (var i = 0; i < binaryString.length; i++) {
        var byte = binaryString.charCodeAt(i);
        for (var j = 7; j >= 0; j--) {
            bits.push((byte >> j) & 1);
        }
    }
    return bits;
}

function encodeState(state) {
    var bits = [];

    function pushBits(value, numBits) {
        for (var i = numBits - 1; i >= 0; i--) {
            bits.push((value >> i) & 1);
        }
    }

    pushBits(state.screen === "results" ? 1 : 0, 1);
    pushBits(state.currentStep, STEP_BITS);
    state.answers.forEach(function (value) {
        pushBits(value === null ? 0 : value - SCALE_MIN + 1, ANSWER_BITS);
    });

    return bitsToBase64Url(bits);
}

function decodeState(encoded) {
    if (!/^[A-Za-z0-9_-]+$/.test(encoded)) {
        return null;
    }

    var bits = base64UrlToBits(encoded);
    var requiredBits = 1 + STEP_BITS + TOTAL_STATEMENTS * ANSWER_BITS;
    if (!bits || bits.length < requiredBits) {
        return null;
    }

    var pos = 0;
    function readBits(numBits) {
        var value = 0;
        for (var i = 0; i < numBits; i++) {
            value = (value << 1) | bits[pos++];
        }
        return value;
    }

    var screen = readBits(1) === 1 ? "results" : "wizard";
    var currentStep = readBits(STEP_BITS);
    var answers = [];
    for (var q = 0; q < TOTAL_STATEMENTS; q++) {
        var code = readBits(ANSWER_BITS);
        answers.push(code === 0 ? null : code - 1 + SCALE_MIN);
    }

    return { screen: screen, currentStep: currentStep, answers: answers };
}

function persistState(screenName) {
    var state = {
        screen: screenName,
        currentStep: currentStep,
        answers: answers
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    history.replaceState(null, "", "#" + encodeState(state));
}

function clearPersistedState() {
    localStorage.removeItem(STORAGE_KEY);
    history.replaceState(null, "", location.pathname + location.search);
}

function restoreState() {
    var state = null;

    if (location.hash && location.hash.length > 1) {
        state = decodeState(location.hash.slice(1));
    }

    if (!state) {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                state = JSON.parse(raw);
            } catch (e) {
                state = null;
            }
        }
    }

    if (!state || !isValidAnswersArray(state.answers)) {
        return false;
    }

    answers = state.answers;

    if (state.screen === "results") {
        showResults();
        return true;
    }

    if (state.screen === "wizard" && typeof state.currentStep === "number"
        && state.currentStep >= 0 && state.currentStep < steps.length) {
        currentStep = state.currentStep;
        showScreen(wizardScreen);
        renderStep();
        return true;
    }

    return false;
}

function showScreen(screen) {
    [startScreen, wizardScreen, resultsScreen].forEach(function (s) {
        s.classList.remove("active");
    });
    screen.classList.add("active");
}

function buildScale() {
    scaleEl.innerHTML = "";
    for (var value = SCALE_MIN; value <= SCALE_MAX; value++) {
        var colorIndex = value - SCALE_MIN;
        var button = document.createElement("button");
        button.type = "button";
        button.className = "scale-option";
        button.style.setProperty("background-color", SCALE_COLORS[colorIndex]);
        button.dataset.value = value;
        button.setAttribute("aria-label", SCALE_ARIA_LABELS[colorIndex]);
        button.title = SCALE_ARIA_LABELS[colorIndex];

        var check = document.createElement("i");
        check.className = "fa-solid fa-check scale-check";
        button.appendChild(check);

        button.addEventListener("click", function (e) {
            selectAnswer(parseInt(e.currentTarget.dataset.value, 10));
        });
        scaleEl.appendChild(button);
    }
}

function renderStep() {
    var step = steps[currentStep];
    var progressPercent = ((currentStep + 1) / steps.length) * 100;
    progressFill.style.setProperty("width", progressPercent + "%");
    backButton.classList.toggle("visible", currentStep > 0);

    if (step.type === "intro") {
        introBlock.classList.add("active");
        statementBlock.classList.remove("active");
        continueButton.style.setProperty("display", "inline-block");
        introTextEl.textContent = step.text;
        return;
    }

    statementBlock.classList.add("active");
    introBlock.classList.remove("active");
    continueButton.style.setProperty("display", "none");

    var statementIndex = step.statementIndex;
    statementNumberEl.textContent = "Statement " + step.displayNumber + " of " + TOTAL_STATEMENTS;
    statementContextEl.textContent = statementContexts[statementIndex];
    statementTextEl.textContent = statementTexts[statementIndex];

    var selectedValue = answers[statementIndex];
    Array.from(scaleEl.getElementsByClassName("scale-option")).forEach(function (button) {
        var buttonValue = parseInt(button.dataset.value, 10);
        button.classList.toggle("selected", selectedValue !== null && buttonValue === selectedValue);
    });

    persistState("wizard");
}

function selectAnswer(value) {
    var step = steps[currentStep];
    answers[step.statementIndex] = value;
    renderStep();

    if (advanceTimeout) {
        clearTimeout(advanceTimeout);
    }
    advanceTimeout = setTimeout(advanceStep, 600);
}

function advanceStep() {
    if (currentStep === steps.length - 1) {
        finishWizard();
    } else {
        currentStep++;
        renderStep();
    }
}

function goToStart() {
    answers = new Array(TOTAL_STATEMENTS).fill(null);
    currentStep = 0;
    clearPersistedState();
    showScreen(startScreen);
}

function startWizard() {
    currentStep = 0;
    showScreen(wizardScreen);
    renderStep();
}

function goBack() {
    if (currentStep > 0) {
        if (advanceTimeout) {
            clearTimeout(advanceTimeout);
        }
        currentStep--;
        renderStep();
    }
}

function downloadResults() {
    var payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        answers: answers,
        results: computeResults()
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "myvalues-results.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function showUploadError() {
    uploadErrorEl.textContent = "Couldn't read that file. Please upload a results file exported from myvalues.";
}

function clearUploadError() {
    uploadErrorEl.textContent = "";
}

function handleUploadedFile(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
        var parsed;
        try {
            parsed = JSON.parse(e.target.result);
        } catch (err) {
            showUploadError();
            return;
        }

        if (!parsed || !isValidAnswersArray(parsed.answers)) {
            showUploadError();
            return;
        }

        clearUploadError();
        answers = parsed.answers;
        finishWizard();
    };
    reader.onerror = showUploadError;
    reader.readAsText(file);
}
