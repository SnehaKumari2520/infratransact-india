import React, { useState, useEffect } from 'react';
import { Project, Complaint } from '../types';
import { Search, MapPin, FileWarning, ChevronRight, BarChart3, UploadCloud, Images, X, Map as MapIcon, List, Info, Building2, AlertTriangle } from 'lucide-react';
import { analyzeComplaintImage, fileToBase64 } from '../services/geminiService';

interface CitizenViewProps {
  projects: Project[];
  complaints: Complaint[];
  onFileComplaint: (c: Complaint) => void;
}

const CitizenView: React.FC<CitizenViewProps> = ({ projects, complaints, onFileComplaint }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'LIST' | 'DETAILS' | 'COMPLAINT'>('LIST');
  const [displayMode, setDisplayMode] = useState<'LIST' | 'MAP'>('LIST');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  // Image Error States
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [mapImageError, setMapImageError] = useState(false);

  // Complaint Form State
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintLoc, setComplaintLoc] = useState('');
  const [complaintFiles, setComplaintFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // Manage file previews
  useEffect(() => {
    const urls = complaintFiles.map(file => URL.createObjectURL(file));
    setFilePreviews(urls);
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [complaintFiles]);

  const handleImageError = (id: string) => {
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setView('DETAILS');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setComplaintFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeFile = (index: number) => {
    setComplaintFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAiAnalysisResult(null);

    let analysisText = "Manual Review Required";
    let severity: any = "Medium";
    let base64Images: string[] = [];

    if (complaintFiles.length > 0) {
      try {
        base64Images = await Promise.all(complaintFiles.map(fileToBase64));
        const result = await analyzeComplaintImage(base64Images, complaintDesc);
        analysisText = result.analysis;
        severity = result.severity;
        setAiAnalysisResult(result);
      } catch (err) {
        console.error("AI failed", err);
      }
    }

    const newComplaint: Complaint = {
      id: Date.now().toString(),
      projectId: selectedProject?.id,
      citizenName: 'Anonymous Citizen',
      location: complaintLoc,
      description: complaintDesc,
      severity: severity,
      status: 'Pending',
      dateFiled: new Date().toISOString(),
      aiAnalysis: analysisText,
      images: base64Images
    };

    onFileComplaint(newComplaint);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header / Search */}
      {view === 'LIST' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-2">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Monitor Public Spending</h2>
                  <p className="text-green-100 max-w-xl">
                    Track every Rupee spent on infrastructure near you. Ensure contractors use quality materials.
                  </p>
                </div>
                {/* View Toggle */}
                <div className="bg-green-800/50 p-1 rounded-lg flex items-center backdrop-blur-sm border border-green-600/30">
                  <button 
                    onClick={() => setDisplayMode('LIST')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${displayMode === 'LIST' ? 'bg-white text-green-900 shadow-sm' : 'text-green-100 hover:bg-green-700/50'}`}
                  >
                    <List className="w-4 h-4 mr-2" />
                    List
                  </button>
                  <button 
                    onClick={() => setDisplayMode('MAP')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${displayMode === 'MAP' ? 'bg-white text-green-900 shadow-sm' : 'text-green-100 hover:bg-green-700/50'}`}
                  >
                    <MapIcon className="w-4 h-4 mr-2" />
                    Map
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flex bg-white rounded-lg overflow-hidden p-1 shadow-lg max-w-lg">
                <div className="flex items-center px-3 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  placeholder="Search by area, road name, or city..."
                  className="flex-1 p-3 outline-none text-white-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 bg-white transform skew-x-12 translate-x-12"></div>
          </div>

          {/* LIST VIEW */}
          {displayMode === 'LIST' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="h-48 overflow-hidden relative group bg-gray-100">
                    {failedImages.has(project.id) || !project.thumbnailUrl ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                        <Building2 className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-xs font-medium uppercase tracking-wider">No Image Available</span>
                      </div>
                    ) : (
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title} 
                        onError={() => handleImageError(project.id)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold shadow-sm ${
                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>{project.status}</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-2">
                      <span className="text-xs text-green-700 font-bold uppercase tracking-wider">{project.type}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{project.title}</h3>
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      {project.location}
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 mt-auto">
                      <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Budget Used</span>
                          <span className="font-semibold text-gray-900">{Math.round((project.budgetReleased / project.budgetAllocated) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(project.budgetReleased / project.budgetAllocated) * 100}%` }}></div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleViewDetails(project)}
                      className="w-full py-2 border border-green-600 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                    >
                      View Transparency Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MAP VIEW */}
          {displayMode === 'MAP' && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden relative h-[600px] bg-blue-50/20">
              <div className="absolute inset-0 flex items-center justify-center p-4">
                {/* Static Map of India */}
                <div className="relative h-full aspect-[3/4] max-w-full flex items-center justify-center">
                  {mapImageError ? (
                    <div className="text-center p-8 bg-white/50 rounded-xl backdrop-blur-sm border border-gray-200">
                      <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600">Map View Unavailable</h3>
                      <p className="text-sm text-gray-500">The map image could not be loaded.</p>
                      <button onClick={() => setDisplayMode('LIST')} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md text-sm">
                        Switch to List View
                      </button>
                    </div>
                  ) : (
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/India_location_map_%28equirectangular_projection%29.svg/1024px-India_location_map_%28equirectangular_projection%29.svg.png" 
                      alt="Map of India" 
                      onError={() => setMapImageError(true)}
                      className="h-full w-full object-contain opacity-80 mix-blend-multiply"
                    />
                  )}

                  {/* Render Markers (Only if map loaded) */}
                  {!mapImageError && filteredProjects.map(project => {
                    if (!project.coordinates) return null;
                    const isActive = activeMarkerId === project.id;
                    return (
                      <div 
                        key={project.id}
                        className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer z-10 group"
                        style={{ left: `${project.coordinates.x}%`, top: `${project.coordinates.y}%` }}
                        onClick={() => setActiveMarkerId(isActive ? null : project.id)}
                        onMouseEnter={() => setActiveMarkerId(project.id)}
                      >
                         {/* Marker Icon */}
                         <div className={`relative transition-transform duration-300 ${isActive ? 'scale-125' : 'scale-100 hover:scale-110'}`}>
                           <MapPin 
                             className={`w-8 h-8 drop-shadow-md ${
                               project.status === 'Delayed' ? 'text-red-600 fill-red-100' : 
                               project.status === 'Completed' ? 'text-green-600 fill-green-100' : 
                               'text-blue-600 fill-blue-100'
                             }`} 
                           />
                           {project.status === 'In Progress' && (
                             <span className="absolute -top-1 -right-1 flex h-3 w-3">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                             </span>
                           )}
                         </div>

                         {/* Popup Card */}
                         {isActive && (
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-0 overflow-hidden z-50 animate-fade-in-up">
                              <div className="h-20 bg-gray-100 relative">
                                {(project.thumbnailUrl && !failedImages.has(project.id)) ? (
                                  <img src={project.thumbnailUrl} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <Building2 className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2">
                                  <span className="px-2 py-0.5 bg-white/90 rounded text-[10px] font-bold shadow-sm uppercase tracking-wider">{project.status}</span>
                                </div>
                              </div>
                              <div className="p-3">
                                <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">{project.title}</h4>
                                <p className="text-xs text-gray-500 mb-3">{project.location}</p>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleViewDetails(project); }}
                                  className="w-full bg-slate-900 text-white text-xs py-1.5 rounded hover:bg-slate-800 transition-colors"
                                >
                                  View Details
                                </button>
                              </div>
                              {/* Arrow */}
                              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 border-b border-r border-gray-200"></div>
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg text-xs text-gray-500 shadow-sm border border-gray-100">
                Click markers for details
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Detail View */}
      {view === 'DETAILS' && selectedProject && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="relative">
            <div className="h-64 w-full overflow-hidden bg-gray-800">
               {(selectedProject.thumbnailUrl && !failedImages.has(selectedProject.id)) ? (
                 <img src={selectedProject.thumbnailUrl} alt={selectedProject.title} className="w-full h-full object-cover" onError={() => handleImageError(selectedProject.id)} />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                   <Building2 className="w-20 h-20 opacity-20" />
                 </div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
            </div>
            
            <div className="absolute top-4 left-4">
              <button onClick={() => setView('LIST')} className="bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm transition-colors border border-white/20">
                &larr; Back to Projects
              </button>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col md:flex-row justify-between items-end gap-4">
              <div className="text-white">
                <span className="inline-block px-2 py-0.5 rounded bg-blue-600/80 text-xs font-bold mb-2 border border-blue-400/30">{selectedProject.type}</span>
                <h2 className="text-3xl font-bold shadow-black drop-shadow-lg">{selectedProject.title}</h2>
                <p className="text-slate-200 flex items-center mt-1"><MapPin className="w-4 h-4 mr-1"/> {selectedProject.location}</p>
              </div>
              <button 
                onClick={() => { setComplaintLoc(selectedProject.location); setView('COMPLAINT'); }}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center shadow-lg transform transition hover:scale-105"
              >
                <FileWarning className="w-4 h-4 mr-2" />
                Report Issue
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-blue-600"/> Financial & Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                   <div>
                      <p className="text-sm text-gray-500">Total Budget</p>
                      <p className="text-xl font-bold text-gray-900">₹{selectedProject.budgetAllocated} Cr</p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm text-gray-500">Released to Contractor</p>
                      <p className="text-xl font-bold text-green-600">₹{selectedProject.budgetReleased} Cr</p>
                   </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Material Log (Transparency Check)</h4>
                  {selectedProject.materials.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No materials logged yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {selectedProject.materials.map((m, i) => (
                         <li key={i} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                            <div>
                              <span className="font-medium text-gray-800 block">{m.name}</span>
                              <span className="inline-block bg-slate-100 text-slate-600 text-xs px-1.5 py-0.5 rounded mt-0.5">{m.qualityGrade}</span>
                            </div>
                            <div className="text-right">
                              <span className="block font-medium">{m.quantity}</span>
                              <span className="text-xs text-gray-500">₹{m.cost.toLocaleString()}</span>
                            </div>
                         </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Latest Work Updates</h3>
              <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pl-6 py-2">
                {selectedProject.updates.length === 0 && <p className="text-gray-500 italic">No updates uploaded by contractor yet.</p>}
                {selectedProject.updates.map((u, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-500 ring-4 ring-white"></span>
                    <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">{new Date(u.date).toLocaleDateString()}</p>
                    <p className="text-gray-800 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">{u.description}</p>
                    {u.percentageCompleted && (
                      <div className="mt-2 flex items-center">
                         <div className="flex-1 h-1.5 bg-gray-100 rounded-full mr-2">
                            <div className="h-1.5 bg-blue-500 rounded-full" style={{width: `${u.percentageCompleted}%`}}></div>
                         </div>
                         <span className="text-xs text-blue-700 font-bold">{u.percentageCompleted}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Form (Unchanged functionality, just keeping context) */}
      {view === 'COMPLAINT' && (
        <div className="bg-white rounded-xl shadow-lg max-w-2xl mx-auto p-8 border border-gray-100">
           <button onClick={() => setView('DETAILS')} className="text-gray-400 hover:text-gray-600 text-sm mb-4 flex items-center">&larr; Cancel</button>
           <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
             <FileWarning className="w-8 h-8 text-red-600 mr-3" />
             File Infrastructure Complaint
           </h2>

           {!aiAnalysisResult ? (
             <form onSubmit={handleComplaintSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text" 
                  value={complaintLoc} 
                  onChange={e => setComplaintLoc(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Street name, landmark, or GPS coordinates"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description of Issue</label>
                <textarea 
                  value={complaintDesc} 
                  onChange={e => setComplaintDesc(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                  rows={4}
                  placeholder="Describe the pothole, crack, or sewage issue..."
                  required
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className={`mx-auto h-12 w-12 ${complaintFiles.length > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                <p className="mt-2 text-sm text-gray-600">
                  {complaintFiles.length > 0 ? <span className="text-green-600 font-bold">{complaintFiles.length} photos selected</span> : "Upload multiple photos for AI Analysis"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG</p>
              </div>

              {/* Selected Files Preview Grid */}
              {filePreviews.length > 0 && (
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Preview</label>
                   <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {filePreviews.map((url, idx) => (
                      <div key={idx} className="relative h-20 w-full rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={url} alt={`Evidence ${idx + 1}`} className="h-full w-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center shadow-lg shadow-red-200"
              >
                {isSubmitting ? (
                  <>
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                   <span className="animate-pulse">Analyzing Evidence...</span>
                  </>
                ) : "Submit Report"}
              </button>
             </form>
           ) : (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Complaint Registered Successfully</h3>
                  <p className="mt-1 text-sm text-gray-500">Ref ID: #{Math.floor(Math.random() * 10000)}</p>
                </div>

                {/* Evidence Summary */}
                {filePreviews.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Submitted Evidence</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                      {filePreviews.map((url, idx) => (
                        <img key={idx} src={url} alt="Submitted" className="h-24 w-24 object-cover rounded-lg border border-gray-200" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <FileWarning className="w-24 h-24 text-blue-900" />
                  </div>
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center relative z-10 text-lg">
                     <span className="mr-2 text-2xl">🤖</span> 
                     AI Analysis Report
                  </h4>
                  <div className="space-y-4 text-sm text-blue-800 relative z-10">
                    <div className="bg-white/60 p-3 rounded-lg backdrop-blur-sm border border-blue-100">
                       <span className="font-bold uppercase text-xs tracking-wider text-blue-500 block mb-1">Severity Assessment</span> 
                       <div className="flex items-center">
                         <span className={`px-3 py-1 rounded-full text-white font-bold text-sm shadow-sm ${
                           aiAnalysisResult.severity === 'High' || aiAnalysisResult.severity === 'Critical' ? 'bg-red-500' : 
                           aiAnalysisResult.severity === 'Medium' ? 'bg-orange-500' : 'bg-yellow-500'
                         }`}>
                           {aiAnalysisResult.severity.toUpperCase()}
                         </span>
                         <span className="ml-2 text-xs text-blue-600 opacity-80">
                           Based on visual evidence of cracks/damage.
                         </span>
                       </div>
                    </div>
                    
                    <div>
                      <span className="font-bold uppercase text-xs tracking-wider text-blue-500 block mb-1">Technical Findings</span> 
                      <p className="leading-relaxed text-gray-800">{aiAnalysisResult.analysis}</p>
                    </div>
                    
                    { (aiAnalysisResult.severity === 'High' || aiAnalysisResult.severity === 'Critical') && (
                      <p className="text-xs font-semibold text-red-700 bg-red-100/50 p-3 rounded border border-red-200 flex items-center">
                        <FileWarning className="w-4 h-4 mr-2" />
                        Priority Alert: This issue has been flagged for immediate inspection by the department engineer.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => { setView('LIST'); setAiAnalysisResult(null); setComplaintFiles([]); setComplaintDesc(''); setComplaintLoc(''); }} className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-medium transition-colors">
                    Back to Dashboard
                  </button>
                  <button onClick={() => { setAiAnalysisResult(null); setComplaintFiles([]); setComplaintDesc(''); setComplaintLoc(''); }} className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-gray-700">
                    File Another
                  </button>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

// Helper icon
const CheckCircle = ({className}: {className: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)

export default CitizenView;