/**
 * Single Source of Truth for Function Signature & Starter Code Generation
 * Behaves like LeetCode / HackerRank / CodeSignal
 */

const mapCppTypeToJava = (cppType) => {
  if (!cppType) return "Object";
  const t = String(cppType).trim();
  if (t.includes("vector<int>") || t.includes("vector<integer>")) return "int[]";
  if (t.includes("vector<string>")) return "String[]";
  if (t.includes("vector<double>")) return "double[]";
  if (t.includes("vector<vector<int>>")) return "int[][]";
  if (t === "int") return "int";
  if (t === "string" || t === "String") return "String";
  if (t === "double" || t === "float") return "double";
  if (t === "bool" || t === "boolean") return "boolean";
  if (t.includes("ListNode")) return "ListNode";
  if (t.includes("TreeNode")) return "TreeNode";
  return t;
};

const mapCppTypeToPython = (cppType) => {
  if (!cppType) return "Any";
  const t = String(cppType).trim();
  if (t.includes("vector<int>") || t.includes("vector<integer>")) return "List[int]";
  if (t.includes("vector<string>")) return "List[str]";
  if (t.includes("vector<double>")) return "List[float]";
  if (t.includes("vector<vector<int>>")) return "List[List[int]]";
  if (t === "int") return "int";
  if (t === "string" || t === "String") return "str";
  if (t === "double" || t === "float") return "float";
  if (t === "bool" || t === "boolean") return "bool";
  if (t.includes("ListNode")) return "Optional[ListNode]";
  if (t.includes("TreeNode")) return "Optional[TreeNode]";
  return "Any";
};

const mapCppTypeToJS = (cppType) => {
  if (!cppType) return "any";
  const t = String(cppType).trim();
  if (t.includes("vector<int>") || t.includes("vector<integer>")) return "number[]";
  if (t.includes("vector<string>")) return "string[]";
  if (t.includes("vector<double>")) return "number[]";
  if (t.includes("vector<vector<int>>")) return "number[][]";
  if (t === "int" || t === "double" || t === "float") return "number";
  if (t === "string" || t === "String") return "string";
  if (t === "bool" || t === "boolean") return "boolean";
  if (t.includes("ListNode")) return "ListNode";
  if (t.includes("TreeNode")) return "TreeNode";
  return "any";
};

const validateFunctionSignature = (sig) => {
  if (!sig || typeof sig !== "object") {
    return { valid: false, reason: "functionSignature object missing" };
  }
  if (!sig.functionName || typeof sig.functionName !== "string" || !sig.functionName.trim()) {
    return { valid: false, reason: "functionName missing or invalid" };
  }
  if (!sig.returnType) {
    return { valid: false, reason: "returnType missing" };
  }
  if (!Array.isArray(sig.parameters)) {
    return { valid: false, reason: "parameters must be an array" };
  }

  const paramNames = new Set();
  for (let i = 0; i < sig.parameters.length; i++) {
    const p = sig.parameters[i];
    if (!p || typeof p !== "object") {
      return { valid: false, reason: `Parameter at index ${i} is invalid` };
    }
    if (!p.name || typeof p.name !== "string" || !p.name.trim()) {
      return { valid: false, reason: `Parameter at index ${i} missing name` };
    }
    if (!p.type) {
      return { valid: false, reason: `Parameter at index ${i} missing type` };
    }
    const cleanName = p.name.trim();
    if (paramNames.has(cleanName)) {
      return { valid: false, reason: `Duplicate parameter name: ${cleanName}` };
    }
    paramNames.add(cleanName);
  }

  return { valid: true };
};

const generateStarterCodeFromSignature = (sig) => {
  const fnName = sig?.functionName || "solve";
  const retType = typeof sig?.returnType === "string" ? sig.returnType : (sig?.returnType?.cpp || "int");
  const params = Array.isArray(sig?.parameters) ? sig.parameters : [];

  // C++
  const cppParamsStr = params.map(p => `${typeof p.type === "string" ? p.type : (p.type?.cpp || "int")} ${p.name}`).join(", ");
  const cpp = `class Solution {\npublic:\n    ${retType} ${fnName}(${cppParamsStr}) {\n        \n    }\n};`;

  // Java
  const javaRet = mapCppTypeToJava(retType);
  const javaParamsStr = params.map(p => `${mapCppTypeToJava(typeof p.type === "string" ? p.type : p.type?.java)} ${p.name}`).join(", ");
  const java = `class Solution {\n    public ${javaRet} ${fnName}(${javaParamsStr}) {\n        \n    }\n}`;

  // Python
  const pyRet = mapCppTypeToPython(retType);
  const pyParamsStr = params.map(p => `${p.name}: ${mapCppTypeToPython(typeof p.type === "string" ? p.type : p.type?.python)}`).join(", ");
  const python = `class Solution:\n    def ${fnName}(self, ${pyParamsStr}) -> ${pyRet}:\n        pass`;

  // JavaScript
  const jsDocParams = params.map(p => ` * @param {${mapCppTypeToJS(typeof p.type === "string" ? p.type : p.type?.javascript)}} ${p.name}`).join("\n");
  const jsRet = mapCppTypeToJS(retType);
  const jsParamsStr = params.map(p => p.name).join(", ");
  const javascript = jsDocParams.trim()
    ? `/**\n${jsDocParams}\n * @return {${jsRet}}\n */\nfunction ${fnName}(${jsParamsStr}) {\n    \n}`
    : `function ${fnName}(${jsParamsStr}) {\n    \n}`;

  return { cpp, java, python, javascript };
};

module.exports = {
  validateFunctionSignature,
  generateStarterCodeFromSignature,
  mapCppTypeToJava,
  mapCppTypeToPython,
  mapCppTypeToJS
};
