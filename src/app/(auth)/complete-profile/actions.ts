"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { field, validatePhone } from "../validation";

export type CompleteProfileState = {
  formError?: string;
  fieldErrors?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    phone?: string;
  };
  // Echoed back so fields are not cleared on a failed submit.
  values?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    phone?: string;
  };
};

/** Step 2 of sign-up: name, birthday and phone, attached to the signed-in user. */
export async function completeProfile(
  _prevState: CompleteProfileState,
  formData: FormData,
): Promise<CompleteProfileState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const firstName = field(formData.get("firstName"));
  const lastName = field(formData.get("lastName"));
  const dateOfBirth = field(formData.get("dateOfBirth"));
  const phone = field(formData.get("phone"));

  const fieldErrors: NonNullable<CompleteProfileState["fieldErrors"]> = {
    firstName: firstName ? undefined : "Enter your first name.",
    lastName: lastName ? undefined : "Enter your last name.",
    dateOfBirth: dateOfBirth ? undefined : "Enter your date of birth.",
    phone: validatePhone(phone),
  };

  if (dateOfBirth && Number.isNaN(Date.parse(dateOfBirth))) {
    fieldErrors.dateOfBirth = "Enter a valid date.";
  }

  const values = { firstName, lastName, dateOfBirth, phone };

  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors, values };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      name: `${firstName} ${lastName}`,
      dateOfBirth: new Date(dateOfBirth!),
      phone,
    },
  });

  redirect("/dashboard");
}
