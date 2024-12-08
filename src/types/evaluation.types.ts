export type EvaluationStatus = 'pending' | 'in_progress' | 'completed';

export interface EvaluationType {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  category: string;
  weight: number;
  created_at: string;
  updated_at: string;
}

export interface Evaluation {
  id: string;
  evaluator_id: string;
  evaluatee_id: string;
  type_id: string;
  status: EvaluationStatus;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface EvaluationResponse {
  id: string;
  evaluation_id: string;
  criteria_id: string;
  score: number;
  comments: string;
  created_at: string;
  updated_at: string;
}

export interface EvaluationFormData {
  evaluatee_id: string;
  type_id: string;
  start_date: string;
  end_date: string;
  responses: {
    criteria_id: string;
    score: number;
    comments?: string;
  }[];
}