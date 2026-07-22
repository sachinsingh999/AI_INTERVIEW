const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "dummy_key"
);

const getFallbackCodeTemplate = (language, type = "string") => {
  const templates = {
    JavaScript: type === "array" 
      ? `// BEGIN: User Solution\nclass Solution {\n  maxSubarraySum(arr) {\n    // Write your code here\n    return 0;\n  }\n}\n// END: User Solution\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8');\nconst lines = input.trim().split('\\n');\nif (lines.length > 0) {\n  const arr = JSON.parse(lines[0]);\n  const sol = new Solution();\n  console.log(sol.maxSubarraySum(arr));\n}` 
      : `// BEGIN: User Solution\nclass Solution {\n  firstUniqChar(s) {\n    // Write your code here\n    return -1;\n  }\n}\n// END: User Solution\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8');\nconst lines = input.trim().split('\\n');\nif (lines.length > 0) {\n  const s = JSON.parse(lines[0]);\n  const sol = new Solution();\n  console.log(sol.firstUniqChar(s));\n}`,
    TypeScript: type === "array" 
      ? `// BEGIN: User Solution\nclass Solution {\n  maxSubarraySum(arr: number[]): number {\n    return 0;\n  }\n}\n// END: User Solution` 
      : `// BEGIN: User Solution\nclass Solution {\n  firstUniqChar(s: string): number {\n    return -1;\n  }\n}\n// END: User Solution`,
    Python: type === "array" 
      ? `# BEGIN: User Solution\nclass Solution:\n    def maxSubarraySum(self, arr):\n        # Write your code here\n        return 0\n# END: User Solution\n\nimport sys\nimport json\nlines = sys.stdin.read().splitlines()\nif lines:\n    arr = json.loads(lines[0])\n    sol = Solution()\n    print(sol.maxSubarraySum(arr))` 
      : `# BEGIN: User Solution\nclass Solution:\n    def firstUniqChar(self, s):\n        # Write your code here\n        return -1\n# END: User Solution\n\nimport sys\nimport json\nlines = sys.stdin.read().splitlines()\nif lines:\n    s = json.loads(lines[0])\n    sol = Solution()\n    print(sol.firstUniqChar(s))`,
    Java: type === "array" 
      ? `import java.util.*;\n\n// BEGIN: User Solution\nclass Solution {\n    public int maxSubarraySum(int[] arr) {\n        // Write your code here\n        return 0;\n    }\n}\n// END: User Solution\n\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String line = sc.nextLine().trim();\n            line = line.substring(1, line.length() - 1);\n            if (line.isEmpty()) {\n                Solution sol = new Solution();\n                System.out.println(sol.maxSubarraySum(new int[0]));\n                return;\n            }\n            String[] parts = line.split(",");\n            int[] arr = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i].trim());\n            Solution sol = new Solution();\n            System.out.println(sol.maxSubarraySum(arr));\n        }\n    }\n}` 
      : `import java.util.*;\n\n// BEGIN: User Solution\nclass Solution {\n    public int firstUniqChar(String s) {\n        // Write your code here\n        return -1;\n    }\n}\n// END: User Solution\n\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String s = sc.nextLine().trim();\n            if (s.startsWith("\\"") && s.endsWith("\\"")) {\n                s = s.substring(1, s.length() - 1);\n            }\n            Solution sol = new Solution();\n            System.out.println(sol.firstUniqChar(s));\n        }\n    }\n}`,
    "C++": type === "array" 
      ? `#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\nusing namespace std;\n\n// BEGIN: User Solution\nclass Solution {\npublic:\n    int maxSubarraySum(vector<int>& arr) {\n        // Write your code here\n        return 0;\n    }\n};\n// END: User Solution\n\nint main() {\n  string line;\n  if (getline(cin, line)) {\n    if (line.front() == '[') line = line.substr(1);\n    if (line.back() == ']') line = line.substr(0, line.length() - 1);\n    if (line.empty()) {\n      vector<int> empty;\n      Solution sol;\n      cout << sol.maxSubarraySum(empty);\n      return 0;\n    }\n    stringstream ss(line);\n    string item;\n    vector<int> arr;\n    while (getline(ss, item, ',')) {\n      arr.push_back(stoi(item));\n    }\n    Solution sol;\n    cout << sol.maxSubarraySum(arr);\n  }\n  return 0;\n}` 
      : `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n// BEGIN: User Solution\nclass Solution {\npublic:\n    int firstUniqChar(string s) {\n        // Write your code here\n        return -1;\n    }\n};\n// END: User Solution\n\nint main() {\n  string s;\n  if (cin >> s) {\n    if (s.front() == '"' && s.back() == '"') {\n      s = s.substr(1, s.length() - 2);\n    }\n    Solution sol;\n    cout << sol.firstUniqChar(s);\n  }\n  return 0;\n}`
  };
  return templates[language] || templates["JavaScript"];
};

