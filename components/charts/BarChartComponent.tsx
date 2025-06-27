
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChartDataPoint } from '../../types';

interface BarChartComponentProps {
  data: BarChartDataPoint[];
  xAxisKey: string;
  barKeys: { key: string; color: string }[];
  title?: string;
  layout?: 'horizontal' | 'vertical';
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({ data, xAxisKey, barKeys, title, layout = 'vertical' }) => {
  return (
    <div className="bg-dark-card p-4 rounded-lg shadow-lg h-80">
      {title && <h3 className="text-lg font-semibold text-dark-text-primary mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout={layout}
          margin={{ top: 5, right: layout === 'vertical' ? 30 : 5, left: layout === 'vertical' ? 20 : 50, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          {layout === 'vertical' ? (
            <>
              <XAxis dataKey={xAxisKey} stroke="#D1D5DB" />
              <YAxis stroke="#D1D5DB" />
            </>
          ) : (
            <>
              <XAxis type="number" stroke="#D1D5DB" />
              <YAxis dataKey={xAxisKey} type="category" stroke="#D1D5DB" width={100} />
            </>
          )}
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }}
            itemStyle={{ color: '#F3F4F6' }}
          />
          <Legend wrapperStyle={{ color: '#D1D5DB' }}/>
          {barKeys.map(bar => (
            <Bar key={bar.key} dataKey={bar.key} fill={bar.color} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
    