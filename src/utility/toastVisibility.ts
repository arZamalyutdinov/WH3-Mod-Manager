const getToastDurationMs = (toast: Toast): number => toast.duration ?? 5000;

export const isToastVisibleAt = (toast: Toast, nowMs: number): boolean => {
  return nowMs - toast.startTime < getToastDurationMs(toast);
};

export const getVisibleToastsAt = (toasts: Toast[], nowMs: number): Toast[] => {
  return toasts.filter((toast) => isToastVisibleAt(toast, nowMs));
};

export const hasVisibleToastsAt = (toasts: Toast[], nowMs: number): boolean => {
  return toasts.some((toast) => isToastVisibleAt(toast, nowMs));
};
