import { habitEntries } from '../db/schema';

export const calculateStreaks = (entries: typeof habitEntries.$inferSelect[]) => {
  if (entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0, completionRate: 0 };
  }

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let completedCount = 0;
  let prevDate: Date | null = null;

  for (const entry of sortedEntries) {
    if (entry.completed) {
      completedCount++;
      const currentDate = new Date(entry.date);
      
      if (prevDate) {
        const dayDiff = Math.floor(
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (dayDiff === 1) {
          currentStreak++;
        } else if (dayDiff > 1) {
          currentStreak = 1; // Reset streak if gap > 1 day
        }
      } else {
        currentStreak = 1;
      }
      
      longestStreak = Math.max(longestStreak, currentStreak);
      prevDate = currentDate;
    }
  }

  const completionRate = (completedCount / entries.length) * 100;

  return { 
    currentStreak, 
    longestStreak, 
    completionRate 
  };
};
