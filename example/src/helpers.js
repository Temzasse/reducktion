export const sleep = (ms = 500) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const foo = 1;
