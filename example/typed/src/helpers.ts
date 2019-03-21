export const sleep = (ms = 500): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export interface IdMapped<T> {
  [id: string]: T;
}

export const byId = (arr: any[]) => {
  return arr.reduce((acc: any, val: any) => {
    acc[val.id] = val;
    return acc;
  }, {});
};

export const byIdUpdater = (data: any, action: any) => ({
  ...data,
  ...byId(action.payload),
});
