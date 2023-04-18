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

// const doIt = async (v) =>
//   new Promise((resolve) => {
//     console.log(`starting ${v}`);
//     const ms = Math.random() * 1000 + 2000;
//     setTimeout(() => {
//       console.log(`--> ${v} finished`);
//       resolve();
//     }, ms);
//   });

// const main = async () => {
//   await runAllWithThrottle(
//     [...Array(100)].map((_, i) => i),
//     doIt
//   );
//   console.log("All done!");
// };

// main();
