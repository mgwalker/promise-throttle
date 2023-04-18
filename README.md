# promise-throttle

This is a simple library for running an asynchronous callback on a list of
items, but throttling down to a maximum number of _simultaneous_ executions.
For example, imagine you wanted to check the validity of a hundred links on a
website. You might not want to fire off 100 requests all at once because that
would be hard on your system and rude to the server. Instead, maybe you want to
make 3 requests at a time, one after the other, until they have all finished.
This library helps you do that.

`promise-throttle` makes two guarantees: the callback will be passed values from
the list in list order, and the final resolved list will be the results of the
callback also in list order.

## Usage

```js
import throttle from "@mgwalker/promise-throttle";

const timesToWait = [10, 30, 4, 97, 16, 40, 12, 70, 2];

const callback = (timeToWait) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(`I have waited for ${timeToWait} seconds`);
    }, timeToWait * 1_000);
  });

const results = await throttle(timesToWait, callback, 3);
```

In this example, when `throttle` is called, the values `10`, `30`, and `4` are
immediately sent to the callback function, which waits for the specified number
of seconds before resolving with a message that it has waited. After 4 seconds,
the third callback resolves, so it is called a fourth time with the value `97`.
Six seconds later, the first callback resolves, resulting in a fifth call with
the value `16`, and so on.

And the end of execution, the value of `results` will be:

```js
[
  "I have waited for 10 seconds",
  "I have waited for 30 seconds",
  "I have waited for 4 seconds",
  "I have waited for 97 seconds",
  "I have waited for 16 seconds",
  "I have waited for 40 seconds",
  "I have waited for 12 seconds",
  "I have waited for 70 seconds",
  "I have waited for 2 seconds",
];
```
