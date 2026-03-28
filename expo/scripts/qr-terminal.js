const os = require("os");
const qrcode = require("qrcode-terminal");

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        candidates.push(iface.address);
      }
    }
  }
  // Filter out common virtual adapter IPs
  const realCandidates = candidates.filter(ip => !ip.startsWith("192.168.56.") && !ip.startsWith("169.254."));

  // Prioritize 10.x.x.x (often used in school/work networks) or 192.168.x.x
  const best = realCandidates.find(ip => ip.startsWith("10.")) ||
    realCandidates.find(ip => ip.startsWith("192.168.")) ||
    realCandidates[0];

  return best || "localhost";
}

const localIP = getLocalIP();
const expoPort = process.env.EXPO_PORT || "8081";
const apiPort = process.env.PORT || "5000";
const expoUrl = `exp://${localIP}:${expoPort}`;
const apiUrl = `http://${localIP}:${apiPort}`;

console.log("\n======================================");
console.log("       FITSYNC CONNECTIVITY");
console.log("======================================\n");
console.log("Expo App URL:", expoUrl);
console.log("Expected API URL:", apiUrl);
console.log("\n--- SETUP CHECKLIST ---");
console.log("1. PC and Phone on SAME Wi-Fi network");
console.log("2. Server running: 'npm run server:dev'");
console.log("3. Expo running: 'npm run expo:dev'\n");

// Print a compact QR first (often scans better in terminals)
qrcode.generate(expoUrl, { small: true });

console.log("\n--- Larger QR (if terminal supports it) ---\n");
qrcode.generate(expoUrl, { small: false });

console.log("\n--- APP REFRESH ---");
console.log("Re-scan this QR code to refresh the app with latest changes.");
console.log("Or shake your device and tap 'Reload' in the Expo menu.");
console.log("Run 'npm run refresh' to clear cache and regenerate QR.\n");

