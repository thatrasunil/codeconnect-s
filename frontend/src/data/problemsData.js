export const QUESTIONS_DATA = [
    // --- Arrays and Strings ---
    {
        id: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        topic: 'Arrays and Strings',
        functionName: 'twoSum',
        template: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your code here
}`,
        testCases: [
            { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
            { input: [[3, 2, 4], 6], expected: [1, 2] },
            { input: [[3, 3], 6], expected: [0, 1] }
        ],
        content: `
### Description
Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.
You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

### Example 1
**Input:** nums = [2,7,11,15], target = 9
**Output:** [0,1]
**Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].

### Example 2
**Input:** nums = [3,2,4], target = 6
**Output:** [1,2]
`
    },
    {
        id: 'best-time-to-buy-stock',
        title: 'Best Time to Buy Stock',
        difficulty: 'Easy',
        topic: 'Arrays and Strings',
        functionName: 'maxProfit',
        template: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
    
}`,
        testCases: [
            { input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
            { input: [[7, 6, 4, 3, 1]], expected: 0 }
        ],
        content: `
### Description
You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.
You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.
Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

### Example 1
**Input:** prices = [7,1,5,3,6,4]
**Output:** 5
**Explanation:** Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
`
    },
    {
        id: 'product-of-array-except-self',
        title: 'Product of Array Except Self',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'productExceptSelf',
        template: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function productExceptSelf(nums) {
    
}`,
        testCases: [
            { input: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
            { input: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] }
        ],
        content: `
### Description
Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.
The product of any prefix or suffix of \`nums\` is guaranteed to fit in a 32-bit integer.
You must write an algorithm that runs in O(n) time and without using the division operation.

### Example 1
**Input:** nums = [1,2,3,4]
**Output:** [24,12,8,6]
`
    },
    {
        id: 'maximum-subarray-sum',
        title: 'Maximum Subarray Sum',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'maxSubArray',
        template: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    
}`,
        testCases: [
            { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
            { input: [[1]], expected: 1 },
            { input: [[5, 4, -1, 7, 8]], expected: 23 }
        ],
        content: `
### Description
Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

### Example 1
**Input:** nums = [-2,1,-3,4,-1,2,1,-5,4]
**Output:** 6
**Explanation:** [4,-1,2,1] has the largest sum = 6.
`
    },
    {
        id: 'contains-duplicate',
        title: 'Contains Duplicate Checker',
        difficulty: 'Easy',
        topic: 'Arrays and Strings',
        functionName: 'containsDuplicate',
        template: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {
    
}`,
        testCases: [
            { input: [[1, 2, 3, 1]], expected: true },
            { input: [[1, 2, 3, 4]], expected: false },
            { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true }
        ],
        content: `
### Description
Given an integer array \`nums\`, return \`true\` if any value appears at least twice in the array, and return \`false\` if every element is distinct.
`
    },
    {
        id: 'rotate-array',
        title: 'Rotate Array In-Place',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'rotate',
        template: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {void} Do not return anything, modify nums in-place instead.
 */
function rotate(nums, k) {
    
}`,
        testCases: [
            { input: [[1, 2, 3, 4, 5, 6, 7], 3], expected: [5, 6, 7, 1, 2, 3, 4] },
            { input: [[-1, -100, 3, 99], 2], expected: [3, 99, -1, -100] }
        ],
        content: `
### Description
Given an array, rotate the array to the right by \`k\` steps, where \`k\` is non-negative.
Try to come up with as many solutions as you can, there are at least 3 different ways to solve this problem.
Could you do it in-place with O(1) extra space?
`
    },
    {
        id: 'move-zeroes',
        title: 'Move Zeroes to End',
        difficulty: 'Easy',
        topic: 'Arrays and Strings',
        functionName: 'moveZeroes',
        template: `/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
function moveZeroes(nums) {
    
}`,
        testCases: [
            { input: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0] },
            { input: [[0]], expected: [0] }
        ],
        content: `
### Description
Given an integer array \`nums\`, move all \`0\`'s to the end of it while maintaining the relative order of the non-zero elements.
Note that you must do this in-place without making a copy of the array.

### Example 1
**Input:** nums = [0,1,0,3,12]
**Output:** [1,3,12,0,0]
`
    },
    {
        id: 'valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'Easy',
        topic: 'Arrays and Strings',
        functionName: 'isAnagram',
        template: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
function isAnagram(s, t) {
    
}`,
        testCases: [
            { input: ["anagram", "nagaram"], expected: true },
            { input: ["rat", "car"], expected: false }
        ],
        content: `
### Description
Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

### Example 1
**Input:** s = "anagram", t = "nagaram"
**Output:** true
`
    },
    {
        id: 'group-anagrams',
        title: 'Group Anagrams',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'groupAnagrams',
        template: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
    
}`,
        testCases: [
            { input: [["eat", "tea", "tan", "ate", "nat", "bat"]], expected: [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]] }, // Note: Order might vary, backend verification needs to be robust for arrays of arrays
            { input: [[""]], expected: [[""]] },
            { input: [["a"]], expected: [["a"]] }
        ],
        content: `
### Description
Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order.
An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

### Example 1
**Input:** strs = ["eat","tea","tan","ate","nat","bat"]
**Output:** [["bat"],["nat","tan"],["ate","eat","tea"]]
`
    },
    {
        id: 'longest-substring-without-repeating-characters',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'lengthOfLongestSubstring',
        template: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
    
}`,
        testCases: [
            { input: ["abcabcbb"], expected: 3 },
            { input: ["bbbbb"], expected: 1 },
            { input: ["pwwkew"], expected: 3 }
        ],
        content: `
### Description
Given a string \`s\`, find the length of the **longest substring** without repeating characters.

### Example 1
**Input:** s = "abcabcbb"
**Output:** 3
**Explanation:** The answer is "abc", with the length of 3.
`
    },

    // --- Hashing, stacks, and queues ---
    {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        topic: 'Hashing, Stacks, & Queues',
        functionName: 'isValid',
        template: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    
}`,
        testCases: [
            { input: ["()"], expected: true },
            { input: ["()[]{}"], expected: true },
            { input: ["(]"], expected: false }
        ],
        content: `
### Description
Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
A string is valid if open brackets are closed by the same type of brackets in the correct order.

### Example 1
**Input:** s = "()"
**Output:** true
`
    },
    {
        id: 'min-stack',
        title: 'Min Stack Design',
        difficulty: 'Medium',
        topic: 'Hashing, Stacks, & Queues',
        functionName: 'MinStack',
        template: `
