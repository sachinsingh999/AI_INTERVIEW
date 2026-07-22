import React from "react";

export const aptitudeQuestions = [
  {
    topic: "Logical Reasoning",
    difficulty: "Easy",
    marks: 1,
    question: "If all Roses are Flowers and some Flowers are Red, which statement must be true?",
    options: ["All Roses are Red", "Some Roses are Red", "All Roses are Flowers", "No Roses are Red"],
    correct: 2,
    explanation: "The first statement directly says all Roses are Flowers. Nothing confirms that Roses are Red.",
  },
  {
    topic: "Logical Reasoning",
    difficulty: "Medium",
    marks: 1,
    question: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
    options: ["40", "41", "42", "44"],
    correct: 2,
    explanation: "The differences are 4, 6, 8, 10, so the next difference is 12. 30 + 12 = 42.",
  },
  {
    topic: "Logical Reasoning",
    difficulty: "Medium",
    marks: 1,
    question: "In a code language, TABLE is written as UBCMF. How is CHAIR written?",
    options: ["DIBJS", "DIBIR", "DHAJS", "BGAHQ"],
    correct: 0,
    explanation: "Each letter is shifted one position forward: C->D, H->I, A->B, I->J, R->S.",
  },
  {
    topic: "Logical Reasoning",
    difficulty: "Easy",
    marks: 1,
    question: "Which number should replace the question mark? 3, 9, 27, 81, ?",
    options: ["162", "216", "243", "324"],
    correct: 2,
    explanation: "Each term is multiplied by 3. 81 * 3 = 243.",
  },
  {
    topic: "Logical Reasoning",
    difficulty: "Medium",
    marks: 1,
    question: "Statements: Some books are pens. All pens are pencils. Which conclusion follows?",
    options: ["All books are pencils", "Some books are pencils", "No books are pencils", "All pencils are books"],
    correct: 1,
    explanation: "The books that are pens must also be pencils because all pens are pencils.",
  },
  {
    topic: "Logical Reasoning",
    difficulty: "Hard",
    marks: 1,
    question: "A is taller than B. C is taller than A. D is shorter than B. Who is the tallest?",
    options: ["A", "B", "C", "D"],
    correct: 2,
    explanation: "C is taller than A, and A is taller than B and D, so C is tallest.",
  },
  {
    topic: "Logical Reasoning",
    difficulty: "Medium",
    marks: 1,
    question: "Choose the odd one out: Apple, Mango, Carrot, Banana",
    options: ["Apple", "Mango", "Carrot", "Banana"],
    correct: 2,
    explanation: "Carrot is a vegetable; the others are fruits.",
  },
  {
    topic: "Logical Reasoning",
    difficulty: "Easy",
    marks: 1,
    question: "If MONDAY is coded as NPOEBZ, then SUNDAY is coded as?",
    options: ["TVOEBZ", "TVOEBX", "RTMEBZ", "TVPDAZ"],
    correct: 0,
    explanation: "Each character moves one step forward: SUNDAY becomes TVOEBZ.",
  },
  {
    topic: "Quantitative Aptitude",
    difficulty: "Easy",
    marks: 1,
    question: "A train covers 180 km in 3 hours. What is its average speed?",
    options: ["45 km/h", "50 km/h", "55 km/h", "60 km/h"],
    correct: 3,
    explanation: "Average speed = total distance / total time = 180 / 3 = 60 km/h.",
  },
  {
    topic: "Quantitative Aptitude",
    difficulty: "Medium",
    marks: 1,
    question: "A can finish a work in 10 days and B can finish it in 15 days. How long will they take together?",
    options: ["5 days", "6 days", "7.5 days", "8 days"],
    correct: 1,
    explanation: "Combined work per day = 1/10 + 1/15 = 1/6. Together they finish in 6 days.",
  },
  {
    topic: "Quantitative Aptitude",
    difficulty: "Medium",
    marks: 1,
    question: "A bag has 5 red balls and 3 blue balls. What is the probability of picking a blue ball?",
    options: ["3/5", "3/8", "5/8", "1/3"],
    correct: 1,
    explanation: "Total balls = 8. Blue balls = 3. Probability = 3/8.",
  },
  {
    topic: "Quantitative Aptitude",
    difficulty: "Easy",
    marks: 1,
    question: "An item is bought for Rs. 800 and sold for Rs. 1,000. What is the profit percentage?",
    options: ["20%", "22%", "25%", "30%"],
    correct: 2,
    explanation: "Profit = 200. Profit percentage = 200 / 800 * 100 = 25%.",
  },
  {
    topic: "Quantitative Aptitude",
    difficulty: "Medium",
    marks: 1,
    question: "What is the simple interest on Rs. 5,000 at 8% per annum for 2 years?",
    options: ["Rs. 600", "Rs. 700", "Rs. 800", "Rs. 900"],
    correct: 2,
    explanation: "Simple interest = PRT/100 = 5000 * 8 * 2 / 100 = Rs. 800.",
  },
  {
    topic: "Quantitative Aptitude",
    difficulty: "Medium",
    marks: 1,
    question: "A number is increased by 20% and then decreased by 20%. What is the net change?",
    options: ["No change", "4% increase", "4% decrease", "8% decrease"],
    correct: 2,
    explanation: "Let the number be 100. It becomes 120, then 96. Net decrease = 4%.",
  },
  {
    topic: "Quantitative Aptitude",
    difficulty: "Easy",
    marks: 1,
    question: "The average of 5 numbers is 18. What is their total sum?",
    options: ["80", "85", "90", "95"],
    correct: 2,
    explanation: "Total sum = average * count = 18 * 5 = 90.",
  },
  {
    topic: "Quantitative Aptitude",
    difficulty: "Hard",
    marks: 1,
    question: "A shopkeeper marks an item 25% above cost and gives a 10% discount. What is the profit percentage?",
    options: ["10%", "11.5%", "12.5%", "15%"],
    correct: 2,
    explanation: "Marked price = 125. Selling price after 10% discount = 112.5. Profit = 12.5%.",
  },
  {
    topic: "Quantitative Aptitude",
    difficulty: "Medium",
    marks: 1,
    question: "The ratio of boys to girls is 3:2. If there are 30 boys, how many girls are there?",
    options: ["15", "18", "20", "24"],
    correct: 2,
    explanation: "3 parts = 30, so 1 part = 10. Girls = 2 parts = 20.",
  },
  {
    topic: "Verbal Ability",
    difficulty: "Easy",
    marks: 1,
    question: "Choose the synonym of 'Rapid'.",
    options: ["Slow", "Quick", "Late", "Calm"],
    correct: 1,
    explanation: "Rapid means quick or fast.",
  },
  {
    topic: "Verbal Ability",
    difficulty: "Medium",
    marks: 1,
    question: "Choose the correctly spelled word.",
    options: ["Accomodate", "Acommodate", "Accommodate", "Acomodate"],
    correct: 2,
    explanation: "The correct spelling is Accommodate.",
  },
  {
    topic: "Verbal Ability",
    difficulty: "Medium",
    marks: 1,
    question: "Fill in the blank: She has been working here ___ 2021.",
    options: ["from", "since", "for", "by"],
    correct: 1,
    explanation: "Since is used with a starting point in time.",
  },
  {
    topic: "Verbal Ability",
    difficulty: "Easy",
    marks: 1,
    question: "Choose the antonym of 'Ancient'.",
    options: ["Old", "Modern", "Historic", "Past"],
    correct: 1,
    explanation: "Modern is the opposite of ancient.",
  },
];

