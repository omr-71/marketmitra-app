import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { deliverySchema, type DispatchData } from "./notification-delivery-policy";
import type { NotificationDiagnosticCode } from "./notification.server";

export { deliverySchema };
export type { DispatchData, NotificationDiagnosticCode };

export const dispatchVerifiedNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(deliverySchema)
  .handler(async ({ data, context }) => {
    const { dispatchNotification } = await import("./notification.server");
    return dispatchNotification(data, context.userId);
  });

export const sendAdminFcmTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({}))
  .handler(async ({ context }) => {
    const { sendAdminFcmTestHandler } = await import("./notification.server");
    return sendAdminFcmTestHandler(context.userId);
  });

export const sendUserPriceAlertTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      crop: z.string().optional(),
      mandi: z.string().optional(),
      priceChangePercent: z.number().optional(),
      currentPrice: z.number().optional(),
      previousPrice: z.number().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { sendUserPriceAlertTestHandler } = await import("./notification.server");
    return sendUserPriceAlertTestHandler(context.userId, data);
  });
