export interface AppStateInterface {
  currentProjectTitle: string | null;
}

function state(): AppStateInterface {
  return {
    currentProjectTitle: "Untitled project"
  };
}

export default state;
