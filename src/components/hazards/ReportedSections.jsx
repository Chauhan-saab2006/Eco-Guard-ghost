import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Modal } from "../common/Modal";
import { FileText, Clock, MapPin, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export const ReportedSections = () => {
  const { reports, setActivePage, focusOnMap } = useApp();
  const [selectedReport, setSelectedReport] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px]">New</span>;
      case "Under Review":
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">Under Review</span>;
      case "Resolved":
      default:
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">Resolved</span>;
    }
  };

  return (
    <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">Reported Sections</h3>
        </div>

        <button
          onClick={() => setActivePage("reports")}
          className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {reports.slice(0, 4).map((rep) => (
          <div
            key={rep.id}
            onClick={() => setSelectedReport(rep)}
            className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                {rep.title}
              </h4>
              {getStatusBadge(rep.status)}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{rep.location}</span>
              <span>•</span>
              <span>{rep.timeAgo}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Reported Incident — ${selectedReport.title}`}
        >
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Location</span>
                <span className="font-bold text-white">{selectedReport.location}</span>
              </div>
              <div>{getStatusBadge(selectedReport.status)}</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-1 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Reporter Details</span>
              <p className="text-slate-300">Reported by: <strong className="text-white">{selectedReport.reportedBy}</strong></p>
              <p className="text-slate-300">Time: <strong className="text-slate-200">{selectedReport.timeAgo}</strong></p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-1 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Incident Description</span>
              <p className="text-slate-200 leading-relaxed">{selectedReport.description}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  focusOnMap(selectedReport.coordinates[0], selectedReport.coordinates[1], 15);
                  setSelectedReport(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
              >
                Focus Map Location
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
