export interface TabItem {
  value: number;
  name: string;
  icon: string;
}

export interface SelectItem<T> {
  title: string;
  value: T;
}

export interface Layer {
  object: fabric.Object | null;
  id: string;
  type: string;
  startTrim: number;
  endTrim: number;
  offset: number;
  duration: number;
}

export interface AssetEvent {
  type: string;
  value: string;
  file?: File;
}

export interface ActiveObjectChangeEvent {
  type: string;
  value: string | number;
}