const generateQuestions = async (role, difficulty, interviewType = "standard", language = "JavaScript", resumeText = "") => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    let resumeContext = "";
    if (resumeText && resumeText.trim()) {
      resumeContext = `
The candidate has provided the following Resume/CV details:
"""
${resumeText.trim()}
"""

Generate questions that directly assess the candidate's actual projects, technical stacks, work experience, or achievements listed in their resume. Frame the questions around how they built those projects or handled technologies mentioned in their resume, matching the target role (${role}) and difficulty (${difficulty}).
`;
    }

    let prompt = "";
    if (interviewType === "oa") {
      prompt = `
${resumeContext}
You are an expert examiner designing an Online Assessment (OA) test for the role of ${role} at ${difficulty} level.
Generate exactly 12 Multiple Choice Questions (MCQs) distributed evenly across these categories:
1. Aptitude Questions (general aptitude related to tech/job)
2. Logical Reasoning (puzzles, sequences, logic flow)
3. Quantitative Aptitude (math, metrics, probability, estimations)
4. Verbal Ability (comprehension, grammar, professional communication)

For each question, return a JSON object with:
- "questionText": The text of the question.
- "options": An array of exactly 4 strings (options).
- "correctOptionIndex": The index (0, 1, 2, or 3) of the correct option.
- "category": The category name (e.g., "Aptitude", "Logical Reasoning", "Quantitative Aptitude", "Verbal Ability").
- "explanation": Brief explanation of why the correct option is right.

Return ONLY a valid JSON array of 12 objects.
`;
    } else if (interviewType === "code") {
      prompt = `
${resumeContext}
You are a Senior Technical Interviewer designing an Online Assessment (OA).
Generate exactly 3 diverse challenges for the candidate.

Role: ${role}
Difficulty: ${difficulty}
Target Coding Language: ${language}

The 3 challenges MUST consist of:
1. Challenge 1: A Data Structures & Algorithms (DSA) problem (e.g. Array, String, Stack/Queue, Graph, or DP) framed around the target role's typical scenarios.
2. Challenge 2: A practical Job-Role Specific implementation challenge (e.g., parsing configs, sanitizing HTML/SQL input, formatting data streams, token-bucket rate limiter logic, etc. matching a ${role}).
3. Challenge 3: An Aptitude, Logic, or Job-Role Conceptual problem (e.g. calculating probability, networking subnet calculations, big-O complexity deduction, or system throughput estimation). The candidate will write a simple function returning the final answer (e.g., choice option or calculated number).

For each challenge, return a JSON object with:
1. "questionText": The description of the coding challenge. Frame it with these exact markdown sections:
   ### 📝 Problem Description
   [Detailed description of the problem/situation]

   ### 💡 Input/Output Explanation
   [Explain parameter inputs, expectations, and return value types]

   ### ⚙️ Constraints
   - [List constraints like sizes, time limits, memory limits]

   ### 🔍 Example Walkthrough
   - **Example 1**:
     - **Input**: ...
     - **Output**: ...
     - **Explanation**: ...
2. "template": Starter code template matching the function signature for ${language}. It MUST include a function named "solve" (e.g. in Python: "def solve(input):", in JS/TS: "function solve(input) { ... }", in C++/Java: matching function signature solve returning a type and accepting input).
3. "testCases": An array of exactly 4 test cases.
For each coding question, return a JSON object with:
1. "title": A short, descriptive title (e.g. "Validate JSON Schema", "Optimized Cache Eviction").
2. "description": A detailed markdown problem description.
3. "constraints": A list of code constraints, array sizes, values, and memory/time limit details.
4. "examples": Markdown listing example inputs, outputs, and walks through the calculation.
5. "questionText": The compiled full markdown prompt containing Title, Description, Constraints, and Examples.
6. "template": Starter code template matching the function signature for ${language}. It MUST include a function named "solve" (e.g. in Python: "def solve(input):", in JS/TS: "function solve(input) { ... }", in C++/Java: matching function signature solve returning a type and accepting input).
7. "testCases": An array of EXACTLY 6 test cases.
   - The first 3 test cases MUST have "isHidden": false (these are public/visible).
   - The remaining 3 test cases MUST have "isHidden": true (these are hidden, used to test edge cases, empty values, and boundaries).
   - Each test case must have:
     - "input": Serialized string or value (e.g., "[1,2,3]" or "leetcode").
     - "expected": Expected return value as string (e.g., "6" or "0").
     - "explanation": Brief explanation of the expected output.

Return ONLY a valid JSON array of 3 objects.
`;
    } else if (interviewType === "design") {
      prompt = `
${resumeContext}
You are an expert System Architect conducting a System Design & Architecture Whiteboard Interview.
Generate exactly 5 deep system design problems/questions that require drawing structural components, sharding, caching, microservices architecture, and sharded storage schemas.

Role: ${role}
Difficulty: ${difficulty}

Each question must be a string describing a system design challenge.

Return ONLY a JSON array of 5 strings.

Example:
[
  "Design a real-time collaborative document editor like Google Docs...",
  "Design a high-throughput metrics ingestion system like Datadog..."
]
`;
    } else if (interviewType === "tech1") {
      prompt = `
${resumeContext}
You are an expert Technical Interviewer conducting Technical Round 1 for the role of ${role} at ${difficulty} level.
Generate exactly 10 deep technical questions.

These questions MUST be heavily customized and based on the candidate's provided Resume, Projects, Skills, and Technologies context:
- Ask about architectural decisions in their listed projects.
- Ask technical questions about their core skills and how they solve specific challenges using their technologies.
- Focus on practical implementations, database choices, state management, API design, or debugging scenarios related to their stack.

Return ONLY a JSON array of 10 strings.

Example:
[
  "In your React project 'Mock Interview Arena', how did you handle state updates when...",
  "You listed MongoDB as a technology. Explain how you would index the..."
]
`;
    } else if (interviewType === "video") {
      prompt = `
${resumeContext}
You are an expert HR Manager conducting the HR Interview Round for a ${role} position.
Generate exactly 6 behavioral and career fit questions.

You MUST ask questions covering exactly these 6 topics:
1. Strengths (Candidate's core professional and personal strengths)
2. Weaknesses (Area of development and how they address it)
3. Teamwork (Working with diverse teams or challenging teammates)
4. Leadership (Taking initiative, leading a feature, or mentoring)
5. Conflict Resolution (Handling professional disagreements or project stalls)
6. Career Goals (Where they see themselves in 2-5 years)

Return ONLY a JSON array of 6 strings.

Example:
[
  "What do you consider to be your greatest professional strength, and how has it helped you succeed in your projects?",
  "Describe a time when you had to resolve a conflict within your software development team. What was the situation and how did you handle it?"
]
`;
    } else {
      prompt = `
${resumeContext}
Generate exactly 5 conceptual interview questions.

Role: ${role}
Difficulty: ${difficulty}
Format: ${interviewType === "video" ? "technical and behavioral spoken questions" : "conceptual technical questions"}

Return ONLY a JSON array of strings.

Example:
[
  "What is middleware in Express?",
  "Explain authentication with JWT."
]
`;
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned);
    if (interviewType === "oa" && Array.isArray(parsed)) {
      return parsed.map(q => ({
        ...q,
        marks: q.marks !== undefined ? q.marks : 1
      }));
    }
    return parsed;
  } catch (error) {
    console.error("Gemini API generateQuestions error, falling back to static questions:", error.message);
    
    // Extract simple keywords from resumeText to customize the fallback questions if API fails
    const lowerResume = (resumeText || "").toLowerCase();
    const hasReact = lowerResume.includes("react") || lowerResume.includes("frontend") || lowerResume.includes("web");
    const hasNode = lowerResume.includes("node") || lowerResume.includes("backend") || lowerResume.includes("express");

    // Fallback static mock questions based on round type
    if (interviewType === "design") {
      return [
        "Design a real-time messaging pipeline like Slack supporting horizontal sharding, web sockets, and caching layers.",
        "Design a scalable metrics ingestion and alert routing pipeline like Datadog to handle 10M+ operations per second.",
        "Design a high-volume global URL shortening service like Bitly with low latency reads and analytics sharding.",
        "Design a multi-region distributed photo sharing system like Instagram with CDN caching and database sharding.",
        "Design a reliable distributed file storage system like Dropbox with chunking, upload resume, and file synchronization."
      ];
    } else if (interviewType === "tech1") {
      return [
        `In your experience with ${role} technologies, how do you optimize database queries or API response times under high concurrency?`,
        `Describe a challenging software project you worked on. What architectural trade-offs did you make, and how did you choose your database and tech stack?`,
        `Explain how you handle state management or distributed cache consistency in a web application.`,
        `How do you secure endpoints against common vulnerabilities like CSRF, XSS, or SQL injection?`,
        `Explain how you configure and monitor error reporting and crash analysis in a production environment.`,
        `Describe your approach to designing a modular and testable component hierarchy or package structure.`,
        `How do you handle background processing, message queuing, or scheduling in your projects?`,
        `Discuss how you write clean, maintainable unit and integration tests for your core business logic.`,
        `How do you handle authentication, session state, and secure tokens (like JWT) in a production app?`,
        `Explain the difference between synchronous execution and asynchronous event loops in your primary programming language.`
      ];
    } else if (interviewType === "oa") {
      const fallbackOa = [
        {
          questionText: "If a coding team of 3 developers can complete a project in 12 days, how many days will it take 4 developers to complete the same project at the same rate?",
          options: ["6 days", "8 days", "9 days", "10 days"],
          correctOptionIndex: 2,
          category: "Quantitative Aptitude",
          explanation: "Total developer-days required = 3 * 12 = 36 developer-days. For 4 developers: 36 / 4 = 9 days."
        },
        {
          questionText: "A box contains 5 red, 4 blue, and 3 green balls. If two balls are drawn at random without replacement, what is the probability that both are blue?",
          options: ["1/11", "3/22", "1/9", "4/33"],
          correctOptionIndex: 0,
          category: "Quantitative Aptitude",
          explanation: "Probability of first blue = 4/12. Probability of second blue = 3/11. Total probability = (4/12) * (3/11) = 1/11."
        },
        {
          questionText: "Complete the sequence: 2, 6, 12, 20, 30, ?",
          options: ["36", "40", "42", "48"],
          correctOptionIndex: 2,
          category: "Logical Reasoning",
          explanation: "The differences between consecutive numbers are 4, 6, 8, 10, so the next difference must be 12. 30 + 12 = 42."
        },
        {
          questionText: "Look at this series: U32, V29, _, X23, Y20. What number should fill the blank?",
          options: ["W26", "W25", "V26", "X26"],
          correctOptionIndex: 0,
          category: "Logical Reasoning",
          explanation: "The letters move forward: U, V, W, X, Y. The numbers decrease by 3: 32, 29, 26, 23, 20. Thus, W26."
        },
        {
          questionText: "Which of the following is the most suitable synonym for 'Precise' in a technical requirements context?",
          options: ["Vague", "Accurate", "Approximate", "General"],
          correctOptionIndex: 1,
          category: "Verbal Ability",
          explanation: "Precise means marked by exactness and accuracy, so 'Accurate' is the correct synonym."
        },
        {
          questionText: "Identify the correct sentence structure for a pull request review request:",
          options: [
            "I have completed the task, please to review my code when you got time.",
            "I have completed the task; please review my code when you have time.",
            "I completed task, review my code if you have time.",
            "Completed task please code review when time."
          ],
          correctOptionIndex: 1,
          category: "Verbal Ability",
          explanation: "Option B is grammatically correct and uses professional tone and punctuation."
        },
        {
          questionText: "In git, what is the primary purpose of 'git rebase' compared to 'git merge'?",
          options: [
            "To rewrite commits onto a new base branch to maintain a clean linear history.",
            "To completely delete history of the branches.",
            "To upload changes to remote servers faster.",
            "To copy files from another directory without tracking."
          ],
          correctOptionIndex: 0,
          category: "Aptitude",
          explanation: "Git rebase reapplies commits on top of another base tip to achieve a linear project history."
        },
        {
          questionText: "Which database index structure is most efficient for handling range queries in a relational database?",
          options: ["Hash Index", "B-Tree Index", "Inverted Index", "Bitmap Index"],
          correctOptionIndex: 1,
          category: "Aptitude",
          explanation: "B-Tree indexes maintain sorted keys, which makes them optimal for range selections (e.g. BETWEEN, >, <)."
        }
      ];
      return fallbackOa.map(q => ({ ...q, marks: 1 }));
    } else if (interviewType === "code") {
      const generate20HiddenCases = (type, qNum) => {
        const cases = [];
        for (let i = 1; i <= 20; i++) {
          if (qNum === 1) {
            const inputs = [
              '"a"', '"ab"', '"aba"', '"abab"', '"abcde"', '"abcdea"', '"aabbc"', '"ccdd"', '"xyz"', '"xxyyzz"',
              '"abcdefg"', '"gfedcba"', '"aab"', '"baa"', '"abba"', '"z"', '"zz"', '"pqp"', '"q"', '"abcabc"'
            ];
            const expecteds = ["0", "0", "1", "-1", "0", "1", "4", "-1", "0", "-1", "0", "0", "2", "0", "-1", "0", "-1", "1", "0", "-1"];
            cases.push({
              input: inputs[i - 1] || '"a"',
              expected: expecteds[i - 1] || '0',
              explanation: "Hidden test case evaluation.",
              isHidden: true
            });
          } else if (qNum === 2) {
            const inputs = [
              '"()"', '"()[]{}"', '"(]"', '"([)]"', '"{[]}"', '""', '"["', '"]"', '"{}"', '"[]"',
              '"(({}))"', '"((("', '")))"', '"(([]))"', '"[({})]"', '"({[()]}())"', '"{"', '"}"', '"()()"', '"[][]"'
            ];
            const expecteds = [
              '"true"', '"true"', '"false"', '"false"', '"true"', '"true"', '"false"', '"false"', '"true"', '"true"',
              '"true"', '"false"', '"false"', '"true"', '"true"', '"true"', '"false"', '"false"', '"true"', '"true"'
            ];
            cases.push({
              input: inputs[i - 1] || '"()"',
              expected: expecteds[i - 1] || '"true"',
              explanation: "Hidden test case evaluation.",
              isHidden: true
            });
          } else {
            const inputs = [
              '"[1]"', '"[-1]"', '"[1,2,3]"', '"[-2,1,-3]"', '"[5,4,-1]"', '"[]"', '"[-5]"', '"[0]"', '"[3,-2,5]"', '"[-1,2,-1,3]"',
              '"[10,-5,6]"', '"[-2,-1,-3]"', '"[2,2,2]"', '"[1,2,-4,5,6]"', '"[8]"', '"[-9]"', '"[1,2,3,4,5]"', '"[-1,0,1]"', '"[100]"', '"[-100]"'
            ];
            const expecteds = [
              "1", "0", "6", "1", "9", "0", "0", "0", "6", "4",
              "11", "0", "6", "11", "8", "0", "15", "1", "100", "0"
            ];
            cases.push({
              input: inputs[i - 1] || '"[]"',
              expected: expecteds[i - 1] || '0',
              explanation: "Hidden test case evaluation.",
              isHidden: true
            });
          }
        }
        return cases;
      };

      return [
        {
          title: "First Unique Character",
          description: "Write a function `solve` to find the first non-repeating character in a string and return its index (0-indexed). If it does not exist, return -1.",
          constraints: "- 1 <= s.length <= 10^5\n- s consists of only lowercase English letters.",
          examples: "**Example 1**:\n- **Input**: \"leetcode\"\n- **Output**: 0\n- **Explanation**: 'l' is the first unique character.",
          questionText: "### 📝 Problem Description\nWrite a function `solve` to find the first non-repeating character in a string and return its index (0-indexed). If it does not exist, return -1.\n\n### ⚙️ Constraints\n- 1 <= s.length <= 10^5\n- s consists of only lowercase English letters.\n\n### 🔍 Example Walkthrough\n- **Example 1**:\n  - **Input**: \"leetcode\"\n  - **Output**: 0\n  - **Explanation**: 'l' is the first unique character.",
          template: getFallbackCodeTemplate(language, "string"),
          testCases: [
            { input: '"leetcode"', expected: '0', explanation: 'l is the first unique character.', isHidden: false },
            { input: '"loveleetcode"', expected: '2', explanation: 'v is the first unique character.', isHidden: false },
            { input: '"aabb"', expected: '-1', explanation: 'No unique characters exist.', isHidden: false },
            ...generate20HiddenCases("string", 1)
          ]
        },
        {
          title: "Valid Parentheses",
          description: "Write a function `solve` that takes a string containing brackets '(', ')', '{', '}', '[' and ']' and checks if it is valid. An input string is valid if brackets close in the correct order. Return \"true\" or \"false\" as a string.",
          constraints: "- 1 <= s.length <= 10^4\n- s consists of brackets only.",
          examples: "**Example 1**:\n- **Input**: \"()\"\n- **Output**: \"true\"",
          questionText: "### 📝 Problem Description\nWrite a function `solve` that takes a string containing brackets '(', ')', '{', '}', '[' and ']' and checks if it is valid.\n\n### ⚙️ Constraints\n- 1 <= s.length <= 10^4\n- s consists of brackets only.\n\n### 🔍 Example Walkthrough\n- **Example 1**:\n  - **Input**: \"()\"\n  - **Output**: \"true\"",
          template: getFallbackCodeTemplate(language, "string"),
          testCases: [
            { input: '"()"', expected: '"true"', explanation: 'Correctly closed simple parentheses.', isHidden: false },
            { input: '"()[]{}"', expected: '"true"', explanation: 'All matching brackets are valid.', isHidden: false },
            { input: '"(]"', expected: '"false"', explanation: 'Mismatched closing bracket.', isHidden: false },
            ...generate20HiddenCases("string", 2)
          ]
        },
        {
          title: "Maximum Subarray Sum",
          description: "Write a function `solve` that takes an array of integers (passed as a JSON array string e.g. \"[-2,1,-3,4,-1,2,1,-5,4]\") and returns the maximum subarray sum (Kadane's algorithm). If the array contains only negative numbers, return 0.",
          constraints: "- 0 <= arr.length <= 10^5\n- -10^4 <= arr[i] <= 10^4",
          examples: "**Example 1**:\n- **Input**: \"[-2,1,-3,4,-1,2,1,-5,4]\"\n- **Output**: 6\n- **Explanation**: [4,-1,2,1] has the largest sum = 6.",
          questionText: "### 📝 Problem Description\nWrite a function `solve` that takes an array of integers and returns the maximum subarray sum. If the array contains only negative numbers or is empty, return 0.\n\n### ⚙️ Constraints\n- 0 <= arr.length <= 10^5\n- -10^4 <= arr[i] <= 10^4\n\n### 🔍 Example Walkthrough\n- **Example 1**:\n  - **Input**: \"[-2,1,-3,4,-1,2,1,-5,4]\"\n  - **Output**: 6\n  - **Explanation**: [4,-1,2,1] has the largest sum = 6.",
          template: getFallbackCodeTemplate(language, "array"),
          testCases: [
            { input: '"[-2,1,-3,4,-1,2,1,-5,4]"', expected: '6', explanation: '[4,-1,2,1] has the largest sum = 6.', isHidden: false },
            { input: '"[5,4,-1,7,8]"', expected: '23', explanation: 'Sum of all positive elements is 23.', isHidden: false },
            { input: '"[-1,-2,-3]"', expected: '0', explanation: 'Only negative numbers, return 0.', isHidden: false },
            ...generate20HiddenCases("array", 3)
          ]
        }
      ];
    } else if (interviewType === "video") {
      return [
        "What do you consider your greatest professional strengths, and how do they align with this role?",
        "Tell me about a technical or professional weakness you have identified and the steps you have taken to improve.",
        "Describe a time when you had to work closely with a cross-functional team. How did you handle differences of opinion or communication barriers?",
        "Share an example of a situation where you demonstrated leadership or took initiative to solve a critical issue.",
        "How do you handle conflicts or disagreements with a peer or manager regarding architectural decisions?",
        "What are your long-term career goals, and how does this position fit into your professional journey?"
      ];
    } else {
      return [
        `Tell me about your experience as a ${role}. What are the primary technologies you use?`,
        hasReact 
          ? `Explain your experience optimizing React component rendering and state updates in your projects.` 
          : `Explain the difference between functional design patterns and OOP concepts in a ${difficulty} environment.`,
        hasNode 
          ? `How do you handle asynchronous performance bottlenecks and event loops in Node.js applications?` 
          : `How do you optimize performance and manage state lifecycle constraints in your projects?`,
        `Describe your approach to database scaling, connection pooling, and query optimization.`,
        `What security best practices do you implement when developing APIs and user authentication flows?`
      ];
    }
  }
};