export const writtenPractice = {
  technical: {
    title: "Technical Practice",
    accent: "from-violet-600 to-fuchsia-500",
    label: "Core CS",
    description: "Practice technical answers with structure, depth, and interview-ready clarity.",
    questions: [
      {
        topic: "API Design",
        prompt: "Explain REST API design principles for a production user-management service.",
        hints: ["Resource naming", "Status codes", "Validation", "Versioning", "Security"],
        expected: "A strong answer explains resource-based URLs, correct HTTP verbs, status codes, auth, validation, pagination, rate limits, and observability.",
      },
      {
        topic: "Authentication",
        prompt: "What is the difference between authentication and authorization?",
        hints: ["Identity", "Permissions", "JWT/session", "RBAC"],
        expected: "Authentication proves who the user is. Authorization decides what the authenticated user can access or do.",
      },
      {
        topic: "Frontend Performance",
        prompt: "How would you optimize a slow React component in a dashboard?",
        hints: ["Profiler", "Memoization", "Virtualization", "Network", "State boundaries"],
        expected: "A strong answer diagnoses first, then discusses render reduction, memoization, splitting state, virtualization, caching, and bundle/code-splitting.",
      },
      {
        topic: "Databases",
        prompt: "How do indexes improve database performance, and when can they hurt?",
        hints: ["Read speed", "Write cost", "Selectivity", "Query plan"],
        expected: "Indexes speed up lookups but add storage and write overhead. Poorly chosen indexes can be ignored or slow writes.",
      },
    ],
  },
  hr: {
    title: "HR Practice",
    accent: "from-amber-500 to-rose-500",
    label: "Behavioral",
    description: "Build confident HR answers with STAR structure and sharper storytelling.",
    questions: [
      {
        topic: "Introduction",
        prompt: "Tell me about yourself.",
        hints: ["Present role", "Key strengths", "Best project", "Target role"],
        expected: "A strong answer is concise, role-relevant, and moves from background to strengths to why this role fits.",
      },
      {
        topic: "Hiring fit",
        prompt: "Why should we hire you?",
        hints: ["Evidence", "Skills", "Impact", "Culture fit"],
        expected: "A strong answer connects skills to company needs and proves them with one or two concrete outcomes.",
      },
      {
        topic: "Conflict",
        prompt: "Describe a conflict you handled professionally.",
        hints: ["Situation", "Action", "Resolution", "Learning"],
        expected: "Use STAR. Show calm communication, ownership, and a measurable or clear resolution.",
      },
      {
        topic: "Failure",
        prompt: "Tell me about a mistake you made and what you learned.",
        hints: ["Ownership", "Correction", "Prevention", "Growth"],
        expected: "The answer should be honest, not dramatic, and should focus on what changed afterward.",
      },
    ],
  },
};

