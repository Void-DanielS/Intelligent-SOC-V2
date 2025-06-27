import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';

interface Incident {
  id: string;
  date: string;
  type: string;
  severity: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  status: 'Abierto' | 'En Investigación' | 'Resuelto' | 'Cerrado';
  description: string;
  assignedTo?: string;
}

const API_URL = 'http://localhost:5000/api/traffic';

const IncidentHistoryPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        // Mapear cada flujo a un "incidente"
        const mapped: Incident[] = data.map((d: any) => ({
          id: crypto.randomUUID(),
          date: d.timestamp,
          type: `${d.protocolo} ${d.clasificacion === 'Maligno' ? 'alerta' : 'flujo'}`,
          severity:
            d.clasificacion === 'Maligno' ? 'Alta' : // malignos = Alta
            'Baja',                                    // benignos = Baja
          status: 'Resuelto',                         // por defecto
          description: `Tráfico ${d.clasificacion.toLowerCase()} de ${d.ip_origen} a ${d.ip_destino}`,
          assignedTo: 'Equipo SOC'
        }));
        // Ordenar de más reciente a más antiguo
        mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setIncidents(mapped);
      } catch (error) {
        console.error('❌ Error al obtener historial de incidentes:', error);
      }
    };

    fetchIncidents();
    // Opcional: refrescar cada X segundos
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const columns = [
    { header: 'ID Incidente', accessor: 'id' as keyof Incident, className: 'font-medium' },
    { header: 'Fecha', accessor: 'date' as keyof Incident },
    { header: 'Tipo de Incidente', accessor: 'type' as keyof Incident },
    { 
      header: 'Severidad', 
      accessor: (item: Incident) => {
        let color = '';
        if (item.severity === 'Crítica') color = 'text-red-500 font-bold';
        else if (item.severity === 'Alta') color = 'text-red-400';
        else if (item.severity === 'Media') color = 'text-yellow-400';
        else color = 'text-green-400';
        return <span className={color}>{item.severity}</span>;
      } 
    },
    { 
      header: 'Estado', 
      accessor: (item: Incident) => {
        let bgColor = '';
        if (item.status === 'Abierto') bgColor = 'bg-red-600';
        else if (item.status === 'En Investigación') bgColor = 'bg-yellow-600';
        else if (item.status === 'Resuelto') bgColor = 'bg-blue-600';
        else bgColor = 'bg-green-600';
        return <span className={`px-2 py-1 text-xs rounded-full text-white ${bgColor}`}>{item.status}</span>;
      } 
    },
    { header: 'Asignado A', accessor: 'assignedTo' as keyof Incident },
    { header: 'Descripción Corta', accessor: 'description' as keyof Incident, className: 'text-xs max-w-xs truncate' },
  ];

  return (
    <div className="space-y-6">
      <Card title="Historial de Incidentes de Seguridad">
        <p className="text-dark-text-secondary mb-4">
          Revise los incidentes (flujos clasificados) recibidos y procesados por el SOC.
        </p>
        <Table columns={columns} data={incidents} />
      </Card>
      <Card title="Análisis de Incidentes">
        <p className="text-dark-text-secondary">
          Funcionalidad futura: gráficos de tipos de incidencia, tiempos de respuesta, etc.
        </p>
      </Card>
    </div>
  );
};

export default IncidentHistoryPage;
