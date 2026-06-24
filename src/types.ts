export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: 'Pothole' | 'Water Leakage' | 'Streetlight' | 'Waste Management' | 'Public Infrastructure' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'Verified' | 'Scheduled' | 'In Progress' | 'Resolved';
  location: {
    lat: number;
    lng: number;
    address: string;
    neighborhood: string;
  };
  imageUrl?: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  votes: number;
  verifiedBy: string[];
  aiAnalysis?: {
    category: string;
    severity: string;
    predictiveInsight: string;
    actionPlan: string;
    estimatedCost?: string;
  };
  timeline: {
    status: string;
    label: string;
    timestamp: string;
    note?: string;
  }[];
  comments: {
    id: string;
    user: string;
    text: string;
    createdAt: string;
    isOfficial?: boolean;
  }[];
}

export interface UserStats {
  email: string;
  points: number;
  reportsSubmitted: number;
  validationsMade: number;
  commentsAdded: number;
  resolvedHelpCount: number;
}

export interface CommunityForecast {
  updatedAt: string;
  overallScore: number; // 0-100 index of community infra health
  aiSummary: string;
  predictions: {
    title: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    probability: number;
    recommendedPreemptiveAction: string;
    location: string;
  }[];
}