var MinStack = function() {
    
};

/** 
 * @param {number} val
 * @return {void}
 */
MinStack.prototype.push = function(val) {
    
};

/**
 * @return {void}
 */
MinStack.prototype.pop = function() {
    
};

/**
 * @return {number}
 */
MinStack.prototype.top = function() {
    
};

/**
 * @return {number}
 */
MinStack.prototype.getMin = function() {
    
};
`,
        // Class based testing is trickier with simple function wrapping.
        // We might mark this as 'class' type later for test executor.
        isClass: true,
        testCases: [],
        content: `
### Description
Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.

Implement the \`MinStack\` class:
* \`MinStack()\` satisfies the stack interface.
* \`void push(int val)\` pushes the element val onto the stack.
* \`void pop()\` removes the element on the top of the stack.
* \`int top()\` gets the top element of the stack.
* \`int getMin()\` retrieves the minimum element in the stack.

You must implement a solution with \`O(1)\` time complexity for each function.
`
    },

    // --- Linked Lists ---
    {
        id: 'reverse-linked-list',
        title: 'Reverse Singly Linked List',
        difficulty: 'Easy',
        topic: 'Linked Lists',
        functionName: 'reverseList',
        template: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
    
}`,
        testCases: [
            { input: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
            { input: [[1, 2]], expected: [2, 1] },
            { input: [[]], expected: [] }
        ],
        content: `
### Description
Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.

### Example 1
**Input:** head = [1,2,3,4,5]
**Output:** [5,4,3,2,1]
`
    },
    {
        id: 'merge-two-sorted-lists',
        title: 'Merge Two Sorted Lists',
        difficulty: 'Easy',
        topic: 'Linked Lists',
        functionName: 'mergeTwoLists',
        template: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
function mergeTwoLists(list1, list2) {
    
}`,
        testCases: [
            { input: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4] },
            { input: [[], []], expected: [] },
            { input: [[], [0]], expected: [0] }
        ],
        content: `
### Description
You are given the heads of two sorted linked lists \`list1\` and \`list2\`.
Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.
Return the head of the merged linked list.

### Example 1
**Input:** list1 = [1,2,4], list2 = [1,3,4]
**Output:** [1,1,2,3,4,4]
`
    },
    {
        id: 'detect-cycle-linked-list',
        title: 'Detect Cycle in Linked List',
        difficulty: 'Easy',
        topic: 'Linked Lists',
        functionName: 'hasCycle',
        template: `/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
function hasCycle(head) {
    
}`,
        content: `
### Description
Given \`head\`, the head of a linked list, determine if the linked list has a cycle in it.
There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the \`next\` pointer.
Return \`true\` if there is a cycle in the linked list. Otherwise, return \`false\`.
`
    },

    // --- Trees and Graphs ---
    {
        id: 'binary-tree-level-order-traversal',
        title: 'Binary Tree Level Order Traversal',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'levelOrder',
        template: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
function levelOrder(root) {
    
}`,
        testCases: [
            { input: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]] },
            { input: [[1]], expected: [[1]] },
            { input: [[]], expected: [] }
        ],
        content: `
### Description
Given the \`root\` of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).

### Example 1
**Input:** root = [3,9,20,null,null,15,7]
**Output:** [[3],[9,20],[15,7]]
`
    },
    {
        id: 'number-of-islands',
        title: 'Number of Islands',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'numIslands',
        template: `/**
 * @param {character[][]} grid
 * @return {number}
 */
function numIslands(grid) {
    
}`,
        testCases: [
            {
                input: [[
                    ["1", "1", "1", "1", "0"],
                    ["1", "1", "0", "1", "0"],
                    ["1", "1", "0", "0", "0"],
                    ["0", "0", "0", "0", "0"]
                ]], expected: 1
            },
            {
                input: [[
                    ["1", "1", "0", "0", "0"],
                    ["1", "1", "0", "0", "0"],
                    ["0", "0", "1", "0", "0"],
                    ["0", "0", "0", "1", "1"]
                ]], expected: 3
            }
        ],
        content: `
### Description
Given an \`m x n\` 2D binary grid \`grid\` which represents a map of '1's (land) and '0's (water), return the number of islands.
An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.
`
    },

    // --- Dynamic Programming ---
    {
        id: 'climbing-stairs',
        title: 'Climbing Stairs Ways',
        difficulty: 'Easy',
        topic: 'Dynamic Programming',
        functionName: 'climbStairs',
        template: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
    
}`,
        testCases: [
            { input: [2], expected: 2 },
            { input: [3], expected: 3 }
        ],
        content: `
### Description
You are climbing a staircase. It takes \`n\` steps to reach the top.
Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

### Example 1
**Input:** n = 2
**Output:** 2
**Explanation:** There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps
`
    },
    {
        id: 'coin-change',
        title: 'Coin Change Minimum Coins',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'coinChange',
        template: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
    
}`,
        testCases: [
            { input: [[1, 2, 5], 11], expected: 3 },
            { input: [[2], 3], expected: -1 },
            { input: [[1], 0], expected: 0 }
        ],
        content: `
### Description
You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.
Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.
You may assume that you have an infinite number of each kind of coin.

