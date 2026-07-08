import React, { useState } from "react";
import { Project, Complaint } from "../types";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Building2,
} from "lucide-react";
import { generateComplianceReport } from "../services/geminiService";

interface GovViewProps {
  projects: Project[];
  complaints: Complaint[];
  updateProjectStatus: (id: string, status: string) => void;
}

const GovView: React.FC<GovViewProps> = ({
  projects = [],
  complaints = [],
  updateProjectStatus,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [aiReport, setAiReport] = useState<string>("");
  const [loadingReport, setLoadingReport] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const pendingComplaints = complaints.filter(
    (c) => c?.status === "Pending",
  ).length;

  // Calculate overdue updates
  const today = new Date();
  const overdueProjects = projects.filter((p) => {
    if (!p?.lastUpdated) return false;
    const lastUpdate = new Date(p.lastUpdated);
    const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  });

  const handleGenerateReport = async (project: Project) => {
    setSelectedProject(project);
    setLoadingReport(true);
    try {
      const report = await generateComplianceReport(project);
      setAiReport(report || "Failed to generate report.");
    } catch (error) {
      setAiReport("Error connecting to audit service.");
    } finally {
      setLoadingReport(false);
    }
  };

  const handleImageError = (id: string) => {
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Budget Released</p>
              <h3 className="text-2xl font-bold">
                ₹{projects.reduce((acc, p) => acc + (p?.budgetReleased || 0), 0)} Cr
              </h3>
            </div>
            <DollarSign className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div>
              {/* FIXED JSX ERROR LINE BELOW */}
              <p className="text-sm text-gray-500">
                Update Overdue (&gt;7 days)
              </p>
              <h3 className="text-2xl font-bold text-red-600">
                {overdueProjects.length}
              </h3>
            </div>
            <Clock className="text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Citizen Complaints</p>
              <h3 className="text-2xl font-bold">
                {pendingComplaints} Pending
              </h3>
            </div>
            <AlertTriangle className="text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Active Projects</p>
              <h3 className="text-2xl font-bold">
                {projects.filter((p) => p?.status === "In Progress").length}
              </h3>
            </div>
            <CheckCircle className="text-green-500" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Active Contracts & Bills
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Create New Contract
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {projects.map((project, idx) => {
              if (!project) return null;
              const lastUpdateDate = project.lastUpdated ? new Date(project.lastUpdated) : new Date();
              const daysSinceUpdate = Math.ceil(
                (new Date().getTime() - lastUpdateDate.getTime()) /
                  (1000 * 3600 * 24),
              );
              const isOverdue = daysSinceUpdate > 7;

              return (
                <div
                  key={project.id || idx}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-4">
                      <div className="hidden sm:block w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shadow-sm flex-shrink-0">
                        {project.thumbnailUrl && project.id && !failedImages.has(project.id) ? (
                          <img
                            src={project.thumbnailUrl}
                            alt={project.title || "Project image"}
                            onError={() => project.id && handleImageError(project.id)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Building2 className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-md font-bold text-gray-900">
                            {project.title || "Untitled Project"}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              project.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : project.status === "Delayed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {project.status || "Unknown"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {project.location || "No Location"} • Contractor:{" "}
                          {project.contractorName || "Unassigned"}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>
                            Budget: ₹{project.budgetReleased || 0}/
                            {project.budgetAllocated || 0} Cr
                          </span>
                          <span
                            className={
                              isOverdue
                                ? "text-red-600 font-bold flex items-center"
                                : "text-green-600 flex items-center"
                            }
                          >
                            {isOverdue ? (
                              <AlertTriangle className="w-3 h-3 mr-1" />
                            ) : (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            Last Update: {daysSinceUpdate} days ago
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleGenerateReport(project)}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium hover:bg-slate-200 flex items-center whitespace-nowrap"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Audit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Audit Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            AI Compliance Audit
          </h2>
          {selectedProject ? (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center space-x-3">
                <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                  {selectedProject.thumbnailUrl && selectedProject.id && !failedImages.has(selectedProject.id) ? (
                    <img
                      src={selectedProject.thumbnailUrl}
                      className="w-full h-full object-cover"
                      onError={() => selectedProject.id && handleImageError(selectedProject.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Audit Target:
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {selectedProject.title}
                  </p>
                </div>
              </div>

              {loadingReport ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900 border border-blue-100">
                  <h4 className="font-bold flex items-center mb-2">
                    <span className="text-xl mr-2">🤖</span> Gemini Report
                  </h4>
                  <p className="whitespace-pre-line leading-relaxed">
                    {aiReport}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-uppercase text-gray-400 font-bold mb-2">
                  ACTIONS
                </h4>
                <button 
                  onClick={() => selectedProject.id && updateProjectStatus(selectedProject.id, "Delayed")}
                  className="w-full mb-2 bg-red-50 text-red-600 px-4 py-2 rounded text-sm font-medium hover:bg-red-100 border border-red-200"
                >
                  Issue Warning to Contractor
                </button>
                <button 
                  onClick={() => selectedProject.id && updateProjectStatus(selectedProject.id, "Completed")}
                  className="w-full bg-green-50 text-green-600 px-4 py-2 rounded text-sm font-medium hover:bg-green-100 border border-green-200"
                >
                  Release Next Tranche Funds
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Select a project to generate an AI audit report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovView;