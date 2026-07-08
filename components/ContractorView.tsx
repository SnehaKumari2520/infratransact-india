import React, { useState } from 'react';
import { Project, Material } from '../types';
import { Camera, Plus, Save, PackageCheck, Building2 } from 'lucide-react';

interface ContractorViewProps {
  projects: Project[];
  onUpdateProject: (projectId: string, material: Material | null, updateDesc: string | null) => void;
}

const ContractorView: React.FC<ContractorViewProps> = ({ projects, onUpdateProject }) => {
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || '');
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  
  // Form States
  const [materialName, setMaterialName] = useState('');
  const [materialQty, setMaterialQty] = useState('');
  const [materialGrade, setMaterialGrade] = useState('');
  const [materialCost, setMaterialCost] = useState('');
  
  const [updateDesc, setUpdateDesc] = useState('');
  const [updatePercent, setUpdatePercent] = useState('');

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleImageError = (id: string) => {
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const handleSubmitMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    const newMaterial: Material = {
      name: materialName,
      quantity: materialQty,
      qualityGrade: materialGrade,
      supplier: 'Verified Supplier Inc.',
      cost: parseFloat(materialCost),
      dateAdded: new Date().toISOString()
    };
    
    onUpdateProject(activeProjectId, newMaterial, null);
    // Reset
    setMaterialName('');
    setMaterialQty('');
    setMaterialGrade('');
    setMaterialCost('');
    alert("Material Logged Successfully");
  };

  const handleSubmitUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    
    onUpdateProject(activeProjectId, null, updateDesc);
    setUpdateDesc('');
    setUpdatePercent('');
    alert("Weekly Progress Updated");
  };

  if (!activeProject) return <div>No Assigned Projects</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Sidebar Project Selector */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-bold text-gray-700 mb-4">Assigned Projects</h3>
        <div className="space-y-2">
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProjectId(p.id)}
              className={`w-full text-left px-3 py-3 rounded-lg transition-colors border flex items-center space-x-3 ${
                activeProjectId === p.id 
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                {p.thumbnailUrl && !failedImages.has(p.id) ? (
                  <img 
                    src={p.thumbnailUrl} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover" 
                    onError={() => handleImageError(p.id)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                <p className="text-xs opacity-70 mt-0.5">{p.location}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Area */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Weekly Progress Update */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Camera className="text-orange-600" />
            <h2 className="text-lg font-bold text-gray-800">Weekly Progress Update</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Mandatory: Upload photos and description every 7 days to avoid penalty.
          </p>
          
          <form onSubmit={handleSubmitUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Description</label>
              <textarea 
                value={updateDesc}
                onChange={(e) => setUpdateDesc(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 outline-none" 
                rows={3} 
                placeholder="e.g., Completed laying foundation layer for 2km stretch..."
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress %</label>
                <input 
                  type="number" 
                  value={updatePercent}
                  onChange={(e) => setUpdatePercent(e.target.value)}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 outline-none" 
                  placeholder="e.g. 45"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo Evidence</label>
                <input 
                  type="file" 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-lg flex justify-center items-center transition-colors">
              <Save className="w-4 h-4 mr-2" />
              Submit Weekly Report
            </button>
          </form>
        </div>

        {/* Material Logger */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <PackageCheck className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Log Material Usage</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Transparently log all raw materials used. This data is visible to citizens.
          </p>

          <form onSubmit={handleSubmitMaterial} className="space-y-4 border-t pt-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Material Name</label>
                  <input value={materialName} onChange={e => setMaterialName(e.target.value)} type="text" className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm border p-2 text-sm text-white placeholder-slate-400" placeholder="e.g. Bitumen" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grade/Quality</label>
                  <input value={materialGrade} onChange={e => setMaterialGrade(e.target.value)} type="text" className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm border p-2 text-sm text-white placeholder-slate-400" placeholder="e.g. VG-30" required/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input value={materialQty} onChange={e => setMaterialQty(e.target.value)} type="text" className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm border p-2 text-sm text-white placeholder-slate-400" placeholder="e.g. 500 Tons" required/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cost (₹)</label>
                  <input value={materialCost} onChange={e => setMaterialCost(e.target.value)} type="number" className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm border p-2 text-sm text-white placeholder-slate-400" required/>
                </div>
             </div>
             <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg flex justify-center items-center transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add to Material Log
            </button>
          </form>
          
          <div className="mt-6">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Recent Logs</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left text-gray-500">
                <thead className="bg-gray-50 text-gray-700 uppercase">
                  <tr>
                    <th className="px-3 py-2">Material</th>
                    <th className="px-3 py-2">Grade</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProject.materials.slice(0, 5).map((m, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2 font-medium">{m.name}</td>
                      <td className="px-3 py-2">{m.qualityGrade}</td>
                      <td className="px-3 py-2">{m.quantity}</td>
                      <td className="px-3 py-2">{new Date(m.dateAdded).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContractorView;