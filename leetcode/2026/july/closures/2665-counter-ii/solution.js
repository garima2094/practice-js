/**
 * @param {number} init
 * @return {Object}
 */
var createCounter = function(init) {
  // TODO: implement
  let count = init; // Use a separate variable to track current count

  return {
      increment: function() {
          count += 1;
          return count;
      },
      decrement: function() {
          count -= 1;
          return count;
      },
      reset: function() {
          count = init; // Reset to original value
          return count;
      }
  };
};

const counter = createCounter(5);
console.log(counter.increment()); // 6
console.log(counter.reset()); // 5
console.log(counter.decrement()); // 4