const evaluateAnswer = async (question, answer, interviewType = "standard") => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    let prompt = "";
    if (interviewType === "video") {
      prompt = `
You are a Senior HR Interviewer and Communication Coach.
Analyze the candidate's spoken response to the given behavioral HR question.

Question:
${question}

Candidate Answer:
${answer}

Perform a rigorous behavioral and communication evaluation. Return a JSON object with:
1. "score": Technical correctness/relevance rating (0 to 10).
2. "communicationScore": Rating for articulation, speech flow, clarity, and pacing (0 to 10).
3. "confidenceScore": Rating of candidate's confidence level, word choice, and structural conviction (0 to 10).
4. "professionalismScore": Rating for professional posture, vocabulary correctness, and respect (0 to 10).
5. "feedback": Feedback on technical content and alignment of their answers with the job role.
6. "communicationFeedback": Detailed analysis of communication delivery, verbal habits (e.g. use of fillers, pace), and confidence improvements.
7. "idealAnswer": Standard structured response matching STAR (Situation, Task, Action, Result) methodology.
8. "keyPoints": Top 3-4 key behavioral points that should be included in an ideal response.
9. "missingPoints": Points they failed to mention.
10. "howToSay": Actionable coaching advice showing the candidate how to rephrase or tell their story better.

Return ONLY a valid JSON object matching the schema.
`;
    } else {
      prompt = `
You are a Senior Technical Interviewer and Communication Coach.
Analyze the candidate's answer to the given question.

Question:
${question}

Candidate Answer:
${answer}

Perform a rigorous evaluation and return a JSON object with:
1. "score": An integer score from 0 to 10 evaluating the correctness and depth of the answer.
2. "feedback": A detailed critique explaining what was good, what was incorrect, and actionable suggestions for improvement.
3. "idealAnswer": A concise, original, industry-standard ideal answer to the question that explains key concepts and code/design constraints clearly.
4. "keyPoints": A JSON array of strings containing the top 3-4 key technical points or conceptual pillars that must be mentioned in an ideal answer.
5. "missingPoints": A JSON array of strings containing those points from "keyPoints" that the candidate did NOT cover or mention sufficiently.
6. "howToSay": A short, practical guideline or exact quote showing the candidate how to articulate or phrase this response eloquently and confidently in a real-time interview.

Return ONLY a valid JSON object matching the schema.
`;
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini API evaluateAnswer error:", error.message);
    return {
      score: 5,
      communicationScore: 5,
      confidenceScore: 5,
      professionalismScore: 5,
      feedback: "AI evaluation unavailable; using neutral fallback score.",
      communicationFeedback: "No AI feedback available.",
      idealAnswer: "",
      keyPoints: [],
      missingPoints: [],
      howToSay: "",
    };
  }
};

const analyzeResume = async (resumeText) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are an expert Technical Recruiter and Career Coach.
Analyze the following resume details:
"""
${resumeText}
"""

