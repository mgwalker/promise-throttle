import sinon from "sinon";
import tap from "tap";
import throttle from "./index.js";

tap.test("promise-throttle lib", async (test) => {
  const clock = sinon.useFakeTimers();

  // These are the items passed into the throttle. The values are how long each
  // item should wait before finishing. By arranging these values correctly, we
  // can test the various flows of the throttler. Setting the intervals at 100ms
  // makes it more likely they will also finish in the expected orders, which is
  // helpful for testing. Suppose we could mock the timer, too, but meh.
  const items = [100, 1000, 300, 400, 1500, 600, 700, 800, 900, 200];

  /*
    This chart shows the expected progression through the items in the queue at
    100ms intervals. The first column is the remaining time of each item in the
    queue at the current timestep. The second column is the list of items that
    are not currently being processed. The third column is the list of items
    that have been completed.

    TS =    0 | 10, 100, 30, 40, 150 | 60, 70, 80, 90, 20 |
    TS =  100 | 90, 20, 30, 140, 60  | 70, 80, 90, 20     | 10
    TS =  200 | 80, 10, 20, 130, 50  | 70, 80, 90, 20     | 10
    TS =  300 | 70, 10, 120, 40, 70  | 80, 90, 20         | 10, 30
    TS =  400 | 60, 110, 30, 60, 80  | 90, 20             | 10, 30, 40
    TS =  500 | 50, 100, 20, 50, 70  | 90, 20             | 10, 30, 40
    TS =  600 | 40, 90, 10, 40, 60   | 90, 20             | 10, 30, 40
    TS =  700 | 30, 80, 30, 50, 90   | 20                 | 10, 30, 40, 60
    TS =  800 | 20, 70, 20, 40, 80   | 20                 | 10, 30, 40, 60
    TS =  900 | 10, 60, 10, 30, 70   | 20                 | 10, 30, 40, 60
    TS = 1000 | 50, 20, 60, 20       |                    | 10, 30, 40, 60, 100, 70
    TS = 1100 | 40, 10, 50, 10       |                    | 10, 30, 40, 60, 100, 70
    TS = 1200 | 30, 40               |                    | 10, 30, 40, 60, 100, 70, 80, 20
    TS = 1300 | 20, 30               |                    | 10, 30, 40, 60, 100, 70, 80, 20
    TS = 1400 | 10, 20               |                    | 10, 30, 40, 60, 100, 70, 80, 20
    TS = 1500 | 10                   |                    | 10, 30, 40, 60, 100, 70, 80, 20, 150
    TS = 1600 |                      |                    | 10, 30, 40, 60, 100, 70, 80, 20, 150, 90
  */

  // This is the order we expect the items to be processed in.
  const expectedFinish = [100, 300, 400, 600, 1000, 700, 800, 200, 1500, 900];

  const processOrder = [];
  const finishOrder = [];

  const process = (ms) =>
    new Promise((resolve) => {
      // Note the order in which items begin processing.
      processOrder.push(ms);
      setTimeout(() => {
        // And the order in which items finish processing.
        finishOrder.push(ms);
        resolve(`${ms} result`);
      }, ms);
    });

  // Run the throttle queue
  const throttlePromise = throttle(items, process, 5);

  for (let i = 0; i < items.length; i += 1) {
    clock.nextAsync();
  }

  const results = await throttlePromise;

  // Ensure that items begin processing in insertion order and that they finish
  // in the order we expect (based on the table above).
  test.same(processOrder, items, "items are processed in insertion order");
  test.same(
    finishOrder,
    expectedFinish,
    "items finish in the expected order based on how long they are programmed to take"
  );
  test.same(
    results,
    processOrder.map((v) => `${v} result`),
    "results are in the original list order"
  );
});
