# YT Ad Cleaner

Chrome extension that removes all YouTube ads — video ads, overlay ads, sidebar ads, and Premium nag popups.

## Features

- **Video ads**: Auto-skip or fast-forward to the end
- **Overlay ads**: Instantly removed from the player
- **Feed/sidebar ads**: Hidden via CSS + DOM removal
- **Companion ads**: Removed from the sidebar
- **Premium popups**: Auto-dismissed
- **Persistent monitoring**: 300ms polling + MutationObserver

## Installation

1. Download the latest release from [GitHub Releases](https://github.com/YOUR_USERNAME/yt-adblock-ext/releases)
2. Unzip the file
3. Open `chrome://extensions/` in Chrome
4. Enable **Developer mode** (top right)
5. Click **Load unpacked** and select the unzipped folder
6. Click the extension icon and enter your license key

## License Activation

1. Purchase a license at [our store](https://your-store.lemonsqueezy.com)
2. You'll receive a license key via email
3. Click the YT Ad Cleaner extension icon
4. Paste your license key and click **Activate**

## Development

```bash
git clone https://github.com/YOUR_USERNAME/yt-adblock-ext.git
cd yt-adblock-ext
# Load as unpacked extension in chrome://extensions/
```

## Project Structure

```
yt-adblock-ext/
├── manifest.json          # Chrome Extension Manifest V3
├── background.js          # Service worker: license validation via LemonSqueezy
├── lib/
│   ├── adblock.js         # Content script: ad removal logic
│   └── adblock.css        # CSS-level ad hiding (instant, before JS runs)
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Dark theme styling
│   └── popup.js           # Popup logic: activate/deactivate license
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## LemonSqueezy Setup

1. Create a [LemonSqueezy](https://lemonsqueezy.com) account
2. Create a **Product** → choose **Software License** as the type
3. Configure:
   - Activation limit: e.g., 3 (devices per license)
   - License key format: auto-generated
4. Get your store URL and update the buy link in `popup/popup.html`
5. No API key needed in the extension — LemonSqueezy's license API is public

## License

MIT
