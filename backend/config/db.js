const mongoose = require("mongoose");
const dns = require("dns");
const Question = require("../models/Question");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Resolve IPv4 first on Node 18+ to avoid querySrv ECONNREFUSED with MongoDB Atlas
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const connectDB = async (retryCount = 0) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected");

    // Auto-seed admin user from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      console.log("Checking admin user from env...");
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        console.log(`Admin user '${adminEmail}' not found. Creating...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        await User.create({
          name: "Admin",
          email: adminEmail,
          password: hashedPassword,
          role: "admin"
        });
        console.log(`Admin user '${adminEmail}' seeded successfully.`);
      } else {
        console.log(`Admin user '${adminEmail}' already exists.`);
        // Ensure its role is indeed admin
        if (adminExists.role !== "admin") {
          adminExists.role = "admin";
          await adminExists.save();
          console.log(`Admin user '${adminEmail}' role updated to admin.`);
        }
      }
    }

    const questionCount = await Question.countDocuments();
    if (questionCount === 0) {
      console.log("Database contains 0 questions. Seeding initial default coding questions...");
      await Question.create([
      {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Exactly one solution exists."
        ],
        examples: [
          {
            input: "nums = [2,7,11,15]\ntarget = 9",
            output: "[0,1]",
            explanation: "nums[0] + nums[1] = 9"
          },
          {
            input: "nums = [3,2,4]\ntarget = 6",
            output: "[1,2]",
            explanation: "nums[1] + nums[2] = 6"
          }
        ],
        visibleTestCases: [
          { label: "Test Case 1", input: "4\n2 7 11 15\n9", expected: "0 1" },
          { label: "Test Case 2", input: "3\n3 2 4\n6", expected: "1 2" },
          { label: "Test Case 3", input: "2\n3 3\n6", expected: "0 1" }
        ],
        hiddenTestCases: [
          { label: "Hidden Case 1", input: "4\n1 5 9 12\n14", expected: "1 2" },
          { label: "Hidden Case 2", input: "5\n10 -2 4 6 8\n8", expected: "0 1" },
          { label: "Hidden Case 3", input: "6\n0 4 3 8 2 9\n11", expected: "2 3" }
        ],
        starterCode: {
          cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};`,
          java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}`,
          python: `class Solution:\n    def twoSum(self, nums, target):\n        pass`,
          javascript: `var twoSum = function(nums, target) {\n    \n};`
        },
        driverCode: {
          cpp: `int main() {\n    int n;\n    if (cin >> n) {\n        vector<int> nums(n);\n        for (int i = 0; i < n; i++) cin >> nums[i];\n        int target;\n        cin >> target;\n        Solution sol;\n        vector<int> ans = sol.twoSum(nums, target);\n        cout << ans[0] << " " << ans[1];\n    }\n    return 0;\n}`,
          java: `class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] nums = new int[n];\n            for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n            int target = sc.nextInt();\n            Solution sol = new Solution();\n            int[] ans = sol.twoSum(nums, target);\n            System.out.print(ans[0] + " " + ans[1]);\n        }\n    }\n}`,
          python: `if __name__ == '__main__':\n    import sys\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 3:\n        nums = list(map(int, lines[1].split()))\n        target = int(lines[2])\n        sol = Solution()\n        ans = sol.twoSum(nums, target)\n        print(ans[0], ans[1])`,
          javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8');\nconst lines = input.trim().split('\\n');\nif (lines.length >= 3) {\n    const n = Number(lines[0]);\n    const nums = lines[1].trim().split(/\\s+/).map(Number).slice(0, n);\n    const target = Number(lines[2]);\n    const ans = twoSum(nums, target);\n    console.log(ans[0] + " " + ans[1]);\n}`
        },
        difficulty: "Easy",
        tags: ["Arrays", "Hash Table"]
      },
      {
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
        constraints: [
          "1 <= s.length <= 10^5",
          "s[i] is a printable ascii character."
        ],
        examples: [
          {
            input: 's = ["h","e","l","l","o"]',
            output: '["o","l","l","e","h"]',
            explanation: "Reverses characters in-place."
          }
        ],
        visibleTestCases: [
          { label: "Test Case 1", input: "5\nh e l l o", expected: "o l l e h" },
          { label: "Test Case 2", input: "6\nH a n n a h", expected: "h a n n a H" }
        ],
        hiddenTestCases: [
          { label: "Hidden Case 1", input: "1\na", expected: "a" },
          { label: "Hidden Case 2", input: "4\nC o d e", expected: "e d o C" }
        ],
        starterCode: {
          cpp: `class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        \n    }\n};`,
          java: `class Solution {\n    public void reverseString(char[] s) {\n        \n    }\n}`,
          python: `class Solution:\n    def reverseString(self, s):\n        pass`,
          javascript: `var reverseString = function(s) {\n    \n};`
        },
        driverCode: {
          cpp: `int main() {\n    int n;\n    if (cin >> n) {\n        vector<char> s(n);\n        for (int i = 0; i < n; i++) cin >> s[i];\n        Solution sol;\n        sol.reverseString(s);\n        for (char c : s) cout << c << " ";\n    }\n    return 0;\n}`,
          java: `class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            char[] s = new char[n];\n            for (int i = 0; i < n; i++) s[i] = sc.next().charAt(0);\n            Solution sol = new Solution();\n            sol.reverseString(s);\n            for (char c : s) System.out.print(c + " ");\n        }\n    }\n}`,
          python: `if __name__ == '__main__':\n    import sys\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        s = lines[1].split()\n        sol = Solution()\n        sol.reverseString(s)\n        print(" ".join(s))`,
          javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8');\nconst lines = input.trim().split('\\n');\nif (lines.length >= 2) {\n    const s = lines[1].trim().split(/\\s+/);\n    reverseString(s);\n    console.log(s.join(" "));\n}`
        },
        difficulty: "Easy",
        tags: ["Two Pointers", "String"]
      }
    ]);
      console.log("Seeded initial database coding questions successfully.");
    }
  } catch (error) {
    console.error("Database connection/seeding failed:", error.message);
    if (retryCount < 5) {
      console.log(`Retrying MongoDB connection in 3s (Attempt ${retryCount + 1}/5)...`);
      setTimeout(() => connectDB(retryCount + 1), 3000);
    } else {
      console.warn("MongoDB connection could not be established after retries. Server will remain running.");
    }
  }
};

module.exports = connectDB;