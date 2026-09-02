"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { BackendError } from "@/lib/backend";
import {
  createDelivery,
  reassignDelivery,
  updateDelivery,
  deleteDelivery,
  type CreateDeliveryInput,
  type UpdateDeliveryInput,
} from "@/lib/deliveries";
import {
  createBusiness,
  updateBusiness,
  disableBusiness,
  setBusinessStatus,
  type CreateBusinessInput,
  type UpdateBusinessInput,
} from "@/lib/businesses";
import {
  syncLogisticsBusinesses,
  updateLogistics,
  disableLogistics,
  createLogistics,
  type CreateLogisticsInput,
} from "@/lib/logistics";
import {
  createRaider,
  approveRaiders,
  updateRaider,
  removeRaider,
  setRaiderActive,
  syncRaiderBusinesses,
  type CreateRaiderInput,
  type UpdateRaiderInput,
} from "@/lib/raiders";
import { setUserStatus, setUserRole } from "@/lib/users";
import { updateBusinessProfile, updateLogisticsProfile } from "@/lib/profile";
import type { UserAccount } from "@/lib/types";

export type ActionResult = { ok: true; message?: string } | { ok: false; message: string };

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Sessione scaduta, effettua di nuovo il login");
  return session;
}

function toActionResult(fn: () => Promise<unknown>): Promise<ActionResult> {
  return fn()
    .then(() => ({ ok: true as const }))
    .catch((error) => ({
      ok: false as const,
      message: error instanceof BackendError ? error.message : (error as Error).message,
    }));
}

export async function createDeliveryAction(input: CreateDeliveryInput): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await createDelivery(session.token, session.role, input);
    revalidatePath("/dashboard/deliveries");
  });
}

export async function reassignDeliveryAction(
  deliveryId: string,
  newRaiderId: string
): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await reassignDelivery(session.token, session.role, deliveryId, newRaiderId);
    revalidatePath("/dashboard/deliveries");
    revalidatePath(`/dashboard/deliveries/${deliveryId}`);
  });
}

export async function updateDeliveryAction(
  id: string,
  input: UpdateDeliveryInput
): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await updateDelivery(session.token, session.role, id, input);
    revalidatePath("/dashboard/deliveries");
    revalidatePath(`/dashboard/deliveries/${id}`);
  });
}

export async function deleteDeliveryAction(id: string): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await deleteDelivery(session.token, session.role, id);
    revalidatePath("/dashboard/deliveries");
  });
}

export async function createBusinessAction(input: CreateBusinessInput): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await createBusiness(session.token, session.role, input);
    revalidatePath("/dashboard/businesses");
  });
}

export async function updateBusinessAction(
  id: string,
  input: UpdateBusinessInput
): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await updateBusiness(session.token, session.role, id, input);
    revalidatePath("/dashboard/businesses");
  });
}

export async function disableBusinessAction(id: string): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await disableBusiness(session.token, id);
    revalidatePath("/dashboard/businesses");
  });
}

export async function setBusinessStatusAction(
  id: string,
  expired: boolean
): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await setBusinessStatus(session.token, id, expired);
    revalidatePath("/dashboard/businesses");
  });
}

export async function createLogisticsAction(input: CreateLogisticsInput): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await createLogistics(session.token, input);
    revalidatePath("/dashboard/logistics");
  });
}

export async function updateLogisticsAction(
  id: string,
  input: { name?: string; surname?: string }
): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await updateLogistics(session.token, id, input);
    revalidatePath("/dashboard/logistics");
  });
}

export async function disableLogisticsAction(id: string): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await disableLogistics(session.token, id);
    revalidatePath("/dashboard/logistics");
  });
}

export async function syncLogisticsBusinessesAction(
  logisticsId: string,
  businessIds: string[]
): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await syncLogisticsBusinesses(session.token, logisticsId, businessIds);
    revalidatePath("/dashboard/logistics");
  });
}

export async function createRaiderAction(input: CreateRaiderInput): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await createRaider(session.token, session.role, input);
    revalidatePath("/dashboard/raiders");
  });
}

export async function approveRaidersAction(raiderIds: string[]): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await approveRaiders(session.token, raiderIds);
    revalidatePath("/dashboard/raiders");
  });
}

export async function updateRaiderAction(
  id: string,
  input: UpdateRaiderInput
): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await updateRaider(session.token, session.role, id, input);
    revalidatePath("/dashboard/raiders");
  });
}

export async function removeRaiderAction(id: string): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await removeRaider(session.token, session.role, id);
    revalidatePath("/dashboard/raiders");
  });
}

export async function syncRaiderBusinessesAction(
  raiderId: string,
  businessIds: string[]
): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await syncRaiderBusinesses(session.token, raiderId, businessIds);
    revalidatePath("/dashboard/raiders");
  });
}

export async function setRaiderActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await setRaiderActive(session.token, session.role, id, isActive);
    revalidatePath("/dashboard/raiders");
  });
}

export async function setUserStatusAction(
  userId: string,
  expired: boolean
): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await setUserStatus(session.token, userId, expired);
    revalidatePath("/dashboard/users");
  });
}

export async function updateOwnBusinessProfileAction(input: {
  bussinesName?: string;
  address?: string;
  businessCord?: string;
}): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await updateBusinessProfile(session.token, input);
    revalidatePath("/dashboard/profile");
  });
}

export async function updateOwnLogisticsProfileAction(input: {
  name?: string;
  surname?: string;
}): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await updateLogisticsProfile(session.token, input);
    revalidatePath("/dashboard/profile");
  });
}

export async function setUserRoleAction(
  userId: string,
  role: UserAccount["role"]
): Promise<ActionResult> {
  const session = await requireSession();
  return toActionResult(async () => {
    await setUserRole(session.token, userId, role);
    revalidatePath("/dashboard/users");
  });
}
