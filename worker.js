console.log("🚀 [System] Background Dispatch Worker Initialized!");

setInterval(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/cron/process');
    const data = await res.json();

    if (data.status === 'success') {
      console.log(`✅ [Worker] Batch processed successfully: ${data.processed} messages sent.`);
    }
  } catch (error) {
  }
}, 15000);