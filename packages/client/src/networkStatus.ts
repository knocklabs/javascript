export enum NetworkStatus {
  // Performing a top level loading operation
  loading = "loading",

  // Performing a fetch more on some already loaded data
  fetchMore = "fetchMore",

  // No operation is currently in progress
  ready = "ready",

  // The last operation failed with an error
  error = "error",
}

export function isRequestInFlight(networkStatus: NetworkStatus): boolean {
  return [NetworkStatus.loading, NetworkStatus.fetchMore].includes(
    networkStatus,
  );
}
