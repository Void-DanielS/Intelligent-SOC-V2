
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../../types';

interface LineChartComponentProps {
  data: ChartDataPoint[];
  xAxisKey: string;
  dataKey: string;
  lineColor?: string;
  title?: string;
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({ data, xAxisKey, dataKey, lineColor = "#8884d8", title }) => {
  return (
    <div className="bg-dark-card p-4 rounded-lg shadow-lg h-80">
       {title && <h3 className="text-lg font-semibold text-dark-text-primary mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={xAxisKey} stroke="#D1D5DB" />
          <YAxis stroke="#D1D5DB" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }}
            itemStyle={{ color: '#F3F4F6' }}
          />
          <Legend wrapperStyle={{ color: '#D1D5DB' }}/>
          <Line type="monotone" dataKey={dataKey} stroke={lineColor} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
    