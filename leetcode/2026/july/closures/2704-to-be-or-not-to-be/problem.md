# To Be Or Not To Be

| Field | Value |
|-------|-------|
| **LeetCode #** | 2704 |
| **Difficulty** | Easy |
| **Topics** | JavaScript |
| **Date** | 2026-07-01 |
| **Link** | https://leetcode.com/problems/to-be-or-not-to-be/ |

## Problem

Write a function `expect` that helps developers test their code. It should take in any value `val` and return an object with the following two functions:

- `toBe(val)` — Returns `true` if the two values are strictly equal. If not, it throws an error `"Not Equal"`.
- `not.toBe(val)` — Returns `true` if the two values are **not** strictly equal. If they are equal, it throws an error `"Equal"`.

## Examples

```javascript
expect(5).toBe(5); // true
expect(5).not.toBe(5); // throws "Equal"
expect(5).not.toBe(null); // true
```

## Approach

<!-- Your thought process -->

## Complexity

- **Time:** O(?)
- **Space:** O(?)

## Notes

<!-- Anything to revisit -->
