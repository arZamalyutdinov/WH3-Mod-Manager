import * as fs from "fs";

type PackSearchOptions = {
  highWaterMark?: number;
};

export const buildPackSearchNeedles = (searchTerm: string) => {
  const normalizedSearchTerm = searchTerm.trim();
  if (normalizedSearchTerm == "") return [] as Buffer[];

  const needles = [Buffer.from(normalizedSearchTerm, "utf8"), Buffer.from(normalizedSearchTerm, "utf16le")].filter(
    (needle) => needle.length > 0,
  );

  return needles.filter((needle, index) => needles.findIndex((iterNeedle) => iterNeedle.equals(needle)) == index);
};

export const fileContainsAnyNeedle = async (packPath: string, needles: Buffer[], options?: PackSearchOptions) => {
  if (needles.length == 0) return false;

  const maxNeedleLength = Math.max(...needles.map((needle) => needle.length));

  return await new Promise<boolean>((resolve, reject) => {
    const stream = fs.createReadStream(packPath, {
      highWaterMark: options?.highWaterMark,
    });
    let tail: Buffer<ArrayBufferLike> = Buffer.alloc(0);
    let isResolved = false;

    const finish = (result: boolean) => {
      if (isResolved) return;
      isResolved = true;
      resolve(result);
    };

    stream.on("data", (chunk: Buffer<ArrayBufferLike> | string) => {
      const chunkBuffer = typeof chunk == "string" ? Buffer.from(chunk) : chunk;
      const haystack: Buffer<ArrayBufferLike> = tail.length > 0 ? Buffer.concat([tail, chunkBuffer]) : chunkBuffer;
      if (needles.some((needle) => haystack.includes(needle))) {
        stream.destroy();
        finish(true);
        return;
      }

      if (maxNeedleLength > 1 && haystack.length >= maxNeedleLength - 1) {
        tail = haystack.subarray(haystack.length - (maxNeedleLength - 1));
      } else {
        tail = haystack;
      }
    });

    stream.on("error", (error) => {
      if (isResolved) return;
      isResolved = true;
      reject(error);
    });

    stream.on("close", () => {
      finish(false);
    });
  });
};

export const searchPackFiles = async (packPaths: string[], searchTerm: string, options?: PackSearchOptions) => {
  const needles = buildPackSearchNeedles(searchTerm);
  if (needles.length == 0) return [] as string[];

  const packNamesAll = [] as string[];
  for (const packPath of packPaths) {
    if (await fileContainsAnyNeedle(packPath, needles, options)) {
      packNamesAll.push(packPath.replace(/\.pack$/i, ""));
    }
  }

  return Array.from(new Set(packNamesAll));
};
