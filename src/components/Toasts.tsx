import { Toast, ToastToggle } from "flowbite-react";
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { HiCheck, HiOutlineInformationCircle, HiX } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setToastDismissed } from "../appSlice";
import localizationContext from "../localizationContext";
import { getVisibleToastsAt, hasVisibleToastsAt } from "../utility/toastVisibility";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getTestToasts = () => [
  {
    type: "info",
    messages: ["Game still closing 1, retrying..."],
    startTime: Date.now(),
  } as Toast,
  {
    type: "success",
    messages: ["Game still closing 2, retrying..."],
    startTime: Date.now(),
  } as Toast,
  {
    type: "warning",
    messages: ["Game still closing 3, retrying..."],
    startTime: Date.now(),
  } as Toast,
];

export const toastTypeToReactNode = (toast: Toast) => {
  switch (toast.type) {
    case "info":
      return <HiOutlineInformationCircle className="h-5 w-5" />;
    case "success":
      return <HiCheck className="h-5 w-5" />;
    case "warning":
      return <HiX className="h-5 w-5" />;
  }
};

export const toastTypeToBackgroundColor = (toast: Toast) => {
  switch (toast.type) {
    case "info":
      return "bg-blue-600";
    case "success":
      return "bg-green-800";
    case "warning":
      return "bg-red-600";
  }
};

export const Toasts = memo(() => {
  const dispatch = useAppDispatch();
  const localized: Record<string, string> = useContext(localizationContext);

  const onToastClicked = useCallback((toast: Toast) => {
    dispatch(setToastDismissed(toast));
  }, [dispatch]);

  const getToastKey = useCallback((toast: Toast, index: number) => {
    if (toast.staticToastId) return toast.staticToastId;
    return `${toast.startTime}:${toast.type}:${toast.messages.join("|")}:${index}`;
  }, []);

  // const toasts = getTestToasts();
  const toasts = useAppSelector((state) => state.app.toasts);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const visibleToasts = useMemo(() => getVisibleToastsAt(toasts, nowMs), [toasts, nowMs]);
  const isShown = visibleToasts.length > 0;
  const hasVisibleToasts = useMemo(() => hasVisibleToastsAt(toasts, nowMs), [toasts, nowMs]);

  useEffect(() => {
    if (!hasVisibleToasts) return;

    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 500);
    return () => clearInterval(interval);
  }, [hasVisibleToasts]);

  return (
    (isShown && (
      <div className={"dark fixed left-3 bottom-3 z-[180] w-[min(24rem,calc(100vw-1.5rem))]"}>
        {visibleToasts.map((toast, index) => (
          <Toast key={getToastKey(toast, index)}>
            <div
              className={
                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-green-500 dark:text-gray-300 " +
                toastTypeToBackgroundColor(toast)
              }
            >
              {toastTypeToReactNode(toast)}
            </div>
            <div className="ml-3 text-sm font-normal dark:text-gray-300">
              {toast.messages.map((message, i) => {
                const localizedMessage = message.startsWith("loc:")
                  ? localized[message.substring(4)]
                  : message;
                return (
                  <p className="break-all" key={`${getToastKey(toast, index)}:${i}`}>
                    {localizedMessage}
                  </p>
                );
              })}
            </div>
            <ToastToggle onClick={() => onToastClicked(toast)} />
          </Toast>
        ))}
      </div>
    )) || <></>
  );
});
