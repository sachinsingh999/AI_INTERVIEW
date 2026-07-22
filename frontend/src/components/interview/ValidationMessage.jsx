import React from "react";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ValidationMessage({ message }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-rose-400"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}
