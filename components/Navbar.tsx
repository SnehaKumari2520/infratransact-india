import React from 'react';
import { Role } from '../types';
import { ShieldCheck, HardHat, Users, Building2 } from 'lucide-react';

interface NavbarProps {
  currentRole: Role;
  setRole: (role: Role) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentRole, setRole }) => {
  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">InfraTransact<span className="text-orange-500">India</span></h1>
              <p className="text-xs text-gray-400">National Infrastructure Transparency Portal</p>
            </div>
          </div>
          
          <div className="flex space-x-2 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setRole('GOVERNMENT')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentRole === 'GOVERNMENT' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Gov Official
            </button>
            <button
              onClick={() => setRole('CONTRACTOR')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentRole === 'CONTRACTOR' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              <HardHat className="w-4 h-4 mr-2" />
              Contractor
            </button>
            <button
              onClick={() => setRole('CITIZEN')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentRole === 'CITIZEN' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Citizen
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
