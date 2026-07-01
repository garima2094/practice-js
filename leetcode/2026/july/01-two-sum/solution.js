/**
 * Two Sum
 * LC #1 | Easy | Array, Hash Table
 * Date: 2026-07-01
 *
 * @param {number[]} nums
 * @param {number} target
 * @returns {number[]}
 */
function solve(nums, target) {
  const seen = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }

  return [];
}

function main() {
  console.log(solve([2, 7, 11, 15], 9)); // [0, 1]
  console.log(solve([3, 2, 4], 6)); // [1, 2]
}

if (require.main === module) {
  main();
}

module.exports = { solve };
