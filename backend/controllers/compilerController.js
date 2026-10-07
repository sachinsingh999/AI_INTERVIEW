const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const mongoose = require("mongoose");
const Question = require("../models/Question");
const Submission = require("../models/Submission");
const User = require("../models/User");
const SavedCode = require("../models/SavedCode");
const { generateSingleCodingQuestion } = require("../services/aiService");

const encodeBase64 = (str) => Buffer.from(str || "").toString("base64");
const decodeBase64 = (str) => Buffer.from(str || "", "base64").toString("utf-8");

const stripSolutionClass = (code, langKey) => {
  if (!code) return code;
  if (langKey === "python") {
    const startIndex = code.search(/\bclass\s+Solution\b/);
    if (startIndex === -1) return code;
    const lines = code.split("\n");
    let inClass = false;
    let newLines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/\bclass\s+Solution\b/)) {
        inClass = true;
        continue;
      }
      if (inClass) {
        if (line.trim() === "" || line.startsWith(" ") || line.startsWith("\t")) {
          continue;
        }
        inClass = false;
      }
      newLines.push(line);
    }
    return newLines.join("\n");
  }

  const startIndex = code.search(/\bclass\s+Solution\b/);
  if (startIndex === -1) return code;

  const firstBraceIndex = code.indexOf("{", startIndex);
  if (firstBraceIndex === -1) return code;

  let braceCount = 1;
  let index = firstBraceIndex + 1;
  while (index < code.length && braceCount > 0) {
    if (code[index] === "{") braceCount++;
    else if (code[index] === "}") braceCount--;
    index++;
  }

  if (braceCount === 0) {
    let endIndex = index;
    while (endIndex < code.length && (code[endIndex] === ";" || /\s/.test(code[endIndex]))) {
      if (code[endIndex] === ";") {
        endIndex++;
        break;
      }
      endIndex++;
    }
    return code.slice(0, startIndex) + code.slice(endIndex);
  }

  return code;
};

// Helper to combine User Solution and Driver Code
const combineUserSolutionAndDriver = (question, sourceCode, languageId) => {
  let langKey = "javascript";
  if (languageId === 71) langKey = "python";
  else if (languageId === 54) langKey = "cpp";
  else if (languageId === 62 || languageId === 4) langKey = "java";
  else if (languageId === 63) langKey = "javascript";
  else if (languageId === 50) langKey = "c";

  const fnName = question?.functionName || "solve";
  const rawDriver = question?.driverCode?.[langKey];
  const driver = stripSolutionClass(rawDriver, langKey);

  if (langKey === "cpp") {
    const hasClass = sourceCode.includes("class Solution");
    const classWrapped = hasClass ? sourceCode : `class Solution {\npublic:\n${sourceCode}\n};`;
    const cppDriver = driver || `int main() {
    Solution sol;
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        int target = 0;
        if (cin >> target) {
            auto ans = sol.${fnName}(nums, target);
            cout << ans;
        } else {
            auto ans = sol.${fnName}(nums, 0);
            cout << ans;
        }
    } else {
        vector<int> nums = {2, 7, 11, 15};
        auto ans = sol.${fnName}(nums, 9);
        cout << ans;
    }
    return 0;
}`;
    return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <set>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>
#include <cmath>
#include <numeric>
#include <sstream>
using namespace std;

${classWrapped}

${cppDriver}`;
  }

  if (langKey === "java") {
    const hasClass = sourceCode.includes("class Solution");
    const classWrapped = hasClass ? sourceCode : `class Solution {\n${sourceCode}\n}`;
    const javaDriver = driver || `class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Solution sol = new Solution();
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
            int target = sc.hasNextInt() ? sc.nextInt() : 0;
            Object ans = sol.${fnName}(nums, target);
            System.out.print(ans);
        } else {
            Object ans = sol.${fnName}(new int[]{2, 7, 11, 15}, 9);
            System.out.print(ans);
        }
    }
}`;
    return `import java.util.*;
import java.io.*;
import java.math.*;

${classWrapped}

${javaDriver}`;
  }

  if (langKey === "python") {
    const hasClass = sourceCode.includes("class Solution");
    let classWrapped = sourceCode;
    if (!hasClass) {
      const indented = sourceCode.split("\n").map((line) => (line.trim().length > 0 ? `    ${line}` : "")).join("\n");
      classWrapped = `class Solution:\n${indented}`;
    }
    const pyDriver = driver || `if __name__ == '__main__':
    sol = Solution()
    if hasattr(sol, '${fnName}'):
        fn = getattr(sol, '${fnName}')
        res = fn([2, 7, 11, 15], 9)
        if res is not None:
            print(" ".join(map(str, res)) if isinstance(res, (list, tuple)) else res)
    elif hasattr(sol, 'solve'):
        res = sol.solve([2, 7, 11, 15])
        if res is not None:
            print(res)`;
    return `import sys
import math
import collections
import heapq
import bisect
from typing import List, Dict, Tuple, Optional, Set

${classWrapped}