Perform a detailed engineering career match assessment. Return a JSON object with:
1. "matchPercentage": An integer from 0 to 100 indicating how well this resume matches modern industry requirements for a software engineer.
2. "roleMatched": A suggested specialized engineering title (e.g. "Senior React Developer", "Fullstack Node.js Engineer", "Python Data Engineer").
3. "skillsDetected": A JSON array of up to 10 key technical skills, languages, or tools found in the resume.
4. "missingKeywords": A JSON array of 3-5 critical technical skills or tools that are missing but highly sought after in the industry for their target role.
5. "suggestions": A detailed, actionable recommendation (1-2 sentences) on how they can improve their resume presentation, project metrics, or certification focus.

Return ONLY a valid JSON object matching this structure.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini API analyzeResume error, using heuristic parser:", error.message);
    
    // Heuristic parsing based on keywords
    const lower = (resumeText || "").toLowerCase();
    const skills = [];
    if (lower.includes("react")) skills.push("React");
    if (lower.includes("javascript") || lower.includes("js")) skills.push("JavaScript");
    if (lower.includes("typescript") || lower.includes("ts")) skills.push("TypeScript");
    if (lower.includes("node")) skills.push("Node.js");
    if (lower.includes("python")) skills.push("Python");
    if (lower.includes("sql") || lower.includes("postgres")) skills.push("SQL");
    if (lower.includes("mongo")) skills.push("MongoDB");
    if (lower.includes("docker")) skills.push("Docker");
    if (lower.includes("aws")) skills.push("AWS");
    
    if (skills.length === 0) {
      skills.push("Software Engineering", "Problem Solving");
    }

    const matchedRole = skills.includes("React") 
      ? "Frontend Software Engineer" 
      : skills.includes("Node.js") 
      ? "Backend Node.js Developer" 
      : "Software Engineer";

    const targetGaps = [];
    if (!skills.includes("Docker")) targetGaps.push("Docker Containerization");
    if (!skills.includes("AWS")) targetGaps.push("Cloud Infrastructure (AWS/GCP)");
    if (!skills.includes("TypeScript")) targetGaps.push("TypeScript Static Typing");
    if (targetGaps.length === 0) targetGaps.push("System Design Architecture", "CI/CD Pipelines");

    return {
      matchPercentage: Math.min(60 + skills.length * 5, 95),
      roleMatched: matchedRole,
      skillsDetected: skills.slice(0, 10),
      missingKeywords: targetGaps.slice(0, 4),
      suggestions: "Highlight key system architectures you designed and write quantitative project descriptions."
    };
  }
};

const extractResumeData = async (resumeText) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are an expert resume parser.
Analyze the following resume details:
"""
${resumeText}
"""

Extract the following information and return exactly a JSON object matching this structure:
{
  "skills": ["List of core skills found"],
  "projects": ["List of notable projects"],
  "technologies": ["List of software tools/technologies"],
  "experience": ["List of work experiences or roles"],
  "education": ["List of education details or schools"],
  "summary": "A concise professional summary of the candidate's career background (max 3 sentences)."
}

Return ONLY a valid JSON object.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini API extractResumeData error:", error.message);
    
    // Heuristic fallbacks if API is offline
    const lower = (resumeText || "").toLowerCase();
    const skills = [];
    if (lower.includes("react")) skills.push("React");
    if (lower.includes("javascript") || lower.includes("js")) skills.push("JavaScript");
    if (lower.includes("typescript") || lower.includes("ts")) skills.push("TypeScript");
    if (lower.includes("node")) skills.push("Node.js");
    if (lower.includes("python")) skills.push("Python");
    if (lower.includes("sql")) skills.push("SQL");
    if (skills.length === 0) skills.push("Software Engineering");

    return {
      skills,
      projects: ["Personal Portfolio Project", "Mock Interview Arena"],
      technologies: ["Git", "VS Code", ...skills],
      experience: ["Software Developer Internship", "Open Source Contributor"],
      education: ["Bachelor of Science in Computer Science"],
      summary: "Aspiring software developer with a focus on web technologies, responsive UI development, and data-driven systems."
    };
  }
};

