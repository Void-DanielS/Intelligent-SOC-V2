import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Table from '../components/ui/Table';
import Card from '../components/ui/Card';
import LineChartComponent from '../components/charts/LineChartComponent';
import BarChartComponent from '../components/charts/BarChartComponent';
import PieChartComponent from '../components/charts/PieChartComponent';
import WarningIcon from '../components/icons/WarningIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';

import { NetworkFlow, Classification, ChartDataPoint, BarChartDataPoint } from '../types';

const API_TRAFFIC      = 'http://localhost:5000/api/traffic';
const MAX_TABLE_ROWS   = 20;
const MAX_CHART_POINTS = 30;

const LiveTrafficPage: React.FC = () => {
  const [trafficData, setTrafficData]   = useState<NetworkFlow[]>([]);

  // --- Estados de los Gráficos ---
  const [ppsData, setPpsData]           = useState<ChartDataPoint[]>([]);
  const [bpsData, setBpsData]           = useState<ChartDataPoint[]>([]); // NUEVO: Bytes por segundo
  const [flowCounts, setFlowCounts]     = useState<{ name: string; value: number }[]>([]);
  const [protocolDist, setProtocolDist] = useState<{ name: string; value: number }[]>([]); // NUEVO: Distribución de protocolos
  const [topSourceIPs, setTopSourceIPs] = useState<BarChartDataPoint[]>([]);
  const [topDestIPs, setTopDestIPs]     = useState<BarChartDataPoint[]>([]); // NUEVO: Top IPs de destino
  const [topMalignantIPs, setTopMalignantIPs] = useState<BarChartDataPoint[]>([]); // NUEVO: Top IPs de origen maligno

  // ── Polling cada 2s ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const { data } = await axios.get(API_TRAFFIC);
        const flows: NetworkFlow[] = (data as any[])
          .slice(-MAX_TABLE_ROWS)
          .reverse()
          .map((f, i) => ({
            id:              `flow-${i}-${f.timestamp}`,
            timestamp:       f.timestamp,
            sourceIp:        f.ip_origen,
            destinationIp:   f.ip_destino,
            sourcePort:      f.puerto_origen,
            destinationPort: f.puerto_destino,
            protocol:        f.protocolo,
            packets:         f.packets,
            bytes:           f.bytes,
            duration:        f.duration ?? 0,
            classification:  f.clasificacion === 'Maligno'
                                ? Classification.MALIGNANT
                                : Classification.BENIGN,
            modelUsed:       f.modelo
          }));
        setTrafficData(flows);

        // Actualizar datos de series temporales (PPS y BPS)
        if (flows.length > 0) {
          const latestFlow = flows[0];
          const now = new Date(latestFlow.timestamp).toLocaleTimeString();

          // PPS
          setPpsData(prev => [
            ...prev.slice(-MAX_CHART_POINTS + 1),
            { time: now, value: latestFlow.packets }
          ]);
          // NUEVO: BPS
          setBpsData(prev => [
            ...prev.slice(-MAX_CHART_POINTS + 1),
            { time: now, value: latestFlow.bytes }
          ]);
        }
      } catch (err) {
        console.error('Error fetching traffic:', err);
      }
    };

    fetchTraffic();
    const interval = setInterval(fetchTraffic, 2000);
    return () => clearInterval(interval);
  }, []);

  // ── Recalcular distribuciones y tops al cambiar trafficData ──────────────────
  useEffect(() => {
    if (trafficData.length === 0) return;

    // Donut: Benigno vs Maligno
    const benignCount    = trafficData.filter(f => f.classification === Classification.BENIGN).length;
    const malignantCount = trafficData.length - benignCount;
    setFlowCounts([
      { name: 'Benigno', value: benignCount },
      { name: 'Maligno', value: malignantCount }
    ]);

    // NUEVO: Pie Chart - Distribución por Protocolo
    const protocolFreq: Record<string, number> = {};
    trafficData.forEach(f => {
      protocolFreq[f.protocol] = (protocolFreq[f.protocol] || 0) + 1;
    });
    setProtocolDist(Object.entries(protocolFreq).map(([name, value]) => ({ name, value })));


    // Función auxiliar para calcular tops
    const getTopN = (data: NetworkFlow[], key: keyof NetworkFlow, n: number): BarChartDataPoint[] => {
      const freq: Record<string, number> = {};
      data.forEach(item => {
        const value = item[key] as string;
        freq[value] = (freq[value] || 0) + 1;
      });
      return Object.entries(freq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, n)
        .map(([name, value]) => ({ name, value }));
    };

    // Top 5 IPs de Origen
    setTopSourceIPs(getTopN(trafficData, 'sourceIp', 5));

    // NUEVO: Top 5 IPs de Destino
    setTopDestIPs(getTopN(trafficData, 'destinationIp', 5));

    // NUEVO: Top 5 IPs de Origen Maligno
    const malignantFlows = trafficData.filter(f => f.classification === Classification.MALIGNANT);
    setTopMalignantIPs(getTopN(malignantFlows, 'sourceIp', 5));

  }, [trafficData]);

  // ── Columnas de la tabla ───────────────────────────────────────────────────────
  const tableColumns = [
    { header: 'Hora',        accessor: 'timestamp' as const },
    { header: 'IP Origen',   accessor: 'sourceIp' as const },
    { header: 'IP Destino',  accessor: 'destinationIp' as const },
    { header: 'P. Origen',   accessor: 'sourcePort' as const },
    { header: 'P. Destino',  accessor: 'destinationPort' as const },
    { header: 'Protocolo',   accessor: 'protocol' as const },
    { header: 'Paquetes',    accessor: 'packets' as const },
    {
      header: 'Clasificación',
      accessor: item => (
        <span className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
          item.classification === Classification.MALIGNANT
            ? 'text-red-400'
            : 'text-green-400'
        }`}>
          {item.classification === Classification.MALIGNANT
            ? <WarningIcon className="w-4 h-4 mr-1 text-red-500"/>
            : <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500"/>}
          {item.classification}
        </span>
      )
    },
    { header: 'Modelo', accessor: 'modelUsed' as const }
  ];

// ... (todo el código anterior, desde los imports hasta antes del return, se mantiene igual)

  return (
    <div className="space-y-6">
      {/* Tabla de flujos */}
      <Card title="Flujos de Red en Tiempo Real">
        <Table columns={tableColumns} data={trafficData} />
        <p className="text-xs text-gray-500 mt-2">
          Mostrando últimos {trafficData.length} flujos. Actualizado cada 2 seg.
        </p>
      </Card>

      {/* Gráficas de Series Temporales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartComponent
          data={ppsData}
          xAxisKey="time"
          dataKey="value"
          lineColor="#82ca9d"
          title="Paquetes por Segundo (PPS)"
        />
        <LineChartComponent
          data={bpsData}
          xAxisKey="time"
          dataKey="value"
          lineColor="#8884d8"
          title="Bytes por Segundo (BPS)"
        />
      </div>

      {/* Gráficas de Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartComponent
          data={flowCounts}
          colors={['#22C55E', '#EF4444']}
          title="Distribución de Flujos (Benigno vs Maligno)"
          isDonut
          innerRadiusPct={50}
          outerRadiusPct={70}
        />
        <PieChartComponent
          data={protocolDist}
          colors={['#3B82F6', '#F97316', '#8B5CF6', '#FBBF24']}
          title="Distribución por Protocolo"
        />
      </div>

      {/* Gráficas de Top N - CORREGIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top 5 IPs de Origen (Frecuencia)">
          <BarChartComponent
            data={topSourceIPs}
            layout="horizontal" // <-- CORREGIDO
            xAxisKey="name"      // <-- CORREGIDO (IPs en el eje X)
            yAxisKey="value"     // <-- CORREGIDO (Frecuencia en el eje Y)
            barKeys={[{ key: 'value', color: '#3B82F6' }]}
            title=""
          />
        </Card>
        <Card title="Top 5 IPs de Destino (Frecuencia)">
          <BarChartComponent
            data={topDestIPs}
            layout="horizontal" // <-- CORREGIDO
            xAxisKey="name"      // <-- CORREGIDO
            yAxisKey="value"     // <-- CORREGIDO
            barKeys={[{ key: 'value', color: '#10B981' }]}
            title=""
          />
        </Card>
      </div>

      {/* Sección de Seguridad - CORREGIDO */}
      <Card title="Top 5 IPs de Origen Maligno">
        <BarChartComponent
          data={topMalignantIPs}
          layout="horizontal" // <-- CORREGIDO
          xAxisKey="name"      // <-- CORREGIDO
          yAxisKey="value"     // <-- CORREGIDO
          barKeys={[{ key: 'value', color: '#EF4444' }]}
          title=""
        />
         <p className="text-xs text-gray-500 mt-2">
          Muestra las IPs de origen más frecuentes entre los flujos clasificados como malignos.
        </p>
      </Card>
    </div>
  );
};

export default LiveTrafficPage;