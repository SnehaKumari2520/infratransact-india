export type Role = 'GOVERNMENT' | 'CONTRACTOR' | 'CITIZEN';

export interface Material {
  name: string;
  quantity: string;
  qualityGrade: string; // e.g., "M40 Concrete", "Grade A Bitumen"
  supplier: string;
  cost: number;
  dateAdded: string;
}

export interface WorkUpdate {
  id: string;
  date: string;
  description: string;
  percentageCompleted: number;
  imageUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  location: string;
  type: 'Road' | 'Highway' | 'Flyover' | 'Sewage';
  contractorName: string;
  budgetAllocated: number; // in Crores
  budgetReleased: number;
  status: 'Planned' | 'In Progress' | 'Delayed' | 'Completed';
  lastUpdated: string; // ISO Date
  materials: Material[];
  updates: WorkUpdate[];
  startDate: string;
  expectedEndDate: string;
  thumbnailUrl?: string;
  coordinates?: { x: number; y: number }; // Percentage 0-100 on the map container
}

export interface Complaint {
  id: string;
  projectId?: string; // Optional if general complaint
  citizenName: string;
  location: string;
  description: string;
  images?: string[]; // Multiple images for evidence
  aiAnalysis?: string; // Analysis from Gemini
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Investigating' | 'Resolved';
  dateFiled: string;
}