import { createMiddleware } from "hono/factory";
import { db } from "../lib/db.js";

export type AuthVariables = {
  userId: string;
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const userId = c.req.header("x-user-id");

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }

    c.set("userId", userId);
    await next();
  }
);