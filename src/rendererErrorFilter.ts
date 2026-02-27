const IGNORED_WINDOW_ERROR_SUBSTRINGS = [
  "ResizeObserver loop completed with undelivered notifications",
  "ResizeObserver loop limit exceeded",
];

export const shouldIgnoreWindowError = (message: string): boolean => {
  if (!message) return false;
  return IGNORED_WINDOW_ERROR_SUBSTRINGS.some((ignoredMessage) => message.includes(ignoredMessage));
};

