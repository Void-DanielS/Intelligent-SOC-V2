import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import { NetworkFlow, Classification } from '../types';
import WarningIcon from '../components/icons/WarningIcon';

const API_URL = 'http://localhost:5000/api/traffic';

const ClassificationAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<NetworkFlow[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        // Filtrar solo los flujos clasificados como 'Maligno'
        const malicious = data
          .filter((d: any) => d.clasificacion === 'Maligno')
          .map((d: any) => ({
            id: crypto.randomUUID(),
            timestamp: d.timestamp,
            sourceIp: d.ip_origen,
            destinationIp: d.ip_destino,
            protocol: d.protocolo,
            modelUsed: d.modelo,
            classification: Classification.MALIGNANT,
          } as NetworkFlow));
        // Ordenar por timestamp descendente
        malicious.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAlerts(malicious);
      } catch (error) {
        console.error('❌ Error al obtener alertas:', error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000); // Actualiza cada 5s
    return () => clearInterval(interval);
  }, []);

  const alertColumns = [
    { header: 'Hora de Detección', accessor: 'timestamp' as keyof NetworkFlow, className: 'text-xs' },
    { header: 'IP Origen', accessor: 'sourceIp' as keyof NetworkFlow },
    { header: 'IP Destino', accessor: 'destinationIp' as keyof NetworkFlow },
    { header: 'Protocolo', accessor: 'protocol' as keyof NetworkFlow },
    {
      header: 'Severidad',
      accessor: () => (
        <span className="flex items-center text-red-400 font-semibold">
          <WarningIcon className="w-4 h-4 mr-1" />
          Alta
        </span>
      )
    },
    { header: 'Modelo', accessor: 'modelUsed' as keyof NetworkFlow },
    {
      header: 'Acciones',
      accessor: () => (
        <button className="text-accent hover:underline text-xs">
          Investigar
        </button>
      )
    }
  ];

  const getRowClassName = (): string =>
    'hover:bg-red-800 hover:bg-opacity-40';

  return (
    <div className="space-y-6">
      <Card title="Clasificación y Alertas de Seguridad">
        <p className="text-dark-text-secondary mb-4">
          Esta sección muestra los flujos de red clasificados como malignos.
          Aquí puedes revisar cada alerta para investigación.
        </p>
        <Table
          columns={alertColumns}
          data={alerts}
          getRowClassName={getRowClassName}
        />
      </Card>

      <Card title="Resumen de Alertas">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-3xl font-bold text-red-500">
              {alerts.length}
            </p>
            <p className="text-dark-text-secondary">Alertas Totales</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-yellow-500">
              {alerts.filter(a => a.protocol === 'TCP').length}
            </p>
            <p className="text-dark-text-secondary">Alertas TCP</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-orange-500">
              {alerts.filter(a =>
                new Date(a.timestamp).getTime() > Date.now() - 1000 * 60 * 60
              ).length}
            </p>
            <p className="text-dark-text-secondary">Alertas (Última Hora)</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClassificationAlertsPage;
