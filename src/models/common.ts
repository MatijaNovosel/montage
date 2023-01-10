export interface TabItem {
  value: number;
  name: string;
  image: string;
}

export interface SelectItem<T> {
  text: string;
  value: T;
}
