export interface SubAction {
  text: string;
  onClick?: () => void;
  actions?: SubAction[];
}

export interface Action {
  text: string;
  onClick?: () => void;
  subActions?: SubAction[];
}
