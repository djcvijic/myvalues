var TOTAL_QUESTIONS = 32;
var SCALE_MIN = -3;
var SCALE_MAX = 3;

var SCALE_COLORS = ["#CD2553", "#AB3870", "#894C8C", "#675FA9", "#4472C6", "#2286E2", "#0099FF"];
var SCALE_ARIA_LABELS = [
    "Strongly disagree",
    "Disagree",
    "Somewhat disagree",
    "Neutral",
    "Somewhat agree",
    "Agree",
    "Strongly agree"
];

var VALUES = [
    {
        name: "Experiences",
        statement: "I embrace adventure and fill my life with a wide variety of experiences.",
        definition: "Living a full, varied life through new adventures and experiences, rather than routine or predictability. People high in this value are energized by change, novelty, and trying new things.",
        deficitExplanation: "When your life has less variety and adventure than you crave, days can start to feel monotonous and stagnant, leaving you restless, bored, or like you're just going through the motions instead of truly living.",
        excessExplanation: "When your life is more chaotic and unpredictable than feels comfortable to you, you may end up feeling scattered, depleted, or unable to build the stability and routine you need to feel grounded.",
    },
    {
        name: "Impact",
        statement: "I build my life around leaving a lasting mark on the world.",
        definition: "Wanting to leave a lasting mark on the world, whether by solving big problems, building something meaningful, or driving change at a systemic level, not just in your own life but beyond it.",
        deficitExplanation: "If your life feels smaller in scope than the impact you want to have, you may feel restless or unfulfilled, wondering whether your work and choices really matter or add up to anything lasting.",
        excessExplanation: "Chasing a bigger impact than you actually need to feel fulfilled can lead to burnout, overextension, and neglecting the smaller, more personal parts of life in pursuit of a legacy that isn't really yours to chase.",
    },
    {
        name: "Family",
        statement: "I build my daily life around my family, keeping my loved ones close and happy.",
        definition: "Family sits at the center of how you organize your time, decisions, and priorities. This reflects how much closeness with, and responsibility toward, your family shapes your life.",
        deficitExplanation: "When family plays a smaller role in your daily life than you'd like, you may feel guilt, distance, or a nagging sense that you're missing out on the closeness and connection that matters most to you.",
        excessExplanation: "When your life revolves around family more than truly fits you, you may lose touch with your own individual identity, interests, or needs outside of that role.",
    },
    {
        name: "Service",
        statement: "I dedicate my time and energy to helping others and having a positive impact on my circle or community.",
        definition: "A pull toward helping others and contributing to something larger than yourself, whether through direct acts of kindness, community involvement, or dedicating your time to causes beyond your own interests.",
        deficitExplanation: "If you're not able to help others or contribute to your community as much as you'd like, you may feel a quiet sense of selfishness or disconnection from a larger purpose.",
        excessExplanation: "Giving more of your time and energy to others than truly matches your own capacity can lead to burnout, resentment, or losing sight of your own needs along the way.",
    },
    {
        name: "Fame",
        statement: "I strive to become as famous as possible, beloved by many, and recognized wherever I go.",
        definition: "The desire to be known, admired, and recognized by others, ideally on a wide scale. Public visibility and acclaim matter to your sense of a life well lived.",
        deficitExplanation: "If you crave recognition and visibility but aren't getting it, you may feel overlooked, undervalued, or like your efforts are going unnoticed by the people who matter to you.",
        excessExplanation: "More public attention and recognition than you actually want can bring unwanted pressure, a loss of privacy, and the exhausting sense of always being watched or judged.",
    },
    {
        name: "Agency",
        statement: "I make my own decisions and chart my own path, no matter what anyone says.",
        definition: "Self-determination: making your own choices and controlling the direction of your life, even when that means going against expectations or pressure from others.",
        deficitExplanation: "When you have less control over your own decisions than you need, you may feel stifled, resentful, or like you're living someone else's life instead of your own.",
        excessExplanation: "Insisting on more control and independence than actually serves you can leave you isolated, overburdened, or unable to lean on others for support when you need it.",
    },
    {
        name: "Work",
        statement: "I organize my life around my work, and I take pride in it.",
        definition: "How central your career or professional pursuits are to your identity and daily life. For some, work is simply a means to an end; for others, it's a defining, organizing force in how they live.",
        deficitExplanation: "If work plays a smaller role in your life than you'd like it to, you may feel unmoored, underutilized, or like you haven't found the professional purpose you're searching for.",
        excessExplanation: "When work takes up more of your identity and time than truly fits you, other parts of your life, like relationships, health, and rest, can quietly erode without you noticing.",
    },
    {
        name: "Self-Care",
        statement: "I take care of my own physical and emotional wellbeing, and find peace and happiness in doing so.",
        definition: "Prioritizing your own physical and emotional wellbeing, rest, and peace of mind. It's about valuing time spent tending to yourself, not just achieving or producing.",
        deficitExplanation: "Neglecting your own physical and emotional wellbeing more than feels right to you can leave you running on empty, more prone to burnout, illness, or resentment toward the demands placed on you.",
        excessExplanation: "Focusing on self-care far beyond what you actually need can tip into self-absorption or avoidance, making it harder to show up fully for other people or responsibilities in your life.",
    },
    {
        name: "Achievement",
        statement: "I accomplish things I can be proud of, and keep climbing to ever greater heights.",
        definition: "The drive to accomplish things, set goals, and continually reach higher. Visible, tangible success and personal accomplishment matter to how you measure a good life.",
        deficitExplanation: "If you're accomplishing less than you feel capable of, you may feel stuck, restless, or plagued by a nagging sense of unfulfilled potential.",
        excessExplanation: "Chasing achievement far beyond what actually satisfies you can leave you on a treadmill of accomplishment, never feeling like enough no matter how much you've done.",
    },
    {
        name: "Wealth",
        statement: "I strive to grow my financial wealth as much as I can.",
        definition: "Financial security and material prosperity. Money, and the freedom it provides, shape your sense of a successful life.",
        deficitExplanation: "Having less financial security than you need can create ongoing stress, anxiety, and a persistent feeling of instability that colors other parts of your life.",
        excessExplanation: "Prioritizing money and material success more than truly serves you can crowd out relationships, meaning, or rest, leaving you wealthier but less fulfilled.",
    },
    {
        name: "Self-Expression",
        statement: "I express myself freely and make sure my voice is heard.",
        definition: "The need to express your authentic thoughts, creativity, and identity openly, and to be heard and understood by others.",
        deficitExplanation: "If you're holding back your true voice or creativity more than feels right, you may feel unseen, unheard, or like you're constantly editing yourself to fit in.",
        excessExplanation: "Expressing yourself more freely or loudly than actually serves you can strain relationships or invite conflict, especially if it comes at the expense of listening to others.",
    },
    {
        name: "Aesthetic",
        statement: "I curate my surroundings and surround myself with beauty.",
        definition: "An appreciation for beauty, whether in your surroundings, your appearance, or how you present yourself and your life to the world.",
        deficitExplanation: "When your surroundings or appearance matter more to you than what you're currently able to maintain, you may feel a persistent low-grade dissatisfaction with how your life looks and feels.",
        excessExplanation: "Investing more time, money, or energy into appearances and beauty than actually fulfills you can become a distraction from deeper sources of meaning and connection.",
    },
    {
        name: "Community",
        statement: "I surround myself with close friends and a strong community, and I'm a dependable, trusted part of my circle.",
        definition: "Closeness with friends and a sense of belonging to a broader group. This reflects how much you rely on, and invest in, the people around you.",
        deficitExplanation: "Having less community and close friendship in your life than you crave can leave you feeling isolated, lonely, or disconnected, even when you're surrounded by people.",
        excessExplanation: "Surrounding yourself with more community and social obligation than you actually need can leave little room for solitude, rest, or the deeper one-on-one connections you also value.",
    },
    {
        name: "Home",
        statement: "I live somewhere that truly feels like home, and I make that place a true home.",
        definition: "Having a physical place that feels like your own: a home base that provides comfort, stability, and a sense of belonging.",
        deficitExplanation: "If where you live doesn't feel like a true home the way you need it to, you may feel unsettled, rootless, or like you're just passing through your own life.",
        excessExplanation: "Over-investing in a specific place or attachment to home beyond what serves you can make change, travel, or new opportunities feel more threatening than they need to.",
    },
    {
        name: "Faith",
        statement: "I shape my life around the teachings and practices of my faith or spirituality.",
        definition: "Organizing your life around religious or spiritual beliefs and practices. Faith or spirituality shapes your daily choices and sense of meaning.",
        deficitExplanation: "When your life is organized around faith or spirituality less than you'd like, you may feel a quiet spiritual emptiness or a disconnection from a sense of meaning bigger than yourself.",
        excessExplanation: "Organizing your life around faith or spirituality more rigidly than actually serves you can narrow your perspective or create friction with other parts of your life and relationships.",
    },
    {
        name: "Companionship",
        statement: "I shape my life around my connection with my romantic partner, finding my soulmate, loving well, and being loved.",
        definition: "The importance of romantic love and deep partnership. Finding and nurturing a close romantic relationship matters to your sense of fulfillment.",
        deficitExplanation: "If romantic love and partnership matter more to you than what you currently have, you may feel a persistent loneliness or longing, even amid a full life otherwise.",
        excessExplanation: "Centering your life around a romantic relationship more than truly serves you can mean losing touch with your own identity, friendships, or interests outside the relationship.",
    }
];

