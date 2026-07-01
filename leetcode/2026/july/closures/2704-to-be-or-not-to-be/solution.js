/**
 * @param {*} val
 * @return {Object}
 */
var expect = function (val) {
  return {
    toBe: function (b) {
      if (val === b) return true;
      throw new Error("Not Equal");
    },
    not: {
      toBe: function (b) {
        if (val !== b) return true;
        throw new Error("Equal");
      },
    },
  };
};

// Local tests
try {
  console.log("expect(5).toBe(5) ->", expect(5).toBe(5));
} catch (e) {
  console.log("expect(5).toBe(5) ->", e.message);
}

try {
  console.log("expect(5).not.toBe(5) ->", expect(5).not.toBe(5));
} catch (e) {
  console.log("expect(5).not.toBe(5) ->", e.message);
}

try {
  console.log("expect(5).not.toBe(null) ->", expect(5).not.toBe(null));
} catch (e) {
  console.log("expect(5).not.toBe(null) ->", e.message);
}
