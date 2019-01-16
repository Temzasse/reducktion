export const sleep = (ms = 500): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));
