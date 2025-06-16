import { Request, Response } from 'express';
import { db } from '../db';
import { habits, habitEntries } from '../db/schema';
import { and, eq, gte, lte, between } from 'drizzle-orm';
import { calculateStreaks } from '../utils/streakCalculator';

export const createHabit = async (req: Request, res: Response) => {
  const { name } = req.body;
  const userId = req.user.id;
  
  try {
    const [habit] = await db.insert(habits).values({ 
      name, 
      userId 
    }).returning();
    
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create habit' });
  }
};

export const getHabits = async (req: Request, res: Response) => {
  const userId = req.user.id;
  
  try {
    const userHabits = await db.query.habits.findMany({
      where: eq(habits.userId, userId),
      with: {
        entries: {
          where: between(habitEntries.date, 
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new Date().toISOString().split('T')[0]
          ),
        },
      },
    });
    
    // Calculate streaks for each habit
    const habitsWithStats = userHabits.map(habit => {
      const streakInfo = calculateStreaks(habit.entries);
      return {
        ...habit,
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        completionRate: streakInfo.completionRate,
      };
    });
    
    res.json(habitsWithStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
};

export const updateHabitEntry = async (req: Request, res: Response) => {
  const { habitId, date, completed } = req.body;
  const userId = req.user.id;
  
  try {
    // Verify the habit belongs to the user
    const habit = await db.query.habits.findFirst({
      where: and(
        eq(habits.id, habitId),
        eq(habits.userId, userId)
      ),
    });
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    const [entry] = await db.insert(habitEntries)
      .values({ habitId, date, completed })
      .onConflictDoUpdate({
        target: [habitEntries.habitId, habitEntries.date],
        set: { completed }
      })
      .returning();
    
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update habit entry' });
  }
};

export const getHabitStats = async (req: Request, res: Response) => {
  const { habitId } = req.params;
  const { startDate, endDate } = req.query;
  const userId = req.user.id;
  
  try {
    // Verify the habit belongs to the user
    const habit = await db.query.habits.findFirst({
      where: and(
        eq(habits.id, Number(habitId)),
        eq(habits.userId, userId)
      ),
    });
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    const entries = await db.query.habitEntries.findMany({
      where: and(
        eq(habitEntries.habitId, Number(habitId)),
        gte(habitEntries.date, startDate as string),
        lte(habitEntries.date, endDate as string)
      ),
      orderBy: (habitEntries, { asc }) => [asc(habitEntries.date)],
    });
    
    const streakInfo = calculateStreaks(entries);
    const completionRate = entries.length > 0 
      ? (entries.filter(e => e.completed).length / entries.length) * 100
      : 0;
    
    res.json({
      habit,
      entries,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      completionRate,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habit stats' });
  }
};