### Example 1
**Input:** coins = [1,2,5], amount = 11
**Output:** 3
**Explanation:** 11 = 5 + 5 + 1
`
    },

    // --- Searching, Sorting, and Math ---
    {
        id: 'binary-search',
        title: 'Binary Search on Sorted Array',
        difficulty: 'Easy',
        topic: 'Searching, Sorting, & Math',
        functionName: 'search',
        template: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
    
}`,
        testCases: [
            { input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
            { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 }
        ],
        content: `
### Description
Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, return its index. Otherwise, return \`-1\`.
You must write an algorithm with \`O(log n)\` runtime complexity.
`
    },
    // --- Additional Problems from User List ---

    // Arrays & Strings
    {
        id: 'longest-common-prefix',
        title: 'Longest Common Prefix',
        difficulty: 'Easy',
        topic: 'Arrays and Strings',
        functionName: 'longestCommonPrefix',
        template: `/**
 * @param {string[]} strs
 * @return {string}
 */
function longestCommonPrefix(strs) {
    
}`,
        testCases: [
            { input: [["flower", "flow", "flight"]], expected: "fl" },
            { input: [["dog", "racecar", "car"]], expected: "" }
        ],
        content: `### Description
Write a function to find the longest common prefix string amongst an array of strings.
If there is no common prefix, return an empty string "".`
    },
    {
        id: 'string-compression',
        title: 'String Compression Encoder',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'compress',
        template: `/**
 * @param {character[]} chars
 * @return {number}
 */
function compress(chars) {
    
}`,
        testCases: [
            { input: [["a", "a", "b", "b", "c", "c", "c"]], expected: 6 },
            { input: [["a"]], expected: 1 }
        ],
        content: `### Description
Given an array of characters, compress it in-place. The length after compression must be always smaller than or equal to the original array.
Return the new length of the array.`
    },
    {
        id: 'ransom-note',
        title: 'Ransom Note Construction',
        difficulty: 'Easy',
        topic: 'Arrays and Strings',
        functionName: 'canConstruct',
        template: `/**
 * @param {string} ransomNote
 * @param {string} magazine
 * @return {boolean}
 */
function canConstruct(ransomNote, magazine) {
    
}`,
        testCases: [
            { input: ["a", "b"], expected: false },
            { input: ["aa", "aab"], expected: true }
        ],
        content: `### Description
Given two strings ransomNote and magazine, return true if ransomNote can be constructed from magazine and false otherwise.`
    },
    {
        id: 'reverse-words',
        title: 'Reverse Words in a String',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'reverseWords',
        template: `/**
 * @param {string} s
 * @return {string}
 */
function reverseWords(s) {
    
}`,
        testCases: [
            { input: ["the sky is blue"], expected: "blue is sky the" },
            { input: ["  hello world  "], expected: "world hello" }
        ],
        content: `### Description
Given an input string s, reverse the order of the words.
A word is defined as a sequence of non-space characters. The words in s will be separated by at least one space.`
    },
    {
        id: 'valid-palindrome-alphanumeric',
        title: 'Palindrome String Check',
        difficulty: 'Easy',
        topic: 'Arrays and Strings',
        functionName: 'isPalindrome',
        template: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
    
}`,
        testCases: [
            { input: ["A man, a plan, a canal: Panama"], expected: true },
            { input: ["race a car"], expected: false }
        ],
        content: `### Description
A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.`
    },
    {
        id: 'merge-sorted-array',
        title: 'Merge Sorted Arrays',
        difficulty: 'Easy',
        topic: 'Arrays and Strings',
        functionName: 'merge',
        template: `/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
function merge(nums1, m, nums2, n) {
    
}`,
        testCases: [
            { input: [[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3], expected: [1, 2, 2, 3, 5, 6] },
            { input: [[1], 1, [], 0], expected: [1] }
        ],
        content: `### Description