${pyDriver}`;
  }

  if (langKey === "c") {
    const cDriver = driver || `int main() {
    int nums[] = {2, 7, 11, 15};
    int returnSize = 0;
    int* ans = ${fnName}(nums, 4, 9, &returnSize);
    if (ans != NULL && returnSize > 0) {
        for (int i = 0; i < returnSize; i++) printf("%d ", ans[i]);
    }
    return 0;
}`;
    return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

${sourceCode}

${cDriver}`;
  }

  const jsDriver = driver || `if (typeof ${fnName} === "function") {
    const ans = ${fnName}([2, 7, 11, 15], 9);
    if (ans !== undefined) console.log(Array.isArray(ans) ? ans.join(" ") : ans);
} else if (typeof solve === "function") {
    const ans = solve([2, 7, 11, 15]);
    if (ans !== undefined) console.log(ans);
}`;

  return `${sourceCode}\n\n${jsDriver}`;
};

// Compare actual output with expected output (trimmed and normalized)
const compareOutput = (actual, expected) => {
  const normActual = String(actual || "").trim().replace(/\r\n/g, "\n");
  const normExpected = String(expected || "").trim().replace(/\r\n/g, "\n");
  return normActual === normExpected;
};

// Local sandbox/system compiler execution helper
const executeLocalCode = async (sourceCode, languageId, stdin) => {
  const tempDir = path.join(__dirname, "../temp");
  const bitsDir = path.join(tempDir, "bits");
  if (!fs.existsSync(bitsDir)) {
    fs.mkdirSync(bitsDir, { recursive: true });
  }

  const stdcxxPath = path.join(bitsDir, "stdc++.h");
  if (!fs.existsSync(stdcxxPath)) {
    const stdcxxContent = `#ifndef STDCXX_H
#define STDCXX_H
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <set>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>
#include <deque>
#include <cmath>
#include <numeric>
#include <climits>
#include <cassert>
#include <sstream>
#include <iomanip>
#endif`;
    fs.writeFileSync(stdcxxPath, stdcxxContent);
  }

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7);

  if (languageId === 71) { // Python
    const fileName = `temp_py_${timestamp}_${randomStr}.py`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, sourceCode);

    return new Promise((resolve) => {
      const startTime = process.hrtime();
      const child = exec(`python3 "${filePath}"`, { timeout: 5000 }, (error, stdout, stderr) => {
        const diff = process.hrtime(startTime);
        const timeMs = Math.round(diff[0] * 1000 + diff[1] / 1000000);

        try {
          fs.unlinkSync(filePath);
        } catch (_) {}

        resolve({
          stdout: stdout || "",
          stderr: stderr || (error && error.killed ? "Execution timed out (5s limit)" : (error ? error.message : "")),
          compile_output: "",
          executionTime: `${timeMs} ms`,
          memory: "1.20 MB"
        });
      });

      if (stdin && child.stdin) {
        child.stdin.write(stdin);
        child.stdin.end();
      }
    });
  } else if (languageId === 54) { // C++
    const fileName = `temp_cpp_${timestamp}_${randomStr}.cpp`;
    const binName = `temp_cpp_bin_${timestamp}_${randomStr}`;
    const filePath = path.join(tempDir, fileName);
    const binPath = path.join(tempDir, binName);
    fs.writeFileSync(filePath, sourceCode);

    return new Promise((resolve) => {
      const compileCmd = `g++ -O2 -I"${tempDir}" "${filePath}" -o "${binPath}"`;
      exec(compileCmd, { timeout: 10000 }, (compileErr, compileStdout, compileStderr) => {
        if (compileErr) {
          try {
            fs.unlinkSync(filePath);
          } catch (_) {}
          resolve({
            stdout: "",
            stderr: compileStderr || compileErr.message,
            compile_output: compileStderr || compileErr.message,
            executionTime: "0 ms",
            memory: "0 MB"
          });
          return;
        }

        const startTime = process.hrtime();
        const child = exec(`"${binPath}"`, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
          const diff = process.hrtime(startTime);
          const timeMs = Math.round(diff[0] * 1000 + diff[1] / 1000000);

          try {
            fs.unlinkSync(filePath);
          } catch (_) {}
          try {
            fs.unlinkSync(binPath);
          } catch (_) {}

          resolve({
            stdout: runStdout || "",
            stderr: runStderr || (runErr && runErr.killed ? "Execution timed out (5s limit)" : (runErr ? runErr.message : "")),
            compile_output: "",
            executionTime: `${timeMs} ms`,
            memory: "1.80 MB"
          });
        });

        if (stdin && child.stdin) {
          child.stdin.write(stdin);
          child.stdin.end();
        }
      });
    });
  } else if (languageId === 50) { // C
    const fileName = `temp_c_${timestamp}_${randomStr}.c`;
    const binName = `temp_c_bin_${timestamp}_${randomStr}`;
    const filePath = path.join(tempDir, fileName);
    const binPath = path.join(tempDir, binName);
    fs.writeFileSync(filePath, sourceCode);

    return new Promise((resolve) => {
      const compileCmd = `gcc -O2 "${filePath}" -o "${binPath}"`;
      exec(compileCmd, { timeout: 10000 }, (compileErr, compileStdout, compileStderr) => {
        if (compileErr) {
          try { fs.unlinkSync(filePath); } catch (_) {}
          resolve({
            stdout: "",
            stderr: compileStderr || compileErr.message,
            compile_output: compileStderr || compileErr.message,
            executionTime: "0 ms",
            memory: "0 MB"
          });
          return;
        }

        const startTime = process.hrtime();
        const child = exec(`"${binPath}"`, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
          const diff = process.hrtime(startTime);
          const timeMs = Math.round(diff[0] * 1000 + diff[1] / 1000000);

          try { fs.unlinkSync(filePath); } catch (_) {}
          try { fs.unlinkSync(binPath); } catch (_) {}

          resolve({
            stdout: runStdout || "",
            stderr: runStderr || (runErr && runErr.killed ? "Execution timed out (5s limit)" : (runErr ? runErr.message : "")),
            compile_output: "",
            executionTime: `${timeMs} ms`,
            memory: "1.10 MB"
          });
        });

        if (stdin && child.stdin) {
          child.stdin.write(stdin);
          child.stdin.end();
        }
      });
    });
  } else if (languageId === 60) { // Go
    const fileName = `temp_go_${timestamp}_${randomStr}.go`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, sourceCode);

    return new Promise((resolve) => {
      const startTime = process.hrtime();
      const child = exec(`go run "${filePath}"`, { timeout: 8000 }, (runErr, runStdout, runStderr) => {
        const diff = process.hrtime(startTime);
        const timeMs = Math.round(diff[0] * 1000 + diff[1] / 1000000);

        try { fs.unlinkSync(filePath); } catch (_) {}

        resolve({
          stdout: runStdout || "",
          stderr: runStderr || (runErr && runErr.killed ? "Execution timed out (8s limit)" : (runErr ? runErr.message : "")),
          compile_output: runStderr || "",
          executionTime: `${timeMs} ms`,
          memory: "3.50 MB"
        });
      });

      if (stdin && child.stdin) {
        child.stdin.write(stdin);
        child.stdin.end();
      }
    });
  } else if (languageId === 73) { // Rust
    const fileName = `temp_rs_${timestamp}_${randomStr}.rs`;
    const binName = `temp_rs_bin_${timestamp}_${randomStr}`;
    const filePath = path.join(tempDir, fileName);
    const binPath = path.join(tempDir, binName);
    fs.writeFileSync(filePath, sourceCode);

    return new Promise((resolve) => {
      const compileCmd = `rustc "${filePath}" -o "${binPath}"`;
      exec(compileCmd, { timeout: 10000 }, (compileErr, compileStdout, compileStderr) => {
        if (compileErr) {
          try { fs.unlinkSync(filePath); } catch (_) {}
          resolve({
            stdout: "",
            stderr: compileStderr || compileErr.message,
            compile_output: compileStderr || compileErr.message,
            executionTime: "0 ms",
            memory: "0 MB"
          });
          return;
        }

        const startTime = process.hrtime();
        const child = exec(`"${binPath}"`, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
          const diff = process.hrtime(startTime);
          const timeMs = Math.round(diff[0] * 1000 + diff[1] / 1000000);

          try { fs.unlinkSync(filePath); } catch (_) {}
          try { fs.unlinkSync(binPath); } catch (_) {}

          resolve({
            stdout: runStdout || "",
            stderr: runStderr || (runErr && runErr.killed ? "Execution timed out (5s limit)" : (runErr ? runErr.message : "")),
            compile_output: "",
            executionTime: `${timeMs} ms`,
            memory: "1.40 MB"
          });
        });

        if (stdin && child.stdin) {
          child.stdin.write(stdin);
          child.stdin.end();
        }
      });
    });
  } else if (languageId === 74) { // TypeScript
    const strippedCode = sourceCode
      .replace(/:\s*(string|number|boolean|any|void|string\[\]|number\[\]|boolean\[\])/g, "")
      .replace(/<[A-Za-z0-9_,\s]+>/g, "")
      .replace(/import\s+type\s+.*?;/g, "");
    return executeLocalCode(strippedCode, 63, stdin);
  } else if (languageId === 63) { // JavaScript VM
    const vm = require("node:vm");
    const sandbox = {
      input: stdin || "",
      stdin: stdin || "",
      stdout: "",
      stderr: "",
      console: {
        log: (...args) => { sandbox.stdout += args.join(" ") + "\n"; },
        error: (...args) => { sandbox.stderr += args.join(" ") + "\n"; },
        warn: (...args) => { sandbox.stderr += args.join(" ") + "\n"; }
      },
      require: (mod) => {
        if (mod === "fs") {
          return {
            readFileSync: () => sandbox.stdin
          };
        }
        throw new Error("Module not allowed in sandbox: " + mod);
      }
    };

    const script = new vm.Script(`
      ${sourceCode}
      if (typeof solve === "function") {
        const res = solve(input);
        if (res !== undefined) {
          console.log(res);
        }
      }
    `);

    try {
      script.runInNewContext(sandbox, { timeout: 1000 });
      return {
        stdout: sandbox.stdout.trim(),
        stderr: sandbox.stderr.trim(),
        compile_output: "",
        executionTime: "12 ms",
        memory: "1.45 MB",
      };
    } catch (err) {
      return {
        stdout: sandbox.stdout.trim(),
        stderr: (sandbox.stderr + "\n" + err.message).trim(),
        compile_output: "",
        executionTime: "0 ms",
        memory: "0 MB",
      };
    }
  }

  // Java fallback or other unconfigured compilers
  return {
    stdout: "",
    stderr: `Judge0 is not running. Please start the local Judge0 service, or configure JUDGE0_API_KEY in your env to compile C++/Java/Python.`,
    compile_output: "",
    executionTime: "0 ms",
    memory: "0 MB"
  };
};