// Each pair means those two values are in harmony/dissonance with each other;
// the relationship is inherently symmetric, so no reverse entries are needed.
var HARMONY_PAIRS = [
    ["Experiences", "Fame", "Seeking bold new experiences often puts you in the public eye, and visibility can open doors to even more adventures."],
    ["Experiences", "Agency", "Chasing new experiences is easiest when you're free to make your own choices and go your own way."],
    ["Experiences", "Achievement", "Trying new things and pushing yourself to accomplish more both come from the same drive to keep growing and reaching further."],
    ["Impact", "Fame", "Making a lasting mark on the world usually requires visibility, so the two reinforce each other."],
    ["Impact", "Wealth", "Financial resources are often what make large-scale impact possible, funding the ventures and initiatives that create lasting change."],
    ["Impact", "Achievement", "Both are about reaching for something bigger than where you are now, one measured by scale, the other by milestones."],
    ["Impact", "Work", "Making a lasting mark on the world is usually accomplished through sustained, focused professional effort."],
    ["Family", "Service", "Caring for your family and caring for your broader community both come from the same instinct to put others' needs alongside your own."],
    ["Family", "Community", "Both values are about investing deeply in the people closest to you, just at different scales."],
    ["Family", "Home", "A stable home is often what makes it possible to build and nurture close family life."],
    ["Family", "Companionship", "Both values are about building deep, lasting bonds with the people you love most."],
    ["Service", "Community", "Helping others and building community naturally reinforce each other, since service often happens within and for a community."],
    ["Fame", "Work", "Building a public profile and career-centrism often reinforce each other, since public recognition and professional advancement tend to move together."],
    ["Fame", "Achievement", "Visible accomplishments are often what earn you recognition in the first place."],
    ["Fame", "Wealth", "Public recognition and financial success are often mutually reinforcing, each opening doors to the other."],
    ["Fame", "Self-Expression", "Putting your authentic voice out into the world is one of the most direct paths to being seen and recognized."],
    ["Fame", "Aesthetic", "How you present yourself and your surroundings shapes the public image that recognition depends on."],
    ["Agency", "Work", "Choosing and shaping your own career path is one of the clearest ways to exercise self-determination."],
    ["Agency", "Achievement", "Setting and pursuing your own goals, on your own terms, is central to both making your own choices and reaching for accomplishment."],
    ["Agency", "Self-Expression", "Speaking your truth and charting your own path both come from the same refusal to be defined by others."],
    ["Work", "Achievement", "Career progress is one of the most common and visible ways people measure their accomplishments."],
    ["Work", "Wealth", "A career is usually the primary vehicle through which financial security and prosperity are built."],
    ["Self-Care", "Aesthetic", "Taking care of yourself often includes how you present yourself and curate your surroundings; beauty and self-care rituals are closely linked for many people."],
    ["Self-Care", "Community", "Having people around you who support and care for you is one of the strongest contributors to your own wellbeing."],
    ["Self-Care", "Home", "A stable, comfortable home base is often exactly where rest and recovery happen."],
    ["Achievement", "Wealth", "Financial success is one of the clearest, most tangible markers of accomplishment."],
    ["Wealth", "Aesthetic", "Financial resources make it easier to curate beautiful surroundings and a polished personal presentation."],
    ["Self-Expression", "Aesthetic", "Creative, authentic expression and an eye for beauty often go hand in hand."],
    ["Aesthetic", "Home", "Curating a home's look and feel is one of the most common ways people express their appreciation for beauty."],
    ["Community", "Home", "A stable home is often what anchors your closest relationships and sense of belonging to a place and its people."],
    ["Community", "Companionship", "Both are about deep, sustained connection with others, just at different scales of intimacy."],
    ["Home", "Companionship", "Building a life and a home together is one of the most common expressions of a committed partnership."],
    ["Faith", "Family", "Religious and spiritual life is often organized around family rituals, traditions, and shared practice."],
    ["Faith", "Service", "Helping others is a near-universal teaching across faith traditions; service is often how faith is practiced."],
    ["Faith", "Community", "Congregational or spiritual community is often central to how faith is lived out day to day."]
];
var DISSONANCE_PAIRS = [
    ["Experiences", "Family", "Chasing constant novelty and change can be hard to reconcile with the routine and stability that family life often needs. Over time, you may feel torn between wanderlust and guilt, or find yourself resenting the routines that family life relies on."],
    ["Experiences", "Work", "A demanding career can leave little room or flexibility for spontaneous adventure and new experiences. You may end up feeling stuck and restless, watching opportunities for adventure slip by while your calendar stays full."],
    ["Impact", "Family", "Pursuing large-scale change often demands time and focus that competes directly with time for family. Ignored for too long, this can bring a persistent guilt about being absent, with family relationships growing distant while your attention stays elsewhere."],
    ["Impact", "Self-Care", "Chasing an ambitious legacy can easily come at the cost of rest and personal wellbeing. Without a check on this, you may run yourself into exhaustion or burnout, undermining the very energy your ambitions depend on."],
    ["Family", "Fame", "Public visibility often means less privacy and time, both of which family life depends on. This can leave your home life feeling intruded upon, with loved ones resenting the spotlight that follows you."],
    ["Family", "Agency", "Family life requires ongoing compromise and consideration of others, which can constrain pure self-determination. If this tension goes unexamined, you may feel chronically boxed in, or grow quietly resentful toward the people whose needs shape your choices."],
    ["Family", "Work", "Time and energy devoted to career advancement is often time and energy taken directly from family. The longer this goes unchecked, the more likely you are to feel constant guilt about being pulled away, watching important family moments pass you by."],
    ["Family", "Self-Care", "The demands of caring for family often leave little time left over for caring for yourself. Unattended, this tends to leave you running on empty, with fatigue and resentment building beneath the surface."],
    ["Family", "Achievement", "Chasing personal accomplishment can pull time and focus away from the people closest to you. Without some balance, you may look back on milestones achieved alone, having missed the family moments that mattered most."],
    ["Family", "Wealth", "The pursuit of financial success often requires the kind of time investment that competes with family life. Left unchecked, you may find that the security you're building comes at the cost of the closeness it was meant to protect."],
    ["Service", "Fame", "Genuine service is other-focused, while seeking recognition for it can undercut the selflessness it depends on. Over time this can breed a nagging emptiness, a sense that your motives have shifted from helping others to being seen helping them."],
    ["Service", "Self-Care", "Constantly prioritizing others' needs can leave little energy left for your own, a common path to caregiver burnout. You may end up feeling depleted and resentful, with little left to give even to the people you most want to help."],
    ["Service", "Achievement", "Service centers on others' needs and outcomes, while achievement centers on your own; they pull attention in different directions. If unresolved, you may feel pulled in two directions at once, never fully satisfied by either the help you give or the goals you chase."],
    ["Service", "Wealth", "Service-oriented work and pursuits are often the ones with the least direct financial reward. Ongoing neglect of this tension can bring chronic financial strain or anxiety, even as your sense of purpose stays strong."],
    ["Fame", "Self-Care", "Public scrutiny and the pressure that comes with visibility can directly undermine peace of mind. This can leave you feeling persistently anxious or on edge, unable to fully switch off from how others perceive you."],
    ["Fame", "Companionship", "The exposure and demands of public life often put real strain on the privacy a close relationship needs. Left unaddressed, intimacy can become harder to sustain, as public attention crowds out the quiet space a relationship needs to grow."],
    ["Agency", "Companionship", "Deep partnership requires ongoing compromise, which can sit uneasily with a strong need to do things entirely your own way. Without attention, this can mean repeated frustration over compromise, or a partner who feels shut out of decisions that affect them too."],
    ["Work", "Self-Care", "A career-centered life is one of the most common paths to burnout and neglected wellbeing. Ignored long enough, your health and energy can quietly erode until burnout forces a stop you didn't choose."],
    ["Work", "Companionship", "Long hours and career focus are among the most common sources of strain in a romantic relationship. A partner may start to feel like an afterthought, with distance growing in the relationship over time."],
    ["Work", "Home", "Demanding careers often require relocation or long hours away, both of which undercut a stable home base. You may end up feeling unmoored or transient, never quite settling into the sense of home you're working toward."],
    ["Self-Care", "Achievement", "The drive to keep achieving more can push rest and self-care aside in favor of relentless output. This often produces diminishing returns as fatigue sets in, ironically undermining the very achievements you're chasing."],
    ["Achievement", "Companionship", "An all-consuming drive to accomplish more can leave little time or attention for a partner. Over time, a relationship can grow thin on connection, sustained by logistics rather than genuine closeness."],
    ["Faith", "Wealth", "Most faith traditions explicitly caution against prioritizing material wealth over spiritual devotion. Left unresolved, this can bring a quiet sense of guilt or spiritual unease, as if your priorities have drifted from what you believe matters most."],
    ["Faith", "Fame", "Humility over seeking public glory is a common, explicit virtue across faith traditions. You may feel an ongoing inner conflict between wanting recognition and the humility your beliefs ask of you."],
    ["Faith", "Agency", "Organizing your life around a faith's teachings means deferring to its authority, which sits in tension with charting a purely self-determined path. Unresolved, this can leave you torn between conviction and independence, second-guessing decisions made either way."]
];

