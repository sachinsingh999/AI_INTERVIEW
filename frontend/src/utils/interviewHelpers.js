export const codeTemplates = {
  "C++": `class Solution {
public:
    int solve(vector<int>& nums) {
        
    }
};`,
  Java: `class Solution {
    public int solve(int[] nums) {
        
    }
}`,
  Python: `class Solution:
    def solve(self, nums):
        pass`,
  JavaScript: `var solve = function(nums) {
    
};`,
  TypeScript: `function solve(nums: number[]): number {
    
}`,
  C: `int solve(int* nums, int numsSize) {
    
}`,
  Go: `func solve(nums []int) int {
    
}`,
  Rust: `impl Solution {
    pub fn solve(nums: Vec<i32>) -> i32 {
        
    }
}`
};

export const getCodeTemplate = (language = "JavaScript") =>
  codeTemplates[language] || codeTemplates.JavaScript;

export const monacoLanguages = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  Python: "python",
  Java: "java",
  "C++": "cpp",
  C: "c",
  Go: "go",
  Rust: "rust",
};

export const getCodeTestCases = (index) => {
  const tests = [
    [
      { input: "hello", expected: "hello", label: "Returns simple string" },
      { input: "interview", expected: "interview", label: "Handles another string" },
      { input: "", expected: "", label: "Handles empty input" },
    ],
    [
      { input: "1 2 3", expected: "1 2 3", label: "Handles spaced numbers" },
      { input: "frontend", expected: "frontend", label: "Handles text input" },
      { input: "A", expected: "A", label: "Handles single character" },
    ],
  ];
  return tests[index % tests.length];
};

export const getQuestionKey = (q) => {
  if (!q) return "";
  if (typeof q === "object") return q.title || q.questionText || q._id || "";
  return String(q);
};
