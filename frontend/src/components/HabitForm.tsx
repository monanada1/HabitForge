import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const habitFormSchema = z.object({
  name: z.string().min(1, 'Habit name is required'),
});

export function HabitForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof habitFormSchema>>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const { mutate: createHabit, isPending } = useMutation({
    mutationFn: (values: z.infer<typeof habitFormSchema>) => 
      api.post('/habits', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      form.reset();
      onSuccess?.();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => createHabit(values))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Habit Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Drink water" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" loading={isPending}>
          Add Habit
        </Button>
      </form>
    </Form>
  );
}
