/**
 * Run the image job runner once.
 *
 *   npm run images:tick
 *   npm run images:tick -- --remote
 */
import {
  formatCounts,
  parseArgs,
  postTick,
  resolveBaseUrl,
} from "./tick-client.mjs";

async function main() {
  const args = parseArgs();
  const baseUrl = resolveBaseUrl(args);

  const result = await postTick(baseUrl);
  const summary = formatCounts(result.counts);

  console.log(
    `tick ${result.workerId} provider=${result.provider} ${summary || "(nothing to do)"}`,
  );

  if (result.circuitOpenReason) {
    console.error(`\n⚠ provider halted: ${result.circuitOpenReason}`);
    console.error("  New jobs will keep failing until this is resolved.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
