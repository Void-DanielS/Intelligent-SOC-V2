
export enum Classification {
  BENIGN = 'Benigno',
  MALIGNANT = 'Maligno',
  UNKNOWN = 'Desconocido'
}

export interface NetworkFlow {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  bytes: number;
  packets: number;
  duration: number; // in seconds
  classification: Classification;
  modelUsed: string;
}

export interface ModelMetric {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface ChartDataPoint {
  time: string; // Or a more specific time/date format
  value: number;
}

export interface BarChartDataPoint {
  name: string;
  [key: string]: number | string; // For multiple bars or categories
}

export interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}
    