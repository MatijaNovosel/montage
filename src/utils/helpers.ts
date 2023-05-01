import { MIME_TYPES, MIME_TYPE_ICONS, SIZES } from "@/utils/constants";

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

export const bytesToSize = (bytes: number | undefined) => {
  if (bytes) {
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + " " + SIZES[i];
  }
};

export const bytesToMB = (bytes: number | undefined) => {
  if (bytes) {
    const kb = bytes / 1024 / 1024;
    return `${kb.toFixed(2)} MB`;
  }
};

export const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
};

export const formatTime = (seconds: number) =>
  new Date(seconds * 1000).toISOString().substring(14, 19);

export const roundToNearestHundred = (n: number) => Math.round(n / 100) * 100;
