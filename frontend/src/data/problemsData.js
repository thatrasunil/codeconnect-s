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
    }
];
