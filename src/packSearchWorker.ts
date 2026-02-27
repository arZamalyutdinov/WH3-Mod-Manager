import { searchPackFiles } from "./utility/packSearch";

type PackSearchWorkerRequest = {
  type: "search";
  requestId: number;
  searchTerm: string;
  modPaths: string[];
};

type PackSearchWorkerResponse =
  | {
      type: "success";
      requestId: number;
      results: string[];
    }
  | {
      type: "error";
      requestId: number;
      error: string;
    };

let hasHandledRequest = false;

process.on("message", (message: PackSearchWorkerRequest) => {
  if (hasHandledRequest) return;
  if (!message || message.type != "search") return;
  hasHandledRequest = true;

  void (async () => {
    try {
      const results = await searchPackFiles(message.modPaths, message.searchTerm);
      if (process.send) {
        process.send({
          type: "success",
          requestId: message.requestId,
          results,
        } as PackSearchWorkerResponse);
      }
    } catch (error) {
      if (process.send) {
        process.send({
          type: "error",
          requestId: message.requestId,
          error: error instanceof Error ? error.message : String(error),
        } as PackSearchWorkerResponse);
      }
    } finally {
      process.exit();
    }
  })();
});
