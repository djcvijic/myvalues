// Runs after values-data.js, wizard.js, and results.js.

buildScale();

if (!restoreState()) {
    showScreen(startScreen);
}

// A hash dropped into an already-open tab only fires hashchange, no reload,
// so restoreState() above won't see it.
window.addEventListener("hashchange", function () {
    consumeUrlHash();
});

startButton.addEventListener("click", startWizard);
backButton.addEventListener("click", goBack);
continueButton.addEventListener("click", advanceStep);
restartButton.addEventListener("click", goToStart);
shareButton.addEventListener("click", openShareModal);
loadButton.addEventListener("click", openLoadModal);
loadUrlSubmit.addEventListener("click", submitLoadUrl);
loadUrlInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        submitLoadUrl();
    }
});
shareUrlCopyButton.addEventListener("click", copyShareUrl);

document.querySelectorAll(".modal-close").forEach(function (button) {
    button.addEventListener("click", closeModals);
});
modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) {
        closeModals();
    }
});
window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modalOverlay.classList.contains("hidden")) {
        closeModals();
    }
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
        for (var i = 0; i < TOTAL_STATEMENTS; i++) {
            answers[i] = Math.floor(Math.random() * (SCALE_MAX - SCALE_MIN + 1)) + SCALE_MIN;
        }
        finishWizard();
        showDebugToast();
    }
}, true);
