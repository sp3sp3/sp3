import { it, describe, beforeEach, expect, afterAll } from 'vitest';
import { seedDb } from '../../../prisma/seed';
import { publicProcedure, router } from '../trpc';
import { appRouter } from '..';

describe('projects test', () => {
  beforeEach(async () => {
    await seedDb();
  });

  afterAll(async () => {});

  it('returns an array of projects', async () => {
    const ctx = await createContextInner({});
    appRouter.projectList;
  });
});
