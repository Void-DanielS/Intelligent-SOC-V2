import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';

interface PieChartDataPoint {
  name: string;
  value: number;
}

interface PieChartComponentProps {
  data: PieChartDataPoint[];
  colors: string[];
  title?: string;
  isDonut?: boolean;
  dataKey?: string; // default to 'value'
  innerRadiusPct?: number; // for donut
  outerRadiusPct?: number; // for donut
}

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize="14">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#ccc">{`Value ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


const PieChartComponent: React.FC<PieChartComponentProps> = ({
  data,
  colors,
  title,
  isDonut = false,
  dataKey = 'value',
  innerRadiusPct = 60,
  outerRadiusPct = 80
}) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const onPieEnter = React.useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, [setActiveIndex]);


  return (
    <div className="bg-dark-card p-4 rounded-lg shadow-lg h-96"> {/* Increased height for better legend/tooltip space */}
      {title && <h3 className="text-lg font-semibold text-dark-text-primary mb-2 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            activeIndex={isDonut ? activeIndex : undefined}
            activeShape={isDonut ? renderActiveShape : undefined}
            data={data}
            cx="50%"
            cy="50%"
            labelLine={!isDonut}
            label={!isDonut ? ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)` : undefined}
            innerRadius={isDonut ? `${innerRadiusPct}%` : 0}
            outerRadius={`${outerRadiusPct}%`}
            fill="#8884d8"
            dataKey={dataKey}
            onMouseEnter={isDonut ? onPieEnter : undefined}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }}
            itemStyle={{ color: '#F3F4F6' }}
          />
          <Legend wrapperStyle={{ color: '#D1D5DB', paddingTop: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
