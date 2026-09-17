import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Student } from "../types";

interface DeleteConfirmModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  student,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        {/* Header Warning */}
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Student Record?</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
            Are you sure you want to permanently delete this student from the SQLite database? This operation cannot be undone.
          </p>

          {/* Student preview pill */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1 mb-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Student:</span>
              <span className="font-mono text-slate-500">ID #{student.id}</span>
            </div>
            <p className="text-sm font-bold text-slate-900">{student.name}</p>
            <p className="text-xs text-slate-500">{student.email} • {student.course}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-delete"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {isDeleting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Yes, Delete Record
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
