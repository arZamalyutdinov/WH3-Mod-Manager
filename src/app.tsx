import * as React from "react";
import { createRoot } from "react-dom/client";
import store from "./store";
import { Provider } from "react-redux";
import Onboarding from "./components/Onboarding";
import { ErrorBoundary } from "react-error-boundary";
import TopBar from "./components/TopBar";
import { Toasts } from "./components/Toasts";
import LeftSidebar from "./components/LeftSidebar";
import Main from "./components/Main";
import { StrictMode, Suspense, useEffect } from "react";
import LocalizationContext, { staticTextIds, useLocalizations } from "./localizationContext";
import { useAppSelector } from "./hooks";
import { perfMonitor, startTiming, endTiming } from "./utility/performanceMonitor";
import { buildLocalizationMap } from "./utility/localizationHelpers";

// Lazy load heavy components with performance tracking
const ModsViewer = React.lazy(() => {
  const startTime = performance.now();
  return import("./components/viewer/ModsViewer").then((module) => {
    perfMonitor.trackComponentLoad("ModsViewer", startTime);
    return module;
  });
});
const SkillsViewer = React.lazy(() => {
  const startTime = performance.now();
  return import("./components/skillsViewer/SkillsViewer").then((module) => {
    perfMonitor.trackComponentLoad("SkillsViewer", startTime);
    return module;
  });
});

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

function ErrorFallback({ error }: { error: unknown }) {
  const localized = useLocalizations();
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    <div role="alert" className="text-red-600">
      <p>{localized.errorSomethingWentWrong}</p>
      <pre>{errorMessage}</pre>
      <p>{localized.errorScreenshotInstructions}</p>
    </div>
  );
}

const App = React.memo(() => {
  React.useEffect(() => {
    startTiming("app_component_mount");
    return () => {
      endTiming("app_component_mount");
    };
  }, []);

  const [localization, setLocalization] = React.useState<Record<string, string>>(() =>
    buildLocalizationMap(undefined, staticTextIds)
  );
  const currentLanguage = useAppSelector((state) => state.app.currentLanguage);

  useEffect(() => {
    if (!currentLanguage) return;
    window.api
      ?.translateAllStatic(staticTextIds)
      .then((translated) => {
        setLocalization(buildLocalizationMap(translated, staticTextIds));
      })
      .catch((err) => {
        console.error("translateAllStatic failed, using fallback localization map", err);
        setLocalization(buildLocalizationMap(undefined, staticTextIds));
      });
  }, [currentLanguage]);

  return (
    <LocalizationContext.Provider value={localization}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // reset the state of your app so the error doesn't happen again
        }}
      >
        <TopBar />
        {(window.location.pathname.includes("/main_window") && (
          <div className="mx-auto h-[calc(100vh-28px)] px-2 pb-3 pt-3 md:px-4">
            <Onboarding></Onboarding>
            <div className="mx-auto grid h-full min-h-0 max-w-[124rem] grid-cols-1 grid-rows-[minmax(0,1fr)] gap-4 md:grid-cols-[clamp(9.5rem,14vw,15rem)_minmax(0,1fr)]">
              <div className="min-w-0 md:self-start">
                <LeftSidebar />
              </div>
              <div className="min-w-0 min-h-0 h-full">
                <Main />
              </div>
            </div>
          </div>
        )) ||
          (window.location.pathname.includes("/viewer") && (
            <div className="m-auto px-8 pb-4 pt-11">
              <Suspense fallback={<LoadingSpinner />}>
                <ModsViewer />
              </Suspense>
            </div>
          )) || (
            <div className="m-auto px-8 pb-4 pt-11">
              <Suspense fallback={<LoadingSpinner />}>
                <SkillsViewer />
              </Suspense>
            </div>
          )}
        <Toasts />
      </ErrorBoundary>
    </LocalizationContext.Provider>
  );
});

function render() {
  startTiming("react_render");
  const root = createRoot(document.getElementById("root") as HTMLElement);
  root.render(
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>
  );
  endTiming("react_render");
}

render();
