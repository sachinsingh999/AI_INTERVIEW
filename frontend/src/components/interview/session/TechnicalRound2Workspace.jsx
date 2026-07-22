import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Clock,
  Save,
  Globe,
  Play,
  Send,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Settings,
  ChevronDown,
  ChevronRight,
  Code,
  Folder,
  FolderPlus,
  FilePlus,
  FileCode,
  BookOpen,
  Terminal,
  Activity,
  AlertCircle,
  HelpCircle,
  Trash2,
  Edit,
  Copy,
  Plus,
  X,
  Lock,
  Check,
  Search,
  Pin,
  Laptop,
  Tablet as TabletIcon,
  Phone,
  RefreshCw,
  ExternalLink,
  Award,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  History,
  TrendingUp,
  Cpu,
  Database,
  LockKeyhole,
  Download,
  Copy as CopyIcon,
  Square,
  PlayCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import api from "../../../services/api";
import { useTheme } from "../../../context/ThemeContext";

const templateRegistry = {
  "react-vite": { supportsPreview: true, supportsApiTesting: false, previewPort: 5173, displayName: "React + Vite (Frontend)" },
  "express-node": { supportsPreview: false, supportsApiTesting: true, previewPort: 3000, displayName: "Express Backend API" },
  "spring-boot": { supportsPreview: false, supportsApiTesting: true, previewPort: 8080, displayName: "Spring Boot Java API" },
  "python-basic": { supportsPreview: false, supportsApiTesting: false, displayName: "Python Script Environment" },
  "cpp-console": { supportsPreview: false, supportsApiTesting: false, displayName: "C++ Compilation Environment" },
  "java-console": { supportsPreview: false, supportsApiTesting: false, displayName: "Java Console App" },
};

