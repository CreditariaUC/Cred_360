import { supabase } from '../lib/supabase';
import type { 
  Evaluation, 
  EvaluationType, 
  EvaluationCriteria, 
  EvaluationResponse,
  EvaluationFormData 
} from '../types/evaluation.types';

export const evaluationService = {
  async getEvaluationTypes(): Promise<EvaluationType[]> {
    const { data, error } = await supabase
      .from('evaluation_types')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async getEvaluationCriteria(): Promise<EvaluationCriteria[]> {
    const { data, error } = await supabase
      .from('evaluation_criteria')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getMyEvaluations(): Promise<Evaluation[]> {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        evaluator:evaluator_id(id, email, profiles!inner(full_name, department)),
        evaluatee:evaluatee_id(id, email, profiles!inner(full_name, department)),
        type:type_id(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getEvaluationResponses(evaluationId: string): Promise<EvaluationResponse[]> {
    const { data, error } = await supabase
      .from('evaluation_responses')
      .select(`
        *,
        criteria:criteria_id(*)
      `)
      .eq('evaluation_id', evaluationId);

    if (error) throw error;
    return data;
  },

  async createEvaluation(formData: EvaluationFormData): Promise<Evaluation> {
    const { evaluatee_id, type_id, start_date, end_date, responses } = formData;

    // Start a transaction
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .insert({
        evaluator_id: (await supabase.auth.getUser()).data.user?.id,
        evaluatee_id,
        type_id,
        start_date,
        end_date,
        status: 'pending'
      })
      .select()
      .single();

    if (evalError) throw evalError;

    // Insert responses
    const { error: respError } = await supabase
      .from('evaluation_responses')
      .insert(
        responses.map(response => ({
          evaluation_id: evaluation.id,
          ...response
        }))
      );

    if (respError) throw respError;

    // Create notification for evaluatee
    await supabase
      .from('notifications')
      .insert({
        user_id: evaluatee_id,
        title: 'Nueva Evaluación Asignada',
        message: 'Se te ha asignado una nueva evaluación para completar.',
        type: 'info',
        action_type: 'action',
        link: `/evaluations/${evaluation.id}`
      });

    return evaluation;
  },

  async updateEvaluationStatus(
    evaluationId: string, 
    status: 'in_progress' | 'completed'
  ): Promise<void> {
    const { error } = await supabase
      .from('evaluations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', evaluationId);

    if (error) throw error;
  }
};