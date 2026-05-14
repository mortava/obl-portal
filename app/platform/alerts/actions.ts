"use server";

import { acknowledgeAlert as ack } from "@/lib/data/alerts";

export async function acknowledgeAlertAction(id: string): Promise<void> {
  await ack(id);
}
