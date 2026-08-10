/**
 * Tick repeatedly until nothing is left in flight.
 *
 *   npm run images:drain
 *   npm run images:drain -- --timeout 600 --interval 2
 *
 * This is the agent's main entry point: it turns the asynchronous pipeline
 * into one blocking call, so an end-to-end run can be verified without a
 * scheduler. Production does not use it — there, webhooks and the GitHub
 * Actions safety net drive the same tick.
 */
import {
  formatCounts,
  parseArgs,
  postTick,
  resolveBaseUrl,
  sleep,
} from "./tick-client.mjs";

const IDLE_TICKS_BEFORE_DONE = 2;

async function main() {
  const args = parseArgs();
  const baseUrl = resolveBaseUrl(args);
  const timeoutSeconds = Number(args.values.timeout ?? 300);
  const intervalSeconds = Number(args.values.interval ?? 2);

  const deadline = Date.now() + timeoutSeconds * 1000;
  let idleTicks = 0;
  let ticks = 0;

  while (Date.now() < deadline) {
    const result = await postTick(baseUrl);
    ticks += 1;

    if (result.circuitOpenReason) {
      console.error(`⚠ provider halted: ${result.circuitOpenReason}`);
      process.exit(1);
    }

    const active = Object.entries(result.counts)
      .filter(([key]) => key !== "leasesReleased")
      .reduce((sum, [, value]) => sum + value, 0);

    const summary = formatCounts(result.counts);

    if (summary) {
      console.log(`tick ${ticks}: ${summary}`);
    }

    // Two consecutive quiet ticks, not one: a job can sit between states
    // (submitted but not yet ready to poll) and look idle for a moment.
    idleTicks = active === 0 ? idleTicks + 1 : 0;

    if (idleTicks >= IDLE_TICKS_BEFORE_DONE) {
      console.log(`drained after ${ticks} tick(s)`);
      return;
    }

    await sleep(intervalSeconds * 1000);
  }

  console.error(
    `drain timed out after ${timeoutSeconds}s with work still in flight.`,
  );
  process.exit(1);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
