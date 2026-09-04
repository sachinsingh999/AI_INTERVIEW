const templates = {
  "react-vite": {
    templateId: "react-vite",
    displayName: "React + Vite (Frontend)",
    language: "javascript",
    framework: "react",
    installCmd: "npm install",
    buildCmd: "npm run build",
    runCmd: "npm run dev",
    previewPort: 5173,
    supportsPreview: true,
    supportsApiTesting: false,
    supportsTerminal: true,
    protectedFiles: ["package.json", "vite.config.js", "README.md"],
    executionLimits: {
      timeoutMs: 8500,
      memory: "256 MB",
    },
    testCases: [
      { id: "t1", label: "Component Search Hook Test", input: "iPhone", expected: "Passed" },
      { id: "t2", label: "State Filter Debounce Validation", input: "Audio", expected: "Passed" }
    ],
    starterFiles: [
      {
        path: "package.json",
        content: JSON.stringify(
          {
            name: "react-vite-challenge",
            private: true,
            version: "0.0.0",
            type: "module",
            scripts: {
              dev: "vite",
              build: "vite build",
            },
            dependencies: {
              react: "^18.2.0",
              "react-dom": "^18.2.0",
            },
            devDependencies: {
              vite: "^5.0.0",
              "@vitejs/plugin-react": "^4.2.0",
            },
          },
          null,
          2
        ),
        isReadOnly: true,
      },
      {
        path: "vite.config.js",
        content: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    port: 5173\n  }\n});`,
        isReadOnly: true,
      },
      {
        path: "src/main.jsx",
        content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App.jsx';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`,
        isReadOnly: false,
      },
      {
        path: "src/index.css",
        content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  margin: 0;\n  background-color: #0f172a;\n  color: white;\n  font-family: sans-serif;\n}`,
        isReadOnly: false,
      },
      {
        path: "src/App.jsx",
        content: `import React, { useState } from 'react';\nimport SearchBar from './components/SearchBar.jsx';\nimport ProductList from './components/ProductList.jsx';\n\nexport default function App() {\n  const [query, setQuery] = useState('');\n  const [category, setCategory] = useState('All');\n\n  return (\n    <div className="max-w-4xl mx-auto p-6 space-y-6">\n      <h1 className="text-3xl font-black text-indigo-400">Search Products</h1>\n      <SearchBar query={query} setQuery={setQuery} category={category} setCategory={setCategory} />\n      <ProductList query={query} category={category} />\n    </div>\n  );\n}`,
        isReadOnly: false,
      },
      {
        path: "src/components/SearchBar.jsx",
        content: `import React from 'react';\n\nexport default function SearchBar({ query, setQuery, category, setCategory }) {\n  // TODO: Render a search input field and category filter buttons.\n  // Make sure to bind appropriate props and update search category/query state.\n  return (\n    <div className="flex flex-col sm:flex-row gap-4 search-bar">\n      <input\n        type="text"\n        placeholder="Search products by title..."\n        value={query}\n        onChange={(e) => setQuery(e.target.value)}\n      />\n      <div className="flex gap-2">\n        {['All', 'Electronics', 'Audio', 'Accessories'].map((cat) => (\n          <button\n            key={cat}\n            onClick={() => setCategory(cat)}\n            className={\`px-3 py-1.5 rounded-lg text-xs font-bold border transition \${\n              category === cat\n                ? 'bg-indigo-600 border-indigo-500 text-white'\n                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'\n            }\`}\n          >\n            {cat}\n          </button>\n        ))}\n      </div>\n    </div>\n  );\n}`,
        isReadOnly: false,
      },
      {
        path: "src/components/ProductList.jsx",
        content: `import React from 'react';\n\nexport default function ProductList({ query, category }) {\n  // TODO: Use the MOCK_PRODUCTS array, filter items based on the search query (case-insensitive)\n  // and category, and map the filtered items dynamically.\n  return (\n    <div className="space-y-3">\n      <div className="product-card">\n        <h3 className="text-sm font-bold text-white">iPhone 15 Pro Max</h3>\n        <p className="text-xs text-slate-400">$1199 • Electronics</p>\n      </div>\n    </div>\n  );\n}`,
        isReadOnly: false,
      },
      {
        path: "src/hooks/useDebounce.js",
        content: `import { useState, useEffect } from 'react';\n\nexport default function useDebounce(value, delay) {\n  // TODO: Implement a custom debounce hook that delays updating the state value.\n  return value;\n}`,
        isReadOnly: false,
      },
      {
        path: "src/tests/hidden.spec.jsx",
        content: `// Hidden React component tests assertions\nconsole.log("Passed");`,
        isReadOnly: true,
        isHidden: true,
      },
    ],
  },
  "express-node": {
    templateId: "express-node",
    displayName: "Express Backend API",
    language: "javascript",
    framework: "express",
    installCmd: "npm install",
    buildCmd: "",
    runCmd: "node server.js",
    previewPort: 3000,
    supportsPreview: false,
    supportsApiTesting: true,
    supportsTerminal: true,
    protectedFiles: ["package.json", "README.md"],
    executionLimits: {
      timeoutMs: 5000,
      memory: "256 MB",
    },
    testCases: [
      { id: "t1", label: "GET /api/products returns products list", input: "/api/products", expected: "200" },
      { id: "t2", label: "POST /api/products validation", input: "/api/products", expected: "400" }
    ],
    starterFiles: [
      {
        path: "package.json",
        content: JSON.stringify(
          {
            name: "express-challenge",
            version: "1.0.0",
            main: "server.js",
            dependencies: {
              express: "^4.18.2",
            },
          },
          null,
          2
        ),
        isReadOnly: true,
      },
      {
        path: "server.js",
        content: `const express = require('express');\nconst app = express();\nconst PORT = 3000;\n\napp.use(express.json());\n\napp.get('/api/products', (req, res) => {\n  res.json([\n    { id: 1, title: 'Wireless Headset', price: 99.99, category: 'Audio' }\n  ]);\n});\n\napp.listen(PORT, () => {\n  console.log(\`Server is running on port \${PORT}\`);\n});`,
        isReadOnly: false,
      },
      {
        path: "tests/hidden.spec.js",
        content: `// Hidden backend route logic test assertions\nconsole.log("Passed");`,
        isReadOnly: true,
        isHidden: true,
      },
    ],
  },
  "spring-boot": {
    templateId: "spring-boot",
    displayName: "Spring Boot Java API",
    language: "java",
    framework: "springboot",
    installCmd: "mvn clean install -DskipTests",
    buildCmd: "mvn compile",
    runCmd: "mvn spring-boot:run",
    previewPort: 8080,
    supportsPreview: false,
    supportsApiTesting: true,
    supportsTerminal: false,
    protectedFiles: ["pom.xml", "README.md"],
    executionLimits: {
      timeoutMs: 15000,
      memory: "512 MB",
    },
    testCases: [
      { id: "t1", label: "GET /api/products Spring Boot Mapping", input: "/api/products", expected: "200" }
    ],
    starterFiles: [
      {
        path: "pom.xml",
        content: `<?xml version="1.0" encoding="UTF-8"?>\n<project xmlns="http://maven.apache.org/POM/4.0.0"\n         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">\n    <modelVersion>4.0.0</modelVersion>\n    <groupId>com.challenge</groupId>\n    <artifactId>springboot-challenge</artifactId>\n    <version>0.0.1-SNAPSHOT</version>\n    <parent>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>spring-boot-starter-parent</artifactId>\n        <version>3.1.5</version>\n    </parent>\n    <dependencies>\n        <dependency>\n            <groupId>org.springframework.boot</groupId>\n            <artifactId>spring-boot-starter-web</artifactId>\n        </dependency>\n    </dependencies>\n</project>`,
        isReadOnly: true,
      },
      {
        path: "src/main/java/com/challenge/Application.java",
        content: `package com.challenge;\n\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n\n@SpringBootApplication\npublic class Application {\n    public static void main(String[] args) {\n        SpringApplication.run(Application.class, args);\n    }\n}`,
        isReadOnly: false,
      },
      {
        path: "src/test/java/com/challenge/HiddenTest.java",
        content: `package com.challenge;\npublic class HiddenTest {\n    // Hidden tests suite declarations\n}`,
        isReadOnly: true,
        isHidden: true,
      },
    ],
  },
  "python-basic": {
    templateId: "python-basic",
    displayName: "Python Script Environment",
    language: "python",
    framework: "none",
    installCmd: "",
    buildCmd: "",
    runCmd: "python main.py",
    previewPort: 0,
    supportsPreview: false,
    supportsApiTesting: false,
    supportsTerminal: true,
    protectedFiles: ["README.md"],
    executionLimits: {
      timeoutMs: 4000,
      memory: "128 MB",
    },
    testCases: [
      { id: "t1", label: "Solve Output Integrity Check", input: "", expected: "Python execution runtime bootstrap complete." }
    ],
    starterFiles: [
      {
        path: "main.py",
        content: `def solve():\n    print("Python execution runtime bootstrap complete.")\n\nif __name__ == '__main__':\n    solve()`,
        isReadOnly: false,
      },
      {
        path: "requirements.txt",
        content: `# add dependencies here\n`,
        isReadOnly: false,
      },
      {
        path: ".hidden_test.py",
        content: `import sys\n# Hidden test assertions\nprint("Passed")`,
        isReadOnly: true,
        isHidden: true,
      },
    ],
  },
  "cpp-console": {
    templateId: "cpp-console",
    displayName: "C++ Compilation Environment",
    language: "cpp",
    framework: "none",
    installCmd: "",
    buildCmd: "g++ -std=c++17 main.cpp -o main_bin",
    runCmd: "./main_bin",
    previewPort: 0,
    supportsPreview: false,
    supportsApiTesting: false,
    supportsTerminal: true,
    protectedFiles: ["README.md"],
    executionLimits: {
      timeoutMs: 4000,
      memory: "128 MB",
    },
    testCases: [
      { id: "t1", label: "Standard Output Verification", input: "", expected: "C++ runtime compilation successful." }
    ],
    starterFiles: [
      {
        path: "main.cpp",
        content: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "C++ runtime compilation successful." << endl;\n    return 0;\n}`,
        isReadOnly: false,
      },
      {
        path: ".hidden_test.cpp",
        content: `// Hidden verification scripts\nvoid test() {}`,
        isReadOnly: true,
        isHidden: true,
      },
    ],
  },
  "java-console": {
    templateId: "java-console",
    displayName: "Java Console App",
    language: "java",
    framework: "none",
    installCmd: "",
    buildCmd: "javac Main.java",
    runCmd: "java Main",
    previewPort: 0,
    supportsPreview: false,
    supportsApiTesting: false,
    supportsTerminal: true,
    protectedFiles: ["README.md"],
    executionLimits: {
      timeoutMs: 5000,
      memory: "256 MB",
    },
    testCases: [
      { id: "t1", label: "Console Print Verification", input: "", expected: "Java compilation bootstrap successful." }
    ],
    starterFiles: [
      {
        path: "Main.java",
        content: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Java compilation bootstrap successful.");\n    }\n}`,
        isReadOnly: false,
      },
      {
        path: "HiddenTest.java",
        content: `public class HiddenTest {\n    // Hidden validation suites\n}`,
        isReadOnly: true,
        isHidden: true,
      },
    ],
  },
};

const getTemplate = (templateId) => {
  return templates[templateId] || templates["react-vite"];
};

const determineTemplateId = (role, skills = []) => {
  const roleLower = (role || "").toLowerCase();
  const skillsStr = skills.map(s => s.toLowerCase()).join(" ");

  if (roleLower.includes("react") || roleLower.includes("frontend")) {
    return "react-vite";
  }
  if (roleLower.includes("spring") || skillsStr.includes("spring") || skillsStr.includes("java")) {
    if (roleLower.includes("backend")) return "spring-boot";
    return "java-console";
  }
  if (roleLower.includes("node") || roleLower.includes("express") || roleLower.includes("backend")) {
    return "express-node";
  }
  if (skillsStr.includes("python") || roleLower.includes("python")) {
    return "python-basic";
  }
  if (skillsStr.includes("c++") || roleLower.includes("c++")) {
    return "cpp-console";
  }

  return "react-vite";
};

module.exports = {
  templates,
  getTemplate,
  determineTemplateId,
};
