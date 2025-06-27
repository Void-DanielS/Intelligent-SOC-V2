// src/pages/HomePage.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';

import Card from '../components/ui/Card';
import LineChartComponent, { ChartDataPoint } from '../components/charts/LineChartComponent';
import PieChartComponent, { PieChartDataPoint } from '../components/charts/PieChartComponent';
import { NetworkFlow, Classification } from '../types';

const API_BASE        = 'http://localhost:5000/api';
const API_TRAFFIC     = `${API_BASE}/traffic`;
const API_BLOCK_IP    = `${API_BASE}/actions/block-ip`;
const API_UNBLOCK_IP  = `${API_BASE}/actions/unblock-ip`;
const API_BLOCK_PT    = `${API_BASE}/actions/block-port`;
const API_UNBLOCK_PT  = `${API_BASE}/actions/unblock-port`;
const API_GET_BLOCKED_IP = `${API_BASE}/actions/blocked-ips`;
const API_GET_BLOCKED_PT = `${API_BASE}/actions/blocked-ports`;

const POLL_INTERVAL = 4000;     // 4s
const WINDOW_MIN    = 60;       // 60m
const MS_PER_MIN    = 60 * 1000;

const HomePage: React.FC = () => {
  const [trafficData, setTrafficData]     = useState<NetworkFlow[]>([]);
  const [blockedIPs, setBlockedIPs]       = useState<string[]>([]);
  const [blockedPTs, setBlockedPTs]       = useState<number[]>([]);
  const [selectedIP, setSelectedIP]       = useState<string>('');
  const [selectedPT, setSelectedPT]       = useState<number | ''>('');
  const [ipMetrics, setIpMetrics]         = useState({
    total: 0,
    benign: 0,
    malignant: 0,
    avgPackets: 0,
    avgBytes: 0
  });

  // 1) Poll tráfico cada 4s
  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    const fetchTraffic = async () => {
      try {
        const { data } = await axios.get(API_TRAFFIC);
        const flows: NetworkFlow[] = (data as any[]).map((f, i) => ({
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
      } catch (err) {
        console.error('Error fetching traffic:', err);
      }
    };
    fetchTraffic();
    iv = setInterval(fetchTraffic, POLL_INTERVAL);
    return () => clearInterval(iv);
  }, []);

  // 2) Poll listas de bloqueos
  const fetchBlockedLists = useCallback(async () => {
    try {
      const [ipsRes, ptsRes] = await Promise.all([
        axios.get<string[]>(API_GET_BLOCKED_IP),
        axios.get<number[]>(API_GET_BLOCKED_PT)
      ]);
      setBlockedIPs(ipsRes.data);
      setBlockedPTs(ptsRes.data);
    } catch (err) {
      console.error('Error fetching blocked lists:', err);
    }
  }, []);
  useEffect(() => {
    fetchBlockedLists();
  }, [fetchBlockedLists]);

  // 3) Tendencia (última hora)
  const alertTrendData = useMemo<ChartDataPoint[]>(() => {
    const now = Date.now();
    const bins: Record<number, number> = {};
    for (let i = 0; i < WINDOW_MIN; i++) {
      const t = now - (WINDOW_MIN - 1 - i) * MS_PER_MIN;
      bins[Math.floor(t / MS_PER_MIN) * MS_PER_MIN] = 0;
    }
    trafficData.forEach(f => {
      if (f.classification === Classification.MALIGNANT) {
        const ts = new Date(f.timestamp).getTime();
        const key = Math.floor(ts / MS_PER_MIN) * MS_PER_MIN;
        if (bins[key] !== undefined) bins[key]++;
      }
    });
    return Object.entries(bins).map(([k, v]) => ({
      time: new Date(+k).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: v
    }));
  }, [trafficData]);

  // 4) Distribución flujos
  const flowDistData = useMemo<PieChartDataPoint[]>(() => {
    const benign    = trafficData.filter(f => f.classification === Classification.BENIGN).length;
    const malignant = trafficData.length - benign;
    return [
      { name: 'Benigno', value: benign },
      { name: 'Maligno', value: malignant }
    ];
  }, [trafficData]);

  // 5) Métricas IP seleccionada
  useEffect(() => {
    if (!selectedIP) return;
    const flows = trafficData.filter(f => f.sourceIp === selectedIP);
    const total = flows.length;
    const benign = flows.filter(f => f.classification === Classification.BENIGN).length;
    const malig = total - benign;
    const avgP = total ? flows.reduce((s, f) => s + f.packets, 0) / total : 0;
    const avgB = total ? flows.reduce((s, f) => s + f.bytes, 0) / total : 0;
    setIpMetrics({ total, benign, malignant: malig, avgPackets: avgP, avgBytes: avgB });
  }, [selectedIP, trafficData]);

  // 6) Acción POST genérica
  const postAction = async (url: string, payload: any) => {
    try {
      await axios.post(url, payload);
      await fetchBlockedLists();
    } catch {
      alert('Error en la acción');
    }
  };

  // 7) IPs ordenadas por flujos malignos
  const sortedSourceIPs = useMemo(() => {
    const malCount: Record<string, number> = {};
    trafficData.forEach(f => {
      if (f.classification === Classification.MALIGNANT) {
        malCount[f.sourceIp] = (malCount[f.sourceIp] || 0) + 1;
      }
    });
    const uniqIPs = Array.from(new Set(trafficData.map(f => f.sourceIp)));
    return uniqIPs.sort((a, b) => (malCount[b] || 0) - (malCount[a] || 0));
  }, [trafficData]);

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <Card title="Bienvenido al SOC Inteligente">
        <p className="text-dark-text-secondary">
          Monitorea tu red en tiempo real con sofisticados modelos de Machine Learning.
          Aquí podrás visualizar tendencias de alertas, distribuciones de flujos
          y gestionar bloqueos de IPs y puertos.
        </p>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tendencia de Alertas (Última Hora)">
          <LineChartComponent
            data={alertTrendData}
            xAxisKey="time"
            dataKey="value"
            lineColor="#EF4444"
            domain={[0, 'auto']}
          />
        </Card>
        <Card title="Distribución de Flujos">
          <PieChartComponent
            data={flowDistData}
            colors={['#22C55E', '#EF4444']}
            isDonut
            innerRadiusPct={50}
            outerRadiusPct={70}
          />
        </Card>
      </div>

      {/* Bloquear / Desbloquear IP */}
      <Card title="Bloquear / Desbloquear IP">
        <div className="flex items-center space-x-4">
          <select
            className="bg-dark-bg border border-gray-700 rounded px-3 py-2 text-sm"
            value={selectedIP}
            onChange={e => setSelectedIP(e.target.value)}
          >
            <option value="">-- elige IP --</option>
            {sortedSourceIPs.map(ip => {
              const count = trafficData.filter(
                f => f.sourceIp === ip && f.classification === Classification.MALIGNANT
              ).length;
              return (
                <option
                  key={ip}
                  value={ip}
                  style={count > 0 ? { color: 'red' } : undefined}
                >
                  {ip} {count > 0 ? `(${count})` : ''}
                  {blockedIPs.includes(ip) ? ' 🔒' : ''}
                </option>
              );
            })}
          </select>
          <button
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
            disabled={!selectedIP}
            onClick={() => postAction(API_BLOCK_IP, { ip: selectedIP })}
          >
            Bloquear IP
          </button>
          <button
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
            disabled={!blockedIPs.includes(selectedIP)}
            onClick={() => postAction(API_UNBLOCK_IP, { ip: selectedIP })}
          >
            Desbloquear IP
          </button>
        </div>
      </Card>

      {/* Bloquear / Desbloquear Puerto */}
      <Card title="Bloquear / Desbloquear Puerto">
        <div className="flex items-center space-x-4">
          <select
            className="bg-dark-bg border border-gray-700 rounded px-3 py-2 text-sm"
            value={selectedPT}
            onChange={e => setSelectedPT(e.target.value ? +e.target.value : '')}
          >
            <option value="">-- elige Puerto --</option>
            {blockedPTs.map(pt => (
              <option key={pt} value={pt}>
                {pt} 🔒
              </option>
            ))}
            {Array.from(new Set(trafficData.map(f => f.sourcePort)))
              .filter(pt => !blockedPTs.includes(pt))
              .map(pt => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
          </select>
          <button
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
            disabled={selectedPT === '' || blockedPTs.includes(+selectedPT!)}
            onClick={() => postAction(API_BLOCK_PT, { port: selectedPT })}
          >
            Bloquear Puerto
          </button>
          <button
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
            disabled={!blockedPTs.includes(+selectedPT!)}
            onClick={() => postAction(API_UNBLOCK_PT, { port: selectedPT })}
          >
            Desbloquear Puerto
          </button>
        </div>
      </Card>

      {/* Detalles de la IP Seleccionada */}
      {selectedIP && (
        <Card title={`Detalles de ${selectedIP}`}>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Total flujos:</strong> {ipMetrics.total}</li>
            <li><strong>Flujos benignos:</strong> {ipMetrics.benign}</li>
            <li><strong>Flujos malignos:</strong> {ipMetrics.malignant}</li>
            <li><strong>Promedio paquetes:</strong> {ipMetrics.avgPackets.toFixed(2)}</li>
            <li><strong>Promedio bytes:</strong> {ipMetrics.avgBytes.toFixed(2)}</li>
          </ul>
        </Card>
      )}
    </div>
  );
};

export default HomePage;
