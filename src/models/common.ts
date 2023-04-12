export interface TabItem {
  value: number;
  name: string;
  image: string;
}

export interface SelectItem<T> {
  title: string;
  value: T;
}

export interface Layer {
  object: fabric.Object | null;
  id: string;
  type: string;
  color?: string;
}

export interface AssetEvent {
  type: string;
  value: string;
  file?: File;
}