const generateSingleCodingQuestion = async (role = "Software Engineer", difficulty = "Medium", category = "DSA", existingTitles = []) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const isMixed = category.toLowerCase() === "mixed topics";

    const prompt = `
You are a Senior Technical Interviewer designing a coding challenge.
Generate a coding challenge matching:
Role: ${role}
Difficulty: ${difficulty}
Category / Primary Topic: ${category}

CRITICAL RULES:
1. TOPIC STRICTNESS:
   - If the category is NOT 'Mixed Topics' (e.g. 'Arrays'), you MUST generate a coding challenge that strictly focuses on that topic (e.g. Arrays). Do NOT generate a Graph, Tree, or Dynamic Programming problem when 'Arrays' is selected.
   - If the category is 'Mixed Topics', you must design a challenge that combines two or more different DSA concepts (e.g. Array + Two Pointers, Stack + Queue, Dynamic Programming + Graph, Trees + DFS, etc.).
2. AVOID DUPLICATES:
   - You MUST NOT generate any of the following existing questions (by title or core challenge): ${JSON.stringify(existingTitles)}. Design a completely unique question.

The response must be a JSON object with the following fields:
1. "title": A short title for the question.
2. "description": The markdown problem description. Write it in clear markdown explaining the task. Do NOT include separate sections for constraints and examples inside this description, as they will be rendered separately.
3. "constraints": Array of strings representing constraints (e.g. array sizes, values, memory/time limit details).
4. "examples": Array of objects, each containing:
   - "input": parameter details as a string (e.g., "nums = [2,7,11,15]\\ntarget = 9")
   - "output": expected return as a string (e.g., "[0,1]")
   - "explanation": brief explanation of the result
5. "visibleTestCases": Array of exactly 3 objects:
   - "label": "Test Case 1", "Test Case 2", etc.
   - "input": raw standard input string (e.g., "4\\n2 7 11 15\\n9")
   - "expected": exact expected output printed to stdout (e.g., "0 1")
6. "hiddenTestCases": Array of exactly 20 objects:
   - "label": "Hidden Case 1", "Hidden Case 2", etc.
   - "input": raw standard input string
   - "expected": exact expected output printed to stdout
7. "expectedTimeComplexity": Expected time complexity as a string (e.g., "O(n)").
8. "expectedSpaceComplexity": Expected space complexity as a string (e.g., "O(n)").
9. "tags": Array of strings representing the DSA tags/topics for this question (e.g. ["Arrays", "Two Pointers"]). If 'Mixed Topics' was requested, include the specific tags that are combined.
10. "functionName": The name of the main function to be solved (e.g. "maxSubarraySum" or "firstUniqChar").
11. "returnType": The return type of the main function (e.g. "int", "string", "vector<int>", "number[]").
12. "starterCode": A JSON object containing starter code templates for these 4 keys exactly: "cpp", "java", "python", "javascript".
    - The template MUST ONLY contain the Solution class/function definition itself, completely unsolved, containing only a comment (e.g. "// Write your code here") and a placeholder return statement (like return 0, return [], or pass).
    - It must NOT contain imports, main(), input parsing, output printing, or custom driver wrappers.
13. "driverCode": A JSON object containing helper execution templates for these 4 keys exactly: "cpp", "java", "python", "javascript".
    - The driver template handles reading input from stdin, parsing it into the required variables, instantiating the Solution class, calling the target function on the instance with parameters, and printing the returned result directly to standard output.
    - Example for C++ driver code:
      "int main() { int m, n; if (cin >> m >> n) { Solution sol; cout << sol.uniquePaths(m, n); } return 0; }"
    - Example for Java driver code:
      "class Main { public static void main(String[] args) { Scanner sc = new Scanner(System.in); if (sc.hasNextInt()) { int m = sc.nextInt(); int n = sc.nextInt(); Solution sol = new Solution(); System.out.println(sol.uniquePaths(m, n)); } } }"
    - Example for Python driver code:
      "if __name__ == '__main__':\n    import sys\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        parts = list(map(int, lines[0].split()))\n        sol = Solution()\n        print(sol.uniquePaths(parts[0], parts[1]))"
    - Example for JavaScript driver code:
      "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8');\nconst lines = input.trim().split('\\n');\nif (lines.length > 0) {\n  const parts = lines[0].trim().split(/\\s+/).map(Number);\n  const sol = new Solution();\n  console.log(sol.uniquePaths(parts[0], parts[1]));\n}"

Make sure the stdin format matches the expected inputs. For example, if it's a list and a target, the stdin could be:
Line 1: N (number of elements)
Line 2: Space-separated array of N elements
Line 3: Target value

Return ONLY a valid JSON object matching this structure. Do NOT include markdown code blocks.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini Coding Generation failed, choosing topic fallback:", error.message);
    
    // Predefined professional fallbacks categorized by topic
    const fallbacks = {
      "arrays": {
        title: "Container With Most Water",
        description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
        constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
        examples: [{ input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "The max area of water the container can contain is 49." }],
        visibleTestCases: [
          { label: "Test Case 1", input: "9\n1 8 6 2 5 4 8 3 7", expected: "49" },
          { label: "Test Case 2", input: "2\n1 1", expected: "1" },
          { label: "Test Case 3", input: "4\n4 3 2 1", expected: "4" }
        ],
        hiddenTestCases: Array.from({ length: 20 }, (_, i) => ({
          label: `Hidden Case ${i + 1}`,
          input: `5\n${2 + i} 1 5 1 ${3 + i}`,
          expected: `${Math.min(2 + i, 3 + i) * 4}`
        })),
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
        tags: ["Arrays", "Two Pointers"],
        functionName: "maxArea",
        returnType: "int",
        starterCode: {
          javascript: `class Solution {\n  maxArea(height) {\n    // Write your code here\n    return 0;\n  }\n}`,
          python: `class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        # Write your code here\n        return 0`,
          cpp: `class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Write your code here\n        return 0;\n    }\n};`,
          java: `class Solution {\n    public int maxArea(int[] height) {\n        // Write your code here\n        return 0;\n    }\n}`
        },
        driverCode: {
          javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8');\nconst lines = input.trim().split('\\n');\nif (lines.length > 1) {\n  const height = lines[1].trim().split(/\\s+/).map(Number);\n  const sol = new Solution();\n  console.log(sol.maxArea(height));\n}`,
          python: `import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) > 1:\n    height = list(map(int, lines[1].split()))\n    sol = Solution()\n    print(sol.maxArea(height))`,
          cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n; if (cin >> n) {\n        vector<int> h(n); for(int i=0; i<n; ++i) cin >> h[i];\n        Solution sol; cout << sol.maxArea(h);\n    } return 0;\n}`,
          java: `import java.util.*;\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] h = new int[n];\n            for (int i=0; i<n; i++) h[i] = sc.nextInt();\n            Solution sol = new Solution();\n            System.out.println(sol.maxArea(h));\n        }\n    }\n}`
        }
      },
      "strings": {
        title: "Longest Palindromic Substring",
        description: "Given a string s, return the longest palindromic substring in s.",
        constraints: ["1 <= s.length <= 1000", "s consists of only digits and English letters."],
        examples: [{ input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' }],
        visibleTestCases: [
          { label: "Test Case 1", input: "babad", expected: "bab" },
          { label: "Test Case 2", input: "cbbd", expected: "bb" },
          { label: "Test Case 3", input: "a", expected: "a" }
        ],
        hiddenTestCases: Array.from({ length: 20 }, (_, i) => ({
          label: `Hidden Case ${i + 1}`,
          input: `${"a".repeat(i + 2)}b`,
          expected: `${"a".repeat(i + 2)}`
        })),
        expectedTimeComplexity: "O(n^2)",
        expectedSpaceComplexity: "O(1)",
        tags: ["Strings", "Dynamic Programming"],
        functionName: "longestPalindrome",
        returnType: "string",
        starterCode: {
          javascript: `class Solution {\n  longestPalindrome(s) {\n    // Write your code here\n    return "";\n  }\n}`,
          python: `class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        # Write your code here\n        return ""`,
          cpp: `class Solution {\npublic:\n    string longestPalindrome(string s) {\n        // Write your code here\n        return "";\n    }\n};`,
          java: `class Solution {\n    public String longestPalindrome(String s) {\n        // Write your code here\n        return "";\n    }\n}`
        },
        driverCode: {
          javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst sol = new Solution();\nconsole.log(sol.longestPalindrome(input));`,
          python: `import sys\ninput_str = sys.stdin.read().strip()\nsol = Solution()\nprint(sol.longestPalindrome(input_str))`,
          cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s; if (cin >> s) {\n        Solution sol; cout << sol.longestPalindrome(s);\n    } return 0;\n}`,
          java: `import java.util.*;\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            Solution sol = new Solution();\n            System.out.println(sol.longestPalindrome(s));\n        }\n    }\n}`
        }
      },
      "dynamic programming": {
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        constraints: ["1 <= n <= 45"],
        examples: [{ input: "n = 3", output: "3", explanation: "There are three ways to climb to the top: 1 step + 1 step + 1 step, 1 step + 2 steps, or 2 steps + 1 step." }],
        visibleTestCases: [
          { label: "Test Case 1", input: "2", expected: "2" },
          { label: "Test Case 2", input: "3", expected: "3" },
          { label: "Test Case 3", input: "4", expected: "5" }
        ],
        hiddenTestCases: Array.from({ length: 20 }, (_, i) => ({
          label: `Hidden Case ${i + 1}`,
          input: `${5 + i}`,
          expected: `${Math.round((Math.pow((1 + Math.sqrt(5)) / 2, 6 + i) - Math.pow((1 - Math.sqrt(5)) / 2, 6 + i)) / Math.sqrt(5))}`
        })),
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
        tags: ["Dynamic Programming"],
        functionName: "climbStairs",
        returnType: "int",
        starterCode: {
          javascript: `class Solution {\n  climbStairs(n) {\n    // Write your code here\n    return 0;\n  }\n}`,
          python: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        # Write your code here\n        return 0`,
          cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your code here\n        return 0;\n    }\n};`,
          java: `class Solution {\n    public int climbStairs(int n) {\n        // Write your code here\n        return 0;\n    }\n}`
        },
        driverCode: {
          javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst sol = new Solution();\nconsole.log(sol.climbStairs(Number(input)));`,
          python: `import sys\ninput_str = sys.stdin.read().strip()\nsol = Solution()\nprint(sol.climbStairs(int(input_str)))`,
          cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int n; if (cin >> n) {\n        Solution sol; cout << sol.climbStairs(n);\n    } return 0;\n}`,
          java: `import java.util.*;\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            Solution sol = new Solution();\n            System.out.println(sol.climbStairs(n));\n        }\n    }\n}`
        }
      },
      "linked list": {
        title: "Reverse Linked List",
        description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        constraints: ["The number of nodes in the list is the range [0, 5000].", "-5000 <= Node.val <= 5000"],
        examples: [{ input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "The reversed list is [5,4,3,2,1]" }],
        visibleTestCases: [
          { label: "Test Case 1", input: "5\n1 2 3 4 5", expected: "5 4 3 2 1" },
          { label: "Test Case 2", input: "2\n1 2", expected: "2 1" },
          { label: "Test Case 3", input: "0\n", expected: "" }
        ],
        hiddenTestCases: Array.from({ length: 20 }, (_, i) => ({
          label: `Hidden Case ${i + 1}`,
          input: `${i + 1}\n${Array.from({ length: i + 1 }, (_, k) => k + 10).join(" ")}`,
          expected: `${Array.from({ length: i + 1 }, (_, k) => k + 10).reverse().join(" ")}`
        })),
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
        tags: ["Linked List"],
        functionName: "reverseList",
        returnType: "ListNode",
        starterCode: {
          javascript: `class Solution {\n  reverseList(head) {\n    // Write your code here\n    return null;\n  }\n}`,
          python: `class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        # Write your code here\n        return None`,
          cpp: `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your code here\n        return nullptr;\n    }\n};`,
          java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your code here\n        return null;\n    }\n}`
        },
        driverCode: {
          javascript: `class ListNode {\n  constructor(val = 0, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length > 1 && Number(input[0]) > 0) {\n  const vals = input[1].trim().split(/\\s+/).map(Number);\n  let dummy = new ListNode(0);\n  let curr = dummy;\n  for (const v of vals) {\n    curr.next = new ListNode(v);\n    curr = curr.next;\n  }\n  const sol = new Solution();\n  let res = sol.reverseList(dummy.next);\n  let out = [];\n  while (res) {\n    out.push(res.val);\n    res = res.next;\n  }\n  console.log(out.join(' '));\n} else {\n  console.log('');\n}`,
          python: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\nimport sys\nlines = sys.stdin.read().splitlines()\nif len(lines) > 1 and int(lines[0]) > 0:\n    vals = list(map(int, lines[1].split()))\n    dummy = ListNode(0)\n    curr = dummy\n    for v in vals:\n        curr.next = ListNode(v)\n        curr = curr.next\n    sol = Solution()\n    res = sol.reverseList(dummy.next)\n    out = []\n    while res:\n        out.append(str(res.val))\n        res = res.next\n    print(" ".join(out))\nelse:\n    print("")`,
          cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nstruct ListNode {\n    int val;\n    ListNode *next;\n    ListNode(int x) : val(x), next(NULL) {}\n};\nint main() {\n    int n; if (cin >> n && n > 0) {\n        ListNode* dummy = new ListNode(0);\n        ListNode* curr = dummy;\n        for (int i=0; i<n; ++i) {\n            int v; cin >> v;\n            curr->next = new ListNode(v);\n            curr = curr->next;\n        }\n        Solution sol; ListNode* res = sol.reverseList(dummy->next);\n        while (res) {\n            cout << res->val << (res->next ? " " : "");\n            res = res->next;\n        }\n    } else { cout << ""; }\n    return 0;\n}`,
          java: `import java.util.*;\nclass ListNode {\n    int val;\n    ListNode next;\n    ListNode(int x) { val = x; }\n}\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            if (n <= 0) { System.out.println(""); return; }\n            ListNode dummy = new ListNode(0);\n            ListNode curr = dummy;\n            for (int i=0; i<n; i++) {\n                curr.next = new ListNode(sc.nextInt());\n                curr = curr.next;\n            }\n            Solution sol = new Solution();\n            ListNode res = sol.reverseList(dummy.next);\n            while (res != null) {\n                System.out.print(res.val + (res.next != null ? " " : ""));\n                res = res.next;\n            }\n            System.out.println();\n        } else { System.out.println(""); }\n    }\n}`
        }
      },
      "stack": {
        title: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only."],
        examples: [{ input: 's = "()"', output: "true", explanation: "Matching parentheses." }],
        visibleTestCases: [
          { label: "Test Case 1", input: "()", expected: "true" },
          { label: "Test Case 2", input: "()[]{}", expected: "true" },
          { label: "Test Case 3", input: "(]", expected: "false" }
        ],
        hiddenTestCases: Array.from({ length: 20 }, (_, i) => ({
          label: `Hidden Case ${i + 1}`,
          input: `${"(".repeat(i + 1)}${")".repeat(i + 1)}`,
          expected: "true"
        })),
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)",
        tags: ["Stack"],
        functionName: "isValid",
        returnType: "bool",
        starterCode: {
          javascript: `class Solution {\n  isValid(s) {\n    // Write your code here\n    return false;\n  }\n}`,
          python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your code here\n        return False`,
          cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        return false;\n    }\n};`,
          java: `class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}`
        },
        driverCode: {
          javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst sol = new Solution();\nconsole.log(sol.isValid(input));`,
          python: `import sys\ns = sys.stdin.read().strip()\nsol = Solution()\nprint(str(sol.isValid(s)).lower())`,
          cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s; if (cin >> s) {\n        Solution sol; cout << (sol.isValid(s) ? "true" : "false");\n    } return 0;\n}`,
          java: `import java.util.*;\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            Solution sol = new Solution();\n            System.out.println(sol.isValid(s));\n        }\n    }\n}`
        }
      },
      "queue": {
        title: "First Unique Character",
        description: "Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
        constraints: ["1 <= s.length <= 10^5", "s consists of lowercase English letters."],
        examples: [{ input: 's = "leetcode"', output: "0", explanation: "The first non-repeating character is 'l' at index 0." }],
        visibleTestCases: [
          { label: "Test Case 1", input: "leetcode", expected: "0" },
          { label: "Test Case 2", input: "loveleetcode", expected: "2" },
          { label: "Test Case 3", input: "aabb", expected: "-1" }
        ],
        hiddenTestCases: Array.from({ length: 20 }, (_, i) => ({
          label: `Hidden Case ${i + 1}`,
          input: `${"a".repeat(i + 1)}b${"a".repeat(i + 1)}`,
          expected: `${i + 1}`
        })),
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
        tags: ["Queue", "Hash Table"],
        functionName: "firstUniqChar",
        returnType: "int",
        starterCode: {
          javascript: `class Solution {\n  firstUniqChar(s) {\n    // Write your code here\n    return -1;\n  }\n}`,
          python: `class Solution:\n    def firstUniqChar(self, s: str) -> int:\n        # Write your code here\n        return -1`,
          cpp: `class Solution {\npublic:\n    int firstUniqChar(string s) {\n        // Write your code here\n        return -1;\n    }\n};`,
          java: `class Solution {\n    public int firstUniqChar(String s) {\n        // Write your code here\n        return -1;\n    }\n}`
        },
        driverCode: {
          javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst sol = new Solution();\nconsole.log(sol.firstUniqChar(input));`,
          python: `import sys\ns = sys.stdin.read().strip()\nsol = Solution()\nprint(sol.firstUniqChar(s))`,
          cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s; if (cin >> s) {\n        Solution sol; cout << sol.firstUniqChar(s);\n    } return 0;\n}`,
          java: `import java.util.*;\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            Solution sol = new Solution();\n            System.out.println(sol.firstUniqChar(s));\n        }\n    }\n}`
        }
      },
      "trees": {
        title: "Maximum Depth of Binary Tree",
        description: "Given the root of a binary tree, return its maximum depth. Input is given as space-separated level-order integers where -1 represents null/empty nodes.",
        constraints: ["The number of nodes in the tree is in the range [0, 10^4].", "-100 <= Node.val <= 100"],
        examples: [{ input: "root = [3,9,20,-1,-1,15,7]", output: "3", explanation: "Depth of the tree is 3." }],
        visibleTestCases: [
          { label: "Test Case 1", input: "7\n3 9 20 -1 -1 15 7", expected: "3" },
          { label: "Test Case 2", input: "3\n1 -1 2", expected: "2" },
          { label: "Test Case 3", input: "0\n", expected: "0" }
        ],
        hiddenTestCases: Array.from({ length: 20 }, (_, i) => ({
          label: `Hidden Case ${i + 1}`,
          input: `${i + 1}\n${Array.from({ length: i + 1 }, (_, k) => k).join(" ")}`,
          expected: `${Math.floor(Math.log2(i + 1)) + 1}`
        })),
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(h)",
        tags: ["Trees", "DFS"],
        functionName: "maxDepth",
        returnType: "int",
        starterCode: {
          javascript: `class Solution {\n  maxDepth(root) {\n    // Write your code here\n    return 0;\n  }\n}`,
          python: `class Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        # Write your code here\n        return 0`,
          cpp: `class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        // Write your code here\n        return 0;\n    }\n};`,
          java: `class Solution {\n    public int maxDepth(TreeNode root) {\n        // Write your code here\n        return 0;\n    }\n}`
        },
        driverCode: {
          javascript: `class TreeNode {\n  constructor(val = 0, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\nfunction buildTree(vals) {\n  if (!vals || vals.length === 0 || vals[0] === -1) return null;\n  let root = new TreeNode(vals[0]);\n  let queue = [root];\n  let i = 1;\n  while (queue.length > 0 && i < vals.length) {\n    let curr = queue.shift();\n    if (i < vals.length && vals[i] !== -1) {\n      curr.left = new TreeNode(vals[i]);\n      queue.push(curr.left);\n    }\n    i++;\n    if (i < vals.length && vals[i] !== -1) {\n      curr.right = new TreeNode(vals[i]);\n      queue.push(curr.right);\n    }\n    i++;\n  }\n  return root;\n}\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length > 1 && Number(input[0]) > 0) {\n  const vals = input[1].trim().split(/\\s+/).map(Number);\n  const root = buildTree(vals);\n  const sol = new Solution();\n  console.log(sol.maxDepth(root));\n} else {\n  console.log(0);\n}`,
          python: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef buildTree(vals):\n    if not vals or vals[0] == -1:\n        return None\n    root = TreeNode(vals[0])\n    queue = [root]\n    i = 1\n    while queue and i < len(vals):\n        curr = queue.pop(0)\n        if i < len(vals) and vals[i] != -1:\n            curr.left = TreeNode(vals[i])\n            queue.append(curr.left)\n        i += 1\n        if i < len(vals) and vals[i] != -1:\n            curr.right = TreeNode(vals[i])\n            queue.append(curr.right)\n        i += 1\n    return root\n\nimport sys\nlines = sys.stdin.read().splitlines()\nif len(lines) > 1 and int(lines[0]) > 0:\n    vals = list(map(int, lines[1].split()))\n    root = buildTree(vals)\n    sol = Solution()\n    print(sol.maxDepth(root))\nelse:\n    print(0)`,
          cpp: `#include <iostream>\n#include <vector>\n#include <queue>\nusing namespace std;\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode(int x) : val(x), left(NULL), right(NULL) {}\n};\nTreeNode* buildTree(vector<int>& vals) {\n    if (vals.empty() || vals[0] == -1) return NULL;\n    TreeNode* root = new TreeNode(vals[0]);\n    queue<TreeNode*> q;\n    q.push(root);\n    int i = 1;\n    while (!q.empty() && i < vals.size()) {\n        TreeNode* curr = q.front(); q.pop();\n        if (i < vals.size() && vals[i] != -1) {\n            curr->left = new TreeNode(vals[i]);\n            q.push(curr->left);\n        }\n        i++;\n        if (i < vals.size() && vals[i] != -1) {\n            curr->right = new TreeNode(vals[i]);\n            q.push(curr->right);\n        }\n        i++;\n    }\n    return root;\n}\nint main() {\n    int n; if (cin >> n && n > 0) {\n        vector<int> vals(n); for(int i=0; i<n; ++i) cin >> vals[i];\n        TreeNode* root = buildTree(vals);\n        Solution sol; cout << sol.maxDepth(root);\n    } else { cout << 0; }\n    return 0;\n}`,
          java: `import java.util.*;\nclass TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode(int x) { val = x; }\n}\nclass Main {\n    public static TreeNode buildTree(int[] vals) {\n        if (vals.length == 0 || vals[0] == -1) return null;\n        TreeNode root = new TreeNode(vals[0]);\n        Queue<TreeNode> q = new LinkedList<>();\n        q.add(root);\n        int i = 1;\n        while (!q.isEmpty() && i < vals.length) {\n            TreeNode curr = q.poll();\n            if (i < vals.length && vals[i] != -1) {\n                curr.left = new TreeNode(vals[i]);\n                q.add(curr.left);\n            }\n            i++;\n            if (i < vals.length && vals[i] != -1) {\n                curr.right = new TreeNode(vals[i]);\n                q.add(curr.right);\n            }\n            i++;\n        }\n        return root;\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            if (n <= 0) { System.out.println(0); return; }\n            int[] vals = new int[n];\n            for (int i=0; i<n; i++) vals[i] = sc.nextInt();\n            TreeNode root = buildTree(vals);\n            Solution sol = new Solution();\n            System.out.println(sol.maxDepth(root));\n        } else { System.out.println(0); }\n    }\n}`
        }
      },
      "graphs": {
        title: "Number of Islands",
        description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
        constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 30", "grid[i][j] is '0' or '1'."],
        examples: [{ input: 'grid = [["1","1","0"],["1","1","0"],["0","0","0"]]', output: "1", explanation: "There is only one island of land." }],
        visibleTestCases: [
          { label: "Test Case 1", input: "3 3\n1 1 0\n1 1 0\n0 0 0", expected: "1" },
          { label: "Test Case 2", input: "3 3\n1 1 0\n0 0 0\n0 0 1", expected: "2" },
          { label: "Test Case 3", input: "2 2\n0 0\n0 0", expected: "0" }
        ],
        hiddenTestCases: Array.from({ length: 20 }, (_, i) => ({
          label: `Hidden Case ${i + 1}`,
          input: `1 ${i + 1}\n${Array.from({ length: i + 1 }, (_, k) => k % 2 === 0 ? "1" : "0").join(" ")}`,
          expected: `${Math.ceil((i + 1) / 2)}`
        })),
        expectedTimeComplexity: "O(m*n)",
        expectedSpaceComplexity: "O(m*n)",
        tags: ["Graphs", "DFS"],
        functionName: "numIslands",
        returnType: "int",
        starterCode: {
          javascript: `class Solution {\n  numIslands(grid) {\n    // Write your code here\n    return 0;\n  }\n}`,
          python: `class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        # Write your code here\n        return 0`,
          cpp: `class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your code here\n        return 0;\n    }\n};`,
          java: `class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your code here\n        return 0;\n    }\n}`
        },
        driverCode: {
          javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length > 0) {\n  const parts = input[0].trim().split(/\\s+/).map(Number);\n  const m = parts[0], n = parts[1];\n  const grid = [];\n  for (let r = 0; r < m; r++) {\n    grid.push(input[r + 1].trim().split(/\\s+/));\n  }\n  const sol = new Solution();\n  console.log(sol.numIslands(grid));\n}`,
          python: `import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    parts = list(map(int, lines[0].split()))\n    m, n = parts[0], parts[1]\n    grid = []\n    for r in range(m):\n        grid.append(lines[r + 1].split())\n    sol = Solution()\n    print(sol.numIslands(grid))`,
          cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int m, n; if (cin >> m >> n) {\n        vector<vector<char>> grid(m, vector<char>(n));\n        for (int i=0; i<m; ++i) {\n            for (int j=0; j<n; ++j) cin >> grid[i][j];\n        }\n        Solution sol; cout << sol.numIslands(grid);\n    } return 0;\n}`,
          java: `import java.util.*;\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int m = sc.nextInt();\n            int n = sc.nextInt();\n            char[][] grid = new char[m][n];\n            for (int i=0; i<m; i++) {\n                for (int j=0; j<n; j++) {\n                    grid[i][j] = sc.next().charAt(0);\n                }\n            }\n            Solution sol = new Solution();\n            System.out.println(sol.numIslands(grid));\n        }\n    }\n}`
        }
      },
      "greedy": {
        title: "Jump Game",
        description: "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.",
        constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 10^5"],
        examples: [{ input: "nums = [2,3,1,1,4]", output: "true", explanation: "Jump 1 step from index 0 to 1, then 3 steps to the last index." }],
        visibleTestCases: [
          { label: "Test Case 1", input: "5\n2 3 1 1 4", expected: "true" },
          { label: "Test Case 2", input: "5\n3 2 1 0 4", expected: "false" },
          { label: "Test Case 3", input: "1\n0", expected: "true" }
        ],
        hiddenTestCases: Array.from({ length: 20 }, (_, i) => ({
          label: `Hidden Case ${i + 1}`,
          input: `${i + 2}\n${Array.from({ length: i + 2 }, (_, k) => k === i ? "0" : "1").join(" ")}`,
          expected: "true"
        })),
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
        tags: ["Greedy"],
        functionName: "canJump",
        returnType: "bool",
        starterCode: {
          javascript: `class Solution {\n  canJump(nums) {\n    // Write your code here\n    return false;\n  }\n}`,
          python: `class Solution:\n    def canJump(self, nums: List[int]) -> bool:\n        # Write your code here\n        return False`,
          cpp: `class Solution {\npublic:\n    bool canJump(vector<int>& nums) {\n        // Write your code here\n        return false;\n    }\n};`,
          java: `class Solution {\n    public boolean canJump(int[] nums) {\n        // Write your code here\n        return false;\n    }\n}`
        },
        driverCode: {
          javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length > 1) {\n  const nums = input[1].trim().split(/\\s+/).map(Number);\n  const sol = new Solution();\n  console.log(sol.canJump(nums));\n}`,
          python: `import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) > 1:\n    nums = list(map(int, lines[1].split()))\n    sol = Solution()\n    print(str(sol.canJump(nums)).lower())`,
          cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n; if (cin >> n) {\n        vector<int> nums(n); for(int i=0; i<n; ++i) cin >> nums[i];\n        Solution sol; cout << (sol.canJump(nums) ? "true" : "false");\n    } return 0;\n}`,
          java: `import java.util.*;\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] nums = new int[n];\n            for (int i=0; i<n; i++) nums[i] = sc.nextInt();\n            Solution sol = new Solution();\n            System.out.println(sol.canJump(nums));\n        }\n    }\n}`
        }
      },
      "backtracking": {
        title: "Generate Parentheses",
        description: "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses. Print each combination on a new line, sorted lexicographically.",
        constraints: ["1 <= n <= 8"],
        examples: [{ input: "n = 3", output: "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]", explanation: "All combinations of 3 parenthesis pairs." }],
        visibleTestCases: [
          { label: "Test Case 1", input: "1", expected: "()" },
          { label: "Test Case 2", input: "2", expected: "(())\n?()()" },
          { label: "Test Case 3", input: "3", expected: "((()))\n(()())\n(())()\n()(())\n()()()" }
        ],
        hiddenTestCases: Array.from({ length: 20 }, (_, i) => ({
          label: `Hidden Case ${i + 1}`,
          input: `${(i % 3) + 2}`,
          expected: (i % 3) + 2 === 2 
            ? "(())\n()()" 
            : (i % 3) + 2 === 3 
              ? "((()))\n(()())\n(())()\n()(())\n()()()" 
              : "(((())))\n((()()))\n((())())\n((()))()\n(()(()))\n(()()())\n(()())()\n(())()()\n()((()))\n()(()())\n()(())()\n()()(())\n()()()()"
        })),
        expectedTimeComplexity: "O(4^n / sqrt(n))",
        expectedSpaceComplexity: "O(n)",
        tags: ["Backtracking"],
        functionName: "generateParenthesis",
        returnType: "vector<string>",
        starterCode: {
          javascript: `class Solution {\n  generateParenthesis(n) {\n    // Write your code here\n    return [];\n  }\n}`,
          python: `class Solution:\n    def generateParenthesis(self, n: int) -> List[str]:\n        # Write your code here\n        return []`,
          cpp: `class Solution {\npublic:\n    vector<string> generateParenthesis(int n) {\n        // Write your code here\n        return {};\n    }\n};`,
          java: `class Solution {\n    public List<String> generateParenthesis(int n) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}`
        },
        driverCode: {
          javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n  const sol = new Solution();\n  const res = sol.generateParenthesis(Number(input));\n  res.sort().forEach(s => console.log(s));\n}`,
          python: `import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    n = int(lines[0])\n    sol = Solution()\n    res = sol.generateParenthesis(n)\n    for s in sorted(res):\n        print(s)`,
          cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n; if (cin >> n) {\n        Solution sol; vector<string> res = sol.generateParenthesis(n);\n        sort(res.begin(), res.end());\n        for (const string& s : res) cout << s << "\\n";\n    } return 0;\n}`,
          java: `import java.util.*;\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            Solution sol = new Solution();\n            List<String> res = sol.generateParenthesis(n);\n            Collections.sort(res);\n            for (String s : res) System.out.println(s);\n        }\n    }\n}`
        }
      }
    };

    // Normalize topic name for matching
    const normCategory = (category || "DSA").toLowerCase().trim();
    const selectedFallback = fallbacks[normCategory] || fallbacks["arrays"];

    // Deep clone the fallback object to prevent mutating the global in-memory template
    const cloned = JSON.parse(JSON.stringify(selectedFallback));

    // Append roman numerals to title if it matches existing titles
    let currentTitle = cloned.title;
    let suffixCount = 1;
    while (existingTitles.includes(currentTitle)) {
      suffixCount++;
      const romanNumerals = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];
      const suffix = romanNumerals[suffixCount] || suffixCount.toString();
      currentTitle = `${cloned.title} ${suffix}`;
    }
    cloned.title = currentTitle;

    return cloned;
  }
};

