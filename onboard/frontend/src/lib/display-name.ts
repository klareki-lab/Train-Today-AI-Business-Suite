/** Display a username as a name only when no employee profile is available. */
export function usernameDisplayName(username: string): string {
  return username ? username[0].toLocaleUpperCase('de-DE') + username.slice(1) : '';
}