You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.
Merge nums1 and nums2 into a single array sorted in non-decreasing order.`
    },
    {
        id: 'merge-intervals',
        title: 'Interval Merge',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'mergeIntervals',
        template: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function mergeIntervals(intervals) {
    
}`,
        testCases: [
            { input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
            { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] }
        ],
        content: `### Description
Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.`
    },
    {
        id: 'insert-interval',
        title: 'Insert Interval',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'insert',
        template: `/**
 * @param {number[][]} intervals
 * @param {number[]} newInterval
 * @return {number[][]}
 */
function insert(intervals, newInterval) {
    
}`,
        testCases: [
            { input: [[[1, 3], [6, 9]], [2, 5]], expected: [[1, 5], [6, 9]] }
        ],
        content: `### Description
You are given an array of non-overlapping intervals intervals where intervals[i] = [starti, endi] represent the start and the end of the ith interval and intervals is sorted in ascending order by starti.`
    },
    {
        id: 'spiral-matrix',
        title: 'Spiral Matrix Traversal',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'spiralOrder',
        template: `/**
 * @param {number[][]} matrix
 * @return {number[]}
 */
function spiralOrder(matrix) {
    
}`,
        testCases: [
            { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] }
        ],
        content: `### Description
Given an m x n matrix, return all elements of the matrix in spiral order.`
    },
    {
        id: 'set-matrix-zeroes',
        title: 'Set Matrix Zeroes',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'setZeroes',
        template: `/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
function setZeroes(matrix) {
    
}`,
        testCases: [
            { input: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] }
        ],
        content: `### Description
Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0's.`
    },

    // Hashing, Stacks & Queues
    {
        id: 'implement-queue-using-stacks',
        title: 'Implement Queue using Stacks',
        difficulty: 'Easy',
        topic: 'Hashing, Stacks, & Queues',
        functionName: 'MyQueue',
        isClass: true,
        template: `
var MyQueue = function() {
    
};
MyQueue.prototype.push = function(x) {
    
};
MyQueue.prototype.pop = function() {
    
};
MyQueue.prototype.peek = function() {
    
};
MyQueue.prototype.empty = function() {
    
};`,
        testCases: [],
        content: `### Description
Implement a first in first out (FIFO) queue using only two stacks.`
    },
    {
        id: 'implement-stack-using-queues',
        title: 'Implement Stack using Queues',
        difficulty: 'Easy',
        topic: 'Hashing, Stacks, & Queues',
        functionName: 'MyStack',
        isClass: true,
        template: `
var MyStack = function() {
    
};
MyStack.prototype.push = function(x) {
    
};
MyStack.prototype.pop = function() {
    
};
MyStack.prototype.top = function() {
    
};
MyStack.prototype.empty = function() {
    
};`,
        testCases: [],
        content: `### Description
Implement a last in first out (LIFO) stack using only two queues.`
    },
    {
        id: 'next-greater-element-i',
        title: 'Next Greater Element I',
        difficulty: 'Easy',
        topic: 'Hashing, Stacks, & Queues',
        functionName: 'nextGreaterElement',
        template: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
function nextGreaterElement(nums1, nums2) {
    
}`,
        testCases: [
            { input: [[4, 1, 2], [1, 3, 4, 2]], expected: [-1, 3, -1] }
        ],
        content: `### Description
The next greater element of some element x in an array is the first greater element that is to the right of x in the same array.`
    },
    {
        id: 'daily-temperatures',
        title: 'Daily Temperatures',
        difficulty: 'Medium',
        topic: 'Hashing, Stacks, & Queues',
        functionName: 'dailyTemperatures',
        template: `/**
 * @param {number[]} temperatures
 * @return {number[]}
 */
function dailyTemperatures(temperatures) {
    
}`,
        testCases: [
            { input: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] }
        ],
        content: `### Description
Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.`
    },
    {
        id: 'lru-cache',
        title: 'LRU Cache Design',
        difficulty: 'Medium',
        topic: 'Hashing, Stacks, & Queues',
        functionName: 'LRUCache',
        isClass: true,
        template: `
/**
 * @param {number} capacity
 */
var LRUCache = function(capacity) {
    
};
LRUCache.prototype.get = function(key) {
    
};
LRUCache.prototype.put = function(key, value) {
    
};`,
        testCases: [],
        content: `### Description
Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.`
    },
    {
        id: 'top-k-frequent-elements',
        title: 'Top K Frequent Elements',
        difficulty: 'Medium',
        topic: 'Hashing, Stacks, & Queues',
        functionName: 'topKFrequent',
        template: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
function topKFrequent(nums, k) {
    
}`,
        testCases: [
            { input: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] }
        ],
        content: `### Description
Given an integer array nums and an integer k, return the k most frequent elements.`
    },
    {
        id: 'first-unique-character',
        title: 'First Unique Character in String',
        difficulty: 'Easy',
        topic: 'Hashing, Stacks, & Queues',
        functionName: 'firstUniqChar',
        template: `/**
 * @param {string} s
 * @return {number}
 */
function firstUniqChar(s) {
    
}`,
        testCases: [
            { input: ["leetcode"], expected: 0 },
            { input: ["loveleetcode"], expected: 2 }
        ],
        content: `### Description
Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.`
    },

    // Linked Lists
    {
        id: 'reorder-list',
        title: 'Reorder List',
        difficulty: 'Medium',
        topic: 'Linked Lists',
        functionName: 'reorderList',
        template: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {void} Do not return anything, modify head in-place instead.
 */
function reorderList(head) {
    
}`,
        testCases: [
            { input: [[1, 2, 3, 4]], expected: [1, 4, 2, 3] }
        ],
        content: `### Description
You are given the head of a singly linked-list. The list can be represented as:
L0 → L1 → … → Ln - 1 → Ln
Reorder the list to be on the following form:
L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …`
    },
    {
        id: 'remove-nth-node-from-end',
        title: 'Remove Nth Node From End',
        difficulty: 'Medium',
        topic: 'Linked Lists',
        functionName: 'removeNthFromEnd',
        template: `/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
function removeNthFromEnd(head, n) {
    
}`,
        testCases: [
            { input: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] }
        ],
        content: `### Description
Given the head of a linked list, remove the nth node from the end of the list and return its head.`
    },
    {
        id: 'copy-list-with-random-pointer',
        title: 'Copy List With Random Pointer',
        difficulty: 'Medium',
        topic: 'Linked Lists',
        functionName: 'copyRandomList',
        template: `/**
 * // Definition for a Node.
 * function Node(val, next, random) {
 *    this.val = val;
 *    this.next = next;
 *    this.random = random;
 * };
 */
/**
 * @param {Node} head
 * @return {Node}
 */
function copyRandomList(head) {
    
}`,
        testCases: [],
        content: `### Description
Construct a deep copy of the list. The deep copy should consist of exactly n brand new nodes.`
    },
    {
        id: 'add-two-numbers',
        title: 'Add Two Numbers',
        difficulty: 'Medium',
        topic: 'Linked Lists',
        functionName: 'addTwoNumbers',
        template: `/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
function addTwoNumbers(l1, l2) {
    
}`,
        testCases: [
            { input: [[2, 4, 3], [5, 6, 4]], expected: [7, 0, 8] }
        ],
        content: `### Description
You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order.`
    },
    {
        id: 'reverse-nodes-in-k-group',
        title: 'Reverse Nodes in k-Group',
        difficulty: 'Hard',
        topic: 'Linked Lists',
        functionName: 'reverseKGroup',
        template: `/**
 * @param {ListNode} head
 * @param {number} k
 * @return {ListNode}
 */
function reverseKGroup(head, k) {
    
}`,
        testCases: [
            { input: [[1, 2, 3, 4, 5], 2], expected: [2, 1, 4, 3, 5] }
        ],
        content: `### Description
Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.`
    },
    {
        id: 'intersection-of-two-linked-lists',
        title: 'Intersection of Two Linked Lists',
        difficulty: 'Easy',
        topic: 'Linked Lists',
        functionName: 'getIntersectionNode',
        template: `/**
 * @param {ListNode} headA
 * @param {ListNode} headB
 * @return {ListNode}
 */
function getIntersectionNode(headA, headB) {
    
}`,
        testCases: [],
        content: `### Description
Given the heads of two singly linked-lists headA and headB, return the node at which the two lists intersect.`
    },

    // Trees & Graphs
    {
        id: 'validate-binary-search-tree',
        title: 'Validate Binary Search Tree',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'isValidBST',
        template: `/**
 * @param {TreeNode} root
 * @return {boolean}
 */
function isValidBST(root) {
    
}`,
        testCases: [
            { input: [[2, 1, 3]], expected: true },
            { input: [[5, 1, 4, null, null, 3, 6]], expected: false }
        ],
        content: `### Description
Given the root of a binary tree, determine if it is a valid binary search tree (BST).`
    },
    {
        id: 'lowest-common-ancestor-bst',
        title: 'Lowest Common Ancestor in BST',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'lowestCommonAncestor',
        template: `/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
function lowestCommonAncestor(root, p, q) {
    
}`,
        testCases: [],
        content: `### Description
Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.`
    },
    {
        id: 'binary-tree-maximum-path-sum',
        title: 'Binary Tree Maximum Path Sum',
        difficulty: 'Hard',
        topic: 'Trees and Graphs',
        functionName: 'maxPathSum',
        template: `/**
 * @param {TreeNode} root
 * @return {number}
 */
function maxPathSum(root) {
    
}`,
        testCases: [
            { input: [[1, 2, 3]], expected: 6 },
            { input: [[-10, 9, 20, null, null, 15, 7]], expected: 42 }
        ],
        content: `### Description
A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge. Return the maximum path sum of any non-empty path.`
    },
    {
        id: 'kth-smallest-element-in-bst',
        title: 'Kth Smallest Element in a BST',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'kthSmallest',
        template: `/**
 * @param {TreeNode} root
 * @param {number} k
 * @return {number}
 */
function kthSmallest(root, k) {
    
}`,
        testCases: [
            { input: [[3, 1, 4, null, 2], 1], expected: 1 }
        ],
        content: `### Description
Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.`
    },
    {
        id: 'rotting-oranges',
        title: 'Rotting Oranges',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'orangesRotting',
        template: `/**
 * @param {number[][]} grid
 * @return {number}
 */
function orangesRotting(grid) {
    
}`,
        testCases: [
            { input: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], expected: 4 }
        ],
        content: `### Description
You are given an m x n grid where each cell can have one of three values: 0 (empty), 1 (fresh), 2 (rotten).
Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.`
    },
    {
        id: 'course-schedule',
        title: 'Course Schedule',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'canFinish',
        template: `/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
function canFinish(numCourses, prerequisites) {
    
}`,
        testCases: [
            { input: [2, [[1, 0]]], expected: true },
            { input: [2, [[1, 0], [0, 1]]], expected: false }
        ],
        content: `### Description
There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1.
Return true if you can finish all courses. Otherwise, return false.`
    },

    // Dynamic Programming
    {
        id: 'house-robber',
        title: 'House Robber',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'rob',
        template: `/**
 * @param {number[]} nums
 * @return {number}
 */
function rob(nums) {
    
}`,
        testCases: [
            { input: [[1, 2, 3, 1]], expected: 4 },
            { input: [[2, 7, 9, 3, 1]], expected: 12 }
        ],
        content: `### Description
You are a professional robber planning to rob houses along a street.
Return the maximum amount of money you can rob tonight without alerting the police.`
    },
    {
        id: 'longest-increasing-subsequence',
        title: 'Longest Increasing Subsequence',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'lengthOfLIS',
        template: `/**
 * @param {number[]} nums
 * @return {number}
 */
function lengthOfLIS(nums) {
    
}`,
        testCases: [
            { input: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 }
        ],
        content: `### Description
Given an integer array nums, return the length of the longest strictly increasing subsequence.`
    },
    {
        id: 'unique-paths',
        title: 'Unique Paths',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'uniquePaths',
        template: `/**
 * @param {number} m
 * @param {number} n
 * @return {number}
 */
function uniquePaths(m, n) {
    
}`,
        testCases: [
            { input: [3, 7], expected: 28 },
            { input: [3, 2], expected: 3 }
        ],
        content: `### Description
There is a robot on an m x n grid. The robot is initially located at the top-left corner (i.e., grid[0][0]). The robot tries to move to the bottom-right corner (i.e., grid[m - 1][n - 1]). The robot can only move either down or right at any point in time.`
    },
    {
        id: 'word-break',
        title: 'Word Break',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'wordBreak',
        template: `/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
function wordBreak(s, wordDict) {
    
}`,
        testCases: [
            { input: ["leetcode", ["leet", "code"]], expected: true }
        ],
        content: `### Description
Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.`
    },
    {
        id: 'edit-distance',
        title: 'Edit Distance',
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        functionName: 'minDistance',
        template: `/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
function minDistance(word1, word2) {
    
}`,
        testCases: [
            { input: ["horse", "ros"], expected: 3 }
        ],
        content: `### Description
Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.`
    },

    // Searching, Sorting, & Math
    {
        id: 'search-in-rotated-sorted-array',
        title: 'Search in Rotated Sorted Array',
        difficulty: 'Medium',
        topic: 'Searching, Sorting, & Math',
        functionName: 'searchRotated',
        template: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function searchRotated(nums, target) {
    
}`,
        testCases: [
            { input: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
            { input: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 }
        ],
        content: `### Description
There is an integer array nums sorted in ascending order (with distinct values).
Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.`
    },
    {
        id: 'find-peak-element',
        title: 'Find Peak Element',
        difficulty: 'Medium',
        topic: 'Searching, Sorting, & Math',
        functionName: 'findPeakElement',
        template: `/**
 * @param {number[]} nums
 * @return {number}
 */
function findPeakElement(nums) {
    
}`,
        testCases: [
            { input: [[1, 2, 3, 1]], expected: 2 }
        ],
        content: `### Description
A peak element is an element that is strictly greater than its neighbors.
Given a 0-indexed integer array nums, find a peak element, and return its index.`
    },
    {
        id: 'k-closest-points-to-origin',
        title: 'K Closest Points to Origin',
        difficulty: 'Medium',
        topic: 'Searching, Sorting, & Math',
        functionName: 'kClosest',
        template: `/**
 * @param {number[][]} points
 * @param {number} k
 * @return {number[][]}
 */
function kClosest(points, k) {
    
}`,
        testCases: [],
        content: `### Description
Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer k, return the k closest points to the origin (0, 0).`
    },
    {
        id: 'median-of-two-sorted-arrays',
        title: 'Median of Two Sorted Arrays',
        difficulty: 'Hard',
        topic: 'Searching, Sorting, & Math',
        functionName: 'findMedianSortedArrays',
        template: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
function findMedianSortedArrays(nums1, nums2) {
    
}`,
        testCases: [
            { input: [[1, 3], [2]], expected: 2.000 },
            { input: [[1, 2], [3, 4]], expected: 2.500 }
        ],
        content: `### Description
Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.`
    },
    // --- Appended 50 New Problems ---
    {
        id: 'clone-graph',
        title: 'Clone Graph',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'cloneGraph',
        template: `/**
 * // Definition for a Node.
 * function Node(val, neighbors) {
 *    this.val = val === undefined ? 0 : val;
 *    this.neighbors = neighbors === undefined ? [] : neighbors;
 * };
 */
/**
 * @param {Node} node
 * @return {Node}
 */
function cloneGraph(node) {
    
}`,
        testCases: [], // Special testing required
        expectGraph: true,
        content: `### Description
Given a reference of a node in a connected undirected graph.
Return a deep copy (clone) of the graph.
Each node in the graph contains a value (int) and a list (List[Node]) of its neighbors.`
    },
    {
        id: 'course-schedule',
        title: 'Course Schedule',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'canFinish',
        template: `/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
function canFinish(numCourses, prerequisites) {
    
}`,
        testCases: [{ input: [2, [[1, 0]]], expected: true }, { input: [2, [[1, 0], [0, 1]]], expected: false }],
        content: `### Description
There are a total of numCourses courses you have to take. Some courses may have prerequisites.
Return true if you can finish all courses. Otherwise, return false.`
    },
    {
        id: 'pacific-atlantic-water-flow',
        title: 'Pacific Atlantic Water Flow',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'pacificAtlantic',
        template: `/**
 * @param {number[][]} heights
 * @return {number[][]}
 */
function pacificAtlantic(heights) {
    
}`,
        testCases: [{
            input: [[[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]],
            expected: [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]]
        }],
        content: `### Description
Return a list of grid coordinates where water can flow to both the Pacific and Atlantic oceans.`
    },
    {
        id: 'longest-consecutive-sequence',
        title: 'Longest Consecutive Sequence',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'longestConsecutive',
        template: `/**
 * @param {number[]} nums
 * @return {number}
 */
function longestConsecutive(nums) {
    
}`,
        testCases: [{ input: [[100, 4, 200, 1, 3, 2]], expected: 4 }, { input: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9 }],
        content: `### Description
Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.
You must write an algorithm that runs in O(n) time.`
    },
    {
        id: '3sum',
        title: '3Sum',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'threeSum',
        template: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
    
}`,
        testCases: [{ input: [[-1, 0, 1, 2, -1, -4]], expected: [[-1, -1, 2], [-1, 0, 1]] }],
        content: `### Description
Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.`
    },
    {
        id: 'container-with-most-water',
        title: 'Container With Most Water',
        difficulty: 'Medium',
        topic: 'Two Pointers',
        functionName: 'maxArea',
        template: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
    
}`,
        testCases: [{ input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 }],
        content: `### Description
You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water.`
    },
    {
        id: 'trapping-rain-water',
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        topic: 'Two Pointers',
        functionName: 'trap',
        template: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
    
}`,
        testCases: [{ input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 }],
        content: `### Description
Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`
    },
    {
        id: 'minimum-window-substring',
        title: 'Minimum Window Substring',
        difficulty: 'Hard',
        topic: 'Sliding Window',
        functionName: 'minWindow',
        template: `/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
function minWindow(s, t) {
    
}`,
        testCases: [{ input: ["ADOBECODEBANC", "ABC"], expected: "BANC" }],
        content: `### Description
Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.`
    },
    {
        id: 'sliding-window-maximum',
        title: 'Sliding Window Maximum',
        difficulty: 'Hard',
        topic: 'Sliding Window',
        functionName: 'maxSlidingWindow',
        template: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
function maxSlidingWindow(nums, k) {
    
}`,
        testCases: [{ input: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] }],
        content: `### Description
You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. Return the max sliding window.`
    },
    {
        id: 'encode-and-decode-strings',
        title: 'Encode and Decode Strings',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'encodeAndDecode',
        template: `/**
 * Encodes a list of strings to a single string.
 * @param {string[]} strs
 * @return {string}
 */
var encode = function(strs) {
    
};

/**
 * Decodes a single string to a list of strings.
 * @param {string} s
 * @return {string[]}
 */
var decode = function(s) {
    
};`,
        isClass: true, // actually helper based
        testCases: [],
        content: `### Description
Design an algorithm to encode a list of strings to a string. The encoded string is then sent over the network and is decoded back to the original list of strings.`
    },
    {
        id: 'top-k-frequent-elements',
        title: 'Top K Frequent Elements',
        difficulty: 'Medium',
        topic: 'Heap / Priority Queue',
        functionName: 'topKFrequent',
        template: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
function topKFrequent(nums, k) {
    
}`,
        testCases: [{ input: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] }],
        content: `### Description
Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.`
    },
    {
        id: 'valid-sudoku',
        title: 'Valid Sudoku',
        difficulty: 'Medium',
        topic: 'Arrays and Strings',
        functionName: 'isValidSudoku',
        template: `/**
 * @param {character[][]} board
 * @return {boolean}
 */
function isValidSudoku(board) {
    
}`,
        testCases: [],
        content: `### Description
Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the following rules.`
    },
    {
        id: 'daily-temperatures',
        title: 'Daily Temperatures',
        difficulty: 'Medium',
        topic: 'Stack',
        functionName: 'dailyTemperatures',
        template: `/**
 * @param {number[]} temperatures
 * @return {number[]}
 */
function dailyTemperatures(temperatures) {
    
}`,
        testCases: [{ input: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] }],
        content: `### Description
Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.`
    },
    {
        id: 'evaluate-reverse-polish-notation',
        title: 'Evaluate Reverse Polish Notation',
        difficulty: 'Medium',
        topic: 'Stack',
        functionName: 'evalRPN',
        template: `/**
 * @param {string[]} tokens
 * @return {number}
 */
function evalRPN(tokens) {
    
}`,
        testCases: [{ input: [["2", "1", "+", "3", "*"]], expected: 9 }],
        content: `### Description
Evaluate the value of an arithmetic expression in Reverse Polish Notation.`
    },
    {
        id: 'generate-parentheses',
        title: 'Generate Parentheses',
        difficulty: 'Medium',
        topic: 'Stack',
        functionName: 'generateParenthesis',
        template: `/**
 * @param {number} n
 * @return {string[]}
 */
function generateParenthesis(n) {
    
}`,
        testCases: [{ input: [3], expected: ["((()))", "(()())", "(())()", "()(())", "()()()"] }],
        content: `### Description
Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.`
    },
    {
        id: 'car-fleet',
        title: 'Car Fleet',
        difficulty: 'Medium',
        topic: 'Stack',
        functionName: 'carFleet',
        template: `/**
 * @param {number} target
 * @param {number[]} position
 * @param {number[]} speed
 * @return {number}
 */
function carFleet(target, position, speed) {
    
}`,
        testCases: [{ input: [12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3]], expected: 3 }],
        content: `### Description
There are n cars going to the same destination which is target miles away. Return the number of car fleets that will arrive at the destination.`
    },
    {
        id: 'largest-rectangle-in-histogram',
        title: 'Largest Rectangle in Histogram',
        difficulty: 'Hard',
        topic: 'Stack',
        functionName: 'largestRectangleArea',
        template: `/**
 * @param {number[]} heights
 * @return {number}
 */
function largestRectangleArea(heights) {
    
}`,
        testCases: [{ input: [[2, 1, 5, 6, 2, 3]], expected: 10 }],
        content: `### Description
Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.`
    },
    {
        id: 'search-in-rotated-sorted-array',
        title: 'Search in Rotated Sorted Array',
        difficulty: 'Medium',
        topic: 'Binary Search',
        functionName: 'searchRotated',
        template: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function searchRotated(nums, target) {
    
}`,
        testCases: [{ input: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 }],
        content: `### Description
Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.`
    },
    {
        id: 'find-minimum-in-rotated-sorted-array',
        title: 'Find Minimum in Rotated Sorted Array',
        difficulty: 'Medium',
        topic: 'Binary Search',
        functionName: 'findMin',
        template: `/**
 * @param {number[]} nums
 * @return {number}
 */
function findMin(nums) {
    
}`,
        testCases: [{ input: [[3, 4, 5, 1, 2]], expected: 1 }],
        content: `### Description
Given the sorted rotated array nums of unique elements, return the minimum element of this array.`
    },
    {
        id: 'reorder-list',
        title: 'Reorder List',
        difficulty: 'Medium',
        topic: 'Linked Lists',
        functionName: 'reorderList',
        template: `/**
 * @param {ListNode} head
 * @return {void} Do not return anything, modify head in-place instead.
 */
function reorderList(head) {
    
}`,
        testCases: [],
        content: `### Description
You are given the head of a singly linked-list. The list can be represented as: L0 -> L1 -> ... -> Ln - 1 -> Ln
Reorder the list to be on the following form: L0 -> Ln -> L1 -> Ln - 1 -> L2 -> Ln - 2 -> ...`
    },
    {
        id: 'remove-nth-node-from-end-of-list',
        title: 'Remove Nth Node From End of List',
        difficulty: 'Medium',
        topic: 'Linked Lists',
        functionName: 'removeNthFromEnd',
        template: `/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
function removeNthFromEnd(head, n) {
    
}`,
        testCases: [],
        content: `### Description
Given the head of a linked list, remove the nth node from the end of the list and return its head.`
    },
    {
        id: 'copy-list-with-random-pointer',
        title: 'Copy List with Random Pointer',
        difficulty: 'Medium',
        topic: 'Linked Lists',
        functionName: 'copyRandomList',
        template: `/**
 * // Definition for a Node.
 * function Node(val, next, random) {
 *    this.val = val;
 *    this.next = next;
 *    this.random = random;
 * };
 */

/**
 * @param {Node} head
 * @return {Node}
 */
function copyRandomList(head) {
    
}`,
        testCases: [],
        content: `### Description
A linked list of length n is given such that each node contains an additional random pointer, which could point to any node in the list, or null. Construct a deep copy of the list.`
    },
    {
        id: 'invert-binary-tree',
        title: 'Invert Binary Tree',
        difficulty: 'Easy',
        topic: 'Trees and Graphs',
        functionName: 'invertTree',
        template: `/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
function invertTree(root) {
    
}`,
        testCases: [],
        content: `### Description
Given the root of a binary tree, invert the tree, and return its root.`
    },
    {
        id: 'maximum-depth-of-binary-tree',
        title: 'Maximum Depth of Binary Tree',
        difficulty: 'Easy',
        topic: 'Trees and Graphs',
        functionName: 'maxDepth',
        template: `/**
 * @param {TreeNode} root
 * @return {number}
 */
function maxDepth(root) {
    
}`,
        testCases: [],
        content: `### Description
Given the root of a binary tree, return its maximum depth.`
    },
    {
        id: 'diameter-of-binary-tree',
        title: 'Diameter of Binary Tree',
        difficulty: 'Easy',
        topic: 'Trees and Graphs',
        functionName: 'diameterOfBinaryTree',
        template: `/**
 * @param {TreeNode} root
 * @return {number}
 */
function diameterOfBinaryTree(root) {
    
}`,
        testCases: [],
        content: `### Description
Given the root of a binary tree, return the length of the diameter of the tree.`
    },
    {
        id: 'balanced-binary-tree',
        title: 'Balanced Binary Tree',
        difficulty: 'Easy',
        topic: 'Trees and Graphs',
        functionName: 'isBalanced',
        template: `/**
 * @param {TreeNode} root
 * @return {boolean}
 */
function isBalanced(root) {
    
}`,
        testCases: [],
        content: `### Description
Given a binary tree, determine if it is height-balanced.`
    },
    {
        id: 'same-tree',
        title: 'Same Tree',
        difficulty: 'Easy',
        topic: 'Trees and Graphs',
        functionName: 'isSameTree',
        template: `/**
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {boolean}
 */
function isSameTree(p, q) {
    
}`,
        testCases: [],
        content: `### Description
Given the roots of two binary trees p and q, write a function to check if they are the same or not.`
    },
    {
        id: 'subtree-of-another-tree',
        title: 'Subtree of Another Tree',
        difficulty: 'Easy',
        topic: 'Trees and Graphs',
        functionName: 'isSubtree',
        template: `/**
 * @param {TreeNode} root
 * @param {TreeNode} subRoot
 * @return {boolean}
 */
function isSubtree(root, subRoot) {
    
}`,
        testCases: [],
        content: `### Description
Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values of subRoot and false otherwise.`
    },
    {
        id: 'lowest-common-ancestor-of-a-binary-search-tree',
        title: 'Lowest Common Ancestor of a BST',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'lowestCommonAncestor',
        template: `/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
function lowestCommonAncestor(root, p, q) {
    
}`,
        testCases: [],
        content: `### Description
Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.`
    },
    {
        id: 'validate-binary-search-tree',
        title: 'Validate Binary Search Tree',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'isValidBST',
        template: `/**
 * @param {TreeNode} root
 * @return {boolean}
 */
function isValidBST(root) {
    
}`,
        testCases: [],
        content: `### Description
Given the root of a binary tree, determine if it is a valid binary search tree (BST).`
    },
    {
        id: 'kth-smallest-element-in-a-bst',
        title: 'Kth Smallest Element in a BST',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'kthSmallest',
        template: `/**
 * @param {TreeNode} root
 * @param {number} k
 * @return {number}
 */
function kthSmallest(root, k) {
    
}`,
        testCases: [],
        content: `### Description
Given the root of a binary search tree and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.`
    },
    {
        id: 'construct-binary-tree-from-preorder-and-inorder-traversal',
        title: 'Construct Binary Tree from Preorder and Inorder Traversal',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'buildTree',
        template: `/**
 * @param {number[]} preorder
 * @param {number[]} inorder
 * @return {TreeNode}
 */
function buildTree(preorder, inorder) {
    
}`,
        testCases: [],
        content: `### Description
Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.`
    },
    {
        id: 'binary-tree-maximum-path-sum',
        title: 'Binary Tree Maximum Path Sum',
        difficulty: 'Hard',
        topic: 'Trees and Graphs',
        functionName: 'maxPathSum',
        template: `/**
 * @param {TreeNode} root
 * @return {number}
 */
function maxPathSum(root) {
    
}`,
        testCases: [],
        content: `### Description
A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. Return the maximum path sum of any non-empty path.`
    },
    {
        id: 'serialize-and-deserialize-binary-tree',
        title: 'Serialize and Deserialize Binary Tree',
        difficulty: 'Hard',
        topic: 'Trees and Graphs',
        functionName: 'Codec',
        template: `/**
 * Encodes a tree to a single string.
 *
 * @param {TreeNode} root
 * @return {string}
 */
var serialize = function(root) {
    
};

/**
 * Decodes your encoded data to tree.
 *
 * @param {string} data
 * @return {TreeNode}
 */
var deserialize = function(data) {
    
};`,
        isClass: true,
        testCases: [],
        content: `### Description
Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer. Design an algorithm to serialize and deserialize a binary tree.`
    },
    {
        id: 'max-area-of-island',
        title: 'Max Area of Island',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'maxAreaOfIsland',
        template: `/**
 * @param {number[][]} grid
 * @return {number}
 */
function maxAreaOfIsland(grid) {
    
}`,
        testCases: [],
        content: `### Description
You are given an m x n binary matrix grid. An island is a group of 1s (representing land) connected 4-directionally (horizontal or vertical). Return the maximum area of an island in grid. If there is no island, return 0.`
    },
    {
        id: 'surrounded-regions',
        title: 'Surrounded Regions',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'solve',
        template: `/**
 * @param {character[][]} board
 * @return {void} Do not return anything, modify board in-place instead.
 */
function solve(board) {
    
}`,
        testCases: [],
        content: `### Description
Given an m x n matrix board containing 'X' and 'O', capture all regions that are 4-directionally surrounded by 'X'.`
    },
    {
        id: 'rotting-oranges',
        title: 'Rotting Oranges',
        difficulty: 'Medium',
        topic: 'Trees and Graphs',
        functionName: 'orangesRotting',
        template: `/**
 * @param {number[][]} grid
 * @return {number}
 */
function orangesRotting(grid) {
    
}`,
        testCases: [],
        content: `### Description
You are given an m x n grid where each cell can have one of three values: 0 (empty), 1 (fresh orange), or 2 (rotten orange). Return the minimum number of minutes that must elapse until no cell has a fresh orange.`
    },
    {
        id: 'word-ladder',
        title: 'Word Ladder',
        difficulty: 'Hard',
        topic: 'Trees and Graphs',
        functionName: 'ladderLength',
        template: `/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @return {number}
 */
function ladderLength(beginWord, endWord, wordList) {
    
}`,
        testCases: [],
        content: `### Description
A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that every adjacent pair of words differs by a single letter. Return the number of words in the shortest transformation sequence.`
    },
    {
        id: 'min-cost-climbing-stairs',
        title: 'Min Cost Climbing Stairs',
        difficulty: 'Easy',
        topic: 'Dynamic Programming',
        functionName: 'minCostClimbingStairs',
        template: `/**
 * @param {number[]} cost
 * @return {number}
 */
function minCostClimbingStairs(cost) {
    
}`,
        testCases: [],
        content: `### Description
You are given an integer array cost where cost[i] is the cost of ith step on a staircase. Return the minimum cost to reach the top of the floor.`
    },
    {
        id: 'house-robber',
        title: 'House Robber',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'rob',
        template: `/**
 * @param {number[]} nums
 * @return {number}
 */
function rob(nums) {
    
}`,
        testCases: [],
        content: `### Description
You are a professional robber planning to rob houses along a street. Return the maximum amount of money you can rob tonight without alerting the police.`
    },
    {
        id: 'house-robber-ii',
        title: 'House Robber II',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'rob2',
        template: `/**
 * @param {number[]} nums
 * @return {number}
 */
function rob2(nums) {
    
}`,
        testCases: [],
        content: `### Description
You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are arranged in a circle.`
    },
    {
        id: 'longest-palindromic-substring',
        title: 'Longest Palindromic Substring',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'longestPalindrome',
        template: `/**
 * @param {string} s
 * @return {string}
 */
function longestPalindrome(s) {
    
}`,
        testCases: [],
        content: `### Description
Given a string s, return the longest palindromic substring in s.`
    },
    {
        id: 'palindromic-substrings',
        title: 'Palindromic Substrings',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'countSubstrings',
        template: `/**
 * @param {string} s
 * @return {number}
 */
function countSubstrings(s) {
    
}`,
        testCases: [],
        content: `### Description
Given a string s, return the number of palindromic substrings in it.`
    },
    {
        id: 'decode-ways',
        title: 'Decode Ways',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'numDecodings',
        template: `/**
 * @param {string} s
 * @return {number}
 */
function numDecodings(s) {
    
}`,
        testCases: [],
        content: `### Description
A message containing letters from A-Z can be encoded into numbers using the mapping 'A' -> "1", 'B' -> "2", ... 'Z' -> "26". Return the number of ways to decode it.`
    },
    {
        id: 'maximum-product-subarray',
        title: 'Maximum Product Subarray',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'maxProduct',
        template: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxProduct(nums) {
    
}`,
        testCases: [],
        content: `### Description
Given an integer array nums, find a contiguous non-empty subarray within the array that has the largest product, and return the product.`
    },
    {
        id: 'word-break',
        title: 'Word Break',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'wordBreak',
        template: `/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
function wordBreak(s, wordDict) {
    
}`,
        testCases: [],
        content: `### Description
Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.`
    },
    {
        id: 'longest-increasing-subsequence',
        title: 'Longest Increasing Subsequence',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'lengthOfLIS',
        template: `/**
 * @param {number[]} nums
 * @return {number}
 */
function lengthOfLIS(nums) {
    
}`,
        testCases: [],
        content: `### Description
Given an integer array nums, return the length of the longest strictly increasing subsequence.`
    },
    {
        id: 'partition-equal-subset-sum',
        title: 'Partition Equal Subset Sum',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'canPartition',
        template: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function canPartition(nums) {
    
}`,
        testCases: [],
        content: `### Description
Given a non-empty array nums containing only positive integers, find if the array can be partitioned into two subsets such that the sum of elements in both subsets is equal.`
    },
    {
        id: 'unique-paths',
        title: 'Unique Paths',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'uniquePaths',
        template: `/**
 * @param {number} m
 * @param {number} n
 * @return {number}
 */
function uniquePaths(m, n) {
    
}`,
        testCases: [],
        content: `### Description
There is a robot on an m x n grid. The robot is initially located at the top-left corner. The robot tries to move to the bottom-right corner. The robot can only move either down or right at any point in time. Return the number of possible unique paths.`
    },
    {
        id: 'longest-common-subsequence',
        title: 'Longest Common Subsequence',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'longestCommonSubsequence',
        template: `/**
 * @param {string} text1
 * @param {string} text2
 * @return {number}
 */
function longestCommonSubsequence(text1, text2) {
    
}`,
        testCases: [],
        content: `### Description
Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.`
    },
    {
        id: 'jump-game',
        title: 'Jump Game',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'canJump',
        template: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function canJump(nums) {
    
}`,
        testCases: [],
        content: `### Description
You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index.`
    },
];
