const qrcode = require("qrcode");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Get local IP address for Expo Go connection
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const localIP = getLocalIP();
const expoPort = process.env.EXPO_PORT || "8081";
const expoUrl = `exp://${localIP}:${expoPort}`;

// Also include GitHub repo URL
const repoUrl =
  process.env.FITSYNC_REPO_URL || "https://github.com/PFERGY810/Cycle-coach.git";

// Generate QR code as data URI
qrcode.toDataURL(expoUrl, { width: 400, margin: 2 }, (err, qrDataUri) => {
  if (err) {
    console.error("Error generating QR code:", err);
    return;
  }

  // Create HTML content
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FitSync AI - QR Code</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #0A0A0A 0%, #1C1C1E 100%);
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      background: rgba(28, 28, 30, 0.8);
      border: 2px solid rgba(0, 212, 255, 0.3);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 0 40px rgba(0, 212, 255, 0.2);
      max-width: 500px;
      width: 100%;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 10px;
      color: #00D4FF;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
      letter-spacing: 1px;
    }
    .subtitle {
      font-size: 14px;
      color: #ABABAB;
      margin-bottom: 30px;
    }
    .qr-code {
      background: #FFFFFF;
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    }
    .qr-code img {
      display: block;
      width: 100%;
      height: auto;
    }
    .url {
      background: rgba(0, 212, 255, 0.1);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      word-break: break-all;
      font-family: monospace;
      font-size: 12px;
      color: #00D4FF;
    }
    .instructions {
      margin-top: 30px;
      text-align: left;
      font-size: 13px;
      color: #ABABAB;
      line-height: 1.6;
    }
    .instructions ol {
      margin-left: 20px;
      margin-top: 10px;
    }
    .instructions li {
      margin-bottom: 8px;
    }
    .repo-link {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .repo-link a {
      color: #00D4FF;
      text-decoration: none;
      font-size: 12px;
    }
    .repo-link a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>FITSYNC OS v2.0</h1>
    <p class="subtitle">Scan QR Code with Expo Go (iOS)</p>
    
    <div class="qr-code">
      <img src="${qrDataUri}" alt="QR Code" />
    </div>
    
    <div class="url">${expoUrl}</div>
    
    <div class="instructions">
      <strong>Instructions:</strong>
      <ol>
        <li>Make sure Expo dev server is running: <code>npm start</code></li>
        <li>Open Expo Go app on your iOS device</li>
        <li>Scan the QR code above</li>
        <li>The app will load on your device</li>
      </ol>
    </div>
    
    <div class="repo-link">
      <a href="${repoUrl}" target="_blank">GitHub Repository</a>
    </div>
  </div>
</body>
</html>`;

  // Write HTML file
  const htmlPath = path.join(__dirname, "qr-popup.html");
  fs.writeFileSync(htmlPath, htmlContent);

  // Open HTML file in default browser
  const platform = os.platform();
  let openCommand;
  
  if (platform === "win32") {
    openCommand = `start "" "${htmlPath}"`;
  } else if (platform === "darwin") {
    openCommand = `open "${htmlPath}"`;
  } else {
    openCommand = `xdg-open "${htmlPath}"`;
  }

  exec(openCommand, (error) => {
    if (error) {
      console.error("Error opening browser:", error);
      console.log(`\nQR code HTML file saved to: ${htmlPath}`);
      console.log("Please open this file manually in your browser.");
    } else {
      console.log("\n✅ QR code popup opened in browser!");
      console.log(`Expo URL: ${expoUrl}`);
      console.log(`Repository: ${repoUrl}\n`);
    }
  });
});
