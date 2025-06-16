import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { HabitCard } from '@/components/HabitCard';
import { HabitForm } from '@/components/HabitForm';
import { ProgressChart } from '@/components/ProgressChart';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => api.get('/habits').then(res => res.data),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Habits</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Habit'}
        </Button>
      </div>
      
      {showForm && (
        <div className="mb-6">
          <HabitForm onSuccess={() => setShowForm(false)} />
        </div>
      )}
      
      <div className="grid gap-4 mt-6">
        {habits?.map((habit: any) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </div>
      
      {habits?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Progress Overview</h2>
          <ProgressChart 
            data={habits[0].entries} 
            timeRange="7d" 
          />
        </div>
      )}
    </div>
  );
}
