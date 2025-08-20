import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

const icons = {
  success: <CheckCircle className="w-6 h-6 text-green-500" />,
  error: <XCircle className="w-6 h-6 text-red-500" />,
  warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
  info: <Info className="w-6 h-6 text-blue-500" />,
};

const bgColors = {
  success: "bg-green-100 border-green-500",
  error: "bg-red-100 border-red-500",
  warning: "bg-yellow-100 border-yellow-500",
  info: "bg-blue-100 border-blue-500",
};

export default function AlertBox({ show, type = "info", message, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-5 right-5 z-50 font-bold border-l-4 ${bgColors[type]} rounded-lg shadow-lg p-4 flex items-center gap-3`}
        >
          {icons[type]}
          <span className="text-gray-800 font-bold">{message}</span>
          <button
            onClick={onClose}
            className="ml-4 text-gray-500 font-bold hover:text-gray-700"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