const generateAptitudeQuestions = async (topic, difficulty, count) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are a professional aptitude test creator. Generate exactly ${count} multiple choice questions (MCQs) for the topic "${topic}" at "${difficulty}" difficulty level.
The questions must be high-quality, similar to real interview-level aptitude tests (conceptual and calculation-based).
Avoid duplicates. The options must be randomized and the explanations should be detailed, clear and human-readable.

Return ONLY a JSON object containing a "questions" array matching the following schema. Do NOT include markdown code blocks, comments, or extra text.
JSON Schema:
{
  "questions": [
    {
      "question": "The question text here...",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": 0, // 0-indexed index of correct option (0, 1, 2, or 3)
      "explanation": "Detailed step-by-step mathematical or logical explanation.",
      "subtopic": "Subtopic name (e.g. Successive Percentage, Profit margin)"
    }
  ]
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned);
    
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid response format: 'questions' array missing.");
    }
    return parsed.questions;
  } catch (error) {
    console.error("Gemini API generateAptitudeQuestions error:", error.message);
    throw error;
  }
};

/**
 * Generate EXACTLY 10 Aptitude Round Questions tailored to Candidate Context.
 * Guarantees zero-failure via fallback pipeline to MongoDB pool.
 */
const generate10AptitudeQuestions = async ({
  role = "Software Engineer",
  experience = "1-3 Years",
  skills = [],
  resumeText = "",
  difficulty = "Medium",
}) => {
  const { getFallbackAptitudeQuestions } = require("./aptitudeFallbackService");
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const skillStr = Array.isArray(skills) ? skills.join(", ") : String(skills || "");

  const prompt = `
You are an expert Aptitude Examiner creating the Aptitude Round for an AI Interview Platform.
Generate EXACTLY 10 high-quality, unique aptitude questions tailored to this candidate profile:
- Target Job Role: ${role}
- Experience Level: ${experience}
- Candidate Technical Skills: ${skillStr || "General"}
- Resume Context: ${resumeText ? resumeText.substring(0, 300) : "N/A"}
- Difficulty Level: ${difficulty}

Distribution Requirements:
- 3 Easy questions
- 4 Medium questions
- 3 Hard questions

Categories to distribute across:
- Logical Reasoning
- Quantitative Aptitude
- Numerical Ability
- Analytical Reasoning
- Data Interpretation
- Probability / Permutations
- Time & Work / Time Speed Distance
- Verbal Ability / Number System

Schema & Output Requirements:
- Return ONLY a JSON object containing a "questions" array.
- Exactly 4 options per question.
- "correctAnswer" MUST be the option letter: "A", "B", "C", or "D".
- Include a clear, step-by-step mathematical or logical "explanation".
- Set "timeLimit" to 60 and "marks" to 1.

JSON Format:
{
  "questions": [
    {
      "id": null,
      "type": "aptitude",
      "category": "Logical Reasoning",
      "difficulty": "Medium",
      "question": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation...",
      "timeLimit": 60,
      "marks": 1
    }
  ]
}
`;

  let validAiQuestions = [];

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    if (parsed && Array.isArray(parsed.questions)) {
      const seenTexts = new Set();

      parsed.questions.forEach((q) => {
        if (!q || !q.question || !Array.isArray(q.options) || q.options.length !== 4) return;

        const normalizedQ = q.question.toLowerCase().trim();
        if (seenTexts.has(normalizedQ)) return; // skip duplicates
        seenTexts.add(normalizedQ);

        // Normalize correctAnswer to "A", "B", "C", or "D"
        let letterAns = "A";
        if (typeof q.correctAnswer === "string" && ["A", "B", "C", "D"].includes(q.correctAnswer.toUpperCase())) {
          letterAns = q.correctAnswer.toUpperCase();
        } else if (typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer <= 3) {
          letterAns = ["A", "B", "C", "D"][q.correctAnswer];
        }

        validAiQuestions.push({
          id: q.id || null,
          type: "aptitude",
          category: q.category || q.topic || "Logical Reasoning",
          difficulty: q.difficulty || difficulty,
          question: q.question.trim(),
          options: q.options.map((opt) => String(opt).trim()),
          correctAnswer: letterAns,
          explanation: q.explanation || "Calculated step by step using quantitative logic.",
          timeLimit: Number(q.timeLimit) || 60,
          marks: Number(q.marks) || 1,
        });
      });
    }
  } catch (err) {
    console.error("Gemini generate10AptitudeQuestions warning/fallback triggered:", err.message);
  }

  // If AI generated fewer than 10 valid questions, invoke fallback pipeline
  const needed = 10 - validAiQuestions.length;
  if (needed > 0) {
    console.log(`[Aptitude Generator] AI produced ${validAiQuestions.length}/10 items. Fetching ${needed} fallback questions from DB pool...`);
    const fallbackItems = await getFallbackAptitudeQuestions(needed, validAiQuestions, {
      jobRole: role,
      difficulty,
    });
    validAiQuestions = [...validAiQuestions, ...fallbackItems];
  }

  // Ensure exactly 10 items returned
  return validAiQuestions.slice(0, 10);
};

