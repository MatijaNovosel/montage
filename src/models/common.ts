export interface TabItem {
  value: number;
  name: string;
  image: string;
}

export interface SelectItem<T> {
  text: string;
  value: T;
}

export interface Layer {
  object: fabric.Object | null;
  id: string;
  type: "image" | "text";
}

export interface AssetEvent {
  type: string;
  value: string;
  file?: File;
}