// POST /api/compiler/run
const runCode = async (req, res) => {
  try {
    let { questionId, title, visibleTestCases, driverCode, questionMetadata, sourceCode, languageId, language, customInput, stdin } = req.body;

    if (!sourceCode) {
      return res.status(400).json({ message: "sourceCode is required." });
    }

    if (!languageId && language) {
      const langLower = String(language).toLowerCase();
      if (langLower.includes("python")) languageId = 71;
      else if (langLower.includes("cpp") || langLower.includes("c++")) languageId = 54;
      else if (langLower.includes("java")) languageId = 62;
      else if (langLower.includes("c")) languageId = 50;
      else languageId = 63; // Default JS
    }
    if (!languageId) languageId = 63;

    if (stdin === undefined && customInput !== undefined) {
      stdin = customInput;
    }

    let question = null;
    if (questionId && mongoose.Types.ObjectId.isValid(questionId)) {
      question = await Question.findById(questionId);
    }
    if (!question && title) {
      question = await Question.findOne({ title });
    }
    if (!question && questionMetadata) {
      question = questionMetadata;
    }
    if (!question) {
      question = await Question.findOne({});
    }

    // Run Code MUST execute ONLY public test cases (visibleTestCases)
    let testCasesToRun = [];
    if (question && question.visibleTestCases && question.visibleTestCases.length > 0) {
      testCasesToRun = question.visibleTestCases;
    } else if (visibleTestCases && Array.isArray(visibleTestCases) && visibleTestCases.length > 0) {
      testCasesToRun = visibleTestCases;
    } else if (stdin !== undefined) {
      testCasesToRun = [{ label: "Custom Input", input: stdin, expected: "" }];
    } else {
      testCasesToRun = [{ label: "Sample Case 1", input: "", expected: "" }];
    }

    const judge0Url = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
    const judge0Key = process.env.JUDGE0_API_KEY;
    const isSelfHosted = judge0Url && (judge0Url.includes("localhost") || judge0Url.includes("127.0.0.1") || !judge0Url.includes("rapidapi.com"));
    const hasRapidApiKey = judge0Key && !judge0Key.includes("YOUR_RAPIDAPI_KEY");
    let useJudge0 = isSelfHosted || hasRapidApiKey;

    const targetQuestion = question || { driverCode };
    const combinedCode = combineUserSolutionAndDriver(targetQuestion, sourceCode, languageId);

    const results = [];
    let passedCount = 0;
    let totalRuntimeMs = 0;
    let maxMemoryMb = 0;
    let overallVerdict = "Accepted";

    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      const tcInput = tc.input || "";
      const expectedOutput = tc.expected || "";

      let executionRes;
      if (useJudge0) {
        try {
          const headers = { "Content-Type": "application/json" };
          if (hasRapidApiKey) {
            headers["X-RapidAPI-Key"] = judge0Key;
            headers["X-RapidAPI-Host"] = judge0Url.replace(/^https?:\/\//i, "");
          }
          const resJudge = await fetch(`${judge0Url}/submissions?base64_encoded=true&wait=true`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              source_code: encodeBase64(combinedCode),
              language_id: languageId,
              stdin: encodeBase64(tcInput),
            }),
          });
          const submission = await resJudge.json();
          executionRes = {
            stdout: decodeBase64(submission.stdout),
            stderr: decodeBase64(submission.stderr),
            compile_output: decodeBase64(submission.compile_output),
            executionTime: submission.time ? `${Math.round(parseFloat(submission.time) * 1000)} ms` : "0 ms",
            memory: submission.memory ? `${(parseFloat(submission.memory) / 1024).toFixed(2)} MB` : "0 MB",
            rawTime: submission.time ? Math.round(parseFloat(submission.time) * 1000) : 0,
            rawMemory: submission.memory ? parseFloat((parseFloat(submission.memory) / 1024).toFixed(2)) : 0,
          };
        } catch (e) {
          executionRes = await executeLocalCode(combinedCode, languageId, tcInput);
        }
      } else {
        executionRes = await executeLocalCode(combinedCode, languageId, tcInput);
      }

      const actualStdout = (executionRes.stdout || "").trim();
      const stderrText = (executionRes.stderr || "").trim();
      const compileOutputText = (executionRes.compile_output || "").trim();

      let status = "Passed";
      if (compileOutputText || (stderrText && stderrText.includes("error:"))) {
        status = "Compilation Error";
        if (overallVerdict === "Accepted") overallVerdict = "Compilation Error";
      } else if (stderrText.includes("timed out") || stderrText.includes("Time Limit")) {
        status = "Time Limit Exceeded";
        if (overallVerdict === "Accepted") overallVerdict = "Time Limit Exceeded";
      } else if (stderrText && !stderrText.includes("warning")) {
        status = "Runtime Error";
        if (overallVerdict === "Accepted") overallVerdict = "Runtime Error";
      } else if (expectedOutput && !compareOutput(actualStdout, expectedOutput)) {
        status = "Failed";
        if (overallVerdict === "Accepted") overallVerdict = "Wrong Answer";
      }

      if (status === "Passed") {
        passedCount++;
      }

      const timeVal = parseInt(executionRes.executionTime) || executionRes.rawTime || 0;
      const memVal = parseFloat(executionRes.memory) || executionRes.rawMemory || 0;
      totalRuntimeMs += timeVal;
      if (memVal > maxMemoryMb) maxMemoryMb = memVal;

      results.push({
        testCaseNumber: i + 1,
        label: tc.label || `Case ${i + 1}`,
        input: tcInput,
        expected: expectedOutput,
        actual: actualStdout,
        status,
        executionTime: executionRes.executionTime || `${timeVal} ms`,
        memory: executionRes.memory || `${memVal} MB`,
        stderr: stderrText,
        compile_output: compileOutputText,
      });
    }

    res.status(200).json({
      verdict: overallVerdict,
      passedCount,
      totalCount: testCasesToRun.length,
      totalRuntime: `${totalRuntimeMs} ms`,
      maxMemory: `${maxMemoryMb.toFixed(2)} MB`,
      results,
      stdout: results[0]?.actual || "",
      stderr: results[0]?.stderr || "",
      compile_output: results[0]?.compile_output || "",
      executionTime: `${totalRuntimeMs} ms`,
      memory: `${maxMemoryMb.toFixed(2)} MB`,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal execution error: " + error.message });
  }
};

