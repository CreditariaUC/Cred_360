import React from 'react';
import { Card, CardBody, Slider, Textarea } from '@nextui-org/react';
import type { EvaluationCriteria } from '../../types/evaluation.types';

interface CriteriaSectionProps {
  criteria: EvaluationCriteria[];
  responses: { criteria_id: string; score: number; comments?: string }[];
  onUpdate: (criteriaId: string, score: number, comments?: string) => void;
}

const CriteriaSection: React.FC<CriteriaSectionProps> = ({
  criteria,
  responses,
  onUpdate,
}) => {
  const getResponse = (criteriaId: string) => {
    return responses.find(r => r.criteria_id === criteriaId);
  };

  const criteriaByCategory = criteria.reduce((acc, curr) => {
    if (!acc[curr.category]) {
      acc[curr.category] = [];
    }
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, EvaluationCriteria[]>);

  return (
    <div className="space-y-6">
      {Object.entries(criteriaByCategory).map(([category, critList]) => (
        <Card key={category}>
          <CardBody className="gap-4">
            <h3 className="text-lg font-semibold">{category}</h3>
            <div className="space-y-6">
              {critList.map((criterion) => (
                <div key={criterion.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{criterion.name}</h4>
                      <p className="text-sm text-gray-600">{criterion.description}</p>
                    </div>
                    <span className="text-sm font-semibold">
                      {getResponse(criterion.id)?.score || 0}/5
                    </span>
                  </div>

                  <Slider
                    size="sm"
                    step={1}
                    maxValue={5}
                    minValue={0}
                    value={getResponse(criterion.id)?.score || 0}
                    onChange={(value) => onUpdate(
                      criterion.id,
                      value as number,
                      getResponse(criterion.id)?.comments
                    )}
                    className="max-w-md"
                    marks={[
                      { value: 0, label: "0" },
                      { value: 1, label: "1" },
                      { value: 2, label: "2" },
                      { value: 3, label: "3" },
                      { value: 4, label: "4" },
                      { value: 5, label: "5" }
                    ]}
                  />

                  <Textarea
                    placeholder="Comentarios adicionales (opcional)"
                    value={getResponse(criterion.id)?.comments || ''}
                    onChange={(e) => onUpdate(
                      criterion.id,
                      getResponse(criterion.id)?.score || 0,
                      e.target.value
                    )}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default CriteriaSection;