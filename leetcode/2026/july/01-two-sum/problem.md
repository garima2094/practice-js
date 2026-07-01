# Two Sum

| Field | Value |
|-------|-------|
| **LeetCode #** | 1 |
| **Difficulty** | Easy |
| **Topics** | Array, Hash Table |
| **Date** | 2026-07-01 |
| **Link** | https://leetcode.com/problems/two-sum/ |

## Problem

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

## Examples

```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]

Input: nums = [3,2,4], target = 6
Output: [1,2]
```

## Approach

Use a hash map to store each number and its index as we iterate. For each `nums[i]`, check if `target - nums[i]` exists in the map. If yes, return both indices.

## Complexity

- **Time:** O(n)
- **Space:** O(n)

## Notes

Classic first problem — good warm-up for hash map patterns.
