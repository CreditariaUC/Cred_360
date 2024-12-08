import React from 'react';
import EvaluationForm from './Evaluations/EvaluationForm';

const IniciarEvaluacion: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Iniciar Nueva Evaluación</h2>
      </div>
      <EvaluationForm />
    </div>
  );
};

export default IniciarEvaluacion;