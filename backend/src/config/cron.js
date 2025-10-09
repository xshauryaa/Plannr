import cron from "cron";
import https from "https";
import { ENV } from "./env.js";

// Keep-alive cron job to prevent Render from sleeping
const keepAliveJob = new cron.CronJob("*/14 * * * *", function () {
  // Only run keep-alive in production
  if (ENV.NODE_ENV === 'production' && ENV.API_URL) {
    console.log('🏓 Sending keep-alive ping...');
    
    https
      .get(ENV.API_URL + '/api/health', (res) => {
        if (res.statusCode === 200) {
          console.log("✅ Keep-alive ping successful");
        } else {
          console.log("❌ Keep-alive ping failed", res.statusCode);
        }
      })
      .on("error", (e) => {
        console.error("❌ Keep-alive ping error:", e.message);
      });
  }
});

export const startCronJobs = () => {
  if (ENV.NODE_ENV === 'production') {
    console.log('🕒 Starting cron jobs for production...');
    keepAliveJob.start();
    console.log('✅ Keep-alive cron job started (every 14 minutes)');
  } else {
    console.log('🕒 Cron jobs disabled in development mode');
  }
};

export const stopCronJobs = () => {
  keepAliveJob.stop();
  console.log('🛑 Cron jobs stopped');
};

export default { startCronJobs, stopCronJobs };