import type { CapabilityContext } from "../types";

export const CONFIRMATION_UNAVAILABLE_ERROR =
  "Confirmation is required for this action, but this host cannot ask the user. " +
  'Host developers: provide a `confirm` callback in the CapabilityContext, or set `confirmPolicy: "skip"` to allow this action without confirmation.';

export type ConfirmationOutcome =
  | { status: "confirmed" }
  | { status: "cancelled" }
  | { status: "unavailable"; error: string };

/**
 * Shared gate for destructive tool actions.
 *
 * - With `ctx.confirm`: asks the user; `false`/`null` means cancelled.
 * - Without `ctx.confirm` and `confirmPolicy` "require" (default): unavailable — the
 *   caller must not perform the action and should return `error` as a tool error.
 * - Without `ctx.confirm` and `confirmPolicy` "skip": proceeds without asking.
 */
export async function confirmDestructiveAction(
  ctx: CapabilityContext,
  title: string,
  description?: string,
): Promise<ConfirmationOutcome> {
  if (!ctx.confirm) {
    const policy = ctx.confirmPolicy ?? "require";
    return policy === "skip"
      ? { status: "confirmed" }
      : { status: "unavailable", error: CONFIRMATION_UNAVAILABLE_ERROR };
  }

  const confirmed = await ctx.confirm(title, description);
  return confirmed === false || confirmed === null
    ? { status: "cancelled" }
    : { status: "confirmed" };
}