// POST /api/compiler/submit
const submitCode = async (req, res) => {
  try {
    let { questionId, sourceCode, languageId, language, languageName } = req.body;

    if (!sourceCode) {
      return res.status(400).json({ message: "sourceCode is required." });
    }

    if (!languageId && language) {
      const langLower = String(language).toLowerCase();
      if (langLower.includes("python")) languageId = 71;
      else if (langLower.includes("cpp") || langLower.includes("c++")) languageId = 54;
      else if (langLower.includes("java")) languageId = 62;
      else if (langLower.includes("c")) languageId = 50;
      else languageId = 63; // Default JS
    }
    if (!languageId) languageId = 63;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    const testCases = question.hiddenTestCases || [];
    if (testCases.length === 0) {
      return res.status(400).json({ message: "This question has no hidden test cases configured." });
    }

    const judge0Url = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
    const judge0Key = process.env.JUDGE0_API_KEY;
    const isSelfHosted = judge0Url && (judge0Url.includes("localhost") || judge0Url.includes("127.0.0.1") || !judge0Url.includes("rapidapi.com"));
    const hasRapidApiKey = judge0Key && !judge0Key.includes("YOUR_RAPIDAPI_KEY");
    let useJudge0 = isSelfHosted || hasRapidApiKey;

    let passed = 0;
    const total = testCases.length;
    let totalTimeMs = 0;
    let maxMemoryKb = 0;
    const caseResults = [];

    const combinedCode = combineUserSolutionAndDriver(question, sourceCode, languageId);

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      let success = false;
      let actual = "";
      let errorMsg = "";
      let executionSuccessful = false;

      if (useJudge0) {
        try {
          const headers = {
            "Content-Type": "application/json",
          };
          if (hasRapidApiKey) {
            const parsedHost = judge0Url.replace(/^https?:\/\//i, "");
            headers["X-RapidAPI-Key"] = judge0Key;
            headers["X-RapidAPI-Host"] = parsedHost;
          }
          const resJudge = await fetch(`${judge0Url}/submissions?base64_encoded=true&wait=true`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              source_code: encodeBase64(combinedCode),
              language_id: languageId,
              stdin: encodeBase64(tc.input || ""),
            }),
          });

          const submission = await resJudge.json();
          actual = decodeBase64(submission.stdout || "").trim();
          const stderr = decodeBase64(submission.stderr || "").trim();
          const compileOut = decodeBase64(submission.compile_output || "").trim();

          if (stderr) {
            errorMsg = stderr;
          } else if (compileOut) {
            errorMsg = compileOut;
          }

          success = compareOutput(actual, tc.expected);
          if (submission.time) totalTimeMs += parseFloat(submission.time) * 1000;
          if (submission.memory) maxMemoryKb = Math.max(maxMemoryKb, parseFloat(submission.memory));
          executionSuccessful = true;
        } catch (err) {
          console.warn("Judge0 submission fetch failed during submit, falling back to local runner:", err.message);
          useJudge0 = false; // Disable Judge0 for the remaining test cases
          executionSuccessful = false;
        }
      }

      if (!executionSuccessful) {
        const localRes = await executeLocalCode(combinedCode, languageId, tc.input || "");
        actual = localRes.stdout.trim();
        const localErr = localRes.stderr || localRes.compile_output;
        if (localErr) {
          errorMsg = localErr;
          success = false;
        } else {
          success = compareOutput(actual, tc.expected);
        }

        if (localRes.executionTime) {
          totalTimeMs += parseFloat(localRes.executionTime) || 10;
        }
        maxMemoryKb = Math.max(maxMemoryKb, parseFloat(localRes.memory) * 1024 || 1500);
      }

      if (success) {
        passed++;
      }

      caseResults.push({
        label: tc.label || `Case ${i + 1}`,
        passed: success,
        input: tc.input,
        expected: tc.expected,
        actual: actual,
        error: errorMsg,
      });
    }

    const score = Math.round((passed / total) * 100);
    const avgRuntime = `${Math.round(totalTimeMs / total)} ms`;
    const memoryUsage = `${(maxMemoryKb / 1024).toFixed(2)} MB`;

    // Save Submission to Database
    const submissionRecord = new Submission({
      user: req.user._id,
      question: question._id,
      language: languageName || (languageId === 63 ? "JavaScript" : "Unknown"),
      code: sourceCode,
      passed,
      total,
      score,
      runtime: avgRuntime,
      memory: memoryUsage,
    });

    await submissionRecord.save();

    if (score === 100) {
      await Question.findByIdAndUpdate(question._id, { $inc: { solveCount: 1 } });
    }

    // AI POTD Completion Tracker Hook
    try {
      const mongoose = require("mongoose");
      const POTD = mongoose.model("POTD");
      let activePotd = await POTD.findOne({ question: question._id, isActive: true });
      if (!activePotd) {
        activePotd = await POTD.findOne({ question: question._id }).sort({ publishedAt: -1 });
      }
      if (activePotd) {
        const POTDCompletion = mongoose.model("POTDCompletion");
        const solved = score === 100;
        const completionTime = new Date();

        const existingCompletion = await POTDCompletion.findOne({
          user: req.user._id,
          potd: activePotd._id,
        });

        if (existingCompletion) {
          existingCompletion.submissionCount += 1;
          if (solved && !existingCompletion.solved) {
            existingCompletion.solved = true;
            existingCompletion.runtime = avgRuntime;
            existingCompletion.memory = memoryUsage;
            existingCompletion.completionTime = completionTime;
          }
          await existingCompletion.save();
        } else {
          const newCompletion = new POTDCompletion({
            user: req.user._id,
            potd: activePotd._id,
            question: question._id,
            solved,
            runtime: solved ? avgRuntime : "N/A",
            memory: solved ? memoryUsage : "N/A",
            completionTime: solved ? completionTime : null,
            submissionCount: 1,
          });
          await newCompletion.save();
        }
      }
    } catch (err) {
      console.error("[POTD Completion Tracker Error]:", err.message);
    }

    res.status(200).json({
      success: true,
      passed,
      total,
      score,
      runtime: avgRuntime,
      memory: memoryUsage,
      results: caseResults,
    });
  } catch (error) {
    res.status(500).json({ message: "Submission processing failed: " + error.message });
  }
};

