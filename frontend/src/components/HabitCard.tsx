import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { format } from 'date-fns';

export function HabitCard({ habit }: { habit: any }) {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEntry = habit.entries?.find((entry: any) => entry.date === today);

  const { mutate: toggleHabit } = useMutation({
    mutationFn: (completed: boolean) => 
      api.post('/habits/entries', { 
        habitId: habit.id, 
        date: today, 
        completed 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{habit.name}</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            {habit.currentStreak} day streak
          </span>
          <Checkbox
            checked={todayEntry?.completed}
            onCheckedChange={(checked) => toggleHabit(!!checked)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[80px]">
          {/* Mini progress chart would go here */}
        </div>
      </CardContent>
    </Card>
  );
}
