const os = require("os");
const qrcode = require("qrcode-terminal");

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const localIP = "10.50.108.120"; // Hardcoded for troubleshooting
const expoPort = process.env.EXPO_PORT || "8081";
const expoUrl = `exp://${localIP}:${expoPort}`;

console.log("\nExpo URL:", expoUrl);
console.log("If scanning fails, try setting EXPO_PORT or switch Wi‑Fi.\n");

// Print a compact QR first (often scans better in terminals)
qrcode.generate(expoUrl, { small: true });

console.log("\n--- Larger QR (if your terminal supports it) ---\n");
qrcode.generate(expoUrl, { small: false });

