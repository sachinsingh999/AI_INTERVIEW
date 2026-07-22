const mongoose = require("mongoose");
const TechnicalQuestion = require("../models/TechnicalQuestion");
const Question = require("../models/Question");

/**
 * Permanent Static Fallback Pool for Technical Round 1 (Guarantees zero-failure)
 * 1 Medium, 1 Hard for default fallback
 */
const STATIC_TECH_FALLBACK_POOL = [
  {
    id: "tech_fb_m1",
    type: "technical",
    difficulty: "Medium",
    category: "React / State Management",
    question: "Explain why React uses the Virtual DOM. How does reconciliation diffing improve rendering efficiency compared to direct DOM updates?",
    expectedAnswerPoints: ["Virtual DOM tree copy", "Batching updates", "Heuristic O(N) diffing algorithm", "Minimizing costly layout reflows"],
    idealAnswer: "React maintains an in-memory Virtual DOM representation. When state changes, a new Virtual DOM tree is generated and compared against the previous snapshot using a heuristic reconciliation diffing algorithm. Changes are batched and flushed to the real DOM in a single write operation, minimizing browser layout re-calculations and paint cycles.",
    evaluationRubric: {
      excellent: "Explains Virtual DOM immutability, diffing heuristics, keys optimization, and browser layout reflow costs with exact technical depth.",
      good: "Understands Virtual DOM and batching concepts clearly.",
      average: "Mentions Virtual DOM is faster than real DOM without explaining diffing details.",
      poor: "Confuses Virtual DOM with Shadow DOM or browser DOM APIs.",
    },
    timeLimit: 300,
    marks: 5,
    source: "Database",
  },
  {
    id: "tech_fb_h1",
    type: "technical",
    difficulty: "Hard",
    category: "Node.js / System Architecture",
    question: "How does the Node.js Event Loop manage asynchronous I/O across its 6 phases? Explain what happens when CPU-bound tasks block the Event Loop thread.",
    expectedAnswerPoints: ["libuv thread pool", "Phases: Timers, Pending, Poll, Check, Close", "Microtasks (process.nextTick, Promise)", "Event Loop starvation"],
    idealAnswer: "Node.js uses a single-threaded Event Loop backed by libuv's C++ thread pool. Asynchronous I/O operations are offloaded to OS kernel primitives or libuv worker threads. When completed, callbacks are queued into Event Loop phases (Timers, Poll, Check). Microtask queues (Promise callbacks, process.nextTick) run exhaustively between phases. Heavy synchronous CPU tasks block the main thread, freezing the Event Loop and starving incoming network requests.",
    evaluationRubric: {
      excellent: "Articulates all 6 event loop phases, microtask queue execution order, libuv thread pool offloading, and worker_threads solutions for CPU bottlenecks.",
      good: "Explains event loop phases and non-blocking I/O concepts accurately.",
      average: "Understands single-threaded nature but lacks phase-specific detail.",
      poor: "Incorrectly claims Node.js spawns a new OS thread for every incoming HTTP connection.",
    },
    timeLimit: 300,
    marks: 5,
    source: "Database",
  },
  {
    id: "tech_fb_m2",
    type: "technical",
    difficulty: "Medium",
    category: "System Design / Caching",
    question: "What are the trade-offs between Cache-Aside, Read-Through, and Write-Through caching strategies in a distributed microservices environment?",
    expectedAnswerPoints: ["Cache consistency", "Cache invalidation", "Stale data risks", "Write latency vs read performance"],
    idealAnswer: "In Cache-Aside, the application directly queries the cache, falling back to the database on a miss. It gives granular control but risks stale data if DB updates bypass the cache. Read-Through puts the cache inline with the DB. Write-Through updates the cache and DB synchronously, ensuring strict consistency at the cost of higher write latency.",
    evaluationRubric: {
      excellent: "Compares cache strategies, invalidation algorithms (LRU/LFU), TTL strategies, and race condition mitigations effectively.",
      good: "Explains difference between Cache-Aside and Write-Through clearly.",
      average: "Defines basic caching without discussing architectural trade-offs.",
      poor: "Cannot distinguish between memory caching and database indexing.",
    },
    timeLimit: 300,
    marks: 5,
    source: "Database",
  },
  {
    id: "tech_fb_h2",
    type: "technical",
    difficulty: "Hard",
    category: "Database Systems / Transactions",
    question: "Explain the 4 ANSI SQL Isolation Levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable). What concurrency anomalies does each prevent?",
    expectedAnswerPoints: ["Dirty Reads", "Non-Repeatable Reads", "Phantom Reads", "Multi-Version Concurrency Control (MVCC)"],
    idealAnswer: "Read Uncommitted permits Dirty Reads (reading uncommitted writes). Read Committed prevents Dirty Reads using short locks or MVCC snapshots. Repeatable Read prevents Non-Repeatable Reads (guaranteeing consistent row reads within a transaction). Serializable prevents Phantom Reads by using range locks or serializable snapshot isolation.",
    evaluationRubric: {
      excellent: "Detailed breakdown of MVCC, lock escalation, phantom read mechanisms, and performance impact of Serializable isolation.",
      good: "Accurately maps isolation levels to dirty/phantom read anomalies.",
      average: "Lists ACID properties without understanding transaction isolation levels.",
      poor: "Confuses database isolation levels with microservice security isolation.",
    },
    timeLimit: 300,
    marks: 5,
    source: "Database",
  },
];

