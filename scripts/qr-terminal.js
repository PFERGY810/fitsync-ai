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
const expoUrl = `exp://${localIP}:${expoPort}`;

console.log("\nExpo URL:", expoUrl);
console.log("If scanning fails, try setting EXPO_PORT or switch Wi‑Fi.\n");

// Print a compact QR first (often scans better in terminals)
qrcode.generate(expoUrl, { small: true });

console.log("\n--- Larger QR (if your terminal supports it) ---\n");
qrcode.generate(expoUrl, { small: false });

