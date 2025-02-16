import { initializeMonitor } from "./client";

(async () => {
  try {
    await initializeMonitor();
  } catch (error) {
    console.error("Monitor error:", error);
    process.exit(1);
  }
})();