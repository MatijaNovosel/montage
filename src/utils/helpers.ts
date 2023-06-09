import { Layer } from "@/models/common";
import { SIZES } from "@/utils/constants";

export const getFileExtension = (fileName: string) => {
  const ext = /^.+\.([^.]+)$/.exec(fileName);
  return ext == null ? "" : ext[1];
};

export const bytesToSize = (bytes: number | undefined) => {
  if (bytes) {
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + " " + SIZES[i];
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

export const formatTime = (miliseconds: number) =>
  new Date(miliseconds).toISOString().substring(14).replace("Z", "");

export const calculateLayerWidth = (layer: Layer) => {
  return `${layer.duration / 10}px`;
};

export const move = (array: any[], from: number, to: number) => {
  if (to === from) return array;
  const target = array[from];
  const increment = to < from ? -1 : 1;
  for (let k = from; k != to; k += increment) {
    array[k] = array[k + increment];
  }
  array[to] = target;
  return array;
};

export const blobToBinary = async (blob: Blob) => {
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
};
