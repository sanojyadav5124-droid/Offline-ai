import React from "react";
import { X, Download, Tag, Calendar, Maximize2 } from "lucide-react";
import { PhotoAttachment } from "../types";

interface PhotoViewerModalProps {
  photo: PhotoAttachment | null;
  onClose: () => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({ photo, onClose }) => {
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {photo.tag || "Technical Reference"}
            </span>
            <h3 className="font-semibold text-sm truncate max-w-md">{photo.caption || photo.fileName}</h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={photo.dataUrl}
              download={photo.fileName || "maritime_reference.jpg"}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 overflow-auto bg-slate-950/60 p-4 flex items-center justify-center min-h-[300px]">
          <img
            src={photo.dataUrl}
            alt={photo.caption}
            className="max-h-[65vh] w-auto object-contain rounded-md border border-slate-800 shadow-lg"
          />
        </div>

        {/* Footer Info */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Logged: {photo.uploadedAt}
            </span>
            <span>Size: ~{photo.fileSizeKb} KB</span>
          </div>
          <p className="text-slate-300 italic font-medium">{photo.caption}</p>
        </div>
      </div>
    </div>
  );
};
