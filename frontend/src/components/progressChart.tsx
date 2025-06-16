import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type ProgressChartProps = {
  data: {
    date: string;
    completed: boolean;
  }[];
  timeRange: '7d' | '30d' | '90d';
};

export function ProgressChart({ data, timeRange }: ProgressChartProps) {
  // Process data for the chart
  const chartData = data.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    completed: entry.completed ? 1 : 0,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 1]} tickCount={2} />
          <Tooltip />
          <Bar dataKey="completed" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
