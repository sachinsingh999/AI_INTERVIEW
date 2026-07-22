const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });
const TechnicalQuestion = require("./models/TechnicalQuestion");

const DSA_QUESTIONS = [
  {
    title: "Two Sum",
    question: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    category: "Arrays & Hashing",
    difficulty: "Medium",
    roleTags: ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer"],
    technologyTags: ["JavaScript", "Node.js", "React", "Python", "Java", "C++"],
    expectedAnswerPoints: [
      "Use Hash Map for O(N) Time Complexity",
      "Avoid O(N^2) Brute Force nested loops",
      "Handle single pass hash insertion and lookup"
    ],
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nTime Complexity: O(N)\nSpace Complexity: O(N)",
    sampleInput: "nums = [2, 7, 11, 15], target = 9",
    sampleOutput: "[0, 1]",
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    testCases: [
      { id: 1, input: "nums = [2, 7, 11, 15], target = 9", expectedOutput: "[0, 1]", isHidden: false },
      { id: 2, input: "nums = [3, 2, 4], target = 6", expectedOutput: "[1, 2]", isHidden: false },
      { id: 3, input: "nums = [3, 3], target = 6", expectedOutput: "[0, 1]", isHidden: true }
    ],
    starterCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    idealAnswer: "Use a hash map to store previously seen numbers and their indices. For each number, calculate `target - currentNum` and check if it exists in the hash map. Time Complexity: O(N), Space Complexity: O(N).",
    timeLimit: 300,
    marks: 10,
    type: "coding",
  },
  {
    title: "Unique Paths",
    question: "A robot is located at the top-left corner of a m x n grid. The robot can only move either down or right at any point in time. The robot is trying to reach the bottom-right corner of the grid. Return the number of possible unique paths.",
    category: "Dynamic Programming",
    difficulty: "Medium",
    roleTags: ["Software Engineer", "Backend Developer", "Full Stack Developer", "Frontend Developer"],
    technologyTags: ["JavaScript", "Node.js", "Python", "Java", "C++"],
    expectedAnswerPoints: [
      "2D Dynamic Programming grid state representation",
      "Base cases: dp[0][j] = 1 and dp[i][0] = 1",
      "Space optimization from O(M*N) to O(N)"
    ],
    constraints: "1 <= m, n <= 100\nTime Complexity: O(M * N)\nSpace Complexity: O(N)",
    sampleInput: "m = 3, n = 7",
    sampleOutput: "28",
    examples: [
      {
        input: "m = 3, n = 7",
        output: "28",
        explanation: "From 3x7 grid top-left to bottom-right, total unique paths = 28."
      },
      {
        input: "m = 3, n = 2",
        output: "3",
        explanation: "Right -> Down -> Down, Down -> Down -> Right, Down -> Right -> Down."
      }
    ],
    testCases: [
      { id: 1, input: "m = 3, n = 7", expectedOutput: "28", isHidden: false },
      { id: 2, input: "m = 3, n = 2", expectedOutput: "3", isHidden: false },
      { id: 3, input: "m = 7, n = 3", expectedOutput: "28", isHidden: true }
    ],
    starterCode: `function uniquePaths(m, n) {
  const dp = Array(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[j] += dp[j - 1];
    }
  }
  return dp[n - 1];
}`,
    idealAnswer: "Use dynamic programming where `dp[i][j] = dp[i-1][j] + dp[i][j-1]`. Space can be optimized using a single 1D array of size N. Time Complexity: O(M * N), Space Complexity: O(N).",
    timeLimit: 300,
    marks: 10,
    type: "coding",
  },
  {
    title: "Container With Most Water",
    question: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
    category: "Two Pointers",
    difficulty: "Medium",
    roleTags: ["Software Engineer", "Frontend Developer", "Full Stack Developer"],
    technologyTags: ["JavaScript", "Node.js", "React", "Python"],
    expectedAnswerPoints: [
      "Two Pointers greedy approach (left = 0, right = n - 1)",
      "Move pointer with smaller height inwards",
      "Time Complexity O(N) vs Brute Force O(N^2)"
    ],
    constraints: "2 <= height.length <= 10^5\n0 <= height[i] <= 10^4\nTime Complexity: O(N)\nSpace Complexity: O(1)",
    sampleInput: "height = [1,8,6,2,5,4,8,3,7]",
    sampleOutput: "49",
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation: "Max area formed between index 1 (height 8) and index 8 (height 7) is min(8, 7) * (8 - 1) = 7 * 7 = 49."
      }
    ],
    testCases: [
      { id: 1, input: "height = [1,8,6,2,5,4,8,3,7]", expectedOutput: "49", isHidden: false },
      { id: 2, input: "height = [1,1]", expectedOutput: "1", isHidden: false }
    ],
    starterCode: `function maxArea(height) {
  let left = 0, right = height.length - 1;
  let maxW = 0;
  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    maxW = Math.max(maxW, area);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return maxW;
}`,
    idealAnswer: "Initialize two pointers at extreme ends. Calculate area at each step and move the pointer pointing to the shorter line inwards to try finding a taller line. Time Complexity: O(N), Space Complexity: O(1).",
    timeLimit: 300,
    marks: 10,
    type: "coding",
  },
  {
    title: "Longest Substring Without Repeating Characters",
    question: "Given a string s, find the length of the longest substring without repeating characters.",
    category: "Sliding Window",
    difficulty: "Hard",
    roleTags: ["Software Engineer", "Backend Developer", "Full Stack Developer"],
    technologyTags: ["JavaScript", "Node.js", "Python", "Java", "C++"],
    expectedAnswerPoints: [
      "Sliding Window pattern with Hash Set / Map",
      "Dynamic window resizing when duplicate character encountered",
      "Time Complexity O(N) with single traversal"
    ],
    constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.\nTime Complexity: O(N)\nSpace Complexity: O(K)",
    sampleInput: "s = \"abcabcbb\"",
    sampleOutput: "3",
    examples: [
      {
        input: "s = \"abcabcbb\"",
        output: "3",
        explanation: "The answer is \"abc\", with the length of 3."
      },
      {
        input: "s = \"bbbbb\"",
        output: "1",
        explanation: "The answer is \"b\", with the length of 1."
      }
    ],
    testCases: [
      { id: 1, input: "s = \"abcabcbb\"", expectedOutput: "3", isHidden: false },
      { id: 2, input: "s = \"bbbbb\"", expectedOutput: "1", isHidden: false },
      { id: 3, input: "s = \"pwwkew\"", expectedOutput: "3", isHidden: true }
    ],
    starterCode: `function lengthOfLongestSubstring(s) {
  let left = 0, maxLen = 0;
  const set = new Set();
  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
    idealAnswer: "Maintain a sliding window using two pointers `left` and `right` along with a hash set. When a duplicate character is encountered at `right`, shrink `left` until set contains unique characters. Time Complexity: O(N), Space Complexity: O(min(N, M)).",
    timeLimit: 300,
    marks: 10,
    type: "coding",
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas!");

    await TechnicalQuestion.deleteMany({});
    console.log("Cleared existing TechnicalQuestion collection.");

    const inserted = await TechnicalQuestion.insertMany(DSA_QUESTIONS);
    console.log(`Successfully inserted ${inserted.length} real DSA coding questions into database!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
