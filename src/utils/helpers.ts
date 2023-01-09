import { MIME_TYPES, MIME_TYPE_ICONS } from "./constants";

export const secondsToElapsedTime = (secs: number) => {
  secs = Math.round(secs);
  const hours = Math.floor(secs / (60 * 60));

  const divisorForMinutes = secs % (60 * 60);
  const minutes = Math.floor(divisorForMinutes / 60);

  const divisorForSeconds = divisorForMinutes % 60;
  const seconds = Math.ceil(divisorForSeconds);

  const obj = {
    h: hours,
    m: minutes,
    s: seconds
  };

  return obj;
};

export const getFileExtension = (fileName: string) => {
  const ext = /^.+\.([^.]+)$/.exec(fileName);
  return ext == null ? "" : ext[1];
};

export const getFileIcon = (fileName: string) => {
  return MIME_TYPE_ICONS[MIME_TYPES[getFileExtension(fileName)]];
};

export const bytesToSize = (bytes: number) => {
  const sizes = ["b", "kB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
};