var IDEAL_CONTEXT = "In my ideal life...";
var ACTUAL_CONTEXT = "In my life as it is now...";

var statements = VALUES.map(function (v) {
    return v.statement;
});

var questions = statements.concat(statements);
var questionContexts = [];
statements.forEach(function () {
    questionContexts.push(IDEAL_CONTEXT);
});
statements.forEach(function () {
    questionContexts.push(ACTUAL_CONTEXT);
});

var IDEAL_INTRO_TEXT = "Imagine your ideal life, the life you'd build for yourself if you could be however you wanted, with no constraints. Keep that ideal life in mind as you answer the next set of statements.";
var ACTUAL_INTRO_TEXT = "Now come back to reality. Think about your life as it actually is today, how you spend your time and energy, and how you currently organize your life. Keep that in mind as you answer the next set of statements.";

// Fixed, shuffled presentation orders (indices into VALUES). Generated once and
// hardcoded so every visitor sees questions within each half in the same order.
var IDEAL_ORDER = [0, 15, 10, 14, 13, 7, 12, 6, 5, 1, 2, 9, 11, 4, 8, 3];
var ACTUAL_ORDER = [15, 14, 7, 5, 13, 0, 10, 1, 3, 11, 9, 12, 6, 4, 2, 8];

var steps = [];
(function buildSteps() {
    var questionNumber = 0;

    steps.push({ type: "intro", text: IDEAL_INTRO_TEXT });
    IDEAL_ORDER.forEach(function (valueIndex) {
        questionNumber++;
        steps.push({ type: "question", questionIndex: valueIndex, displayNumber: questionNumber });
    });
    steps.push({ type: "intro", text: ACTUAL_INTRO_TEXT });
    ACTUAL_ORDER.forEach(function (valueIndex) {
        questionNumber++;
        steps.push({ type: "question", questionIndex: valueIndex + VALUES.length, displayNumber: questionNumber });
    });
})();