const analyzeAptitudePerformance = async (sessionInfo, questionsData) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are an AI learning mentor. Analyze a student's performance on a "${sessionInfo.topic}" practice set of "${sessionInfo.difficulty}" difficulty.
Here are the session details:
- Total questions: ${sessionInfo.total}
- Correct answers: ${sessionInfo.correct}
- Wrong answers: ${sessionInfo.wrong}
- Skipped questions: ${sessionInfo.skipped}
- Accuracy: ${sessionInfo.accuracy}%

Here are the questions, user answers, and details:
${JSON.stringify(questionsData.map(q => ({
  question: q.question,
  subtopic: q.subtopic,
  isCorrect: q.userSelectedAnswer === q.correctAnswer,
  skipped: q.userSelectedAnswer === null,
  timeSpentSeconds: q.timeSpent
})), null, 2)}

Provide qualitative evaluation. Identify specific conceptual strengths (which types of problems did they solve correctly or fast), weak areas (which specific subtopics or types of questions did they fail or skip or take too much time on), and brief personalized feedback.

Return ONLY a JSON object with this schema:
{
  "strengths": ["Strength 1...", "Strength 2..."],
  "weakAreas": ["Weakness 1...", "Weakness 2..."],
  "feedback": "Overall personalized feedback text..."
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini API analyzeAptitudePerformance error:", error.message);
    return {
      strengths: [`General understanding of ${sessionInfo.topic}`],
      weakAreas: ["Specific calculation pace or advanced problems"],
      feedback: "Great job completing the practice set. Review the step-by-step explanations for questions you missed."
    };
  }
};

