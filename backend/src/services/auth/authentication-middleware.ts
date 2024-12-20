import { factory } from "@backend/lib/utils/factory";
import { gen } from "@backend/lib/utils/generator";
import { auth } from ".";

export const authenticationMiddleware = factory.createMiddleware(
  async (c, next) => {
    try {
      const jwt = await auth.token.loadFromCookie(c);
      if (!jwt.exp) throw new Error("No expiration date found");
      if (jwt.exp < gen.x_hours_from_now_in_sec(0.5)) {
        const newToken = await auth.token.create(jwt.payload, c);
        auth.token.saveToCookie(newToken, c);
      }
      c.set("user", jwt.payload);
    } catch (error) {
      console.info("authentication middleware error:", error);
      c.set("user", null);
    }
    await next();
  },
);
