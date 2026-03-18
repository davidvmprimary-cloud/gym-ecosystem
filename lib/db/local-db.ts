import Dexie, { type Table } from 'dexie';

export interface PendingAction {
  id?: number;
  type: 'SYNC_NUTRITION' | 'DELETE_NUTRITION' | 'SYNC_WORKOUT' | 'SYNC_BODY_STATS' | 'SYNC_SPLIT' | 'SYNC_CATALOG' | 'SYNC_DIET';
  payload: any;
  timestamp: number;
}

export interface CachedWorkout {
  id: string; // splitId
  name: string;
  exercises: any[];
  updatedAt: number;
}

export interface CachedNutrition {
  date: string; // YYYY-MM-DD
  entries: any[];
  updatedAt: number;
}

export class GymLocalDB extends Dexie {
  pendingActions!: Table<PendingAction>;
  cachedWorkouts!: Table<CachedWorkout>;
  cachedNutrition!: Table<CachedNutrition>;

  constructor() {
    super('GymLocalDB');
    this.version(1).stores({
      pendingActions: '++id, type, timestamp',
      cachedWorkouts: 'id, updatedAt',
      cachedNutrition: 'date, updatedAt',
    });
  }
}

export const db = new GymLocalDB();
