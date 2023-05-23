/**
 * @param {any[]} items The list of items to be iterated over
 * @param {(arg0: any) => Promise<any>} callback The function to be called with
 *                        each item from the items argument.
 * @param {number} throttle (optional) The maximum number of awaiting callbacks to allow at
 *                          a time. Default: 5
 */
export default async (items, callback, throttle = 5) => {
  const copy = [...items];

  const indices = new Map();
  copy.forEach((value, index) => {
    indices.set(value, index);
  });

  const results = [...Array(copy.length)];

  const then = (inResult, inValue) => {
    const index = indices.get(inValue);
    results[index] = inResult;

    if (copy.length) {
      const value = copy.shift();
      return callback(value).then((result) => then(result, value));
    }
    return Promise.resolve();
  };

  const initialCount = throttle <= copy.length ? throttle : copy.length;

  await Promise.all(
    [...Array(initialCount)].map(() => {
      const value = copy.shift();
      return callback(value).then((result) => then(result, value));
    })
  );

  return results;
};