export const codingProblems = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays, Hashing",
    statement:
      "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume exactly one valid solution exists.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Exactly one solution exists.",
    ],
    examples: [
      {
        input: "nums = [2,7,11,15]\ntarget = 9",
        output: "[0,1]",
        explanation: "nums[0] + nums[1] = 9",
      },
      {
        input: "nums = [3,2,4]\ntarget = 6",
        output: "[1,2]",
        explanation: "nums[1] + nums[2] = 6",
      },
    ],
    expectedComplexity: {
      time: "O(n)",
      space: "O(n)",
    },
    starterCode: {
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        return {};
    }
};`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[0];
    }
}`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your code here
        return []`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your code here
    return [];
};`,
    },
    driverCode: {
      cpp: `int main() {
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        int target;
        cin >> target;
        Solution sol;
        vector<int> ans = sol.twoSum(nums, target);
        cout << ans[0] << " " << ans[1];
    }
    return 0;
}`,
      java: `class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
            int target = sc.nextInt();
            Solution sol = new Solution();
            int[] ans = sol.twoSum(nums, target);
            System.out.print(ans[0] + " " + ans[1]);
        }
    }
}`,
      python: `if __name__ == '__main__':
    import sys
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 3:
        nums = list(map(int, lines[1].split()))
        target = int(lines[2])
        sol = Solution()
        ans = sol.twoSum(nums, target)
        print(ans[0], ans[1])`,
      javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8');
const lines = input.trim().split('\\n');
if (lines.length >= 3) {
    const n = Number(lines[0]);
    const nums = lines[1].trim().split(/\\s+/).map(Number).slice(0, n);
    const target = Number(lines[2]);
    const ans = twoSum(nums, target);
    console.log(ans[0] + " " + ans[1]);
}`,
    },
    tests: [
      {
        label: "Test Case 1",
        input: "4\n2 7 11 15\n9",
        expected: "0 1",
      },
      {
        label: "Test Case 2",
        input: "3\n3 2 4\n6",
        expected: "1 2",
      },
      {
        label: "Test Case 3",
        input: "2\n3 3\n6",
        expected: "0 1",
      },
    ],
    hidden: [
      { input: "4\n1 5 9 12\n14", expected: "1 2", label: "Hidden 1" },
      { input: "5\n10 -2 4 6 8\n8", expected: "0 1", label: "Hidden 2" },
      { input: "6\n0 4 3 8 2 9\n11", expected: "2 3", label: "Hidden 3" },
      { input: "3\n-1 -2 -3\n-5", expected: "1 2", label: "Hidden 4" },
      { input: "5\n100 200 300 400 500\n900", expected: "3 4", label: "Hidden 5" },
      { input: "4\n5 75 25 20\n100", expected: "1 2", label: "Hidden 6" },
      { input: "7\n7 1 11 15 2 9 4\n6", expected: "4 6", label: "Hidden 7" },
      { input: "4\n-10 20 30 5\n15", expected: "0 1", label: "Hidden 8" },
      { input: "6\n8 3 1 6 4 2\n10", expected: "0 5", label: "Hidden 9" },
      { input: "8\n12 14 17 19 21 3 6 9\n30", expected: "2 7", label: "Hidden 10" },
      { input: "5\n2 4 6 8 10\n12", expected: "0 4", label: "Hidden 11" },
      { input: "4\n-5 0 5 10\n0", expected: "0 2", label: "Hidden 12" },
      { input: "6\n1 2 3 4 5 6\n7", expected: "0 5", label: "Hidden 13" },
      { input: "3\n9 1 8\n10", expected: "0 1", label: "Hidden 14" },
      { input: "5\n11 13 17 19 23\n36", expected: "1 4", label: "Hidden 15" },
      { input: "4\n4 4 2 8\n8", expected: "0 1", label: "Hidden 16" },
      { input: "6\n-100 50 70 20 30 90\n-50", expected: "0 1", label: "Hidden 17" },
      { input: "7\n31 14 2 18 27 9 40\n49", expected: "5 6", label: "Hidden 18" },
      { input: "4\n1000000000 -1000000000 7 3\n0", expected: "0 1", label: "Hidden 19" },
      { input: "5\n6 12 18 24 30\n42", expected: "1 4", label: "Hidden 20" },
    ],
  },
];

export const modeShell = {
  aptitude: {
    title: "Aptitude Practice",
    label: "Exam Console",
    description: "A polished test interface with choices, timer, review state, answer map, score, and explanations.",
  },
  coding: {
    title: "Coding Practice",
    label: "Compiler Lab",
    description: "Solve problems in Monaco, run visible tests, submit hidden tests, and read real-time verdicts.",
  },
};

export const languageOptions = [
  { id: "javascript", label: "JavaScript", monaco: "javascript", api: "JavaScript", judge0Id: 63 },
  { id: "typescript", label: "TypeScript", monaco: "typescript", api: "TypeScript", judge0Id: 74 },
  { id: "python", label: "Python", monaco: "python", api: "Python", judge0Id: 71 },
  { id: "java", label: "Java", monaco: "java", api: "Java", judge0Id: 62 },
  { id: "cpp", label: "C++", monaco: "cpp", api: "C++", judge0Id: 54 },
  { id: "c", label: "C", monaco: "c", api: "C", judge0Id: 50 },
  { id: "go", label: "Go", monaco: "go", api: "Go", judge0Id: 60 },
  { id: "rust", label: "Rust", monaco: "rust", api: "Rust", judge0Id: 73 },
];

export const formatTime = (seconds) => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
};

export const getAnswerQuality = (answer, hints) => {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const matchedHints = hints.filter((hint) =>
    answer.toLowerCase().includes(hint.toLowerCase().split(" ")[0])
  ).length;

  if (!answer.trim()) {
    return { score: 0, label: "Not answered", tone: "text-slate-500", feedback: "Write an answer to unlock coaching feedback." };
  }

  const score = Math.min(10, Math.round(words / 18 + matchedHints * 1.5 + 3));
  const label = score >= 8 ? "Strong" : score >= 6 ? "Developing" : "Needs depth";
  const tone = score >= 8 ? "text-emerald-650" : score >= 6 ? "text-amber-650" : "text-rose-650";
  const feedback =
    score >= 8
      ? "This has useful detail. Tighten the opening and close with measurable impact."
      : score >= 6
        ? "Good start. Add evidence, tradeoffs, and one concrete example."
        : "Add structure first: context, action, result, and learning.";

  return { score, label, tone, feedback };
};

export const renderMarkdown = (text) => {
  if (!text) return "";
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    let cleanLine = line;
    cleanLine = cleanLine.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    cleanLine = cleanLine.replace(/`(.*?)`/g, '<code class="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-emerald-400 text-xs">$1</code>');
    
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      return (
        <li key={idx} className="ml-4 list-disc text-sm text-slate-355" dangerouslySetInnerHTML={{ __html: cleanLine.substring(2) }} />
      );
    }
    if (line.trim().startsWith("### ")) {
      return (
        <h3 key={idx} className="text-base font-black text-white mt-4 mb-2" dangerouslySetInnerHTML={{ __html: cleanLine.substring(4) }} />
      );
    }
    if (line.trim().startsWith("## ")) {
      return (
        <h2 key={idx} className="text-lg font-black text-white mt-5 mb-2" dangerouslySetInnerHTML={{ __html: cleanLine.substring(3) }} />
      );
    }
    
    return (
      <p key={idx} className="text-sm leading-relaxed text-slate-355 min-h-[1.5em]" dangerouslySetInnerHTML={{ __html: cleanLine }} />
    );
  });
};

export const generateDynamicStarter = (question, language) => {
  const title = question?.title || "solve";
  const cleanTitle = title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((word, idx) => 
      idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");

  const snakeTitle = title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .toLowerCase()
    .split(/\s+/)
    .join("_");

  if (language === "javascript") {
    return `/**
 * @return {any}
 */
var ${cleanTitle} = function() {
    // Write your code here
    
};`;
  }
  if (language === "python") {
    return `class Solution:
    def ${snakeTitle}(self) -> None:
        # Write your code here
        pass`;
  }
  if (language === "cpp") {
    return `class Solution {
public:
    void ${cleanTitle}() {
        // Write your code here
        
    }
};`;
  }
  if (language === "java") {
    return `class Solution {
    public void ${cleanTitle}() {
        // Write your code here
        
    }
}`;
  }
  return "";
};

export const getOriginalStarter = (question, language) => {
  if (!question) return "";
  const dbStarter = question.starterCode?.[language];
  if (dbStarter) return dbStarter;
  const localProblem = codingProblems.find(p => p.title === question.title);
  if (localProblem) return localProblem.starterCode?.[language] || "";
  return generateDynamicStarter(question, language);
};

export const extractUserSolution = (fullCode, language) => {
  if (!fullCode) return "";
  const lines = fullCode.split("\n");
  let startIdx = -1;
  let endIdx = -1;

  const isPython = language === "python";
  const startMarker = isPython ? "# BEGIN: User Solution" : "// BEGIN: User Solution";
  const endMarker = isPython ? "# END: User Solution" : "// END: User Solution";

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(startMarker)) {
      startIdx = i;
    }
    if (lines[i].includes(endMarker)) {
      endIdx = i;
      break;
    }
  }

  if (startIdx !== -1 && endIdx !== -1) {
    return lines.slice(startIdx + 1, endIdx).join("\n");
  }
  return fullCode;
};

export const wrapUserSolution = (fullCode, userSolution, language) => {
  if (!fullCode) return userSolution;
  const lines = fullCode.split("\n");
  let startIdx = -1;
  let endIdx = -1;

  const isPython = language === "python";
  const startMarker = isPython ? "# BEGIN: User Solution" : "// BEGIN: User Solution";
  const endMarker = isPython ? "# END: User Solution" : "// END: User Solution";

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(startMarker)) {
      startIdx = i;
    }
    if (lines[i].includes(endMarker)) {
      endIdx = i;
      break;
    }
  }

  if (startIdx !== -1 && endIdx !== -1) {
    const prefix = lines.slice(0, startIdx + 1).join("\n");
    const suffix = lines.slice(endIdx).join("\n");
    return `${prefix}\n${userSolution}\n${suffix}`;
  }
  return userSolution;
};

export const getEditorialContent = (problem) => {
  if (problem.title === "Two Sum") {
    return `### Editorial - Two Sum

#### Overview
The problem asks us to find indices of two numbers in an array that sum to a given target. We can assume that each input would have exactly one solution, and we may not use the same element twice.

#### Approach 1: Brute Force
The simplest approach is to loop through each element $x$ and find if there is another value that equals to $target - x$.
- **Algorithm:** 
  1. Use nested loops: the outer loop runs from $i = 0$ to $n-1$, and the inner loop runs from $j = i+1$ to $n-1$.
  2. If $nums[i] + nums[j] == target$, return $[i, j]$.
- **Time Complexity:** $O(N^2)$ because we check all pairs.
- **Space Complexity:** $O(1)$ since we don't use extra memory.

#### Approach 2: One-pass Hash Map (Optimal)
While iterating and inserting elements into the table, we can also look back to check if current element's complement already exists in the table. If it exists, we have found the solution and return its index immediately.
- **Algorithm:**
  1. Initialize an empty hash map (e.g. \`Map\` in JS, \`HashMap\` in Java, \`unordered_map\` in C++, \`dict\` in Python).
  2. For each element $nums[i]$, calculate its complement: \`complement = target - nums[i]\`.
  3. If \`complement\` exists in the hash map, return its index and the current index: \`[map[complement], i]\`.
  4. Otherwise, put the value and index into the map: \`map[nums[i]] = i\`.
- **Time Complexity:** $O(N)$ because we traverse the list containing $n$ elements exactly once. Each lookup in the table costs only $O(1)$ time.
- **Space Complexity:** $O(N)$ since the extra space required depends on the number of items stored in the hash map, which stores at most $N$ elements.`;
  }

  return `### Editorial - ${problem.title}

#### Problem Breakdown
We need to solve the problem "${problem.title}" under the given constraints:
\${(problem.constraints || []).map(c => \`- \${c}\`).join("\\n")}

#### Recommended Solution Path
1. **Analyze Input Dynamics:** Determine if sorting can simplify index lookups or search ranges.
2. **Utilize Space-Time Tradeoffs:** Storing values in a Hash Table (Map/Set) often reduces lookup time from $O(N)$ to $O(1)$, converting a brute-force $O(N^2)$ quadratic scan into an optimal $O(N)$ linear-time pass.
3. **Handle Edge Cases:** Ensure empty arrays, single elements, negative inputs, or bounds are tested.

#### Optimal Complexity
- **Time Complexity:** $O(N)$ or $O(N \\log N)$ depending on sorting requirements.
- **Space Complexity:** $O(N)$ or $O(1)$ if we can solve in-place.`;
};

