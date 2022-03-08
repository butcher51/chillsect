export interface Updateable {
  update(delta: number): void;
}

export interface IState {
  start(params: any): void;
  update(delta: number): void;
  stop(): void;
  resize(): void;

  weapons: any[];
}
