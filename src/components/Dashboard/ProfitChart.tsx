import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { time: '00:00', profit: 0 },
  { time: '04:00', profit: 125 },
  { time: '08:00', profit: 89 },
  { time: '12:00', profit: 234 },
  { time: '16:00', profit: 178 },
  { time: '20:00', profit: 312 },
  { time: '24:00', profit: 445 },
];

const ProfitChart: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          24h Profit Chart
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Cumulative Profit</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time" 
              className="text-gray-600 dark:text-gray-400"
              fontSize={12}
            />
            <YAxis 
              className="text-gray-600 dark:text-gray-400"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgb(31 41 55)',
                border: '1px solid rgb(75 85 99)',
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value) => [`$${value}`, 'Profit']}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitChart;