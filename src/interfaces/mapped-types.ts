export type ReadonlyPartial<T> = {
  readonly [K in keyof T]?: T[K];
};