export const getSolutionContent = (problem, language) => {
  if (problem.title === "Two Sum") {
    const codes = {
      javascript: `class Solution {
  twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
      const complement = target - nums[i];
      if (map.has(complement)) {
        return [map.get(complement), i];
      }
      map.set(nums[i], i);
    }
    return [];
  }
}`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        hashmap = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in hashmap:
                return [hashmap[complement], i]
            hashmap[num] = i
        return []`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> hashmap;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (hashmap.count(complement)) {
                return {hashmap[complement], i};
            }
            hashmap[nums[i]] = i;
        }
        return {};
    }
};`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`
    };
    return codes[language] || codes.javascript;
  }

  const cleanTitle = (problem.title || "solve")
    .replace(/[^a-zA-Z0-9\\s]/g, "")
    .split(/\\s+/)
    .map((word, idx) => 
      idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");

  const snakeTitle = (problem.title || "solve")
    .replace(/[^a-zA-Z0-9\\s]/g, "")
    .toLowerCase()
    .split(/\\s+/)
    .join("_");

  const fallbacks = {
    javascript: `class Solution {
  \${cleanTitle}(args) {
    // Optimal implementation
    // Time complexity: O(N)
    // Space complexity: O(N)
  }
}`,
    python: `class Solution:
    def \${snakeTitle}(self, args):
        # Optimal implementation
        # Time complexity: O(N)
        # Space complexity: O(N)
        pass`,
    cpp: `class Solution {
public:
    void \${cleanTitle}() {
        // Optimal implementation
        // Time complexity: O(N)
        // Space complexity: O(N)
    }
};`,
    java: `class Solution {
    public void \${cleanTitle}() {
        // Optimal implementation
        // Time complexity: O(N)
        // Space complexity: O(N)
    }
}`
  };
  return fallbacks[language] || fallbacks.javascript;
};

export const parseTestCaseInput = (title, inputStr) => {
  const cleanTitle = (title || "").toLowerCase();
  const rawLines = (inputStr || "").trim().split("\n").map(l => l.trim());

  if (cleanTitle.includes("two sum")) {
    const numsStr = rawLines[1] || "";
    const nums = numsStr.split(/[\s,]+/).filter(Boolean).map(Number);
    const target = parseInt(rawLines[2]) || 0;
    return [
      { name: "NUMS", type: "array", value: `[${nums.join(",")}]` },
      { name: "TARGET", type: "number", value: String(target) }
    ];
  } else if (cleanTitle.includes("unique paths")) {
    const firstLineParts = (rawLines[0] || "").split(/[\s,]+/).filter(Boolean).map(Number);
    let m = firstLineParts[0] || 0;
    let n = firstLineParts[1] || 0;
    if (rawLines.length > 1 && !n) {
      n = parseInt(rawLines[1]) || 0;
    }
    return [
      { name: "M", type: "number", value: String(m) },
      { name: "N", type: "number", value: String(n) }
    ];
  } else if (cleanTitle.includes("container with most water")) {
    const heightStr = rawLines[1] || "";
    const height = heightStr.split(/[\s,]+/).filter(Boolean).map(Number);
    return [
      { name: "HEIGHT", type: "array", value: `[${height.join(",")}]` }
    ];
  } else if (cleanTitle.includes("valid parentheses")) {
    const s = rawLines[0] || "";
    return [
      { name: "S", type: "string", value: s }
    ];
  } else if (cleanTitle.includes("reverse linked list")) {
    const headStr = rawLines[1] || "";
    const head = headStr.split(/[\s,]+/).filter(Boolean).map(Number);
    return [
      { name: "HEAD", type: "array", value: `[${head.join(",")}]` }
    ];
  } else if (cleanTitle.includes("maximum depth of binary tree")) {
    const rootStr = rawLines[1] || "";
    const root = rootStr.split(/[\s,]+/).filter(Boolean).map(Number);
    return [
      { name: "ROOT", type: "array", value: `[${root.join(",")}]` }
    ];
  }

  return [
    { name: "INPUT", type: "text", value: inputStr }
  ];
};

export const serializeTestCaseInput = (title, fields) => {
  const cleanTitle = (title || "").toLowerCase();
  
  const getField = (name) => {
    const field = fields.find(f => f.name === name);
    return field ? field.value : "";
  };

  if (cleanTitle.includes("two sum")) {
    const numsVal = getField("NUMS") || "";
    const cleanNums = numsVal
      .replace(/[\[\]]/g, "")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    const targetVal = parseInt(getField("TARGET")) || 0;
    return `${cleanNums.length}\n${cleanNums.join(" ")}\n${targetVal}`;
  } else if (cleanTitle.includes("unique paths")) {
    const m = parseInt(getField("M")) || 0;
    const n = parseInt(getField("N")) || 0;
    return `${m} ${n}`;
  } else if (cleanTitle.includes("container with most water")) {
    const heightVal = getField("HEIGHT") || "";
    const cleanHeight = heightVal
      .replace(/[\[\]]/g, "")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    return `${cleanHeight.length}\n${cleanHeight.join(" ")}`;
  } else if (cleanTitle.includes("valid parentheses")) {
    const s = getField("S") || "";
    const cleanS = s.replace(/^["']|["']$/g, "");
    return cleanS;
  } else if (cleanTitle.includes("reverse linked list")) {
    const headVal = getField("HEAD") || "";
    const cleanHead = headVal
      .replace(/[\[\]]/g, "")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    return `${cleanHead.length}\n${cleanHead.join(" ")}`;
  } else if (cleanTitle.includes("maximum depth of binary tree")) {
    const rootVal = getField("ROOT") || "";
    const cleanRoot = rootVal
      .replace(/[\[\]]/g, "")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    return `${cleanRoot.length}\n${cleanRoot.join(" ")}`;
  }

  return getField("INPUT") || "";
};