// Helper to validate AI generated questions
const validateGeneratedQuestion = (rawQuestion) => {
  const errors = [];
  if (!rawQuestion.title || typeof rawQuestion.title !== "string" || rawQuestion.title.trim().length === 0) {
    errors.push("Title must be a non-empty string.");
  }
  if (!rawQuestion.description || typeof rawQuestion.description !== "string" || rawQuestion.description.trim().length === 0) {
    errors.push("Description must be a non-empty string.");
  }
  if (!Array.isArray(rawQuestion.constraints) || rawQuestion.constraints.length === 0) {
    errors.push("Constraints must be a non-empty array of strings.");
  }
  if (!Array.isArray(rawQuestion.examples) || rawQuestion.examples.length === 0) {
    errors.push("Examples must be a non-empty array.");
  } else {
    rawQuestion.examples.forEach((ex, idx) => {
      if (!ex.input || ex.input.trim().length === 0) errors.push(`Example ${idx + 1} is missing input.`);
      if (!ex.output || ex.output.trim().length === 0) errors.push(`Example ${idx + 1} is missing output.`);
    });
  }

  const rawStarters = rawQuestion.starterCode || rawQuestion.starters || {};
  const starters = {};
  Object.keys(rawStarters).forEach(key => {
    const normKey = key.toLowerCase().replace("c++", "cpp");
    starters[normKey] = rawStarters[key];
  });

  const rawDrivers = rawQuestion.driverCode || rawQuestion.drivers || {};
  const drivers = {};
  Object.keys(rawDrivers).forEach(key => {
    const normKey = key.toLowerCase().replace("c++", "cpp");
    drivers[normKey] = rawDrivers[key];
  });

  const requiredLangs = ["javascript", "python", "cpp", "java"];
  requiredLangs.forEach(lang => {
    if (!starters[lang] || typeof starters[lang] !== "string" || starters[lang].trim().length === 0) {
      errors.push(`Starter code template for ${lang} is missing or invalid.`);
    }
    if (!drivers[lang] || typeof drivers[lang] !== "string" || drivers[lang].trim().length === 0) {
      errors.push(`Driver code template for ${lang} is missing or invalid.`);
    }
  });

  const hidden = rawQuestion.hiddenTestCases || [];
  if (!Array.isArray(hidden) || hidden.length === 0) {
    errors.push("Hidden test cases must be a non-empty array.");
  } else {
    hidden.forEach((tc, idx) => {
      if (tc.input === undefined || tc.input === null) errors.push(`Hidden case ${idx + 1} is missing input.`);
      if (tc.expected === undefined || tc.expected === null) errors.push(`Hidden case ${idx + 1} is missing expected output.`);
    });
  }

  const visible = rawQuestion.visibleTestCases || [];
  if (!Array.isArray(visible) || visible.length === 0) {
    errors.push("Visible test cases must be a non-empty array.");
  } else {
    visible.forEach((tc, idx) => {
      if (tc.input === undefined || tc.input === null) errors.push(`Visible case ${idx + 1} is missing input.`);
      if (tc.expected === undefined || tc.expected === null) errors.push(`Visible case ${idx + 1} is missing expected output.`);
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// POST /api/compiler/generate
const generateQuestion = async (req, res) => {
  try {
    const { role = "Fullstack Developer", difficulty = "Medium", topic, category } = req.body;
    const finalTopic = topic || category || "Arrays";
    
    // Fetch existing questions to avoid duplication
    const existing = await Question.find({}).select("title");
    const existingTitles = existing.map(q => q.title);

    // Call AI to generate question
    const rawQuestion = await generateSingleCodingQuestion(role, difficulty, finalTopic, existingTitles);

    // Validate generated question
    const validation = validateGeneratedQuestion(rawQuestion);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Generated coding question failed verification rules.",
        errors: validation.errors
      });
    }

    // Normalize starter and driver keys for DB insertion
    const rawStarters = rawQuestion.starterCode || rawQuestion.starters || {};
    const normalizedStarters = {};
    Object.keys(rawStarters).forEach(key => {
      const normKey = key.toLowerCase().replace("c++", "cpp");
      normalizedStarters[normKey] = rawStarters[key];
    });

    const rawDrivers = rawQuestion.driverCode || rawQuestion.drivers || {};
    const normalizedDrivers = {};
    Object.keys(rawDrivers).forEach(key => {
      const normKey = key.toLowerCase().replace("c++", "cpp");
      normalizedDrivers[normKey] = rawDrivers[key];
    });

    // Determine tags: use AI suggested tags, or default to the chosen topic
    let finalTags = [finalTopic];
    if (rawQuestion.tags && Array.isArray(rawQuestion.tags) && rawQuestion.tags.length > 0) {
      finalTags = rawQuestion.tags;
    }

    // Save complete question details in MongoDB
    const question = new Question({
      title: rawQuestion.title,
      description: rawQuestion.description,
      constraints: rawQuestion.constraints,
      examples: rawQuestion.examples,
      visibleTestCases: rawQuestion.visibleTestCases,
      hiddenTestCases: rawQuestion.hiddenTestCases,
      starterCode: normalizedStarters,
      driverCode: normalizedDrivers,
      expectedTimeComplexity: rawQuestion.expectedTimeComplexity || "O(n)",
      expectedSpaceComplexity: rawQuestion.expectedSpaceComplexity || "O(1)",
      difficulty: difficulty,
      role: role,
      tags: finalTags,
      functionName: rawQuestion.functionName || "solve",
      returnType: rawQuestion.returnType || "void",
      createdBy: req.user._id,
      solveCount: 0,
    });

    await question.save();

    // Do NOT return hiddenTestCases to candidate
    const questionData = question.toObject();
    delete questionData.hiddenTestCases;

    res.status(200).json({
      success: true,
      message: "Coding question generated, verified, and saved successfully.",
      question: questionData,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate question: " + error.message });
  }
};

// GET /api/compiler/questions
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({}).select("-hiddenTestCases");
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/compiler/questions/:id
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).select("-hiddenTestCases");
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/compiler/submissions
const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate("question", "title")
      .sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/compiler/questions/trending
const getTrendingQuestions = async (req, res) => {
  try {
    const mostSolved = await Question.find({}).sort({ solveCount: -1 }).limit(5).select("-hiddenTestCases");
    const recentlyGenerated = await Question.find({}).sort({ createdAt: -1 }).limit(5).select("-hiddenTestCases");

    // Highest Rated: get top average score submissions
    const avgScores = await Submission.aggregate([
      {
        $group: {
          _id: "$question",
          avgScore: { $avg: "$score" }
        }
      },
      { $sort: { avgScore: -1 } },
      { $limit: 10 }
    ]);
    const questionIds = avgScores.map(item => item._id);
    let highestRated = await Question.find({ _id: { $in: questionIds } }).select("-hiddenTestCases");

    highestRated.sort((a, b) => {
      const scoreA = avgScores.find(item => item._id.toString() === a._id.toString())?.avgScore || 0;
      const scoreB = avgScores.find(item => item._id.toString() === b._id.toString())?.avgScore || 0;
      return scoreB - scoreA;
    });

    if (highestRated.length < 5) {
      const fallbackQ = await Question.find({ _id: { $nin: questionIds } }).limit(5 - highestRated.length).select("-hiddenTestCases");
      highestRated = [...highestRated, ...fallbackQ];
    }

    res.status(200).json({
      mostSolved,
      recentlyGenerated,
      highestRated: highestRated.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trending questions: " + error.message });
  }
};

// GET /api/compiler/questions/my-practice
const getMyPractice = async (req, res) => {
  try {
    const userId = req.user._id;
    const submissions = await Submission.find({ user: userId }).populate("question");
    
    const solvedMap = {};
    const attemptedMap = {};
    
    submissions.forEach(sub => {
      if (!sub.question) return;
      const qId = sub.question._id.toString();
      if (sub.score === 100) {
        solvedMap[qId] = sub.question;
        delete attemptedMap[qId];
      } else {
        if (!solvedMap[qId]) {
          attemptedMap[qId] = sub.question;
        }
      }
    });

    const solvedList = Object.values(solvedMap);
    const attemptedList = Object.values(attemptedMap);

    const user = await User.findById(userId)
      .populate({ path: "savedQuestions", select: "-hiddenTestCases" })
      .populate({ path: "bookmarkedQuestions", select: "-hiddenTestCases" });

    res.status(200).json({
      solved: solvedList.map(q => {
        const qObj = q.toObject();
        delete qObj.hiddenTestCases;
        return qObj;
      }),
      attempted: attemptedList.map(q => {
        const qObj = q.toObject();
        delete qObj.hiddenTestCases;
        return qObj;
      }),
      saved: user.savedQuestions || [],
      bookmarked: user.bookmarkedQuestions || [],
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch practice profile: " + error.message });
  }
};

// POST /api/compiler/questions/:id/bookmark
const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const questionId = req.params.id;
    const isBookmarked = (user.bookmarkedQuestions || []).some(id => id.toString() === questionId);

    if (isBookmarked) {
      user.bookmarkedQuestions = user.bookmarkedQuestions.filter(id => id.toString() !== questionId);
    } else {
      user.bookmarkedQuestions.push(questionId);
    }

    await user.save();
    res.status(200).json({ success: true, bookmarked: !isBookmarked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/compiler/questions/:id/save
const toggleSave = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const questionId = req.params.id;
    const isSaved = (user.savedQuestions || []).some(id => id.toString() === questionId);

    if (isSaved) {
      user.savedQuestions = user.savedQuestions.filter(id => id.toString() !== questionId);
    } else {
      user.savedQuestions.push(questionId);
    }

    await user.save();
    res.status(200).json({ success: true, saved: !isSaved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/compiler/save-progress
const saveProgress = async (req, res) => {
  try {
    const { questionId, language, code, autoSaveEnabled } = req.body;
    if (!questionId || !language || code === undefined) {
      return res.status(400).json({ message: "questionId, language, and code are required." });
    }

    const savedRecord = await SavedCode.findOneAndUpdate(
      { user: req.user._id, question: questionId, language },
      { 
        code, 
        lastSavedAt: new Date(),
        autoSaveEnabled: autoSaveEnabled !== undefined ? autoSaveEnabled : true 
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Progress saved successfully.",
      savedRecord
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to save progress: " + error.message });
  }
};

// GET /api/compiler/get-progress/:questionId/:language
const getProgress = async (req, res) => {
  try {
    const { questionId, language } = req.params;
    const progress = await SavedCode.findOne({
      user: req.user._id,
      question: questionId,
      language
    });

    res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load progress: " + error.message });
  }
};

// GET /api/compiler/get-last-active
const getLastActive = async (req, res) => {
  try {
    const lastActive = await SavedCode.findOne({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .populate("question");

    res.status(200).json({
      success: true,
      lastActive
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get last active progress: " + error.message });
  }
};

module.exports = {
  runCode,
  submitCode,
  generateQuestion,
  getQuestions,
  getQuestionById,
  getSubmissions,
  getTrendingQuestions,
  getMyPractice,
  toggleBookmark,
  toggleSave,
  saveProgress,
  getProgress,
  getLastActive,
  combineUserSolutionAndDriver,
  executeLocalCode,
};
