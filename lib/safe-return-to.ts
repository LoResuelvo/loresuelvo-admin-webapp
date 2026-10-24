export function getSafeReturnToPath(
  returnTo: string | undefined,
  appBaseUrl: string,
): string | null {
  if (!returnTo) return null;

  try {
    const appOrigin = new URL(appBaseUrl).origin;
    const destination = new URL(returnTo, appBaseUrl);
    if (destination.origin !== appOrigin) return null;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return null;
  }
}
