import { getImageProviderId } from "@/lib/images/env";
import { fluxImageProvider } from "@/lib/images/providers/flux";
import { mockImageProvider } from "@/lib/images/providers/mock";
import type {
  ImageProvider,
  ImageProviderId,
} from "@/lib/images/providers/types";

/**
 * Resolves the active image provider.
 *
 * Follows getDataSource(): with nothing configured you get the mock, so a
 * fresh checkout runs the pipeline end to end offline and free. Real
 * adapters register here as they are written; until then, asking for one
 * is a configuration error rather than a silent downgrade, so a
 * half-configured production deployment fails loudly instead of quietly
 * generating placeholder images.
 */

const PROVIDERS: Partial<Record<ImageProviderId, ImageProvider>> = {
  mock: mockImageProvider,
  replicate_flux: fluxImageProvider,
};

export function getImageProvider(
  id: ImageProviderId = getImageProviderId(),
): ImageProvider {
  const provider = PROVIDERS[id];

  if (!provider) {
    throw new Error(
      `Image provider "${id}" is selected but not implemented. ` +
        `Available: ${Object.keys(PROVIDERS).join(", ")}.`,
    );
  }

  return provider;
}

export function listImplementedProviderIds(): ImageProviderId[] {
  return Object.keys(PROVIDERS) as ImageProviderId[];
}
