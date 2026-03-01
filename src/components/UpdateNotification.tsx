import React, { memo, useCallback, useContext } from "react";
import localizationContext from "../localizationContext";
import { useDispatch } from "react-redux";
import { addToast } from "../appSlice";

interface UpdateNotificationProps {
  downloadURL: string;
  releaseNotesURL: string;
  setIsUpdateAvailable: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UpdateNotification = memo(
  ({ downloadURL, releaseNotesURL, setIsUpdateAvailable }: UpdateNotificationProps) => {
    const dispatch = useDispatch();

    const onDownloadClick = useCallback(async () => {
      // window.open(downloadURL);

      setIsUpdateAvailable(false);

      dispatch(
        addToast({
          type: "info",
          messages: ["loc:downloadingUpdate"],
          startTime: Date.now(),
        })
      );
      await window.api?.downloadAndInstallUpdate(downloadURL);
    }, [downloadURL]);

    const onReleaseNotesClick = useCallback(() => {
      window.open(releaseNotesURL);
    }, [releaseNotesURL]);

    const localized: Record<string, string> = useContext(localizationContext);

    return (
      <div className="relative w-full rounded-lg border border-slate-600 bg-slate-900/95 p-4 text-slate-100 shadow-xl">
        <button
          type="button"
          aria-label="Close update notification"
          onClick={() => setIsUpdateAvailable(false)}
          className="absolute right-2 top-2 rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          x
        </button>
        <div className="pr-6">
          <div className="mb-1 text-sm font-semibold">{localized.updateAvailable}</div>
          <div className="mb-3 text-sm text-slate-300">{localized.newVersionAvailable}</div>
          {releaseNotesURL && releaseNotesURL != "" && (
            <button
              type="button"
              onClick={onReleaseNotesClick}
              className="mb-3 block text-left text-sm text-blue-300 underline hover:text-blue-200"
            >
              {localized.releaseNotes}
            </button>
          )}
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={onDownloadClick}
              className="w-full rounded-md border border-blue-500 bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              {localized.download}
            </button>
          </div>
        </div>
      </div>
    );
  }
);
