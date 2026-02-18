/**
 * YT Ad Cleaner - Background Service Worker
 * Handles license validation via LemonSqueezy API.
 */

const LEMON_API = "https://api.lemonsqueezy.com/v1/licenses";

// On install, check stored license
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["licenseKey"], (result) => {
    if (result.licenseKey) {
      validateLicense(result.licenseKey);
    }
  });
});

// On startup, re-validate
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["licenseKey"], (result) => {
    if (result.licenseKey) {
      validateLicense(result.licenseKey);
    }
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "activate") {
    activateLicense(msg.licenseKey).then(sendResponse);
    return true; // async response
  }
  if (msg.action === "deactivate") {
    deactivateLicense().then(sendResponse);
    return true;
  }
  if (msg.action === "getStatus") {
    chrome.storage.local.get(
      ["licenseActive", "licenseKey", "licenseEmail", "licenseExpiry"],
      (result) => {
        sendResponse(result);
      }
    );
    return true;
  }
});

/**
 * Activate a license key via LemonSqueezy API.
 * POST https://api.lemonsqueezy.com/v1/licenses/activate
 */
async function activateLicense(key) {
  try {
    const resp = await fetch(`${LEMON_API}/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        license_key: key,
        instance_name: "yt-ad-cleaner-chrome",
      }),
    });

    const data = await resp.json();

    if (data.activated || data.valid) {
      const meta = data.meta || {};
      const licenseData = {
        licenseActive: true,
        licenseKey: key,
        licenseEmail: meta.customer_email || "",
        licenseExpiry: meta.expires_at || null,
        instanceId: data.instance?.id || "",
      };
      await chrome.storage.local.set(licenseData);
      return { success: true, message: "License activated!" };
    } else {
      return {
        success: false,
        message: data.error || data.message || "Invalid license key.",
      };
    }
  } catch (err) {
    return { success: false, message: "Network error: " + err.message };
  }
}

/**
 * Validate stored license (silent check).
 */
async function validateLicense(key) {
  try {
    const resp = await fetch(`${LEMON_API}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ license_key: key }),
    });

    const data = await resp.json();

    if (data.valid) {
      await chrome.storage.local.set({ licenseActive: true });
    } else {
      await chrome.storage.local.set({ licenseActive: false });
    }
  } catch (err) {
    // Network error — keep current state, don't lock out
  }
}

/**
 * Deactivate license.
 */
async function deactivateLicense() {
  const { licenseKey, instanceId } = await chrome.storage.local.get([
    "licenseKey",
    "instanceId",
  ]);

  if (licenseKey && instanceId) {
    try {
      await fetch(`${LEMON_API}/deactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          license_key: licenseKey,
          instance_id: instanceId,
        }),
      });
    } catch (e) {
      // best effort
    }
  }

  await chrome.storage.local.set({
    licenseActive: false,
    licenseKey: "",
    licenseEmail: "",
    licenseExpiry: null,
    instanceId: "",
  });

  return { success: true };
}
