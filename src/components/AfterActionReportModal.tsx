import React from 'react';
import { Award, TrendingUp, CheckCircle, AlertCircle, X } from 'lucide-react';

interface AfterActionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: {
    eventId: string;
    generatedAt: string;
    predictedMetrics: {
      privateVehicles: number;
      peakSaturationPct: number;
      divertedVehicles: number;
    };
    actualTelemetry: {
      privateVehicles: number;
      peakSaturationPct: number;
      divertedVehicles: number;
    };
    variance: {
      predictionErrorVehiclesPct: number;
      predictionErrorSatPct: number;
      summary: string;
    };
    learningUpdate: {
      metric: string;
      previousFactor: number;
      updatedFactor: number;
      status: string;
    };
  };
}

export const AfterActionReportModal: React.FC<AfterActionReportModalProps> = ({
  isOpen,
  onClose,
  report
}) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 max-w-xl w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#2563EB]" />
            <div>
              <h3 className="text-base font-semibold text-[#1F2933]">
                After-Action Learning Report (Post-Event Review)
              </h3>
              <span className="text-xs text-slate-500">
                Generated at {report.generatedAt} | Continuous Adaptive Learning Loop
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prediction vs Actuals Telemetry Table */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-700 block">
            Predicted Model vs Actual Ground Sensors (Loop Detectors)
          </span>

          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F5F6F8] border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2 px-3">Metric</th>
                  <th className="py-2 px-3">Predicted</th>
                  <th className="py-2 px-3">Actual Telemetry</th>
                  <th className="py-2 px-3">Accuracy / Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-800">Private vehicles</td>
                  <td className="py-2 px-3 text-slate-600 font-mono">
                    {report.predictedMetrics.privateVehicles.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-slate-800 font-bold font-mono">
                    {report.actualTelemetry.privateVehicles.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-emerald-700 font-semibold">
                    {100 - report.variance.predictionErrorVehiclesPct}% match (±{report.variance.predictionErrorVehiclesPct}%)
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-800">Peak road saturation</td>
                  <td className="py-2 px-3 text-slate-600 font-mono">
                    {report.predictedMetrics.peakSaturationPct}%
                  </td>
                  <td className="py-2 px-3 text-slate-800 font-bold font-mono">
                    {report.actualTelemetry.peakSaturationPct}%
                  </td>
                  <td className="py-2 px-3 text-emerald-700 font-semibold">
                    {100 - report.variance.predictionErrorSatPct}% match (±{report.variance.predictionErrorSatPct}%)
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-800">Vehicles diverted</td>
                  <td className="py-2 px-3 text-slate-600 font-mono">
                    {report.predictedMetrics.divertedVehicles.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-slate-800 font-bold font-mono">
                    {report.actualTelemetry.divertedVehicles.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-emerald-700 font-semibold">
                    97% adherence
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs text-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
            <CheckCircle className="w-4 h-4 text-emerald-700" />
            <span>Telemetry Validation Summary</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {report.variance.summary}
          </p>
        </div>

        {/* Adaptive Model Self-Calibration */}
        <div className="p-4 bg-[#F5F6F8] rounded-lg border border-slate-200 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <TrendingUp className="w-4 h-4 text-[#2563EB]" />
            <span>Adaptive Correction Factor (Learned Parameter Update)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Prior Model Factor</span>
              <div className="font-mono text-sm font-bold text-slate-700">
                {report.learningUpdate.previousFactor}x
              </div>
              <span className="text-[10px] text-slate-400">Baseline multiplier</span>
            </div>

            <div className="bg-white p-2.5 rounded border border-blue-200">
              <span className="text-[10px] text-[#2563EB] block font-semibold">Updated Learned Factor</span>
              <div className="font-mono text-sm font-bold text-[#2563EB]">
                {report.learningUpdate.updatedFactor}x
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">Fine-tuned from ground truth</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600">
            <strong>Parameter: </strong>{report.learningUpdate.metric} — <em>{report.learningUpdate.status}</em>
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] text-slate-400">
            Sample data. Estimates from stated assumptions.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded font-medium"
          >
            Close report
          </button>
        </div>
      </div>
    </div>
  );
};