var STORAGE_KEY = "myvalues-state-v1";

var answers = new Array(TOTAL_QUESTIONS).fill(null);
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
var questionBlock = document.getElementById("question-block");
var questionNumberEl = document.getElementById("question-number");
var questionContextEl = document.getElementById("question-context");
var questionTextEl = document.getElementById("question-text");
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
        && candidate.length === TOTAL_QUESTIONS
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
    var requiredBits = 1 + STEP_BITS + TOTAL_QUESTIONS * ANSWER_BITS;
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
    for (var q = 0; q < TOTAL_QUESTIONS; q++) {
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
        currentStep = steps.length - 1;
        renderResults();
        showScreen(resultsScreen);
        resultsNav.refresh();
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
        questionBlock.classList.remove("active");
        continueButton.style.setProperty("display", "inline-block");
        introTextEl.textContent = step.text;
        return;
    }

    questionBlock.classList.add("active");
    introBlock.classList.remove("active");
    continueButton.style.setProperty("display", "none");

    var qIndex = step.questionIndex;
    questionNumberEl.textContent = "Statement " + step.displayNumber + " of " + TOTAL_QUESTIONS;
    questionContextEl.textContent = questionContexts[qIndex];
    questionTextEl.textContent = questions[qIndex];

    var selectedValue = answers[qIndex];
    Array.from(scaleEl.getElementsByClassName("scale-option")).forEach(function (button) {
        var buttonValue = parseInt(button.dataset.value, 10);
        button.classList.toggle("selected", selectedValue !== null && buttonValue === selectedValue);
    });

    persistState("wizard");
}

