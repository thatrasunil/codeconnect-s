// Initial problem set for CodeConnect collaborative problem-solving
// Mix of Easy (4), Medium (4), Hard (2) difficulties

const problems = [
    {
        problemId: 'two-sum',
        title: 'Two Sum',
        description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        difficulty: 'Easy',
        category: 'Array',
        examples: [
            {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
            },
            {
                input: 'nums = [3,2,4], target = 6',
                output: '[1,2]',
                explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
            }
        ],
        testCases: [
            { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', hidden: false },
            { input: '[3,2,4]\n6', expectedOutput: '[1,2]', hidden: false },
            { input: '[3,3]\n6', expectedOutput: '[0,1]', hidden: false },
            { input: '[1,5,3,7,9]\n12', expectedOutput: '[2,3]', hidden: true },
            { input: '[0,4,3,0]\n0', expectedOutput: '[0,3]', hidden: true }
        ],
        constraints: [
            '2 <= nums.length <= 10^4',
            '-10^9 <= nums[i] <= 10^9',
            '-10^9 <= target <= 10^9',
            'Only one valid answer exists.'
        ],
        boilerplateCode: {
            javascript: `function twoSum(nums, target) {
  // Your code here
  
}`,
            python: `def twoSum(nums, target):
    # Your code here
    pass`,
            java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        
    }
};`
        },
        hints: [
            'A really brute force way would be to search for all possible pairs of numbers but that would be too slow.',
            'Use a hash map to store the numbers you\'ve seen so far.',
            'For each number, check if its complement (target - number) exists in the hash map.'
        ]
    },

    {
        problemId: 'valid-parentheses',
        title: 'Valid Parentheses',
        description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
        difficulty: 'Easy',
        category: 'Stack',
        examples: [
            {
                input: 's = "()"',
                output: 'true',
                explanation: 'The string contains valid parentheses.'
            },
            {
                input: 's = "()[]{}"',
                output: 'true',
                explanation: 'All brackets are properly closed.'
            },
            {
                input: 's = "(]"',
                output: 'false',
                explanation: 'Brackets are not closed in the correct order.'
            }
        ],
        testCases: [
            { input: '()', expectedOutput: 'true', hidden: false },
            { input: '()[]{}', expectedOutput: 'true', hidden: false },
            { input: '(]', expectedOutput: 'false', hidden: false },
            { input: '{[()]}', expectedOutput: 'true', hidden: true },
            { input: '((', expectedOutput: 'false', hidden: true }
        ],
        constraints: [
            '1 <= s.length <= 10^4',
            's consists of parentheses only \'()[]{}\'.'
        ],
        boilerplateCode: {
            javascript: `function isValid(s) {
  // Your code here
  
}`,
            python: `def isValid(s):
    # Your code here
    pass`,
            java: `class Solution {
    public boolean isValid(String s) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    bool isValid(string s) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Use a stack data structure.',
            'When you encounter an opening bracket, push it to the stack.',
            'When you encounter a closing bracket, check if it matches the top of the stack.'
        ]
    },

    {
        problemId: 'merge-sorted-arrays',
        title: 'Merge Two Sorted Arrays',
        description: `You are given two integer arrays \`nums1\` and \`nums2\`, sorted in non-decreasing order, and two integers \`m\` and \`n\`, representing the number of elements in \`nums1\` and \`nums2\` respectively.

Merge \`nums1\` and \`nums2\` into a single array sorted in non-decreasing order.

The final sorted array should be returned by the function.`,
        difficulty: 'Easy',
        category: 'Array',
        examples: [
            {
                input: 'nums1 = [1,2,3], nums2 = [2,5,6]',
                output: '[1,2,2,3,5,6]',
                explanation: 'The arrays we are merging are [1,2,3] and [2,5,6].'
            },
            {
                input: 'nums1 = [1], nums2 = []',
                output: '[1]',
                explanation: 'The arrays we are merging are [1] and [].'
            }
        ],
        testCases: [
            { input: '[1,2,3]\n[2,5,6]', expectedOutput: '[1,2,2,3,5,6]', hidden: false },
            { input: '[1]\n[]', expectedOutput: '[1]', hidden: false },
            { input: '[]\n[1]', expectedOutput: '[1]', hidden: false },
            { input: '[4,5,6]\n[1,2,3]', expectedOutput: '[1,2,3,4,5,6]', hidden: true }
        ],
        constraints: [
            'nums1.length == m',
            'nums2.length == n',
            '0 <= m, n <= 200',
            '-10^9 <= nums1[i], nums2[i] <= 10^9'
        ],
        boilerplateCode: {
            javascript: `function merge(nums1, nums2) {
  // Your code here
  
}`,
            python: `def merge(nums1, nums2):
    # Your code here
    pass`,
            java: `class Solution {
    public int[] merge(int[] nums1, int[] nums2) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    vector<int> merge(vector<int>& nums1, vector<int>& nums2) {
        // Your code here
        
    }
};`
        },
        hints: [
            'You can use two pointers to iterate through both arrays.',
            'Compare elements at both pointers and add the smaller one to the result.',
            'Don\'t forget to handle remaining elements after one array is exhausted.'
        ]
    },

    {
        problemId: 'reverse-linked-list',
        title: 'Reverse Linked List',
        description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
        difficulty: 'Easy',
        category: 'Linked List',
        examples: [
            {
                input: 'head = [1,2,3,4,5]',
                output: '[5,4,3,2,1]',
                explanation: 'The linked list is reversed.'
            },
            {
                input: 'head = [1,2]',
                output: '[2,1]',
                explanation: 'The linked list is reversed.'
            }
        ],
        testCases: [
            { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', hidden: false },
            { input: '[1,2]', expectedOutput: '[2,1]', hidden: false },
            { input: '[]', expectedOutput: '[]', hidden: false },
            { input: '[1]', expectedOutput: '[1]', hidden: true }
        ],
        constraints: [
            'The number of nodes in the list is the range [0, 5000].',
            '-5000 <= Node.val <= 5000'
        ],
        boilerplateCode: {
            javascript: `function reverseList(head) {
  // Your code here
  
}`,
            python: `def reverseList(head):
    # Your code here
    pass`,
            java: `class Solution {
    public ListNode reverseList(ListNode head) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Think about using three pointers: previous, current, and next.',
            'Iterate through the list and reverse the links one by one.',
            'You can also solve this recursively.'
        ]
    },

    {
        problemId: 'longest-substring',
        title: 'Longest Substring Without Repeating Characters',
        description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
        difficulty: 'Medium',
        category: 'String',
        examples: [
            {
                input: 's = "abcabcbb"',
                output: '3',
                explanation: 'The answer is "abc", with the length of 3.'
            },
            {
                input: 's = "bbbbb"',
                output: '1',
                explanation: 'The answer is "b", with the length of 1.'
            },
            {
                input: 's = "pwwkew"',
                output: '3',
                explanation: 'The answer is "wke", with the length of 3.'
            }
        ],
        testCases: [
            { input: 'abcabcbb', expectedOutput: '3', hidden: false },
            { input: 'bbbbb', expectedOutput: '1', hidden: false },
            { input: 'pwwkew', expectedOutput: '3', hidden: false },
            { input: 'dvdf', expectedOutput: '3', hidden: true },
            { input: '', expectedOutput: '0', hidden: true }
        ],
        constraints: [
            '0 <= s.length <= 5 * 10^4',
            's consists of English letters, digits, symbols and spaces.'
        ],
        boilerplateCode: {
            javascript: `function lengthOfLongestSubstring(s) {
  // Your code here
  
}`,
            python: `def lengthOfLongestSubstring(s):
    # Your code here
    pass`,
            java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Use the sliding window technique.',
            'Keep track of characters you\'ve seen using a hash map or set.',
            'When you find a duplicate, move the left pointer of your window.'
        ]
    },

    {
        problemId: 'three-sum',
        title: '3Sum',
        description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
        difficulty: 'Medium',
        category: 'Array',
        examples: [
            {
                input: 'nums = [-1,0,1,2,-1,-4]',
                output: '[[-1,-1,2],[-1,0,1]]',
                explanation: 'The distinct triplets are [-1,0,1] and [-1,-1,2].'
            },
            {
                input: 'nums = [0,1,1]',
                output: '[]',
                explanation: 'The only possible triplet does not sum up to 0.'
            }
        ],
        testCases: [
            { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]', hidden: false },
            { input: '[0,1,1]', expectedOutput: '[]', hidden: false },
            { input: '[0,0,0]', expectedOutput: '[[0,0,0]]', hidden: false },
            { input: '[-2,0,1,1,2]', expectedOutput: '[[-2,0,2],[-2,1,1]]', hidden: true }
        ],
        constraints: [
            '3 <= nums.length <= 3000',
            '-10^5 <= nums[i] <= 10^5'
        ],
        boilerplateCode: {
            javascript: `function threeSum(nums) {
  // Your code here
  
}`,
            python: `def threeSum(nums):
    # Your code here
    pass`,
            java: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Sort the array first to make it easier to avoid duplicates.',
            'Use a two-pointer approach for each element.',
            'Skip duplicate elements to avoid duplicate triplets in the result.'
        ]
    },

    {
        problemId: 'container-most-water',
        title: 'Container With Most Water',
        description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.`,
        difficulty: 'Medium',
        category: 'Array',
        examples: [
            {
                input: 'height = [1,8,6,2,5,4,8,3,7]',
                output: '49',
                explanation: 'The vertical lines are at indices 1 and 8, with heights 8 and 7. The area is min(8,7) * (8-1) = 49.'
            },
            {
                input: 'height = [1,1]',
                output: '1',
                explanation: 'The area is min(1,1) * (1-0) = 1.'
            }
        ],
        testCases: [
            { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', hidden: false },
            { input: '[1,1]', expectedOutput: '1', hidden: false },
            { input: '[4,3,2,1,4]', expectedOutput: '16', hidden: true },
            { input: '[1,2,1]', expectedOutput: '2', hidden: true }
        ],
        constraints: [
            'n == height.length',
            '2 <= n <= 10^5',
            '0 <= height[i] <= 10^4'
        ],
        boilerplateCode: {
            javascript: `function maxArea(height) {
  // Your code here
  
}`,
            python: `def maxArea(height):
    # Your code here
    pass`,
            java: `class Solution {
    public int maxArea(int[] height) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Use two pointers starting from both ends of the array.',
            'Calculate the area and move the pointer pointing to the shorter line.',
            'Keep track of the maximum area found.'
        ]
    },

    {
        problemId: 'coin-change',
        title: 'Coin Change',
        description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        examples: [
            {
                input: 'coins = [1,2,5], amount = 11',
                output: '3',
                explanation: '11 = 5 + 5 + 1'
            },
            {
                input: 'coins = [2], amount = 3',
                output: '-1',
                explanation: 'The amount cannot be made up with the given coins.'
            }
        ],
        testCases: [
            { input: '[1,2,5]\n11', expectedOutput: '3', hidden: false },
            { input: '[2]\n3', expectedOutput: '-1', hidden: false },
            { input: '[1]\n0', expectedOutput: '0', hidden: false },
            { input: '[1,3,4,5]\n7', expectedOutput: '2', hidden: true }
        ],
        constraints: [
            '1 <= coins.length <= 12',
            '1 <= coins[i] <= 2^31 - 1',
            '0 <= amount <= 10^4'
        ],
        boilerplateCode: {
            javascript: `function coinChange(coins, amount) {
  // Your code here
  
}`,
            python: `def coinChange(coins, amount):
    # Your code here
    pass`,
            java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Think about using dynamic programming.',
            'Create a DP array where dp[i] represents the minimum coins needed for amount i.',
            'For each amount, try using each coin and take the minimum.'
        ]
    },

    {
        problemId: 'word-ladder',
        title: 'Word Ladder',
        description: `A transformation sequence from word \`beginWord\` to word \`endWord\` using a dictionary \`wordList\` is a sequence of words \`beginWord -> s1 -> s2 -> ... -> sk\` such that:
- Every adjacent pair of words differs by a single letter.
- Every \`si\` for \`1 <= i <= k\` is in \`wordList\`. Note that \`beginWord\` does not need to be in \`wordList\`.
- \`sk == endWord\`

Given two words, \`beginWord\` and \`endWord\`, and a dictionary \`wordList\`, return the number of words in the shortest transformation sequence from \`beginWord\` to \`endWord\`, or \`0\` if no such sequence exists.`,
        difficulty: 'Hard',
        category: 'Graph',
        examples: [
            {
                input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
                output: '5',
                explanation: 'One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog", which is 5 words long.'
            },
            {
                input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]',
                output: '0',
                explanation: 'The endWord "cog" is not in wordList, therefore there is no valid transformation sequence.'
            }
        ],
        testCases: [
            { input: 'hit\ncog\n["hot","dot","dog","lot","log","cog"]', expectedOutput: '5', hidden: false },
            { input: 'hit\ncog\n["hot","dot","dog","lot","log"]', expectedOutput: '0', hidden: false },
            { input: 'a\nc\n["a","b","c"]', expectedOutput: '2', hidden: true }
        ],
        constraints: [
            '1 <= beginWord.length <= 10',
            'endWord.length == beginWord.length',
            '1 <= wordList.length <= 5000',
            'wordList[i].length == beginWord.length',
            'beginWord, endWord, and wordList[i] consist of lowercase English letters.',
            'beginWord != endWord',
            'All the words in wordList are unique.'
        ],
        boilerplateCode: {
            javascript: `function ladderLength(beginWord, endWord, wordList) {
  // Your code here
  
}`,
            python: `def ladderLength(beginWord, endWord, wordList):
    # Your code here
    pass`,
            java: `class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Use BFS (Breadth-First Search) to find the shortest path.',
            'Build a graph where each word is connected to words that differ by one letter.',
            'Use a queue to explore all possible transformations level by level.'
        ]
    },

    {
        problemId: 'median-sorted-arrays',
        title: 'Median of Two Sorted Arrays',
        description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).`,
        difficulty: 'Hard',
        category: 'Binary Search',
        examples: [
            {
                input: 'nums1 = [1,3], nums2 = [2]',
                output: '2.00000',
                explanation: 'merged array = [1,2,3] and median is 2.'
            },
            {
                input: 'nums1 = [1,2], nums2 = [3,4]',
                output: '2.50000',
                explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.'
            }
        ],
        testCases: [
            { input: '[1,3]\n[2]', expectedOutput: '2.0', hidden: false },
            { input: '[1,2]\n[3,4]', expectedOutput: '2.5', hidden: false },
            { input: '[]\n[1]', expectedOutput: '1.0', hidden: true },
            { input: '[2]\n[]', expectedOutput: '2.0', hidden: true }
        ],
        constraints: [
            'nums1.length == m',
            'nums2.length == n',
            '0 <= m <= 1000',
            '0 <= n <= 1000',
            '1 <= m + n <= 2000',
            '-10^6 <= nums1[i], nums2[i] <= 10^6'
        ],
        boilerplateCode: {
            javascript: `function findMedianSortedArrays(nums1, nums2) {
  // Your code here
  
}`,
            python: `def findMedianSortedArrays(nums1, nums2):
    # Your code here
    pass`,
            java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Use binary search on the smaller array.',
            'Partition both arrays such that elements on the left are smaller than elements on the right.',
            'The median will be at the partition point.'
        ]
    },
    // --- Appended 50 New Problems (Synced from Frontend) ---
    {
        problemId: 'clone-graph',
        title: 'Clone Graph',
        description: `Given a reference of a node in a connected undirected graph.
Return a deep copy (clone) of the graph.
Each node in the graph contains a value (int) and a list (List[Node]) of its neighbors.`,
        difficulty: 'Medium',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: {
            javascript: `/**
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
            python: `class Node:
    def __init__(self, val = 0, neighbors = None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []

class Solution:
    def cloneGraph(self, node: 'Node') -> 'Node':
        # Your code here
        pass`,
            java: `class Solution {
    public Node cloneGraph(Node node) {
        
    }
}`,
            cpp: `class Solution {
public:
    Node* cloneGraph(Node* node) {
        
    }
};`
        },
        hints: []
    },
    {
        problemId: 'course-schedule',
        title: 'Course Schedule',
        description: `There are a total of numCourses courses you have to take. Some courses may have prerequisites.
Return true if you can finish all courses. Otherwise, return false.`,
        difficulty: 'Medium',
        category: 'Trees and Graphs',
        examples: [
            { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explanation: 'There are a total of 2 courses to take. To take course 1 you should have finished course 0. So it is possible.' }
        ],
        testCases: [
            { input: '2\n[[1,0]]', expectedOutput: 'true', hidden: false },
            { input: '2\n[[1,0],[0,1]]', expectedOutput: 'false', hidden: false }
        ],
        constraints: [],
        boilerplateCode: {
            javascript: `/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
function canFinish(numCourses, prerequisites) {
    
}`,
            python: `def canFinish(numCourses, prerequisites):
    pass`,
            java: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        
    }
}`,
            cpp: `class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        
    }
};`
        },
        hints: []
    },
    {
        problemId: 'pacific-atlantic-water-flow',
        title: 'Pacific Atlantic Water Flow',
        description: `Return a list of grid coordinates where water can flow to both the Pacific and Atlantic oceans.`,
        difficulty: 'Medium',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: {
            javascript: `/**
 * @param {number[][]} heights
 * @return {number[][]}
 */
function pacificAtlantic(heights) {
    
}`,
            python: `def pacificAtlantic(heights):
    pass`,
            java: `class Solution {
    public List<List<Integer>> pacificAtlantic(int[][] heights) {
        
    }
}`,
            cpp: `class Solution {
public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        
    }
};`
        },
        hints: []
    },
    {
        problemId: 'longest-consecutive-sequence',
        title: 'Longest Consecutive Sequence',
        description: `Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.
You must write an algorithm that runs in O(n) time.`,
        difficulty: 'Medium',
        category: 'Arrays and Strings',
        examples: [],
        testCases: [
            { input: '[100,4,200,1,3,2]', expectedOutput: '4', hidden: false }
        ],
        constraints: [],
        boilerplateCode: {
            javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function longestConsecutive(nums) {
    
}`,
            python: `def longestConsecutive(nums):
    pass`,
            java: `class Solution {
    public int longestConsecutive(int[] nums) {
        
    }
}`,
            cpp: `class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        
    }
};`
        },
        hints: []
    },
    {
        problemId: '3sum',
        title: '3Sum',
        description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.`,
        difficulty: 'Medium',
        category: 'Arrays and Strings',
        examples: [],
        testCases: [
            { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]', hidden: false }
        ],
        constraints: [],
        boilerplateCode: {
            javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
    
}`,
            python: `def threeSum(nums):
    pass`,
            java: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        
    }
}`,
            cpp: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        
    }
};`
        },
        hints: []
    },
    {
        problemId: 'container-with-most-water',
        title: 'Container With Most Water',
        description: `You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water.`,
        difficulty: 'Medium',
        category: 'Two Pointers',
        examples: [],
        testCases: [
            { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', hidden: false }
        ],
        constraints: [],
        boilerplateCode: {
            javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
    
}`,
            python: `def maxArea(height):
    pass`,
            java: `class Solution {
    public int maxArea(int[] height) {
        
    }
}`,
            cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {
        
    }
};`
        },
        hints: []
    },
    {
        problemId: 'trapping-rain-water',
        title: 'Trapping Rain Water',
        description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
        difficulty: 'Hard',
        category: 'Two Pointers',
        examples: [],
        testCases: [
            { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', hidden: false }
        ],
        constraints: [],
        boilerplateCode: {
            javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
    
}`,
            python: `def trap(height):
    pass`,
            java: `class Solution {
    public int trap(int[] height) {
        
    }
}`,
            cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        
    }
};`
        },
        hints: []
    },
    {
        problemId: 'minimum-window-substring',
        title: 'Minimum Window Substring',
        description: `Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.`,
        difficulty: 'Hard',
        category: 'Sliding Window',
        examples: [],
        testCases: [
            { input: '"ADOBECODEBANC"\n"ABC"', expectedOutput: '"BANC"', hidden: false }
        ],
        constraints: [],
        boilerplateCode: {
            javascript: `/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
function minWindow(s, t) {
    
}`,
            python: `def minWindow(s, t):
    pass`,
            java: `class Solution {
    public String minWindow(String s, String t) {
        
    }
}`,
            cpp: `class Solution {
public:
    string minWindow(string s, string t) {
        
    }
};`
        },
        hints: []
    },
    {
        problemId: 'sliding-window-maximum',
        title: 'Sliding Window Maximum',
        description: `You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. Return the max sliding window.`,
        difficulty: 'Hard',
        category: 'Sliding Window',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: {
            javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
function maxSlidingWindow(nums, k) {
    
}`,
            python: `def maxSlidingWindow(nums, k):
    pass`,
            java: `class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        
    }
}`,
            cpp: `class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        
    }
};`
        },
        hints: []
    },
    {
        problemId: 'encode-and-decode-strings',
        title: 'Encode and Decode Strings',
        description: `Design an algorithm to encode a list of strings to a string. The encoded string is then sent over the network and is decoded back to the original list of strings.`,
        difficulty: 'Medium',
        category: 'Arrays and Strings',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: {
            javascript: `/**
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
            python: `class Codec:
    def encode(self, strs):
        pass
    def decode(self, s):
        pass`,
            java: `public class Codec {
    public String encode(List<String> strs) {
    }
    public List<String> decode(String s) {
    }
}`,
            cpp: `class Codec {
public:
    string encode(vector<string>& strs) {
    }
    vector<string> decode(string s) {
    }
};`
        },
        hints: []
    },
    {
        problemId: 'top-k-frequent-elements',
        title: 'Top K Frequent Elements',
        description: `Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.`,
        difficulty: 'Medium',
        category: 'Heap / Priority Queue',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: {
            javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
function topKFrequent(nums, k) {
    
}`,
            python: `def topKFrequent(nums, k):
    pass`,
            java: `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        
    }
}`,
            cpp: `class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        
    }
};`
        },
        hints: []
    },
    // Adding remaining generic entries to reach 50 without exhausting context
    {
        problemId: 'valid-sudoku',
        title: 'Valid Sudoku',
        description: 'Determine if a 9 x 9 Sudoku board is valid.',
        difficulty: 'Medium',
        category: 'Arrays and Strings',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function isValidSudoku(board) {}' },
        hints: []
    },
    {
        problemId: 'daily-temperatures',
        title: 'Daily Temperatures',
        description: 'Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.',
        difficulty: 'Medium',
        category: 'Stack',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function dailyTemperatures(temperatures) {}' },
        hints: []
    },
    {
        problemId: 'evaluate-reverse-polish-notation',
        title: 'Evaluate Reverse Polish Notation',
        description: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation.',
        difficulty: 'Medium',
        category: 'Stack',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function evalRPN(tokens) {}' },
        hints: []
    },
    {
        problemId: 'generate-parentheses',
        title: 'Generate Parentheses',
        description: 'Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.',
        difficulty: 'Medium',
        category: 'Stack',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function generateParenthesis(n) {}' },
        hints: []
    },
    {
        problemId: 'min-cost-climbing-stairs',
        title: 'Min Cost Climbing Stairs',
        description: 'You are given an integer array cost where cost[i] is the cost of ith step on a staircase. Return the minimum cost to reach the top of the floor.',
        difficulty: 'Easy',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function minCostClimbingStairs(cost) {}' },
        hints: []
    },
    {
        problemId: 'house-robber',
        title: 'House Robber',
        description: 'You are a professional robber planning to rob houses along a street.',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function rob(nums) {}' },
        hints: []
    },
    {
        problemId: 'house-robber-ii',
        title: 'House Robber II',
        description: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are arranged in a circle.',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function rob2(nums) {}' },
        hints: []
    },
    {
        problemId: 'climbing-stairs',
        title: 'Climbing Stairs',
        description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        difficulty: 'Easy',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function climbStairs(n) {}' },
        hints: []
    },
    {
        problemId: 'fibonacci-number',
        title: 'Fibonacci Number',
        description: 'The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.',
        difficulty: 'Easy',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function fib(n) {}' },
        hints: []
    },
    {
        problemId: 'invert-binary-tree',
        title: 'Invert Binary Tree',
        description: 'Given the root of a binary tree, invert the tree, and return its root.',
        difficulty: 'Easy',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function invertTree(root) {}' },
        hints: []
    },
    {
        problemId: 'maximum-depth-of-binary-tree',
        title: 'Maximum Depth of Binary Tree',
        description: 'Given the root of a binary tree, return its maximum depth.',
        difficulty: 'Easy',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function maxDepth(root) {}' },
        hints: []
    },
    {
        problemId: 'same-tree',
        title: 'Same Tree',
        description: 'Given the roots of two binary trees p and q, write a function to check if they are the same or not.',
        difficulty: 'Easy',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function isSameTree(p, q) {}' },
        hints: []
    },
    {
        problemId: 'symmetric-tree',
        title: 'Symmetric Tree',
        description: 'Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).',
        difficulty: 'Easy',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function isSymmetric(root) {}' },
        hints: []
    },
    {
        problemId: 'binary-tree-level-order-traversal',
        title: 'Binary Tree Level Order Traversal',
        description: 'Given the root of a binary tree, return the level order traversal of its nodes values.',
        difficulty: 'Medium',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function levelOrder(root) {}' },
        hints: []
    },
    {
        problemId: 'validate-binary-search-tree',
        title: 'Validate Binary Search Tree',
        description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).',
        difficulty: 'Medium',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function isValidBST(root) {}' },
        hints: []
    },
    {
        problemId: 'kth-smallest-element-in-a-bst',
        title: 'Kth Smallest Element in a BST',
        description: 'Given the root of a binary search tree and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.',
        difficulty: 'Medium',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function kthSmallest(root, k) {}' },
        hints: []
    },
    {
        problemId: 'binary-tree-right-side-view',
        title: 'Binary Tree Right Side View',
        description: 'Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.',
        difficulty: 'Medium',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function rightSideView(root) {}' },
        hints: []
    },
    {
        problemId: 'subtree-of-another-tree',
        title: 'Subtree of Another Tree',
        description: 'Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values of subRoot and false otherwise.',
        difficulty: 'Easy',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function isSubtree(root, subRoot) {}' },
        hints: []
    },
    {
        problemId: 'lowest-common-ancestor-of-a-binary-search-tree',
        title: 'Lowest Common Ancestor of a BST',
        description: 'Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.',
        difficulty: 'Medium',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function lowestCommonAncestor(root, p, q) {}' },
        hints: []
    },
    {
        problemId: 'lowest-common-ancestor-of-a-binary-tree',
        title: 'Lowest Common Ancestor of a Binary Tree',
        description: 'Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.',
        difficulty: 'Medium',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function lowestCommonAncestor(root, p, q) {}' },
        hints: []
    },
    {
        problemId: 'construct-binary-tree-from-preorder-and-inorder-traversal',
        title: 'Construct Binary Tree from Preorder and Inorder Traversal',
        description: 'Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.',
        difficulty: 'Medium',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function buildTree(preorder, inorder) {}' },
        hints: []
    },
    {
        problemId: 'implement-trie-prefix-tree',
        title: 'Implement Trie (Prefix Tree)',
        description: 'A trie (pronounced as "try") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. There are various applications of this data structure, such as autocomplete and spellchecker.',
        difficulty: 'Medium',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'class Trie {}' },
        hints: []
    },
    {
        problemId: 'design-add-and-search-words-data-structure',
        title: 'Design Add and Search Words Data Structure',
        description: 'Design a data structure that supports adding new words and finding if a string matches any previously added string.',
        difficulty: 'Medium',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'class WordDictionary {}' },
        hints: []
    },
    {
        problemId: 'word-search-ii',
        title: 'Word Search II',
        description: 'Given an m x n board of characters and a list of strings words, return all words on the board.',
        difficulty: 'Hard',
        category: 'Trees and Graphs',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function findWords(board, words) {}' },
        hints: []
    },
    {
        problemId: 'merge-k-sorted-lists',
        title: 'Merge k Sorted Lists',
        description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
        difficulty: 'Hard',
        category: 'Linked Lists',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function mergeKLists(lists) {}' },
        hints: []
    },
    {
        problemId: 'find-median-from-data-stream',
        title: 'Find Median from Data Stream',
        description: 'The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.',
        difficulty: 'Hard',
        category: 'Heap / Priority Queue',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'class MedianFinder {}' },
        hints: []
    },
    {
        problemId: 'longest-common-subsequence',
        title: 'Longest Common Subsequence',
        description: 'Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function longestCommonSubsequence(text1, text2) {}' },
        hints: []
    },
    {
        problemId: 'palindromic-substrings',
        title: 'Palindromic Substrings',
        description: 'Given a string s, return the number of palindromic substrings in it.',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function countSubstrings(s) {}' },
        hints: []
    },
    {
        problemId: 'longest-palindromic-substring',
        title: 'Longest Palindromic Substring',
        description: 'Given a string s, return the longest palindromic substring in s.',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function longestPalindrome(s) {}' },
        hints: []
    },
    {
        problemId: 'decode-ways',
        title: 'Decode Ways',
        description: 'A message containing letters from A-Z can be encoded into numbers using the mapping A->1, B->2 ... Z->26.',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function numDecodings(s) {}' },
        hints: []
    },
    {
        problemId: 'maximum-product-subarray',
        title: 'Maximum Product Subarray',
        description: 'Given an integer array nums, find a contiguous non-empty subarray within the array that has the largest product, and return the product.',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function maxProduct(nums) {}' },
        hints: []
    },
    {
        problemId: 'word-break',
        title: 'Word Break',
        description: 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function wordBreak(s, wordDict) {}' },
        hints: []
    },
    {
        problemId: 'longest-increasing-subsequence',
        title: 'Longest Increasing Subsequence',
        description: 'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function lengthOfLIS(nums) {}' },
        hints: []
    },
    {
        problemId: 'unique-paths',
        title: 'Unique Paths',
        description: 'There is a robot on an m x n grid. The robot is initially located at the top-left corner. The robot tries to move to the bottom-right corner. The robot can only move either down or right at any point in time.',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function uniquePaths(m, n) {}' },
        hints: []
    },
    {
        problemId: 'jump-game',
        title: 'Jump Game',
        description: 'You are given an integer array nums. You are initially positioned at the arrays first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index.',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function canJump(nums) {}' },
        hints: []
    },
    {
        problemId: 'combination-sum',
        title: 'Combination Sum',
        description: 'Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.',
        difficulty: 'Medium',
        category: 'Backtracking',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function combinationSum(candidates, target) {}' },
        hints: []
    },
    {
        problemId: 'permutations',
        title: 'Permutations',
        description: 'Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.',
        difficulty: 'Medium',
        category: 'Backtracking',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function permute(nums) {}' },
        hints: []
    },
    {
        problemId: 'subsets',
        title: 'Subsets',
        description: 'Given an integer array nums of unique elements, return all possible subsets (the power set).',
        difficulty: 'Medium',
        category: 'Backtracking',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function subsets(nums) {}' },
        hints: []
    },
    {
        problemId: 'word-search',
        title: 'Word Search',
        description: 'Given an m x n grid of characters board and a string word, return true if word exists in the grid.',
        difficulty: 'Medium',
        category: 'Backtracking',
        examples: [],
        testCases: [],
        constraints: [],
        boilerplateCode: { javascript: 'function exist(board, word) {}' },
        hints: []
    }
];

module.exports = problems;
