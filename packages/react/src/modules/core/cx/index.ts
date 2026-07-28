type ClassValue = string | false | null | undefined;

/**
 * Joins truthy class names into a space-separated string, e.g.
 * `cx("knock-guide-banner", className)`. Falsy values are dropped, so
 * conditional modifiers work too: `cx("btn", isActive && "btn--active")`.
 */
export const cx = (...classes: ClassValue[]): string =>
  classes.filter((value): value is string => Boolean(value)).join(" ");