function selectAnswer(value) {
    var step = steps[currentStep];
    answers[step.questionIndex] = value;
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
    answers = new Array(TOTAL_QUESTIONS).fill(null);
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

function computeResults() {
    var results = VALUES.map(function (v, i) {
        var ideal = answers[i];
        var actual = answers[i + VALUES.length];
        return {
            name: v.name,
            definition: v.definition,
            deficitExplanation: v.deficitExplanation,
            excessExplanation: v.excessExplanation,
            ideal: ideal === null ? 0 : ideal,
            actual: actual === null ? 0 : actual
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

function buildIdealOnlyResultItem(result) {
    var item = buildResultItemBase(result);

    var track = document.createElement("div");
    track.className = "result-track";

    var idealPercent = scoreToPercent(result.ideal);
    var idealMarker = document.createElement("div");
    idealMarker.className = "result-marker result-marker-ideal";
    idealMarker.style.setProperty("left", idealPercent + "%");

    track.appendChild(createMarkerPercentLabel(idealPercent, "result-marker-percent-ideal"));
    track.appendChild(idealMarker);

    item.appendChild(track);
    return item;
}

function buildActualOnlyResultItem(result) {
    var item = buildResultItemBase(result);

    var track = document.createElement("div");
    track.className = "result-track";

    var actualPercent = scoreToPercent(result.actual);
    var actualMarker = document.createElement("div");
    actualMarker.className = "result-marker result-marker-actual";
    actualMarker.style.setProperty("left", actualPercent + "%");

    track.appendChild(createMarkerPercentLabel(actualPercent, "result-marker-percent-actual"));
    track.appendChild(actualMarker);

    item.appendChild(track);
    return item;
}

function buildResultItem(result) {
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
        var tiedMarker = document.createElement("div");
        tiedMarker.className = "result-marker result-marker-tied";
        tiedMarker.style.setProperty("left", idealPercent + "%");
        track.appendChild(createMarkerPercentLabel(idealPercent, "result-marker-percent-tied"));
        track.appendChild(tiedMarker);
    } else {
        var idealMarker = document.createElement("div");
        idealMarker.className = "result-marker result-marker-ideal";
        idealMarker.style.setProperty("left", idealPercent + "%");

        var actualMarker = document.createElement("div");
        actualMarker.className = "result-marker result-marker-actual";
        actualMarker.style.setProperty("left", actualPercent + "%");

        track.appendChild(createMarkerPercentLabel(idealPercent, "result-marker-percent-ideal"));
        track.appendChild(createMarkerPercentLabel(actualPercent, "result-marker-percent-actual"));
        track.appendChild(idealMarker);
        track.appendChild(actualMarker);
    }

    item.appendChild(track);
    return item;
}

function buildComparisonResultItem(result) {
    var item = buildResultItem(result);

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

function selectTopIdealValues(results) {
    var core = [];
    var coreNames = {};

    function add(r) {
        if (!coreNames[r.name]) {
            coreNames[r.name] = true;
            core.push(r);
        }
    }

    // 1. The #1 value, and anything tied with it by ideal score.
    var topIdeal = results[0].ideal;
    results.forEach(function (r) {
        if (r.ideal === topIdeal) {
            add(r);
        }
    });

    // 2. If that's fewer than 5, add every value at 80%+ ideal.
    if (core.length < 5) {
        results.forEach(function (r) {
            if (scoreToPercent(r.ideal) >= 80) {
                add(r);
            }
        });
    }

    // 3. If still fewer than 3, fall back to top 3 (with ties at #3 included).
    if (core.length < 3) {
        var thirdPlaceIdeal = results[2].ideal;
        results.forEach(function (r) {
            if (r.ideal >= thirdPlaceIdeal) {
                add(r);
            }
        });
    }

    return core;
}

function selectTopActualValues(results) {
    var sorted = results.slice().sort(function (a, b) {
        return b.actual - a.actual;
    });

    var core = [];
    var coreNames = {};

    function add(r) {
        if (!coreNames[r.name]) {
            coreNames[r.name] = true;
            core.push(r);
        }
    }

    // 1. The #1 value, and anything tied with it by actual score.
    var topActual = sorted[0].actual;
    sorted.forEach(function (r) {
        if (r.actual === topActual) {
            add(r);
        }
    });

    // 2. If that's fewer than 5, add every value at 80%+ actual.
    if (core.length < 5) {
        sorted.forEach(function (r) {
            if (scoreToPercent(r.actual) >= 80) {
                add(r);
            }
        });
    }

    // 3. If still fewer than 3, fall back to top 3 (with ties at #3 included).
    if (core.length < 3) {
        var thirdPlaceActual = sorted[2].actual;
        sorted.forEach(function (r) {
            if (r.actual >= thirdPlaceActual) {
                add(r);
            }
        });
    }

    return core;
}

// Weight is based on whichever score (ideal or actual) is greater, so a value you're
// already living out strongly counts just as much as one you aspire to strongly.
function computeWeight(result) {
    return Math.max(result.ideal, result.actual) - SCALE_MIN;
}

// Also known as the "value disconnect score" - a single value's weighted deviation
// between its ideal and actual score, feeding both the authenticity score (as a
// weighted mean absolute deviation) and the Ideal vs. Actual Comparison ranking.
function computeWeightedDiff(result) {
    var diff = Math.abs(result.ideal - result.actual);
    return computeWeight(result) * diff;
}

function computeAuthenticityScore(results) {
    var maxDiff = SCALE_MAX - SCALE_MIN;
    var totalWeight = 0;
    var weightedDiffSum = 0;

    results.forEach(function (r) {
        totalWeight += computeWeight(r);
        weightedDiffSum += computeWeightedDiff(r);
    });

    var weightedAvgDiff = totalWeight > 0 ? weightedDiffSum / totalWeight : 0;
    var score = (1 - weightedAvgDiff / maxDiff) * 100;
    return Math.round(score);
}

var MAX_WEIGHTED_DIFF = (SCALE_MAX - SCALE_MIN) * (SCALE_MAX - SCALE_MIN);
var DISCONNECT_THRESHOLD_PERCENT = 30;

function computeDisconnectPercent(result) {
    return (computeWeightedDiff(result) / MAX_WEIGHTED_DIFF) * 100;
}

function selectGreatestDisconnects(results) {
    var sorted = results.slice().sort(function (a, b) {
        return (computeWeightedDiff(b) - computeWeightedDiff(a)) || (b.ideal - a.ideal);
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

    // Eligible = core values.
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

function buildHarmonyPairValue(result) {
    var side = document.createElement("div");
    side.className = "harmony-pair-value";

    var name = document.createElement("div");
    name.className = "harmony-pair-name";
    name.textContent = result.name;

    var percent = document.createElement("div");
    percent.className = "harmony-pair-percent";
    percent.textContent = Math.round(scoreToPercent(result.ideal)) + "%";

    side.appendChild(name);
    side.appendChild(percent);
    return side;
}

function buildCoreValuePairItem(pairInfo, connectorSymbol) {
    var item = document.createElement("div");
    item.className = "harmony-pair";

    var valuesRow = document.createElement("div");
    valuesRow.className = "harmony-pair-values";

    var connector = document.createElement("div");
    connector.className = "harmony-pair-connector";
    connector.textContent = connectorSymbol;

    valuesRow.appendChild(buildHarmonyPairValue(pairInfo.left));
    valuesRow.appendChild(connector);
    valuesRow.appendChild(buildHarmonyPairValue(pairInfo.right));

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
    renderResultsList(resultsListEl, sortByNameAlphabetically(results), buildResultItem);
    renderResultsList(topValuesListEl, selectTopIdealValues(results), buildIdealOnlyResultItem);
    renderResultsList(topActualValuesListEl, selectTopActualValues(results), buildActualOnlyResultItem);
    renderAuthenticityScore(results);

    var disconnects = selectGreatestDisconnects(results);
    renderResultsList(disconnectsListEl, disconnects, buildComparisonResultItem);
    comparisonSectionEl.style.setProperty("display", disconnects.length === 0 ? "none" : "block");

    renderHarmonyPairs(results);
    renderDissonancePairs(results);
}

function finishWizard() {
    currentStep = steps.length - 1;
    renderResults();
    showScreen(resultsScreen);
    resultsNav.refresh();
    persistState("results");
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
        var current = null;
        visibleLinks().forEach(function (link) {
            var section = document.getElementById(link.dataset.section);
            if (section.getBoundingClientRect().top <= 120) {
                current = link;
            }
        });
        if (!current) {
            current = visibleLinks()[0];
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

buildScale();

if (!restoreState()) {
    showScreen(startScreen);
}

startButton.addEventListener("click", startWizard);
backButton.addEventListener("click", goBack);
continueButton.addEventListener("click", advanceStep);
restartButton.addEventListener("click", goToStart);
downloadButton.addEventListener("click", downloadResults);
uploadButton.addEventListener("click", function () {
    uploadInput.click();
});
uploadInput.addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (file) {
        handleUploadedFile(file);
    }
    uploadInput.value = "";
});

var debugToastEl = document.createElement("div");
debugToastEl.className = "debug-toast";
debugToastEl.textContent = "Random answers generated";
document.body.appendChild(debugToastEl);
var debugToastTimeout = null;

function showDebugToast() {
    debugToastEl.classList.add("visible");
    if (debugToastTimeout) {
        clearTimeout(debugToastTimeout);
    }
    debugToastTimeout = setTimeout(function () {
        debugToastEl.classList.remove("visible");
    }, 1200);
}

window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.altKey && (e.code === "KeyR" || e.key.toLowerCase() === "r")) {
        e.preventDefault();
        for (var i = 0; i < TOTAL_QUESTIONS; i++) {
            answers[i] = Math.floor(Math.random() * (SCALE_MAX - SCALE_MIN + 1)) + SCALE_MIN;
        }
        finishWizard();
        showDebugToast();
    }
}, true);

function backToTop() {
    var toTop = document.getElementById("to-top");

    var onScroll = function () {
        if (window.scrollY > 0) {
            toTop.style.setProperty("opacity", 1);
            toTop.style.setProperty("pointer-events", "auto");
        } else {
            toTop.style.setProperty("opacity", 0);
            toTop.style.setProperty("pointer-events", "none");
        }
    };

    window.addEventListener("scroll", onScroll);

    var scrollToTop = function () {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    };

    toTop.addEventListener("click", scrollToTop);
}

backToTop();
