import React from 'react';
import { ClipboardList } from 'lucide-react';

const MisEvaluaciones: React.FC = () => {
  const evaluaciones = [
    { id: 1, nombre: 'Revisión de Desempeño Q1', estado: 'Completada', puntuacion: 4.5 },
    { id: 2, nombre: 'Evaluación de Mitad de Año', estado: 'En Progreso', puntuacion: null },
    { id: 3, nombre: 'Evaluación del Proyecto X', estado: 'Pendiente', puntuacion: null },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Mis Evaluaciones 180</h3>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300">
          Ver Todas
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Nombre de la Evaluación</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Puntuación</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {evaluaciones.map((evaluacion) => (
              <tr key={evaluacion.id} className="border-b">
                <td className="px-4 py-2">{evaluacion.nombre}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    evaluacion.estado === 'Completada' ? 'bg-green-200 text-green-800' :
                    evaluacion.estado === 'En Progreso' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {evaluacion.estado}
                  </span>
                </td>
                <td className="px-4 py-2">{evaluacion.puntuacion !== null ? evaluacion.puntuacion.toFixed(1) : '-'}</td>
                <td className="px-4 py-2">
                  <button className="text-indigo-600 hover:text-indigo-800">
                    <ClipboardList size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MisEvaluaciones;