export default function TechnicalRound2Workspace({
  interviewId,
  role = "Frontend React Developer",
  difficulty = "Medium",
  timeLeftSeconds = 1800,
  onCompletePhase,
}) {
  const token = localStorage.getItem("token");

  // Layout & Theme
  const { resolvedTheme, setTheme: setGlobalTheme } = useTheme();
  const theme = resolvedTheme;
  const [panelWidth, setPanelWidth] = useState(() => Number(localStorage.getItem("tech2_panel_width")) || 45);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(() => localStorage.getItem("tech2_left_collapsed") === "true");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Active Left Sidebar view (Explorer vs History vs Monitoring)
  const [activeSidebarView, setActiveSidebarView] = useState("explorer");

  // Predefined Project Templates
  const [templateId, setTemplateId] = useState("react-vite");

  // File tree & tabs
  const [files, setFiles] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null); // String, 'preview', 'tester', or 'report'
  const [expandedFolders, setExpandedFolders] = useState({});
  const [pinnedTabs, setPinnedTabs] = useState({});

  // Version History
  const [workspaceVersions, setWorkspaceVersions] = useState([]);

  // Responsive preview frame configuration
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [previewKey, setPreviewKey] = useState(0);

  // API Request Tester (for backend templates)
  const [apiMethod, setApiMethod] = useState("GET");
  const [apiUrl, setApiUrl] = useState("http://localhost:3000/api/products");
  const [apiHeaders, setApiHeaders] = useState([{ key: "Content-Type", value: "application/json" }]);
  const [apiBody, setApiBody] = useState("{\n  \"query\": \"\"\n}");
  
  const [apiResponse, setApiResponse] = useState(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // CRUD & Context Menu UI states
  const [newTarget, setNewTarget] = useState(null);
  const [newIName, setNewIName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [contextMenu, setContextMenu] = useState(null);

  // Telemetry & States
  const [saveStatus, setSaveStatus] = useState("saved");
  const [toast, setToast] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Execution environment states
  const [problems, setProblems] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [isExecutingTests, setIsExecutingTests] = useState(false);
  const [editorCursorTarget, setEditorCursorTarget] = useState(null);

  const eventSourceRef = useRef(null);
  const editorRef = useRef(null);
  const [cursorPositions, setCursorPositions] = useState({});
  const [scrollTops, setScrollTops] = useState({});

  // Submission Pipeline states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workspaceSubmission, setWorkspaceSubmission] = useState(null);

  // Bottom Panel State
  const [bottomExpanded, setBottomExpanded] = useState(false);
  const [bottomTab, setBottomTab] = useState("terminal"); // 'terminal' | 'console' | 'output' | 'problems' | 'tests'
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);

  // Section Collapsed States
  const [collapsedSections, setCollapsedSections] = useState({
    overview: false,
    statement: false,
    functional: false,
    nonFunctional: false,
    acceptance: false,
    apiDoc: false,
    projectStructure: false,
    constraints: false,
    rubric: false,
    notes: false,
    hints: true,
  });

  // Timer Setup
  const [secsLeft, setSecsLeft] = useState(timeLeftSeconds);
  useEffect(() => {
    setSecsLeft(timeLeftSeconds);
  }, [timeLeftSeconds]);

  useEffect(() => {
    if (workspaceSubmission?.isSubmitted) return;
    const timer = setInterval(() => {
      setSecsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [workspaceSubmission]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Scroll Position Ref
  const leftPanelRef = useRef(null);
  const containerRef = useRef(null);
  const isResizing = useRef(false);

  // Load Workspace from Database
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await api.get(`/interview/${interviewId}/workspace`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          const filesData = res.data.workspaceFiles || [];
          setFiles(filesData);

          if (res.data.templateId) {
            setTemplateId(res.data.templateId);
            const port = templateRegistry[res.data.templateId]?.previewPort || 3000;
            setApiUrl(`http://localhost:${port}/api/products`);
          }

          const stateData = res.data.workspaceState || {};
          if (stateData.openTabs) setOpenTabs(stateData.openTabs);
          if (stateData.activeFileId) setActiveFileId(stateData.activeFileId);
          if (stateData.expandedFolders) setExpandedFolders(stateData.expandedFolders);
          if (stateData.pinnedTabs) setPinnedTabs(stateData.pinnedTabs);
          if (stateData.cursorPositions) setCursorPositions(stateData.cursorPositions);
          if (stateData.scrollTops) setScrollTops(stateData.scrollTops);

          if (res.data.workspaceSubmission && res.data.workspaceSubmission.isSubmitted) {
            setWorkspaceSubmission(res.data.workspaceSubmission);
            setActiveFileId("report");
          }

          fetchVersions();
        }
      } catch (err) {
        console.error("Error loading workspace:", err);
        showToast("Error loading project workspace from server.", "error");
      }
    };
    if (interviewId) fetchWorkspace();
  }, [interviewId, token]);

  const fetchVersions = async () => {
    try {
      const res = await api.get(`/interview/${interviewId}/workspace-versions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.versions) {
        setWorkspaceVersions(res.data.versions);
      }
    } catch (e) {
      console.error("Error fetching version snapshots:", e);
    }
  };

  useEffect(() => {
    if (isOnline && files.length > 0) {
      triggerAutosave(files, activeFileId, openTabs, expandedFolders, pinnedTabs);
    }
  }, [isOnline]);

  // Monaco Editor mount capture for target cursors
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      const position = editor.getPosition();
      if (position && activeFileId) {
        setCursorPositions((prev) => {
          const existing = prev[activeFileId];
          if (existing && existing.lineNumber === position.lineNumber && existing.column === position.column) {
            return prev;
          }
          const next = { ...prev, [activeFileId]: { lineNumber: position.lineNumber, column: position.column } };
          triggerAutosave(files, activeFileId, openTabs, expandedFolders, pinnedTabs, next, scrollTops);
          return next;
        });
      }
    });

    editor.onDidScrollChange((e) => {
      const scrollTop = editor.getScrollTop();
      if (activeFileId) {
        setScrollTops((prev) => {
          const existing = prev[activeFileId];
          if (existing === scrollTop) {
            return prev;
          }
          const next = { ...prev, [activeFileId]: scrollTop };
          triggerAutosave(files, activeFileId, openTabs, expandedFolders, pinnedTabs, cursorPositions, next);
          return next;
        });
      }
    });

    if (activeFileId) {
      const savedPos = cursorPositions[activeFileId];
      if (savedPos) {
        editor.setPosition({
          lineNumber: savedPos.lineNumber,
          column: savedPos.column,
        });
        editor.revealLineInCenter(savedPos.lineNumber);
      }
      const savedScrollTop = scrollTops[activeFileId];
      if (typeof savedScrollTop === "number") {
        editor.setScrollTop(savedScrollTop);
      }
    }
  };

  useEffect(() => {
    if (editorCursorTarget && editorRef.current) {
      editorRef.current.revealLineInCenter(editorCursorTarget.line);
      editorRef.current.setPosition({
        lineNumber: editorCursorTarget.line,
        column: editorCursorTarget.column || 1,
      });
      editorRef.current.focus();
      setEditorCursorTarget(null);
    }
  }, [editorCursorTarget]);

  useEffect(() => {
    if (!editorRef.current || !activeFileId) return;

    const savedPos = cursorPositions[activeFileId];
    if (savedPos) {
      editorRef.current.setPosition({
        lineNumber: savedPos.lineNumber,
        column: savedPos.column,
      });
      editorRef.current.revealLineInCenter(savedPos.lineNumber);
    } else {
      editorRef.current.setPosition({ lineNumber: 1, column: 1 });
      editorRef.current.revealLine(1);
    }

    const savedScrollTop = scrollTops[activeFileId];
    if (typeof savedScrollTop === "number") {
      editorRef.current.setScrollTop(savedScrollTop);
    } else {
      editorRef.current.setScrollTop(0);
    }
  }, [activeFileId]);

  // Interview Integrity Event Tracking
  const logIntegrity = async (eventType, details) => {
    try {
      await api.post(
        `/interview/${interviewId}/integrity-event`,
        { eventType, details },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to log integrity event:", err);
    }
  };

  useEffect(() => {
    const handleBlur = () => logIntegrity("Window Focus Lost", "Candidate exited full tab or window focus.");
    const handleFocus = () => logIntegrity("Window Focus Restored", "Candidate returned to workspace screen.");
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        logIntegrity("Tab Hidden", "Workspace tab was hidden behind other tasks.");
      } else {
        logIntegrity("Tab Visible", "Workspace tab was active again.");
      }
    };

    const handleCopy = () => {
      const selectedText = window.getSelection().toString();
      logIntegrity("Text Copied", `Copied: "${selectedText.substring(0, 100)}"`);
    };

    const handlePaste = () => {
      logIntegrity("Text Pasted", "Pasted content inside coding editor.");
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [interviewId, token]);

  // Autosave to database
  const autosaveTimerRef = useRef(null);
  const triggerAutosave = (updatedFiles, currentActive, tabs, expanded, pinned, currentCursors = cursorPositions, currentScrolls = scrollTops) => {
    if (workspaceSubmission?.isSubmitted) return;

    setSaveStatus("saving");
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.post(
          `/interview/${interviewId}/workspace`,
          {
            workspaceFiles: updatedFiles,
            workspaceState: {
              activeFileId: currentActive,
              openTabs: tabs,
              expandedFolders: expanded,
              pinnedTabs: pinned,
              cursorPositions: currentCursors,
              scrollTops: currentScrolls,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSaveStatus("saved");
        if (res.data && res.data.versions) {
          setWorkspaceVersions(res.data.versions);
        }
      } catch (err) {
        console.error("Autosave error:", err);
        setSaveStatus("error");
      }
    }, 2000);
  };

  // Toast helper
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Restore scroll position
  useEffect(() => {
    const savedScroll = localStorage.getItem("tech2_left_scroll");
    if (savedScroll && leftPanelRef.current) {
      leftPanelRef.current.scrollTop = Number(savedScroll);
    }
  }, []);

  const handleLeftScroll = () => {
    if (leftPanelRef.current) {
      localStorage.setItem("tech2_left_scroll", leftPanelRef.current.scrollTop);
    }
  };

  // Resizing Panels
  const startResizing = (e) => {
    isResizing.current = true;
    document.addEventListener("mousemove", resizePanels);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const resizePanels = (e) => {
    if (!isResizing.current || !containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const mouseX = e.clientX - containerRef.current.getBoundingClientRect().left;
    const newWidthPercent = (mouseX / containerWidth) * 100;

    if (newWidthPercent >= 25 && newWidthPercent <= 75) {
      setPanelWidth(newWidthPercent);
      localStorage.setItem("tech2_panel_width", newWidthPercent);
    }
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", resizePanels);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleShortcuts = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl) {
        if (e.key === "s") {
          e.preventDefault();
          if (workspaceSubmission?.isSubmitted) return;
          triggerAutosave(files, activeFileId, openTabs, expandedFolders, pinnedTabs);
          showToast("Project saved successfully.", "success");
        } else if (e.key === "w" && activeFileId) {
          e.preventDefault();
          closeTab(activeFileId);
        } else if (e.key === "n" && !workspaceSubmission?.isSubmitted) {
          e.preventDefault();
          if (e.shiftKey) {
            setNewTarget({ parentFolderId: null, type: "folder" });
          } else {
            setNewTarget({ parentFolderId: null, type: "file" });
          }
        }
      }
    };
    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, [files, activeFileId, openTabs, expandedFolders, pinnedTabs, workspaceSubmission]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const getFileLanguage = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    const mapping = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      cpp: "cpp",
      java: "java",
      py: "python",
      go: "go",
      rs: "rust",
      cs: "csharp",
      sql: "sql",
      yaml: "yaml",
      xml: "xml",
    };
    return mapping[ext] || "plaintext";
  };

  const toggleSection = (section) => {
    setCollapsedSections((prev) => {
      const next = { ...prev, [section]: !prev[section] };
      localStorage.setItem("tech2_collapsed_sections", JSON.stringify(next));
      return next;
    });
  };

  const toggleLeftPanel = () => {
    setIsLeftCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("tech2_left_collapsed", String(next));
      return next;
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        logIntegrity("Fullscreen Entered", "Candidate activated full-screen focus.");
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        logIntegrity("Fullscreen Exited", "Candidate disabled full-screen workspace.");
      });
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setGlobalTheme(nextTheme);
  };

  // CRUD Operations
  const handleCreateItem = () => {
    if (workspaceSubmission?.isSubmitted) return;

    if (!newIName.trim()) {
      setNewTarget(null);
      return;
    }

    const parentId = newTarget.parentFolderId;
    const sameFolderItems = files.filter(f => f.parentFolderId === parentId);
    if (sameFolderItems.some(f => f.name.toLowerCase() === newIName.trim().toLowerCase())) {
      showToast("A file or folder with this name already exists.", "error");
      return;
    }

    const newItem = {
      id: generateId(),
      name: newIName.trim(),
      path: parentId ? `${files.find(f => f.id === parentId).path}/${newIName.trim()}` : newIName.trim(),
      type: newTarget.type,
      content: newTarget.type === "file" ? "" : undefined,
      language: newTarget.type === "file" ? getFileLanguage(newIName.trim()) : undefined,
      isReadOnly: false,
      isModified: false,
      parentFolderId: parentId,
    };

    const nextFiles = [...files, newItem];
    setFiles(nextFiles);
    setNewTarget(null);
    setNewIName("");

    if (newItem.type === "file") {
      openFile(newItem.id);
    }
    triggerAutosave(nextFiles, activeFileId, openTabs, expandedFolders, pinnedTabs);
  };

  const handleRenameItem = (id) => {
    if (workspaceSubmission?.isSubmitted) return;

    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }

    const item = files.find(f => f.id === id);
    if (item.isReadOnly) {
      showToast("Protected files cannot be renamed.", "error");
      setEditingId(null);
      return;
    }

    const sameFolderItems = files.filter(f => f.parentFolderId === item.parentFolderId && f.id !== id);
    if (sameFolderItems.some(f => f.name.toLowerCase() === editingName.trim().toLowerCase())) {
      showToast("A file or folder with this name already exists.", "error");
      return;
    }

    const nextFiles = files.map(f => {
      if (f.id === id) {
        return {
          ...f,
          name: editingName.trim(),
          language: f.type === "file" ? getFileLanguage(editingName.trim()) : undefined,
        };
      }
      return f;
    });

    setFiles(nextFiles);
    setEditingId(null);
    setEditingName("");
    triggerAutosave(nextFiles, activeFileId, openTabs, expandedFolders, pinnedTabs);
  };

  const handleDeleteItem = (id) => {
    if (workspaceSubmission?.isSubmitted) return;

    const item = files.find(f => f.id === id);
    if (item.isReadOnly) {
      showToast("Protected files cannot be deleted.", "error");
      return;
    }

    const getChildrenIds = (parentId) => {
      let ids = [];
      const children = files.filter(f => f.parentFolderId === parentId);
      for (const child of children) {
        ids.push(child.id);
        if (child.type === "folder") {
          ids = [...ids, ...getChildrenIds(child.id)];
        }
      }
      return ids;
    };

    const deleteIds = [id, ...getChildrenIds(id)];
    const nextFiles = files.filter(f => !deleteIds.includes(f.id));

    setFiles(nextFiles);
    const nextTabs = openTabs.filter(tid => !deleteIds.includes(tid));
    setOpenTabs(nextTabs);
    if (deleteIds.includes(activeFileId)) {
      setActiveFileId(nextTabs[0] || null);
    }

    triggerAutosave(nextFiles, activeFileId, nextTabs, expandedFolders, pinnedTabs);
    showToast("Deleted successfully.", "success");
  };

  const handleDuplicateFile = (id) => {
    if (workspaceSubmission?.isSubmitted) return;

    const item = files.find(f => f.id === id);
    if (item.type !== "file") return;

    const ext = item.name.includes(".") ? `.${item.name.split(".").pop()}` : "";
    const nameWithoutExt = item.name.substring(0, item.name.length - ext.length);
    const newName = `${nameWithoutExt}_copy${ext}`;

    const newItem = {
      id: generateId(),
      name: newName,
      path: item.parentFolderId ? `${files.find(f => f.id === item.parentFolderId).path}/${newName}` : newName,
      type: "file",
      content: item.content,
      language: item.language,
      isReadOnly: false,
      isModified: false,
      parentFolderId: item.parentFolderId,
    };

    const nextFiles = [...files, newItem];
    setFiles(nextFiles);
    openFile(newItem.id);
    triggerAutosave(nextFiles, newItem.id, [...openTabs, newItem.id], expandedFolders, pinnedTabs);
  };

  // Tab management
  const openFile = (id) => {
    if (!openTabs.includes(id)) {
      setOpenTabs((prev) => [...prev, id]);
    }
    setActiveFileId(id);
    triggerAutosave(files, id, [...openTabs.filter(t => t !== id), id], expandedFolders, pinnedTabs);
  };

  const closeTab = (id) => {
    const nextTabs = openTabs.filter(tid => tid !== id);
    setOpenTabs(nextTabs);
    if (activeFileId === id) {
      setActiveFileId(nextTabs[nextTabs.length - 1] || null);
    }
    triggerAutosave(files, nextTabs[nextTabs.length - 1] || null, nextTabs, expandedFolders, pinnedTabs);
  };

  const togglePinTab = (id) => {
    setPinnedTabs((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      triggerAutosave(files, activeFileId, openTabs, expandedFolders, next);
      return next;
    });
  };

  const closeOthers = (id) => {
    const nextTabs = openTabs.filter(tid => tid === id || pinnedTabs[tid]);
    setOpenTabs(nextTabs);
    setActiveFileId(id);
    triggerAutosave(files, id, nextTabs, expandedFolders, pinnedTabs);
  };

  const closeAllTabs = () => {
    const nextTabs = openTabs.filter(tid => pinnedTabs[tid]);
    setOpenTabs(nextTabs);
    setActiveFileId(nextTabs[0] || null);
    triggerAutosave(files, nextTabs[0] || null, nextTabs, expandedFolders, pinnedTabs);
  };

  // Monaco Editor Change Listener
  const handleEditorChange = (value) => {
    if (workspaceSubmission?.isSubmitted) return;

    const activeFileObj = files.find(f => f.id === activeFileId);
    if (activeFileObj && activeFileObj.isReadOnly) {
      showToast("This file is protected and read-only.", "error");
      return;
    }

    const nextFiles = files.map(f => {
      if (f.id === activeFileId) {
        return { ...f, content: value, isModified: true };
      }
      return f;
    });
    setFiles(nextFiles);
    triggerAutosave(nextFiles, activeFileId, openTabs, expandedFolders, pinnedTabs);
  };

  const toggleFolder = (id) => {
    setExpandedFolders((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      triggerAutosave(files, activeFileId, openTabs, next, pinnedTabs);
      return next;
    });
  };

  // Context Menu
  const handleContextMenu = (e, fileId) => {
    if (workspaceSubmission?.isSubmitted) return;
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      fileId,
    });
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Restore Version Snapshot
  const handleRestoreVersion = async (versionId) => {
    if (workspaceSubmission?.isSubmitted) return;

    try {
      const res = await api.post(
        `/interview/${interviewId}/restore-version`,
        { versionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        setFiles(res.data.workspaceFiles || []);
        const state = res.data.workspaceState || {};
        if (state.openTabs) setOpenTabs(state.openTabs);
        if (state.activeFileId) setActiveFileId(state.activeFileId);
        showToast("Version snapshot restored.", "success");
      }
    } catch (err) {
      console.error("Restore version error:", err);
      showToast("Failed to restore snapshot.", "error");
    }
  };

  // Compiler Diagnostics parsing for Problems tab
  const parseProblemsFromStderr = (stderr) => {
    const nextProblems = [];
    const lines = stderr.split("\n");

    lines.forEach((line) => {
      // 1. GCC / G++ error format: file:line:col: severity: description
      const gccMatch = line.match(/^([^:\n]+):(\d+):(\d+):\s+(error|warning|note):\s+(.*)$/i);
      if (gccMatch) {
        const [, filePath, lineStr, colStr, severity, desc] = gccMatch;
        const fileObj = files.find(f => f.path.endsWith(filePath.trim()));
        nextProblems.push({
          id: Math.random().toString(),
          severity: severity.toLowerCase(),
          file: filePath,
          fileId: fileObj?.id || null,
          line: Number(lineStr),
          column: Number(colStr),
          description: desc,
        });
        return;
      }

      // 2. Python traceback format: File "filepath", line X
      const pyMatch = line.match(/File\s+"([^"]+)",\s+line\s+(\d+)/i);
      if (pyMatch) {
        const [, filePath, lineStr] = pyMatch;
        const fileObj = files.find(f => f.path.endsWith(filePath.trim()));
        nextProblems.push({
          id: Math.random().toString(),
          severity: "error",
          file: filePath,
          fileId: fileObj?.id || null,
          line: Number(lineStr),
          column: 1,
          description: "SyntaxError or Runtime Exception detected.",
        });
        return;
      }

      // 3. Node.js stacktrace format: at Object.<anonymous> (file:line:col)
      const nodeMatch = line.match(/at\s+.*\(?([^:\s]+):(\d+):(\d+)\)?/i);
      if (nodeMatch) {
        const [, filePath, lineStr, colStr] = nodeMatch;
        if (filePath.includes("node_modules") || filePath.includes("node:internal")) return;
        const fileObj = files.find(f => f.path.endsWith(filePath.trim()));
        nextProblems.push({
          id: Math.random().toString(),
          severity: "error",
          file: filePath,
          fileId: fileObj?.id || null,
          line: Number(lineStr),
          column: Number(colStr),
          description: "Exception call stack frame",
        });
      }
    });

    if (nextProblems.length > 0) {
      setProblems((prev) => [...prev, ...nextProblems]);
    }
  };

  // Real-time EventSource Log Streaming sandbox connection
  const handleRunProject = async () => {
    if (workspaceSubmission?.isSubmitted) return;

    setIsRunning(true);
    setSaveStatus("saving");
    setTerminalLogs([]);
    setProblems([]);
    setBottomTab("terminal");
    setBottomExpanded(true);

    try {
      await api.post(
        `/interview/${interviewId}/workspace`,
        {
          workspaceFiles: files,
          workspaceState: {
            activeFileId,
            openTabs,
            expandedFolders,
            pinnedTabs,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveStatus("saved");
    } catch (saveErr) {
      console.error("Autosave failed before execution stream start:", saveErr);
      showToast("Failed to save changes before running.", "error");
      setIsRunning(false);
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const baseURL = api.defaults.baseURL || "http://localhost:5000/api";
    const streamURL = `${baseURL}/interview/${interviewId}/run-stream?token=${token}`;
    
    const es = new EventSource(streamURL);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "stdout") {
          const newLog = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            exitCode: 0,
            stdout: payload.data,
            stderr: "",
          };
          setTerminalLogs((prev) => [...prev, newLog]);
        } else if (payload.type === "stderr") {
          const newLog = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            exitCode: 1,
            stdout: "",
            stderr: payload.data,
          };
          setTerminalLogs((prev) => [...prev, newLog]);
          parseProblemsFromStderr(payload.data);
        } else if (payload.type === "exit") {
          es.close();
          eventSourceRef.current = null;
          setIsRunning(false);
          showToast(`Execution finished with code ${payload.exitCode}`, payload.exitCode === 0 ? "success" : "error");

          if (activeTemplate.supportsPreview) {
            setPreviewKey((p) => p + 1);
          }
        } else if (payload.type === "error") {
          es.close();
          eventSourceRef.current = null;
          setIsRunning(false);
          showToast(payload.message || "Execution engine crash.", "error");
        }
      } catch (err) {
        console.error("Error parsing stream message:", err);
      }
    };

    es.onerror = (err) => {
      console.error("SSE stream error:", err);
      es.close();
      eventSourceRef.current = null;
      setIsRunning(false);
      showToast("Stream disconnected.", "error");
    };
  };

  const handleStopProject = async () => {
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      await api.post(`/interview/${interviewId}/stop-run`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsRunning(false);
      showToast("Execution stopped.", "info");
    } catch (err) {
      console.error("Stop execution failed:", err);
    }
  };

  // Run Test Suite execution pipeline
  const handleRunTests = async () => {
    if (workspaceSubmission?.isSubmitted) return;

    setIsExecutingTests(true);
    setSaveStatus("saving");
    setBottomTab("tests");
    setBottomExpanded(true);

    try {
      await api.post(
        `/interview/${interviewId}/workspace`,
        {
          workspaceFiles: files,
          workspaceState: {
            activeFileId,
            openTabs,
            expandedFolders,
            pinnedTabs,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveStatus("saved");
    } catch (saveErr) {
      console.error("Autosave failed before tests execution:", saveErr);
      showToast("Failed to save changes before running tests.", "error");
      setIsExecutingTests(false);
      return;
    }

    try {
      const res = await api.post(
        `/interview/${interviewId}/run-tests`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && res.data.testResults) {
        setTestResults(res.data.testResults);
        showToast("Test suite run completed.", "success");
      }
    } catch (err) {
      console.error("Tests run error:", err);
      showToast("Failed to run test suites.", "error");
    } finally {
      setIsExecutingTests(false);
    }
  };

  // Terminal Controls
  const handleClearLogs = () => {
    setTerminalLogs([]);
    setProblems([]);
    showToast("Terminal logs cleared.", "info");
  };

  const handleDownloadLogs = () => {
    const text = terminalLogs.map(l => `[${l.timestamp}] ${l.stdout || l.stderr}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terminal_logs_${interviewId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLogs = () => {
    const text = terminalLogs.map(l => l.stdout || l.stderr).join("\n");
    navigator.clipboard.writeText(text);
    showToast("Logs copied.", "success");
  };

  // API Tester Response Simulator
  const handleSendApiRequest = async () => {
    setIsTestingApi(true);
    const start = Date.now();

    setTimeout(() => {
      const end = Date.now();
      const serverFile = files.find(f => f.name === "server.js")?.content || "";
      
      let resBody = { message: "Server connection failed or endpoint not found." };
      let status = 404;

      if (apiUrl.includes("/api/products")) {
        status = 200;
        if (serverFile.includes("Wireless Headset")) {
          resBody = [
            { id: 1, title: "Wireless Headset", price: 99.99, category: "Audio" }
          ];
        } else {
          resBody = [
            { id: 1, title: "iPhone 15 Pro Max", price: 1199, category: "Electronics" }
          ];
        }
      }

      const resString = JSON.stringify(resBody, null, 2);

      setApiResponse({
        status,
        timeMs: end - start + 8,
        sizeBytes: resString.length,
        body: resString,
      });
      setIsTestingApi(false);
      showToast("API Response received.", "success");
    }, 600);
  };

  // Submit Final Workspace Snapshot
  const handleSubmitWorkspace = async () => {
    setIsSubmitting(true);
    setShowSubmitModal(false);

    try {
      const submitRes = await api.post(
        `/interview/${interviewId}/submit-workspace`,
        {
          workspaceFiles: files,
          workspaceState: {
            activeFileId,
            openTabs,
            expandedFolders,
            pinnedTabs,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (submitRes.data && submitRes.data.workspaceSubmission) {
        setWorkspaceSubmission(submitRes.data.workspaceSubmission);
        setFiles(prev => prev.map(f => ({ ...f, isReadOnly: true })));
        
        if (!openTabs.includes("report")) {
          setOpenTabs(p => [...p, "report"]);
        }
        setActiveFileId("report");
        showToast("Solution submitted successfully.", "success");
      }
    } catch (err) {
      console.error("Submit workspace error:", err);
      showToast(err.response?.data?.message || "Submission failed. Reconnecting...", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileNode = (node, depth = 0) => {
    const isExpanded = !!expandedFolders[node.id];
    const isFolder = node.type === "folder";
    const isActive = activeFileId === node.id;
    const isUnsaved = node.isModified;

    const children = files.filter(f => f.parentFolderId === node.id)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    return (
      <div key={node.id} className="select-none">
        <div
          onContextMenu={(e) => handleContextMenu(e, node.id)}
          onClick={() => {
            if (isFolder) toggleFolder(node.id);
            else openFile(node.id);
          }}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
          className={`flex items-center justify-between py-1.5 px-3 group text-xs font-medium cursor-pointer transition ${
            isActive
              ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
              : "text-slate-300 hover:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {isFolder ? (
              <>
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
                <Folder className="h-4 w-4 shrink-0 text-indigo-400 fill-indigo-400/10" />
              </>
            ) : (
              <>
                <FileCode className={`h-4 w-4 shrink-0 ${node.isReadOnly ? "text-slate-500" : "text-blue-400"}`} />
              </>
            )}

            {editingId === node.id && !workspaceSubmission?.isSubmitted ? (
              <input
                type="text"
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRenameItem(node.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameItem(node.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-indigo-500 px-1 py-0.5 rounded text-white font-sans text-xs focus:outline-none focus:ring-0 max-w-[120px]"
              />
            ) : (
              <span className="truncate">{node.name}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {(node.isReadOnly || workspaceSubmission?.isSubmitted) && <Lock className="h-3 w-3 text-slate-500" />}
            {isUnsaved && <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0"></span>}
            
            {isFolder && !workspaceSubmission?.isSubmitted && (
              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedFolders(p => ({ ...p, [node.id]: true }));
                    setNewTarget({ parentFolderId: node.id, type: "file" });
                  }}
                  className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="New File"
                >
                  <FilePlus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedFolders(p => ({ ...p, [node.id]: true }));
                    setNewTarget({ parentFolderId: node.id, type: "folder" });
                  }}
                  className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="New Folder"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {newTarget && newTarget.parentFolderId === node.id && (
          <div style={{ paddingLeft: `${(depth + 1) * 12 + 12}px` }} className="flex items-center gap-2 py-1 px-3">
            {newTarget.type === "folder" ? <Folder className="h-4 w-4 text-indigo-400 shrink-0" /> : <FileCode className="h-4 w-4 text-blue-400 shrink-0" />}
            <input
              type="text"
              autoFocus
              placeholder={newTarget.type === "folder" ? "Folder name" : "File name"}
              value={newIName}
              onChange={(e) => setNewIName(e.target.value)}
              onBlur={handleCreateItem}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateItem();
                if (e.key === "Escape") setNewTarget(null);
              }}
              className="bg-slate-900 border border-indigo-500 px-1 py-0.5 rounded text-white font-sans text-xs focus:outline-none focus:ring-0 max-w-[120px]"
            />
          </div>
        )}

        {isFolder && isExpanded && children.map(child => renderFileNode(child, depth + 1))}
      </div>
    );
  };

  const compileReactWorkspace = () => {
    const appFile = files.find(f => f.path === "src/App.jsx")?.content || "";
    const searchFile = files.find(f => f.path === "src/components/SearchBar.jsx")?.content || "";
    const listFile = files.find(f => f.path === "src/components/ProductList.jsx")?.content || "";
    const debounceFile = files.find(f => f.path === "src/hooks/useDebounce.js")?.content || "";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <script src="https://unpkg.com/react@18.2.0/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone@7.22.20/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { background-color: #070b13; color: white; font-family: sans-serif; padding: 20px; }
            .search-bar input { width: 100%; max-width: 400px; padding: 10px 14px; border-radius: 8px; border: 1px solid #ffffff15; background-color: #0a0f1d; color: white; outline: none; }
            .search-bar input:focus { border-color: #6366f1; }
            .product-card { padding: 16px; border-radius: 12px; border: 1px solid #ffffff05; background-color: #0b1120; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div id="root"></div>

          <script type="text/babel">
            // Mock product search database
            const MOCK_PRODUCTS = [
              { id: 1, title: "iPhone 15 Pro Max", price: 1199, category: "Electronics" },
              { id: 2, title: "MacBook Air M3", price: 1099, category: "Electronics" },
              { id: 3, title: "iPad Pro", price: 999, category: "Electronics" },
              { id: 4, title: "Sony WH-1000XM5", price: 349, category: "Audio" },
              { id: 5, title: "AirPods Pro 2", price: 249, category: "Audio" },
              { id: 6, title: "Bose QuietComfort Ultra", price: 429, category: "Audio" },
              { id: 7, title: "Keychron K2 Keyboard", price: 89, category: "Accessories" }
            ];

            // 1. useDebounce hook
            ${debounceFile.replace(/export default/g, "const useDebounce =")}

            // 2. SearchBar component
            ${searchFile.replace(/import .*/g, "").replace(/export default/g, "const SearchBar =")}

            // 3. ProductList component
            ${listFile.replace(/import .*/g, "").replace(/export default/g, "const ProductList =")}

            // 4. Main App component
            ${appFile.replace(/import .*/g, "").replace(/export default/g, "const App =")}

            const rootElement = document.getElementById("root");
            const root = ReactDOM.createRoot(rootElement);
            root.render(<App />);
          </script>
        </body>
      </html>
    `;
  };

  const activeFile = files.find(f => f.id === activeFileId);
  const activeTemplate = templateRegistry[templateId] || { supportsPreview: true };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans select-none transition-colors duration-200 ${
      theme === "dark" ? "bg-[#070b13] text-white" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl border text-xs font-bold tracking-tight shadow-xl z-55 flex items-center gap-2 ${
              toast.type === "error"
                ? "bg-rose-500/20 border-rose-500/30 text-rose-300"
                : toast.type === "success"
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                : "bg-slate-900 border-white/10 text-slate-200"
            }`}
          >
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-950 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-amber-400">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-lg font-black text-white">Submit Solution?</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                After submitting, your current project snapshot will be frozen and evaluated against hidden test suites and AI review. You will not be able to modify this submission.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitWorkspace}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Context Menu Modal */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed bg-slate-950 border border-white/10 p-1 rounded-xl shadow-2xl z-50 min-w-[130px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {files.find(f => f.id === contextMenu.fileId)?.type === "file" && (
            <button
              onClick={() => {
                openFile(contextMenu.fileId);
                setContextMenu(null);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-slate-800 text-left text-xs text-slate-200 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Open</span>
            </button>
          )}
          <button
            onClick={() => {
              const item = files.find(f => f.id === contextMenu.fileId);
              if (item.isReadOnly) {
                showToast("Protected files cannot be renamed.", "error");
              } else {
                setEditingId(contextMenu.fileId);
                setEditingName(item.name);
              }
              setContextMenu(null);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-slate-800 text-left text-xs text-slate-200 cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5 text-slate-400" />
            <span>Rename</span>
          </button>
          {files.find(f => f.id === contextMenu.fileId)?.type === "file" && (
            <button
              onClick={() => {
                handleDuplicateFile(contextMenu.fileId);
                setContextMenu(null);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-slate-800 text-left text-xs text-slate-200 cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5 text-slate-400" />
              <span>Duplicate</span>
            </button>
          )}
          <button
            onClick={() => {
              handleDeleteItem(contextMenu.fileId);
              setContextMenu(null);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-slate-800 text-left text-xs text-rose-400 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* ==================== TOP NAVIGATION BAR ==================== */}
      <header className={`h-14 border-b flex items-center justify-between px-4 shrink-0 transition-colors duration-200 ${
        theme === "dark" ? "bg-slate-950/80 border-white/10" : "bg-white border-slate-200"
      }`}>
        {/* Left Side Info */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm tracking-tighter">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black tracking-tight">{role} Assessment</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                theme === "dark" ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-700"
              }`}>
                Technical Round 2
              </span>
            </div>
          </div>
          <div className={`h-5 w-[1px] ${theme === "dark" ? "bg-white/10" : "bg-slate-200"}`}></div>
          <button
            onClick={toggleLeftPanel}
            className={`p-1.5 rounded-lg border transition ${
              isLeftCollapsed
                ? "bg-indigo-600 border-indigo-500 text-white"
                : theme === "dark"
                ? "bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
            title={isLeftCollapsed ? "Expand Problem Panel" : "Collapse Problem Panel"}
          >
            <FileText className="h-4 w-4" />
          </button>
        </div>

        {/* Center: System Telemetry */}
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold ${
            theme === "dark" ? "bg-slate-900 border-white/10 text-rose-400" : "bg-slate-100 border-slate-200 text-rose-600"
          }`}>
            <Clock className="h-4 w-4" />
            <span>{workspaceSubmission?.isSubmitted ? "SUBMITTED" : formatTimer(secsLeft)}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Save className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {workspaceSubmission?.isSubmitted ? "Workspace Frozen" : saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Autosaving..." : "Save Error"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Globe className={`h-3.5 w-3.5 ${isOnline ? "text-emerald-400" : "text-rose-400"}`} />
            <span>{isOnline ? "Online" : "Disconnected"}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {activeTemplate.supportsPreview && (
            <button
              onClick={() => openFile("preview")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-black text-emerald-400 hover:text-emerald-300 shadow-sm transition duration-150 shrink-0 cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>
          )}

          {isRunning ? (
            <button
              onClick={handleStopProject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white bg-rose-600 hover:bg-rose-500 cursor-pointer shadow-md shrink-0 transition"
            >
              <Square className="h-3.5 w-3.5 fill-white text-white" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={handleRunProject}
              disabled={!!workspaceSubmission?.isSubmitted}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white shadow-md transition duration-150 shrink-0 cursor-pointer ${
                !!workspaceSubmission?.isSubmitted
                  ? "bg-slate-800 border border-slate-700 cursor-not-allowed opacity-50 text-slate-500"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110"
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-white text-white" />
              <span>Run</span>
            </button>
          )}

          <button
            onClick={handleRunTests}
            disabled={isExecutingTests || !!workspaceSubmission?.isSubmitted}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white shadow-md transition duration-150 shrink-0 cursor-pointer ${
              isExecutingTests || !!workspaceSubmission?.isSubmitted
                ? "bg-slate-800 border border-slate-700 cursor-not-allowed opacity-55 text-slate-500"
                : "bg-slate-900 border border-white/10 hover:bg-slate-800"
            }`}
          >
            <PlayCircle className="h-3.5 w-3.5" />
            <span>{isExecutingTests ? "Testing..." : "Run Tests"}</span>
          </button>

          <button
            onClick={() => {
              if (workspaceSubmission?.isSubmitted) {
                onCompletePhase();
              } else {
                setShowSubmitModal(true);
              }
            }}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-black text-white hover:brightness-110 transition duration-150 shrink-0 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{workspaceSubmission?.isSubmitted ? "Proceed to HR" : "Submit"}</span>
          </button>

          <div className={`h-5 w-[1px] ${theme === "dark" ? "bg-white/10" : "bg-slate-200"}`}></div>

          <button
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-lg border transition ${
              theme === "dark" ? "bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition ${
              theme === "dark" ? "bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button className={`p-1.5 rounded-lg border transition ${
            theme === "dark" ? "bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
          }`}>
            <Settings className="h-4 w-4" />
          </button>

          <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md border border-indigo-400">
            T
          </div>
        </div>
      </header>

      {/* ==================== SPLIT RESIZABLE PANELS CONTAINER ==================== */}
      <div ref={containerRef} className="flex-1 w-full flex overflow-hidden relative">
        
        {/* ==================== LEFT PANEL: PROBLEM STATEMENT ==================== */}
        <div
          ref={leftPanelRef}
          onScroll={handleLeftScroll}
          style={{ width: isLeftCollapsed ? "0%" : `${panelWidth}%`, display: isLeftCollapsed ? "none" : "flex" }}
          className={`h-full overflow-y-auto custom-scrollbar flex flex-col transition-colors duration-200 ${
            theme === "dark" ? "bg-slate-950/50 border-r border-white/10" : "bg-white border-r border-slate-200"
          }`}
        >
          {/* Scrollable Problem Sections */}
          <div className="p-5 space-y-6">
            
            {/* Title */}
            <div className="space-y-2 border-b pb-4 border-white/10">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                theme === "dark" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-amber-100 text-amber-800"
              }`}>
                Core Engineering
              </span>
              <h1 className="text-2xl font-black tracking-tight">Build Responsive Product Search</h1>
              <p className="text-xs text-slate-400 font-medium">Estimated Time: 45 Mins • Max Marks: 50</p>
            </div>

            {/* Difficulty Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className={`p-3 rounded-lg border text-center ${
                theme === "dark" ? "bg-slate-900 border-white/5" : "bg-slate-50 border-slate-200"
              }`}>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Difficulty</span>
                <span className="text-xs font-black text-amber-400">Medium</span>
              </div>
              <div className={`p-3 rounded-lg border text-center ${
                theme === "dark" ? "bg-slate-900 border-white/5" : "bg-slate-50 border-slate-200"
              }`}>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Language</span>
                <span className="text-xs font-black text-blue-400">React / JS</span>
              </div>
              <div className={`p-3 rounded-lg border text-center ${
                theme === "dark" ? "bg-slate-900 border-white/5" : "bg-slate-50 border-slate-200"
              }`}>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Time Limit</span>
                <span className="text-xs font-black text-emerald-400">3 Secs</span>
              </div>
              <div className={`p-3 rounded-lg border text-center ${
                theme === "dark" ? "bg-slate-900 border-white/5" : "bg-slate-50 border-slate-200"
              }`}>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Memory Limit</span>
                <span className="text-xs font-black text-purple-400">512 MB</span>
              </div>
            </div>

            {/* Overview */}
            <div className={`rounded-xl border ${
              theme === "dark" ? "border-white/10 bg-slate-900/40" : "border-slate-200 bg-slate-50"
            } overflow-hidden shadow-sm`}>
              <button
                onClick={() => toggleSection("overview")}
                className="w-full flex items-center justify-between px-4 py-3 font-bold text-sm tracking-wide uppercase font-mono border-b border-white/10 bg-white/5 cursor-pointer text-left"
              >
                <span>1. Overview</span>
                {collapsedSections.overview ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <AnimatePresence initial={false}>
                {!collapsedSections.overview && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
                      <p>
                        Your task is to build a reusable, performant product search and catalog filter interface.
                      </p>
                      <p>
                        The component must perform asynchronous backend queries with optimal request caching, debounced keypress handling to mitigate network flooding, and comprehensive error fallback displays.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Problem Statement */}
            <div className={`rounded-xl border ${
              theme === "dark" ? "border-white/10 bg-slate-900/40" : "border-slate-200 bg-slate-50"
            } overflow-hidden shadow-sm`}>
              <button
                onClick={() => toggleSection("statement")}
                className="w-full flex items-center justify-between px-4 py-3 font-bold text-sm tracking-wide uppercase font-mono border-b border-white/10 bg-white/5 cursor-pointer text-left"
              >
                <span>2. Detailed Problem Statement</span>
                {collapsedSections.statement ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <AnimatePresence initial={false}>
                {!collapsedSections.statement && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
                      <p>
                        The business requires a high-performance product catalog directory with immediate real-time search filtering. The system must adhere to these directives:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>Listen to keydown inputs on the catalog search field.</li>
                        <li>Implement a custom debounce hook with a <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 font-mono">300ms</code> delay windows.</li>
                        <li>Maintain a query cache to prevent redundant fetches for previous lookups.</li>
                        <li>Handle loading indicators and empty states appropriately.</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Functional */}
            <div className={`rounded-xl border ${
              theme === "dark" ? "border-white/10 bg-slate-900/40" : "border-slate-200 bg-slate-50"
            } overflow-hidden shadow-sm`}>
              <button
                onClick={() => toggleSection("functional")}
                className="w-full flex items-center justify-between px-4 py-3 font-bold text-sm tracking-wide uppercase font-mono border-b border-white/10 bg-white/5 cursor-pointer text-left"
              >
                <span>3. Functional Requirements</span>
                {collapsedSections.functional ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <AnimatePresence initial={false}>
                {!collapsedSections.functional && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 text-xs space-y-2.5">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked readOnly className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-slate-200">Search input yields immediate asynchronous queries</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked readOnly className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-slate-200">Debouncing input prevents network flooding</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked readOnly className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-slate-200">Interactive category filter chips sync with queries</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked readOnly className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-slate-200">Loading spinner, empty state card, and custom error displays</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Non-Functional */}
            <div className={`rounded-xl border ${
              theme === "dark" ? "border-white/10 bg-slate-900/40" : "border-slate-200 bg-slate-50"
            } overflow-hidden shadow-sm`}>
              <button
                onClick={() => toggleSection("nonFunctional")}
                className="w-full flex items-center justify-between px-4 py-3 font-bold text-sm tracking-wide uppercase font-mono border-b border-white/10 bg-white/5 cursor-pointer text-left"
              >
                <span>4. Non-Functional Requirements</span>
                {collapsedSections.nonFunctional ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <AnimatePresence initial={false}>
                {!collapsedSections.nonFunctional && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
                      <p><strong>Performance</strong>: Network payload caching must prevent duplicate fetches.</p>
                      <p><strong>Accessibility</strong>: Compliant with WCAG 2.1 (keyboard focus support, screen readers, semantic tags).</p>
                      <p><strong>Responsive Design</strong>: Fluid layout transitions between mobile viewports and wide monitors.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Manual Proceed Button */}
            <div className="pt-4 border-t border-white/10 flex justify-center">
              <button
                onClick={onCompletePhase}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-black tracking-wide uppercase text-white shadow-xl cursor-pointer transition text-xs sm:text-sm"
              >
                Proceed to HR Round
              </button>
            </div>

          </div>
        </div>

        {/* ==================== RESIZE HANDLER DIVIDER ==================== */}
        {!isLeftCollapsed && (
          <div
            onMouseDown={startResizing}
            className={`w-1 h-full cursor-col-resize shrink-0 transition hover:bg-indigo-500/50 flex items-center justify-center ${
              theme === "dark" ? "bg-white/5" : "bg-slate-200"
            }`}
          >
            <div className="h-10 w-[2px] bg-slate-600 rounded"></div>
          </div>
        )}

        {/* ==================== RIGHT PANEL: REAL VS CODE IDE WORKSPACE ==================== */}
        <div
          style={{ width: isLeftCollapsed ? "100%" : `${100 - panelWidth}%` }}
          className={`h-full flex overflow-hidden transition-colors duration-200 ${
            theme === "dark" ? "bg-slate-950" : "bg-slate-50"
          }`}
        >
          {/* 1. VS Code-Style Activity Bar (Vertical) */}
          <div className="w-12 h-full bg-[#0a0f1d] border-r border-white/5 flex flex-col items-center py-3 justify-between shrink-0">
            <div className="flex flex-col items-center gap-4 w-full">
              <button
                onClick={() => setActiveSidebarView("explorer")}
                className={`p-2 transition rounded-xl ${
                  activeSidebarView === "explorer"
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                    : "text-slate-500 hover:text-white"
                }`}
                title="File Explorer"
              >
                <FileCode className="h-5 w-5" />
              </button>

              <button
                onClick={() => setActiveSidebarView("history")}
                className={`p-2 transition rounded-xl ${
                  activeSidebarView === "history"
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                    : "text-slate-500 hover:text-white"
                }`}
                title="Version History Snapshots"
              >
                <History className="h-5 w-5" />
              </button>

              <button
                onClick={() => setActiveSidebarView("monitoring")}
                className={`p-2 transition rounded-xl ${
                  activeSidebarView === "monitoring"
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                    : "text-slate-500 hover:text-white"
                }`}
                title="System Health & Sandbox Monitoring"
              >
                <TrendingUp className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-col items-center gap-4 w-full">
              <button className="p-2 text-slate-400 hover:text-white transition" title="Settings">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 2. Left Sidebar Dynamic Panel */}
          <div className="w-56 h-full bg-[#080d19]/80 border-r border-white/5 flex flex-col shrink-0">
            
            {/* VIEW A: Explorer Panel */}
            {activeSidebarView === "explorer" && (
              <>
                <div className="px-3 py-2 flex items-center justify-between border-b border-white/5 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Project Explorer
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => !workspaceSubmission?.isSubmitted && setNewTarget({ parentFolderId: null, type: "file" })}
                      disabled={!!workspaceSubmission?.isSubmitted}
                      className={`p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white ${workspaceSubmission?.isSubmitted ? "opacity-30 cursor-not-allowed" : ""}`}
                      title="New File"
                    >
                      <FilePlus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => !workspaceSubmission?.isSubmitted && setNewTarget({ parentFolderId: null, type: "folder" })}
                      disabled={!!workspaceSubmission?.isSubmitted}
                      className={`p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white ${workspaceSubmission?.isSubmitted ? "opacity-30 cursor-not-allowed" : ""}`}
                      title="New Folder"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {newTarget && newTarget.parentFolderId === null && !workspaceSubmission?.isSubmitted && (
                  <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-900/50 border-b border-white/5">
                    {newTarget.type === "folder" ? <Folder className="h-4 w-4 text-indigo-400 shrink-0" /> : <FileCode className="h-4 w-4 text-blue-400 shrink-0" />}
                    <input
                      type="text"
                      autoFocus
                      placeholder={newTarget.type === "folder" ? "Folder name" : "File name"}
                      value={newIName}
                      onChange={(e) => setNewIName(e.target.value)}
                      onBlur={handleCreateItem}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateItem();
                        if (e.key === "Escape") setNewTarget(null);
                      }}
                      className="bg-slate-955 border border-indigo-500 px-1 py-0.5 rounded text-white font-sans text-xs focus:outline-none focus:ring-0 max-w-[120px]"
                    />
                  </div>
                )}

                <div className="px-2 py-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-white/5">
                    <Search className="h-3 w-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Filter tree..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-0 text-[10px] text-white focus:outline-none focus:ring-0 w-full placeholder-slate-600"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")}>
                        <X className="h-3 w-3 text-slate-500 hover:text-white" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
                  {filteredFiles
                    .filter(f => f.parentFolderId === null)
                    .sort((a, b) => {
                      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
                      return a.name.localeCompare(b.name);
                    })
                    .map(node => renderFileNode(node))
                  }
                  {files.length === 0 && (
                    <p className="p-3 text-[10px] text-slate-500 italic text-center">Empty project tree</p>
                  )}
                </div>
              </>
            )}

            {/* VIEW B: Version History Panel */}
            {activeSidebarView === "history" && (
              <div className="flex-1 flex flex-col h-full overflow-hidden select-text text-left">
                <div className="px-3 py-2.5 border-b border-white/5 shrink-0">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                    <History className="h-4 w-4 text-indigo-400" />
                    <span>Version History</span>
                  </h3>
                  <p className="text-[9px] text-slate-500 mt-0.5">Timeline snapshots of your coding process</p>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {workspaceVersions.map((ver, idx) => (
                    <div
                      key={ver.id || idx}
                      className="p-2.5 bg-slate-900/60 border border-white/5 rounded-lg space-y-1.5 hover:border-indigo-500/20 transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-300 font-mono">Snapshot #{workspaceVersions.length - idx}</span>
                        <span className="text-[9px] text-slate-500">{new Date(ver.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[9px] text-slate-400">
                        {ver.files?.filter(f => f.type === "file").length} files saved
                      </p>
                      
                      {!workspaceSubmission?.isSubmitted && (
                        <button
                          onClick={() => handleRestoreVersion(ver.id)}
                          className="w-full py-1 text-[9px] font-black uppercase text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500 rounded border border-indigo-500/10 transition cursor-pointer"
                        >
                          Restore Snapshot
                        </button>
                      )}
                    </div>
                  ))}
                  {workspaceVersions.length === 0 && (
                    <p className="p-3 text-[10px] text-slate-500 italic text-center">No snapshots recorded yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* VIEW C: System Health & Monitoring Panel */}
            {activeSidebarView === "monitoring" && (
              <div className="flex-1 flex flex-col h-full overflow-hidden select-text text-left p-3 space-y-4">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span>System Observability</span>
                  </h3>
                  <p className="text-[9px] text-slate-500 mt-0.5">Real-time container and database health</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                      <span className="flex items-center gap-1"><Cpu className="h-3 w-3 text-indigo-400" /> CPU Limits</span>
                      <span className="text-white">0.05 Core / 1.0</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded" style={{ width: "5%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                      <span className="flex items-center gap-1"><Database className="h-3 w-3 text-emerald-400" /> Memory Limits</span>
                      <span className="text-white">24 MB / 512 MB</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded" style={{ width: "4.6%" }}></div>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-900/60 border border-white/5 rounded-lg space-y-1 text-[9px] font-mono">
                    <p className="font-bold text-slate-300">Sandbox Isolation ID:</p>
                    <p className="text-indigo-400 select-all truncate">{interviewId.substring(0, 12)}</p>
                    <p className="text-slate-500">Status: <span className="text-emerald-400 font-bold">READY (IDLE)</span></p>
                    <p className="text-slate-500">Disk Usage: 1.2 MB / 100 MB</p>
                    <p className="text-slate-500">Network: RESTRICTED (Isolated)</p>
                  </div>

                  <div className="p-2 bg-slate-900/60 border border-white/5 rounded-lg space-y-1 text-[9px] font-mono">
                    <div className="flex items-center gap-1 font-bold text-emerald-400">
                      <LockKeyhole className="h-3 w-3" />
                      <span>Security Guards Active</span>
                    </div>
                    <p className="text-slate-500">• Path Traversal: BLOCKED</p>
                    <p className="text-slate-500">• Exec Escape: SECURE</p>
                    <p className="text-slate-500">• XSS/CSRF Shields: ON</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Editor & Multi-Tab Area */}
          <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#070b13]">
            {/* Tab strip */}
            <div className="h-9 w-full bg-[#090d18] border-b border-white/5 flex items-center justify-between shrink-0 overflow-x-auto custom-scrollbar">
              <div className="flex items-center h-full">
                {openTabs.map((tid) => {
                  if (tid === "report") {
                    const isActive = activeFileId === "report";
                    return (
                      <div
                        key="report"
                        onClick={() => setActiveFileId("report")}
                        className={`h-full px-3.5 flex items-center gap-2 border-r border-white/5 text-[11px] font-bold cursor-pointer transition select-none ${
                          isActive
                            ? "bg-slate-950 text-indigo-400 border-t-2 border-indigo-500 font-bold"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Award className="h-3.5 w-3.5 text-amber-400" />
                        <span>🏆 Evaluation Report</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab("report");
                          }}
                          className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  }

                  if (tid === "preview") {
                    const isActive = activeFileId === "preview";
                    return (
                      <div
                        key="preview"
                        onClick={() => setActiveFileId("preview")}
                        className={`h-full px-3.5 flex items-center gap-2 border-r border-white/5 text-[11px] font-bold cursor-pointer transition select-none ${
                          isActive
                            ? "bg-slate-950 text-indigo-400 border-t-2 border-indigo-500 font-bold"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Globe className="h-3.5 w-3.5 text-emerald-400" />
                        <span>🌐 Live Preview</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab("preview");
                          }}
                          className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  }

                  if (tid === "tester") {
                    const isActive = activeFileId === "tester";
                    return (
                      <div
                        key="tester"
                        onClick={() => setActiveFileId("tester")}
                        className={`h-full px-3.5 flex items-center gap-2 border-r border-white/5 text-[11px] font-bold cursor-pointer transition select-none ${
                          isActive
                            ? "bg-slate-950 text-indigo-400 border-t-2 border-indigo-500 font-bold"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                        <span>🔌 API Tester Client</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab("tester");
                          }}
                          className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  }

                  const tFile = files.find(f => f.id === tid);
                  if (!tFile) return null;
                  const isActive = activeFileId === tid;
                  const isPinned = pinnedTabs[tid];

                  return (
                    <div
                      key={tid}
                      onAuxClick={(e) => {
                        if (e.button === 1) {
                          e.preventDefault();
                          closeTab(tid);
                        }
                      }}
                      onDoubleClick={() => togglePinTab(tid)}
                      onClick={() => openFile(tid)}
                      className={`h-full px-3.5 flex items-center gap-2 border-r border-white/5 text-[11px] font-medium cursor-pointer transition select-none ${
                        isActive
                          ? "bg-slate-950 text-indigo-400 border-t-2 border-indigo-500 font-bold"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <FileCode className={`h-3.5 w-3.5 ${tFile.isReadOnly ? "text-slate-500" : "text-blue-400"}`} />
                      <span>{tFile.name}</span>
                      
                      <div className="flex items-center gap-1.5 ml-1">
                        {isPinned && <Pin className="h-3 w-3 text-slate-500 fill-slate-500" />}
                        {tFile.isModified && <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tid);
                          }}
                          className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {activeTemplate.supportsApiTesting && (
                  <button
                    onClick={() => openFile("tester")}
                    className="px-3 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 hover:bg-white/5 h-full"
                  >
                    <Terminal className="h-3 w-3" />
                    <span>Open API Tester</span>
                  </button>
                )}

                {workspaceSubmission?.isSubmitted && (
                  <button
                    onClick={() => openFile("report")}
                    className="px-3 text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:bg-white/5 h-full"
                  >
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    <span>View Submission Report</span>
                  </button>
                )}
              </div>

              {openTabs.length > 0 && (
                <div className="flex items-center gap-1 px-3 shrink-0">
                  <button
                    onClick={() => activeFileId && closeOthers(activeFileId)}
                    className="px-2 py-0.5 rounded hover:bg-slate-800 text-[10px] text-slate-400 hover:text-white"
                  >
                    Close Others
                  </button>
                  <button
                    onClick={closeAllTabs}
                    className="px-2 py-0.5 rounded hover:bg-slate-800 text-[10px] text-slate-400 hover:text-white"
                  >
                    Close All
                  </button>
                </div>
              )}
            </div>

            {/* Monaco Editor / Live Preview / Submission Report Container */}
            <div className="flex-1 w-full bg-slate-950 overflow-hidden relative">
              
              {activeFileId === "report" && workspaceSubmission ? (
                /* ==================== WORKSPACE SUBMISSION EVALUATION REPORT ==================== */
                <div className="h-full overflow-y-auto custom-scrollbar bg-slate-950 p-6 space-y-6 text-left select-text">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-5 gap-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                        Submission Snapshot Record Confirmed
                      </span>
                      <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <Award className="h-7 w-7 text-amber-400" />
                        <span>Evaluation Report</span>
                      </h2>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">
                        Submitted: {new Date(workspaceSubmission.submittedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-900 border border-white/5 px-5 py-3 rounded-2xl shrink-0">
                      <div className="relative h-14 w-14 flex items-center justify-center">
                        <svg className="absolute transform -rotate-90 w-full h-full">
                          <circle cx="28" cy="28" r="24" stroke="#ffffff05" strokeWidth="4.5" fill="transparent" />
                          <circle cx="28" cy="28" r="24" stroke="#eab308" strokeWidth="4.5" fill="transparent"
                            strokeDasharray={150.7}
                            strokeDashoffset={150.7 - (150.7 * workspaceSubmission.weightedScore) / 100}
                          />
                        </svg>
                        <span className="text-sm font-black text-white font-mono">{workspaceSubmission.weightedScore}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Score</span>
                        <span className="text-xs font-black text-emerald-400">
                          {workspaceSubmission.passedHiddenTests} / {workspaceSubmission.totalHiddenTests} Tests Passed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Individual Metrics Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3 bg-slate-900/40 border border-white/5 p-4 rounded-xl">
                      <h4 className="text-xs font-bold uppercase font-mono tracking-wide text-slate-300">Weighted Performance Metrics</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mb-1">
                            <span>Correctness (40%)</span>
                            <span className="text-indigo-400">{workspaceSubmission.scores?.correctness || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded" style={{ width: `${workspaceSubmission.scores?.correctness || 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mb-1">
                            <span>Architecture (15%)</span>
                            <span className="text-indigo-400">{workspaceSubmission.scores?.architecture || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded" style={{ width: `${workspaceSubmission.scores?.architecture || 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mb-1">
                            <span>Performance Tuning (10%)</span>
                            <span className="text-indigo-400">{workspaceSubmission.scores?.performance || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded" style={{ width: `${workspaceSubmission.scores?.performance || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 bg-slate-900/40 border border-white/5 p-4 rounded-xl">
                      <h4 className="text-xs font-bold uppercase font-mono tracking-wide text-slate-300">Code Quality & Security Dials</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mb-1">
                            <span>Code Quality (10%)</span>
                            <span className="text-emerald-400">{workspaceSubmission.scores?.codeQuality || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded" style={{ width: `${workspaceSubmission.scores?.codeQuality || 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mb-1">
                            <span>Security Rubric (10%)</span>
                            <span className="text-emerald-400">{workspaceSubmission.scores?.security || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded" style={{ width: `${workspaceSubmission.scores?.security || 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mb-1">
                            <span>Readability & Guidelines (15%)</span>
                            <span className="text-emerald-400">{workspaceSubmission.scores?.readability || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded" style={{ width: `${workspaceSubmission.scores?.readability || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI reviewer report details */}
                  <div className="border-t border-white/10 pt-5 space-y-5">
                    <h3 className="text-sm font-black uppercase text-slate-200 font-mono tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Descriptive AI Code Review Report</span>
                    </h3>

                    <div className="p-4 bg-slate-900/60 border border-indigo-500/10 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block">Overall Summary</span>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                        {workspaceSubmission.aiReview?.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-950/10 border border-emerald-500/10 rounded-xl space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">Key Strengths</span>
                        <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1 font-normal">
                          {workspaceSubmission.aiReview?.strengths?.map((str, idx) => <li key={idx}>{str}</li>)}
                        </ul>
                      </div>
                      <div className="p-4 bg-rose-950/10 border border-rose-500/10 rounded-xl space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block">Weaknesses & Gaps</span>
                        <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1 font-normal">
                          {workspaceSubmission.aiReview?.weaknesses?.map((weak, idx) => <li key={idx}>{weak}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-normal">
                      <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Architecture</span>
                        <p className="text-slate-300 leading-relaxed">{workspaceSubmission.aiReview?.architectureReview}</p>
                      </div>
                      <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Naming Conventions</span>
                        <p className="text-slate-300 leading-relaxed">{workspaceSubmission.aiReview?.namingReview}</p>
                      </div>
                      <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Folder Structure</span>
                        <p className="text-slate-300 leading-relaxed">{workspaceSubmission.aiReview?.folderStructureReview}</p>
                      </div>
                    </div>

                    <div className="space-y-3 bg-slate-900/40 border border-white/5 p-4 rounded-xl text-xs font-normal">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block">Refactoring Suggestions</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <p className="font-bold text-slate-300">Performance Suggestions</p>
                          <ul className="list-disc pl-5 text-slate-400 space-y-1">
                            {workspaceSubmission.aiReview?.performanceSuggestions?.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                        <div className="space-y-1.5">
                          <p className="font-bold text-slate-300">Security Suggestions</p>
                          <ul className="list-disc pl-5 text-slate-400 space-y-1">
                            {workspaceSubmission.aiReview?.securitySuggestions?.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-center">
                      <button
                        onClick={onCompletePhase}
                        className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-wide uppercase shadow-lg transition duration-150 flex items-center gap-2 cursor-pointer text-xs sm:text-sm animate-bounce"
                      >
                        <span>Proceed to HR Behavioral Round</span>
                        <ArrowRight className="h-4.5 w-4.5" />
                      </button>
                    </div>

                  </div>
                </div>
              ) : activeFileId === "preview" && activeTemplate.supportsPreview ? (
                /* ==================== BROWSER PREVIEW COMPONENT ==================== */
                <div className="h-full flex flex-col bg-[#070b13]">
                  <div className="h-10 border-b border-white/5 bg-slate-950 flex items-center justify-between px-3 shrink-0 gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewDevice("desktop")}
                        className={`p-1 rounded transition ${previewDevice === "desktop" ? "bg-slate-850 text-indigo-400" : "text-slate-500"}`}
                        title="Desktop Frame"
                      >
                        <Laptop className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPreviewDevice("tablet")}
                        className={`p-1 rounded transition ${previewDevice === "tablet" ? "bg-slate-850 text-indigo-400" : "text-slate-500"}`}
                        title="Tablet Frame"
                      >
                        <TabletIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPreviewDevice("mobile")}
                        className={`p-1 rounded transition ${previewDevice === "mobile" ? "bg-slate-850 text-indigo-400" : "text-slate-500"}`}
                        title="Mobile Frame"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex-1 max-w-xl mx-auto flex items-center gap-1.5 px-3 py-1 rounded bg-[#0a0f1d] border border-white/5 text-[11px] font-mono text-slate-400 select-text truncate">
                      <Globe className="h-3 w-3 text-slate-500" />
                      <span>http://localhost:{activeTemplate.previewPort}/</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewKey(p => p + 1)}
                        className="p-1 rounded hover:bg-slate-850 text-slate-400 hover:text-white"
                        title="Refresh Preview"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const w = window.open();
                          if (w) w.document.write(compileReactWorkspace());
                        }}
                        className="p-1 rounded hover:bg-slate-850 text-slate-400 hover:text-white"
                        title="Open in New Window"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 bg-slate-900/60 p-4 flex justify-center items-center overflow-auto">
                    <div
                      style={{
                        width: previewDevice === "mobile" ? "390px" : previewDevice === "tablet" ? "768px" : "100%",
                        height: "100%",
                        maxWidth: "100%",
                      }}
                      className="border border-white/10 rounded-xl overflow-hidden bg-[#070b13] shadow-2xl transition-all duration-300"
                    >
                      <iframe
                        key={previewKey}
                        title="Live Sandboxed Browser Preview"
                        srcDoc={compileReactWorkspace()}
                        sandbox="allow-scripts"
                        className="w-full h-full border-0 bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              ) : activeFileId === "tester" && activeTemplate.supportsApiTesting ? (
                /* ==================== INTEGRATED REST API CLIENT TESTER ==================== */
                <div className="h-full flex flex-col bg-[#070b13] p-4 space-y-4 text-left select-text overflow-y-auto custom-scrollbar">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
                      Integrated API Client Tester
                    </h3>
                    <p className="text-[10px] text-slate-500">Test backend REST API route triggers in the container sandbox</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={apiMethod}
                      onChange={(e) => setApiMethod(e.target.value)}
                      className="bg-slate-900 border border-white/10 text-white rounded-lg px-2 py-1.5 font-mono text-xs focus:outline-none focus:ring-0 cursor-pointer"
                    >
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>DELETE</option>
                    </select>

                    <input
                      type="text"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="http://localhost:3000/api/endpoint"
                      className="flex-1 bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-1.5 font-mono text-xs focus:outline-none focus:ring-0"
                    />

                    <button
                      onClick={handleSendApiRequest}
                      disabled={isTestingApi}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs cursor-pointer shadow-md"
                    >
                      {isTestingApi ? "Sending..." : "Send"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Headers</span>
                      {apiHeaders.map((hdr, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Key"
                            value={hdr.key}
                            onChange={(e) => {
                              const next = [...apiHeaders];
                              next[idx].key = e.target.value;
                              setApiHeaders(next);
                            }}
                            className="flex-1 bg-slate-950 border border-white/10 text-white rounded px-2 py-1 text-[10px] font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={hdr.value}
                            onChange={(e) => {
                              const next = [...apiHeaders];
                              next[idx].value = e.target.value;
                              setApiHeaders(next);
                            }}
                            className="flex-1 bg-slate-950 border border-white/10 text-white rounded px-2 py-1 text-[10px] font-mono"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Body (JSON payload)</span>
                      <textarea
                        rows={3}
                        value={apiBody}
                        onChange={(e) => setApiBody(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 text-indigo-300 rounded p-2 text-[10px] font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {apiResponse ? (
                    <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Response</span>
                        <div className="flex gap-3 text-[10px] font-mono">
                          <span>Status: <strong className={apiResponse.status === 200 ? "text-emerald-400" : "text-rose-400"}>{apiResponse.status} OK</strong></span>
                          <span>Time: <strong>{apiResponse.timeMs} ms</strong></span>
                          <span>Size: <strong>{apiResponse.sizeBytes} B</strong></span>
                        </div>
                      </div>

                      <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono text-[10px] overflow-x-auto select-all max-h-[150px]">
                        {apiResponse.body}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic text-center py-4">Click send to inspect API returns.</p>
                  )}
                </div>
              ) : activeFile ? (
                <Editor
                  height="100%"
                  language={activeFile.language}
                  theme={theme === "dark" ? "vs-dark" : "vs-light"}
                  value={activeFile.content}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: true },
                    fontSize: 13,
                    wordWrap: "on",
                    automaticLayout: true,
                    lineNumbers: "on",
                    readOnly: activeFile.isReadOnly || !!workspaceSubmission?.isSubmitted,
                    bracketPairColorization: { enabled: true },
                    scrollBeyondLastLine: false,
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <Code className="h-12 w-12 text-slate-700 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-slate-400">No Active Document Open</p>
                    <p className="text-[10px] text-slate-600">Select a file from the explorer sidebar to begin coding.</p>
                  </div>
                </div>
              )}
            </div>

            {/* ==================== BOTTOM TERMINAL PANEL ==================== */}
            <div className={`border-t shrink-0 flex flex-col transition-colors duration-200 ${
              theme === "dark" ? "bg-slate-950 border-white/10" : "bg-white border-slate-200"
            }`}>
              <div className="h-10 px-3 flex items-center justify-between bg-slate-900/60 border-b border-white/5 select-none shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setBottomTab("terminal");
                      setBottomExpanded(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      bottomTab === "terminal" && bottomExpanded
                        ? "bg-slate-800 text-indigo-400 border border-slate-700"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Terminal</span>
                  </button>
                  <button
                    onClick={() => {
                      setBottomTab("console");
                      setBottomExpanded(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      bottomTab === "console" && bottomExpanded
                        ? "bg-slate-800 text-indigo-400 border border-slate-700"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Console</span>
                  </button>
                  <button
                    onClick={() => {
                      setBottomTab("output");
                      setBottomExpanded(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      bottomTab === "output" && bottomExpanded
                        ? "bg-slate-800 text-indigo-400 border border-slate-700"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span>Output</span>
                  </button>
                  <button
                    onClick={() => {
                      setBottomTab("problems");
                      setBottomExpanded(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      bottomTab === "problems" && bottomExpanded
                        ? "bg-slate-800 text-indigo-400 border border-slate-700"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="flex items-center gap-1">
                      <span>Problems</span>
                      {problems.length > 0 && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-rose-500 text-white shrink-0 animate-pulse">
                          {problems.length}
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setBottomTab("tests");
                      setBottomExpanded(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      bottomTab === "tests" && bottomExpanded
                        ? "bg-slate-800 text-indigo-400 border border-slate-700"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Tests</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearLogs}
                    className="p-1.5 rounded hover:bg-slate-850 text-slate-400 hover:text-white"
                    title="Clear Terminal / Problems"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleCopyLogs}
                    className="p-1.5 rounded hover:bg-slate-850 text-slate-400 hover:text-white"
                    title="Copy Logs"
                  >
                    <CopyIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleDownloadLogs}
                    className="p-1.5 rounded hover:bg-slate-850 text-slate-400 hover:text-white"
                    title="Download Logs"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                  <button
                    onClick={() => setBottomExpanded(!bottomExpanded)}
                    className="p-1 rounded hover:bg-slate-850 transition text-slate-400 hover:text-white cursor-pointer"
                  >
                    {bottomExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 -rotate-90" />}
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {bottomExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 220 }}
                    exit={{ height: 0 }}
                    className="h-[220px] bg-slate-950 font-mono text-xs overflow-y-auto custom-scrollbar shrink-0 select-text p-4 text-left"
                  >
                    {bottomTab === "terminal" && (
                      <div className="text-slate-300 space-y-1 flex flex-col font-mono text-xs">
                        <p className="text-slate-500">// Sandboxed real-time log stream console</p>
                        {terminalLogs.map((log, idx) => (
                          <div key={log.id || idx} className="leading-relaxed">
                            {log.stdout && <pre className="text-slate-300 whitespace-pre-wrap">{log.stdout}</pre>}
                            {log.stderr && <pre className="text-rose-400 whitespace-pre-wrap font-bold">{log.stderr}</pre>}
                          </div>
                        ))}
                        {terminalLogs.length === 0 && (
                          <p className="text-slate-600">Terminal is empty. Click Run to trigger dependencies install, build compile, and stream logs.</p>
                        )}
                      </div>
                    )}
                    
                    {bottomTab === "console" && (
                      <div className="text-slate-300 space-y-1 font-mono text-xs">
                        <p className="text-slate-500">// Standard streams history</p>
                        {terminalLogs.map((log, idx) => (
                          <div key={idx} className="border-b border-white/5 py-1">
                            {log.stdout && <p className="text-emerald-400">[STDOUT] {log.stdout.trim()}</p>}
                            {log.stderr && <p className="text-rose-400 font-bold">[STDERR] {log.stderr.trim()}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {bottomTab === "output" && (
                      <div className="text-slate-300 space-y-3 font-mono text-xs">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Final Program Execution Status</span>
                        <div className="p-3 bg-slate-900/60 border border-white/5 rounded-lg space-y-1">
                          <p>Active Stack Template: <span className="text-indigo-400 font-bold">{templateRegistry[templateId]?.displayName || templateId}</span></p>
                          <p>Exit code: <span className="font-bold text-indigo-400">0</span></p>
                          <p>Time limitation boundary: <span className="font-bold text-indigo-400">3000ms</span></p>
                          <p>Is sandbox preview rendering active: <span className="font-bold text-emerald-400">{activeTemplate.supportsPreview ? "YES" : "NO"}</span></p>
                        </div>
                      </div>
                    )}

                    {bottomTab === "problems" && (
                      <div className="text-slate-300 space-y-2 font-mono text-xs">
                        <p className="text-slate-500">// Compilation and syntax error diagnostics</p>
                        {problems.map((prob) => (
                          <div
                            key={prob.id}
                            onClick={() => {
                              if (prob.fileId) {
                                openFile(prob.fileId);
                                setEditorCursorTarget({ line: prob.line, column: prob.column });
                                showToast(`Moved cursor to ${prob.file}:${prob.line}`, "info");
                              }
                            }}
                            className="p-2 bg-rose-950/20 border border-rose-500/10 hover:border-rose-500/30 rounded-lg cursor-pointer transition flex items-center justify-between group"
                          >
                            <div>
                              <span className="text-rose-400 font-bold uppercase text-[9px] mr-2">[{prob.severity}]</span>
                              <span className="text-slate-300 font-sans text-xs">{prob.description}</span>
                              <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{prob.file} (Line {prob.line}, Column {prob.column})</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white shrink-0" />
                          </div>
                        ))}
                        {problems.length === 0 && (
                          <p className="text-slate-600">No syntax errors, ESLint diagnostics, or compiler logs warnings found.</p>
                        )}
                      </div>
                    )}

                    {bottomTab === "tests" && (
                      <div className="text-slate-300 space-y-3 font-mono text-xs">
                        <p className="text-slate-500">// Runtime test suites evaluations</p>
                        {testResults.map((test) => (
                          <div key={test.id} className="p-3 bg-slate-900 border border-white/5 rounded-lg space-y-1">
                            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                              <span className="text-slate-300 font-bold">{test.label}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                test.status === "Passed" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                              }`}>{test.status}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mt-1">
                              <div>Input: <code className="text-indigo-400">{test.input || "None"}</code></div>
                              <div>Expected: <code className="text-emerald-400">{test.expected}</code></div>
                              <div>Actual Output: <code className={test.status === "Passed" ? "text-emerald-400" : "text-rose-400"}>{test.actual || "Empty"}</code></div>
                              <div>Runtime: <code className="text-indigo-400">{test.durationMs}ms</code></div>
                            </div>
                          </div>
                        ))}
                        {testResults.length === 0 && !isExecutingTests && (
                          <p className="text-slate-600">Click the "Run Tests" button in the header toolbar to trigger automated compiler test cases.</p>
                        )}
                        {isExecutingTests && (
                          <p className="text-indigo-400 animate-pulse">Running assertions check inside sandbox container...</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