const getAptitudeRecommendations = async (sessionInfo, questionsData) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
Based on a student's performance on the topic "${sessionInfo.topic}" with difficulty "${sessionInfo.difficulty}" and score ${sessionInfo.correct}/${sessionInfo.total}, suggest recommendations for their next practice.

Recommend:
1. Three relevant next topics to study/practice (e.g. if they did Percentage, next could be Profit & Loss, Simple Interest).
2. The recommended next difficulty level (Easy, Medium, Hard).
3. Suggested question count (integer).

Return ONLY a JSON object matching this schema:
{
  "nextTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "recommendedDifficulty": "Easy/Medium/Hard",
  "suggestedPracticeCount": 20
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini API getAptitudeRecommendations error:", error.message);
    let nextDifficulty = sessionInfo.difficulty;
    const pct = (sessionInfo.correct / sessionInfo.total) * 100;
    if (pct >= 80) {
      if (sessionInfo.difficulty === "Easy") nextDifficulty = "Medium";
      else if (sessionInfo.difficulty === "Medium") nextDifficulty = "Hard";
    } else if (pct < 50) {
      if (sessionInfo.difficulty === "Hard") nextDifficulty = "Medium";
      else if (sessionInfo.difficulty === "Medium") nextDifficulty = "Easy";
    }
    return {
      nextTopics: ["Profit & Loss", "Simple Interest", "Ratio & Proportion"],
      recommendedDifficulty: nextDifficulty,
      suggestedPracticeCount: 20
    };
  }
};

const analyzeOAPerformance = async (statsSummary, questions) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are an expert technical recruiter analyzing a candidate's Online Assessment (OA) performance.
Candidate role: ${statsSummary.role}
Difficulty: ${statsSummary.difficulty}
Assessment Results:
- Total Questions: ${statsSummary.total}
- Correct Answers: ${statsSummary.correct}
- Wrong Answers: ${statsSummary.wrong}
- Skipped Questions: ${statsSummary.skipped}
- Score: ${statsSummary.correct}/${statsSummary.total}
- Percentage: ${statsSummary.percentage}%

Here is the list of questions, the candidate's answers, and whether they were correct:
${questions.map((q, idx) => `
Q${idx + 1}: ${q.questionText}
Category/Topic: ${q.category}
Candidate Answer: ${q.candidateAnswer}
Correct Answer: ${q.correctAnswer}
Result: ${q.isCorrect ? "Correct" : q.isSkipped ? "Skipped" : "Incorrect"}
`).join("\n")}

Please identify the candidate's strong topics and weak topics, and provide overall AI observations/feedback.
Return ONLY a JSON object matching this schema:
{
  "strongTopics": ["Topic 1", "Topic 2"],
  "weakTopics": ["Topic 1", "Topic 2"],
  "observations": "Overall observations about candidate performance and knowledge gaps."
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini API analyzeOAPerformance error:", error.message);
    const strongTopics = [];
    const weakTopics = [];
    questions.forEach(q => {
      if (q.isCorrect && !strongTopics.includes(q.category)) {
        strongTopics.push(q.category);
      } else if (!q.isCorrect && !weakTopics.includes(q.category)) {
        weakTopics.push(q.category);
      }
    });
    return {
      strongTopics: strongTopics.slice(0, 3),
      weakTopics: weakTopics.slice(0, 3),
      observations: "The candidate completed the online assessment. Review individual responses for topic accuracy."
    };
  }
};

/**
 * Technical Round 1 - Generate Exactly 2 Technical Questions (1 Medium, 1 Hard)
 * Includes 2 AI attempts (1 retry) and progressive filter relaxation DB fallback
 */
const generate2TechnicalQuestions = async (context = {}) => {
  const { getFallbackTechnicalQuestions } = require("./techFallbackService");
  console.log("[Tech DB Fetch] Fetching Technical Round 1 DSA Coding Questions FROM MONGODB DB ONLY...");
  const finalQuestions = await getFallbackTechnicalQuestions(2, [], context);
  console.log(`[Tech DB Fetch Log] Successfully fetched ${finalQuestions.length} DSA questions from MongoDB database.`);
  return finalQuestions;
};

module.exports = {
  generateQuestions,
  evaluateAnswer,
  analyzeResume,
  extractResumeData,
  generateSingleCodingQuestion,
  generateAptitudeQuestions,
  analyzeAptitudePerformance,
  getAptitudeRecommendations,
  analyzeOAPerformance,
  generate2TechnicalQuestions,
  generate10AptitudeQuestions,
  genAI,
};