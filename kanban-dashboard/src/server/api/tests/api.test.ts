import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "~/server/api/root";
import prismaMock from "~/server/__mocks__/db";

vi.mock("../../../db"); // 1

describe("api testing", () => {
  // 2
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  const trpc = appRouter.createCaller({ prisma: prismaMock });
  describe("quarters", async () => {
    it("should return 12 quarters", async () => {
        const quarters = await trpc.quarters.all({ startYear: 2021 });
        expect(quarters.length).toEqual(12);
    })
  });
});
