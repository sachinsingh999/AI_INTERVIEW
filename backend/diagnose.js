const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

// Load backend env
dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const Question = require("./models/Question");

const jsCode = `// BEGIN: User Solution
class Solution {
    twoSum(nums, target) {
        return [0, 1];
    }
}
// END: User Solution

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8');
const lines = input.trim().split('\\n');
if (lines.length >= 3) {
    const n = Number(lines[0]);
    const nums = lines[1].trim().split(/\\s+/).map(Number).slice(0, n);
    const target = Number(lines[2]);
    const sol = new Solution();
    const ans = sol.twoSum(nums, target);
    console.log(ans[0] + " " + ans[1]);
}`;

const pyCode = `# BEGIN: User Solution
class Solution:
    def twoSum(self, nums, target):
        return [0, 1]
# END: User Solution

n = int(input())
nums = list(map(int, input().split()))
target = int(input())
sol = Solution()
ans = sol.twoSum(nums, target)
print(ans[0], ans[1])`;

const cppCode = `#include <bits/stdc++.h>
using namespace std;

// BEGIN: User Solution
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        return {0, 1};
    }
};
// END: User Solution

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;
    Solution sol;
    vector<int> ans = sol.twoSum(nums, target);
    cout << ans[0] << " " << ans[1];
    return 0;
}`;

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const user = await User.findOne({});
  if (!user) {
    console.error("No user found.");
    process.exit(1);
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const question = await Question.findOne({ title: "Two Sum" });
  if (!question) {
    console.error("No 'Two Sum' question.");
    process.exit(1);
  }

  const runTest = async (langName, code, langId) => {
    console.log(`\n=== Testing ${langName} (ID: ${langId}) ===`);
    try {
      const resRun = await fetch("http://localhost:5001/api/compiler/run", {
        method: "POST",
        headers,
        body: JSON.stringify({ sourceCode: code, languageId: langId, stdin: "4\n2 7 11 15\n9" })
      });
      const jsonRun = await resRun.json();
      console.log(`[Run status]: ${resRun.status}`);
      console.log(`[Run response]:`, JSON.stringify(jsonRun, null, 2));

      const resSubmit = await fetch("http://localhost:5001/api/compiler/submit", {
        method: "POST",
        headers,
        body: JSON.stringify({ questionId: question._id, sourceCode: code, languageId: langId, languageName: langName })
      });
      const jsonSubmit = await resSubmit.json();
      console.log(`[Submit status]: ${resSubmit.status}`);
      console.log(`[Submit response] passed cases count:`, jsonSubmit.passed, "/", jsonSubmit.total);
    } catch (err) {
      console.error(`${langName} tests failed:`, err);
    }
  };

  await runTest("JavaScript", jsCode, 63);
  await runTest("Python", pyCode, 71);
  await runTest("C++", cppCode, 54);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Error in script:", err);
  process.exit(1);
});
