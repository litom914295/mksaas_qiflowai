import { getDb } from '@/db';
import { taskProgress } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

/**
 * Increment a user's task progress by 1 (or a specific delta) up to target.
 * Creates the row if it does not exist.
 */
export async function incrementTaskProgress(params: {
  userId: string;
  taskId: string;
  target?: number; // default 3
  delta?: number; // default 1
}) {
  const { userId, taskId } = params;
  const target = params.target ?? 3;
  const delta = params.delta ?? 1;

  const db = await getDb();
  // Try read existing row
  const existing = await db
    .select({ id: taskProgress.id, progress: taskProgress.progress, target: taskProgress.target })
    .from(taskProgress)
    .where(and(eq(taskProgress.userId, userId), eq(taskProgress.taskId, taskId)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(taskProgress).values({
      userId,
      taskId,
      taskType: 'activation',
      progress: Math.min(delta, target),
      target,
      completed: delta >= target,
      rewardClaimed: false,
      updatedAt: new Date(),
    });
    return { progress: Math.min(delta, target), target };
  }

  const cur = existing[0];
  const nextProgress = Math.min((cur.progress ?? 0) + delta, cur.target ?? target);
  await db
    .update(taskProgress)
    .set({ progress: nextProgress, completed: nextProgress >= (cur.target ?? target), updatedAt: new Date() })
    .where(eq(taskProgress.id, cur.id));
  return { progress: nextProgress, target: cur.target ?? target };
}