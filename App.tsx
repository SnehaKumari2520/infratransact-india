import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GovView from './components/GovView';
import ContractorView from './components/ContractorView';
import CitizenView from './components/CitizenView';
import { Project, Role, Complaint, Material } from './types';

// --- MOCK DATA ---
const MOCK_PROJECTS: Project[] = [
  {
    id: 'P-101',
    title: 'NH-44 Highway Expansion (Bangalore North)',
    location: 'Bangalore, Karnataka',
    type: 'Highway',
    contractorName: 'Larsen & Toubro Infra',
    budgetAllocated: 450,
    budgetReleased: 320,
    status: 'In Progress',
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    startDate: '2023-01-15',
    expectedEndDate: '2024-06-30',
    // Using Placehold.co for reliable image rendering
    thumbnailUrl: 'https://placehold.co/800x600/10b981/ffffff.png?text=Highway+Expansion+Project',
    coordinates: { x: 38, y: 78 }, // Approximate Bangalore
    materials: [
      { name: 'Bitumen VG-30', quantity: '1200 Tons', qualityGrade: 'Grade A', supplier: 'Indian Oil', cost: 4500000, dateAdded: '2023-08-10' },
      { name: 'Cement', quantity: '5000 Bags', qualityGrade: 'OPC 53', supplier: 'UltraTech', cost: 2000000, dateAdded: '2023-08-12' }
    ],
    updates: [
      { id: 'u1', date: '2023-09-01', description: 'Completed 15km leveling work near Hebbal.', percentageCompleted: 35 }
    ]
  },
  {
    id: 'P-102',
    title: 'Ganga Bridge Repair',
    location: 'Patna, Bihar',
    type: 'Flyover',
    contractorName: 'Bihar Rajya Pul Nirman',
    budgetAllocated: 120,
    budgetReleased: 110,
    status: 'Delayed',
    lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago (OVERDUE ALERT)
    startDate: '2022-11-01',
    expectedEndDate: '2023-12-01',
    thumbnailUrl: 'https://placehold.co/800x600/3b82f6/ffffff.png?text=Ganga+Bridge+Repair',
    coordinates: { x: 62, y: 38 }, // Approximate Patna
    materials: [
       { name: 'Steel Rebar', quantity: '200 Tons', qualityGrade: 'Fe-550', supplier: 'Tata Steel', cost: 12000000, dateAdded: '2023-01-20' }
    ],
    updates: []
  },
  {
    id: 'P-103',
    title: 'Rural Road Connect Scheme',
    location: 'Varanasi, UP',
    type: 'Road',
    contractorName: 'ABC Roads Pvt Ltd',
    budgetAllocated: 50,
    budgetReleased: 10,
    status: 'Planned',
    lastUpdated: new Date().toISOString(),
    startDate: '2024-01-01',
    expectedEndDate: '2024-12-01',
    thumbnailUrl: 'https://placehold.co/800x600/f59e0b/ffffff.png?text=Rural+Road+Scheme',
    coordinates: { x: 55, y: 40 }, // Approximate Varanasi
    materials: [],
    updates: []
  }
];

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'C-001',
    projectId: 'P-102',
    citizenName: 'Rahul Kumar',
    location: 'Pillar 4, Ganga Bridge',
    description: 'Large cracks visible on the pillar base.',
    severity: 'High',
    status: 'Pending',
    dateFiled: '2023-10-01',
    aiAnalysis: 'Structural integrity risk detected. Cracks suggest foundation settling.'
  }
];

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('CITIZEN');
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);

  // Handle Contractor Updates
  const handleProjectUpdate = (projectId: string, material: Material | null, updateDesc: string | null) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      
      const updatedProject = { ...p, lastUpdated: new Date().toISOString() };
      
      if (material) {
        updatedProject.materials = [material, ...updatedProject.materials];
      }
      
      if (updateDesc) {
        updatedProject.updates = [
          { 
            id: Date.now().toString(), 
            date: new Date().toISOString(), 
            description: updateDesc, 
            percentageCompleted: p.updates.length > 0 ? (p.updates[0].percentageCompleted || 0) + 2 : 5 
          }, 
          ...updatedProject.updates
        ];
      }
      return updatedProject;
    }));
  };

  // Handle Gov Actions
  const handleStatusUpdate = (id: string, status: any) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  // Handle Citizen Complaint
  const handleNewComplaint = (complaint: Complaint) => {
    setComplaints(prev => [complaint, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <Navbar currentRole={role} setRole={setRole} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === 'GOVERNMENT' && (
          <div>
            <div className="mb-6">
               <h1 className="text-2xl font-bold text-slate-800">Ministry Dashboard</h1>
               <p className="text-slate-500">Oversee active contracts, monitor budget flow, and audit compliance.</p>
            </div>
            <GovView 
              projects={projects} 
              complaints={complaints}
              updateProjectStatus={handleStatusUpdate}
            />
          </div>
        )}

        {role === 'CONTRACTOR' && (
          <div>
             <div className="mb-6">
               <h1 className="text-2xl font-bold text-slate-800">Contractor Portal</h1>
               <p className="text-slate-500">Log materials and update weekly progress to ensure transparency.</p>
            </div>
            <ContractorView 
              projects={projects}
              onUpdateProject={handleProjectUpdate}
            />
          </div>
        )}

        {role === 'CITIZEN' && (
          <CitizenView 
            projects={projects} 
            complaints={complaints}
            onFileComplaint={handleNewComplaint}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>&copy; 2024 InfraTransact India. Ministry of Road Transport & Highways.</p>
        <p className="mt-2 text-xs">Powered by Gemini AI for Infrastructure Safety Analysis.</p>
      </footer>
    </div>
  );
};

export default App;