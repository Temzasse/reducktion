// TODO: not sure if we should have types in a separate file (?)
// It kindah goes against the modular ducks principles...

export interface Order {
  id: number;
  name: string;
}

export interface Package {
  name: string;
}