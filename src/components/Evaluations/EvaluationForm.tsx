import React, { useState, useEffect } from 'react';
import { Card, CardBody, Select, SelectItem, Input, Button, Textarea } from '@nextui-org/react';
import { Calendar, Users, AlertCircle } from 'lucide-react';
import { evaluationService } from '../../services/evaluation.service';
import type { EvaluationType, EvaluationCriteria } from '../../types/evaluation.types';
import toast from 'react-hot-toast';
import CriteriaSection from './CriteriaSection';
import { useAuth } from '../../contexts/AuthContext';

const EvaluationForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [evaluationTypes, setEvaluationTypes] = useState<EvaluationType[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [subordinates, setSubordinates] = useState<{ id: string; full_name: string }[]>([]);
  const { profile } = useAuth();

  const [formData, setFormData] = useState({
    evaluatee_id: '',
    type_id: '',
    start_date: '',
    end_date: '',
    responses: [] as { criteria_id: string; score: number; comments?: string }[]
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [types, criteriaList] = await Promise.all([
          evaluationService.getEvaluationTypes(),
          evaluationService.getEvaluationCriteria()
        ]);
        setEvaluationTypes(types);
        setCriteria(criteriaList);
      } catch (error) {
        console.error('Error loading evaluation data:', error);
        toast.error('Error al cargar los datos de evaluación');
      }
    };

    loadInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.evaluatee_id || !formData.type_id || !formData.start_date || !formData.end_date) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.responses.length === 0) {
      toast.error('Por favor califica todos los criterios');
      return;
    }

    try {
      setLoading(true);
      await evaluationService.createEvaluation(formData);
      toast.success('Evaluación creada exitosamente');
      
      // Reset form
      setFormData({
        evaluatee_id: '',
        type_id: '',
        start_date: '',
        end_date: '',
        responses: []
      });
    } catch (error) {
      console.error('Error creating evaluation:', error);
      toast.error('Error al crear la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleCriteriaUpdate = (criteriaId: string, score: number, comments?: string) => {
    setFormData(prev => {
      const responses = [...prev.responses];
      const existingIndex = responses.findIndex(r => r.criteria_id === criteriaId);
      
      if (existingIndex >= 0) {
        responses[existingIndex] = { criteria_id: criteriaId, score, comments };
      } else {
        responses.push({ criteria_id: criteriaId, score, comments });
      }

      return { ...prev, responses };
    });
  };

  return (
    <Card>
      <CardBody className="gap-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de Evaluación"
              placeholder="Selecciona el tipo"
              value={formData.type_id}
              onChange={(e) => setFormData(prev => ({ ...prev, type_id: e.target.value }))}
              startContent={<AlertCircle className="text-default-400" size={20} />}
              isRequired
            >
              {evaluationTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.description}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Empleado a Evaluar"
              placeholder="Selecciona el empleado"
              value={formData.evaluatee_id}
              onChange={(e) => setFormData(prev => ({ ...prev, evaluatee_id: e.target.value }))}
              startContent={<Users className="text-default-400" size={20} />}
              isRequired
            >
              {subordinates.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.full_name}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Fecha de Inicio"
              placeholder="Selecciona la fecha de inicio"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              startContent={<Calendar className="text-default-400" size={20} />}
              isRequired
            />

            <Input
              type="date"
              label="Fecha de Finalización"
              placeholder="Selecciona la fecha de finalización"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              startContent={<Calendar className="text-default-400" size={20} />}
              isRequired
            />
          </div>

          <CriteriaSection
            criteria={criteria}
            responses={formData.responses}
            onUpdate={handleCriteriaUpdate}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              className="w-full md:w-auto"
            >
              Crear Evaluación
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default EvaluationForm;