const viewActivate = document.getElementById("view-activate");
const viewActive = document.getElementById("view-active");
const licenseInput = document.getElementById("license-input");
const btnActivate = document.getElementById("btn-activate");
const btnDeactivate = document.getElementById("btn-deactivate");
const errorMsg = document.getElementById("error-msg");
const infoEmail = document.getElementById("info-email");
const infoExpiry = document.getElementById("info-expiry");
const infoKey = document.getElementById("info-key");

// Load current status
chrome.runtime.sendMessage({ action: "getStatus" }, (status) => {
  if (status && status.licenseActive) {
    showActiveView(status);
  } else {
    showActivateView();
  }
});

// Activate
btnActivate.addEventListener("click", async () => {
  const key = licenseInput.value.trim();
  if (!key) {
    showError("Please enter a license key.");
    return;
  }

  btnActivate.disabled = true;
  btnActivate.textContent = "Activating...";
  errorMsg.classList.add("hidden");

  chrome.runtime.sendMessage({ action: "activate", licenseKey: key }, (resp) => {
    btnActivate.disabled = false;
    btnActivate.textContent = "Activate";

    if (resp && resp.success) {
      chrome.runtime.sendMessage({ action: "getStatus" }, (status) => {
        showActiveView(status);
      });
    } else {
      showError(resp?.message || "Activation failed.");
    }
  });
});

// Deactivate
btnDeactivate.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "deactivate" }, () => {
    showActivateView();
  });
});

// Enter key to activate
licenseInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnActivate.click();
});

function showActiveView(status) {
  viewActivate.classList.add("hidden");
  viewActive.classList.remove("hidden");

  infoEmail.textContent = status.licenseEmail || "—";
  infoKey.textContent = maskKey(status.licenseKey || "");

  if (status.licenseExpiry) {
    const d = new Date(status.licenseExpiry);
    infoExpiry.textContent = d.toLocaleDateString();
  } else {
    infoExpiry.textContent = "Lifetime";
  }
}

function showActivateView() {
  viewActive.classList.add("hidden");
  viewActivate.classList.remove("hidden");
  licenseInput.value = "";
  errorMsg.classList.add("hidden");
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

function maskKey(key) {
  if (key.length <= 8) return key;
  return key.slice(0, 4) + "····" + key.slice(-4);
}
