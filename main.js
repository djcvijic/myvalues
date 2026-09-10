// Boot sequence, event wiring, and the debug shortcut. Runs after
// values-data.js, wizard.js, and results.js have all loaded.

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
        for (var i = 0; i < TOTAL_STATEMENTS; i++) {
            answers[i] = Math.floor(Math.random() * (SCALE_MAX - SCALE_MIN + 1)) + SCALE_MIN;
        }
        finishWizard();
        showDebugToast();
    }
}, true);