/**
 * Multi-tier Progressive Filter Relaxation Fallback Service
 */
async function getFallbackTechnicalQuestions(neededCount = 2, existingQuestions = [], context = {}) {
  const selectedQuestions = [...existingQuestions];
  const neededDifficulties = [];

  // Determine needed difficulty distribution (1 Medium, 1 Hard)
  const hasMedium = selectedQuestions.some((q) => q.difficulty === "Medium");
  const hasHard = selectedQuestions.some((q) => q.difficulty === "Hard");

  if (!hasMedium) neededDifficulties.push("Medium");
  if (!hasHard) neededDifficulties.push("Hard");

  while (neededDifficulties.length < neededCount - selectedQuestions.length) {
    neededDifficulties.push(neededDifficulties.length % 2 === 0 ? "Medium" : "Hard");
  }

  const role = context.jobRole || context.role || "Software Engineer";
  const techTags = context.skills || context.technologies || ["JavaScript", "Node.js", "React"];
  const usedIds = new Set();
  const usedObjectIds = [];

  const addUsed = (val) => {
    if (!val) return;
    const strVal = String(val).trim();
    if (!strVal) return;
    usedIds.add(strVal);
    if (mongoose.Types.ObjectId.isValid(strVal)) {
      usedObjectIds.push(new mongoose.Types.ObjectId(strVal));
    }
  };

  for (const q of selectedQuestions) {
    addUsed(q.id);
    addUsed(q._id);
    addUsed(q.title);
    addUsed(q.question);
    addUsed(q.description);
  }

  if (Array.isArray(context.excludedTexts)) {
    for (const t of context.excludedTexts) {
      addUsed(t);
    }
  }

  for (const diff of neededDifficulties) {
    let matchedDoc = null;

    try {
      // Priority 1: Pick a RANDOM question matching difficulty from Question collection (Real DSA DB)
      let randomDocs = await Question.aggregate([
        { $match: { 
          difficulty: diff, 
          _id: { $nin: usedObjectIds },
          title: { $nin: Array.from(usedIds) },
          description: { $nin: Array.from(usedIds) }
        } },
        { $sample: { size: 1 } },
      ]);

      if ((!randomDocs || randomDocs.length === 0) && usedIds.size > 0) {
        randomDocs = await Question.aggregate([
          { $match: { difficulty: diff } },
          { $sample: { size: 1 } },
        ]);
      }

      if (randomDocs && randomDocs.length > 0) {
        matchedDoc = randomDocs[0];
      }

      // Priority 2: Pick ANY RANDOM question from Question collection
      if (!matchedDoc) {
        let anyRandomDocs = await Question.aggregate([
          { $match: { 
            _id: { $nin: usedObjectIds },
            title: { $nin: Array.from(usedIds) },
            description: { $nin: Array.from(usedIds) }
          } },
          { $sample: { size: 1 } },
        ]);

        if ((!anyRandomDocs || anyRandomDocs.length === 0) && usedIds.size > 0) {
          anyRandomDocs = await Question.aggregate([
            { $sample: { size: 1 } },
          ]);
        }

        if (anyRandomDocs && anyRandomDocs.length > 0) {
          matchedDoc = anyRandomDocs[0];
        }
      }

      // Priority 3: Fallback to random question in TechnicalQuestion collection
      if (!matchedDoc) {
        let techDocs = await TechnicalQuestion.aggregate([
          { $match: { 
            _id: { $nin: usedObjectIds },
            question: { $nin: Array.from(usedIds) },
            title: { $nin: Array.from(usedIds) }
          } },
          { $sample: { size: 1 } },
        ]);

        if ((!techDocs || techDocs.length === 0) && usedIds.size > 0) {
          techDocs = await TechnicalQuestion.aggregate([
            { $sample: { size: 1 } },
          ]);
        }

        if (techDocs && techDocs.length > 0) {
          matchedDoc = techDocs[0];
        }
      }
    } catch (e) {
      console.error("Error querying random question from DB collection:", e.message);
    }

    // Priority 4: Static Fallback Pool
    if (!matchedDoc) {
      const staticCandidate = STATIC_TECH_FALLBACK_POOL.find(
        (sq) => sq.difficulty === diff && !usedIds.has(sq.question) && !usedIds.has(sq.id)
      ) || STATIC_TECH_FALLBACK_POOL.find((sq) => !usedIds.has(sq.question));

      if (staticCandidate) {
        matchedDoc = { ...staticCandidate };
      }
    }

const { validateFunctionSignature, generateStarterCodeFromSignature } = require("./signatureService");

    if (matchedDoc) {
      const fnName = matchedDoc.functionSignature?.functionName || matchedDoc.functionName || (matchedDoc.title ? matchedDoc.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") : "solve");
      const retType = matchedDoc.functionSignature?.returnType || matchedDoc.returnType || "int";
      const parameters = matchedDoc.functionSignature?.parameters || matchedDoc.parameters || [
        { type: "vector<int>&", name: "height" }
      ];

      const functionSignature = {
        functionName: fnName,
        returnType: retType,
        parameters,
      };

      const validation = validateFunctionSignature(functionSignature);
      if (!validation.valid) {
        console.warn(`Invalid question signature for ${matchedDoc.title}: ${validation.reason}`);
      }

      const starterCodes = generateStarterCodeFromSignature(functionSignature);

      const formattedItem = {
        id: matchedDoc._id ? matchedDoc._id.toString() : matchedDoc.id || `dsa_db_${Date.now()}_${Math.random()}`,
        type: "coding",
        title: matchedDoc.title || matchedDoc.category || "DSA Coding Challenge",
        question: matchedDoc.description || matchedDoc.question || "DSA Problem Statement",
        description: matchedDoc.description || matchedDoc.question || "DSA Problem Statement",
        functionSignature,
        functionName: fnName,
        returnType: retType,
        parameters,
        difficulty: matchedDoc.difficulty || diff,
        category: Array.isArray(matchedDoc.tags) && matchedDoc.tags.length > 0 ? matchedDoc.tags[0] : (matchedDoc.category || "Dynamic Programming"),
        constraints: Array.isArray(matchedDoc.constraints)
          ? matchedDoc.constraints.join("\n")
          : (matchedDoc.constraints || `Time Complexity: ${matchedDoc.expectedTimeComplexity || "O(N)"}\nSpace Complexity: ${matchedDoc.expectedSpaceComplexity || "O(1)"}`),
        sampleInput: (matchedDoc.examples && matchedDoc.examples[0]?.input) || (matchedDoc.visibleTestCases && matchedDoc.visibleTestCases[0]?.input) || matchedDoc.sampleInput || "m = 3, n = 7",
        sampleOutput: (matchedDoc.examples && matchedDoc.examples[0]?.output) || (matchedDoc.visibleTestCases && matchedDoc.visibleTestCases[0]?.expected) || matchedDoc.sampleOutput || "28",
        examples: Array.isArray(matchedDoc.examples) && matchedDoc.examples.length > 0 ? matchedDoc.examples : [
          {
            input: (matchedDoc.visibleTestCases && matchedDoc.visibleTestCases[0]?.input) || "m = 3, n = 7",
            output: (matchedDoc.visibleTestCases && matchedDoc.visibleTestCases[0]?.expected) || "28",
            explanation: "Sample input and output test case."
          }
        ],
        testCases: Array.isArray(matchedDoc.visibleTestCases) && matchedDoc.visibleTestCases.length > 0
          ? matchedDoc.visibleTestCases.map((vtc, idx) => ({
              id: idx + 1,
              input: vtc.input,
              expectedOutput: vtc.expected,
              isHidden: false,
            }))
          : (Array.isArray(matchedDoc.testCases) ? matchedDoc.testCases : [
              { id: 1, input: "m = 3, n = 7", expectedOutput: "28", isHidden: false },
              { id: 2, input: "m = 3, n = 2", expectedOutput: "3", isHidden: false }
            ]),
        starterCode: starterCodes,
        driverCode: matchedDoc.driverCode || null,
        expectedAnswerPoints: Array.isArray(matchedDoc.constraints) && matchedDoc.constraints.length > 0
          ? matchedDoc.constraints
          : (Array.isArray(matchedDoc.expectedAnswerPoints) ? matchedDoc.expectedAnswerPoints : ["Optimal Time Complexity", "Space Complexity", "Edge Case Handling"]),
        idealAnswer: matchedDoc.idealAnswer || `Optimal DSA Solution with ${matchedDoc.expectedTimeComplexity || "O(N)"} time complexity.`,
        evaluationRubric: matchedDoc.evaluationRubric || {
          excellent: "Optimal solution meeting all complexity constraints.",
          good: "Clear understanding.",
          average: "Basic comprehension.",
          poor: "Incomplete or inaccurate.",
        },
        timeLimit: matchedDoc.timeLimit || 300,
        marks: matchedDoc.marks || 10,
        source: "Database",
      };

      usedIds.add(formattedItem.question);
      usedIds.add(formattedItem.title);
      selectedQuestions.push(formattedItem);
    }
  }

  // Ensure exactly 2 questions are returned
  while (selectedQuestions.length < 2) {
    const fallbackItem = { ...STATIC_TECH_FALLBACK_POOL[selectedQuestions.length % STATIC_TECH_FALLBACK_POOL.length] };
    fallbackItem.id = `tech_fb_guaranteed_${selectedQuestions.length + 1}`;
    selectedQuestions.push(fallbackItem);
  }

  return selectedQuestions.slice(0, 2);
}

module.exports = {
  getFallbackTechnicalQuestions,
  STATIC_TECH_FALLBACK_POOL,
};
