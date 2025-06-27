import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import BarChartComponent from '../components/charts/BarChartComponent';
import { ModelMetric } from '../types';

const API_URL_METRICS = 'http://localhost:5000/api/metrics';

const ModelMetricsPage: React.FC = () => {
  const [modelMetrics, setModelMetrics] = useState<ModelMetric[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(API_URL_METRICS);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ModelMetric[] = await response.json();
        setModelMetrics(data);
      } catch (error) {
        console.error('❌ Error al obtener métricas:', error);
      }
    };
    fetchMetrics();
  }, []);

  const columns = [
    { header: 'Nombre del Modelo', accessor: 'modelName' as keyof ModelMetric, className: 'font-semibold' },
    { header: 'Accuracy', accessor: 'accuracy' as keyof ModelMetric },
    { header: 'Precision', accessor: 'precision' as keyof ModelMetric },
    { header: 'Recall', accessor: 'recall' as keyof ModelMetric },
    { header: 'F1-Score', accessor: 'f1Score' as keyof ModelMetric },
  ];
  
  const chartData = useMemo(() => modelMetrics.map(metric => ({
    name: metric.modelName,
    Accuracy: metric.accuracy,
    Precision: metric.precision,
    Recall: metric.recall,
    F1Score: metric.f1Score,
  })), [modelMetrics]);

  const f1ScoreBarKeys = useMemo(() => [{ key: 'F1Score', color: '#8884d8' }], []);
  const accuracyBarKeys = useMemo(() => [{ key: 'Accuracy', color: '#82ca9d' }], []);

  return (
    <div className="space-y-6">
      <Card title="Métricas de Rendimiento de Modelos de ML">
        <p className="text-dark-text-secondary mb-4">
          Evalúe el rendimiento de los diferentes modelos de Machine Learning utilizados para la clasificación de tráfico.
          Las métricas incluyen Accuracy, Precision, Recall y F1-Score.
        </p>
        <Table columns={columns} data={modelMetrics} />
      </Card>
      
      <Card title="Comparación Visual de Métricas (F1-Score)">
         <BarChartComponent
            data={chartData}
            xAxisKey="name"
            barKeys={f1ScoreBarKeys}
            title="F1-Score por Modelo"
         />
      </Card>

      <Card title="Comparación Visual de Métricas (Accuracy)">
         <BarChartComponent
            data={chartData}
            xAxisKey="name"
            barKeys={accuracyBarKeys}
            title="Accuracy por Modelo"
         />
      </Card>
      
      <Card title="Interpretación de Métricas">
        <ul className="list-disc list-inside text-dark-text-secondary space-y-1 text-sm">
            <li><strong>Accuracy:</strong> Proporción de predicciones correctas sobre el total.</li>
            <li><strong>Precision:</strong> De todas las predicciones positivas, cuántas fueron correctas. Importante para minimizar falsos positivos.</li>
            <li><strong>Recall (Sensibilidad):</strong> De todos los casos positivos reales, cuántos fueron identificados correctamente. Importante para minimizar falsos negativos.</li>
            <li><strong>F1-Score:</strong> Media armónica de Precision y Recall. Útil para un balance entre ambas.</li>
        </ul>
      </Card>
    </div>
  );
};

export default ModelMetricsPage;
