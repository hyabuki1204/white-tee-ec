const url = process.argv[2] ?? "http://127.0.0.1:3000";
const timeoutMs = Number(process.argv[3] ?? 60_000);
const startedAt = Date.now();

while (Date.now() - startedAt < timeoutMs) {
  try {
    const response = await fetch(url, { redirect: "follow" });
    if (response.ok) {
      process.exit(0);
    }
  } catch {
    // Server not ready yet.
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));
}

console.error(`Timed out waiting for ${url}`);
process.exit(1);
