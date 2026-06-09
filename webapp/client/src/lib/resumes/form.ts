import type { ResumeUpdate } from "@/types/supabase";

const GENDER_VALUES = ["Male", "Female", "Other", "Prefer not to say"] as const;
const TRAINING_VALUES = ["yes", "no", "try"] as const;
const JOINING_VALUES = ["immediate", "specific"] as const;
const WORK_TYPE_VALUES = ["full", "part", "contract"] as const;
const BUSINESS_TYPE_VALUES = ["any", "new", "old"] as const;

type AllowedValue = readonly string[];

const genderAliases: Record<string, (typeof GENDER_VALUES)[number]> = {
  male: "Male",
  m: "Male",
  female: "Female",
  f: "Female",
  other: "Other",
  others: "Other",
  "prefer not to say": "Prefer not to say",
  "prefer-not-to-say": "Prefer not to say",
  "prefer_not_to_say": "Prefer not to say",
};

function emptyToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

function normalizeEnum<T extends AllowedValue>(
  value: unknown,
  allowed: T
): T[number] | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return allowed.includes(normalized) ? normalized : null;
}

export function normalizeGender(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  if (GENDER_VALUES.includes(normalized as (typeof GENDER_VALUES)[number])) {
    return normalized as (typeof GENDER_VALUES)[number];
  }
  return genderAliases[normalized.toLowerCase()] ?? null;
}

export function normalizeResumeUpdateInput(input: Record<string, unknown>): ResumeUpdate {
  const updates: ResumeUpdate = {};

  const textFields = [
    "name",
    "phone",
    "user_location",
    "age_range",
    "city",
    "user_state",
    "pin_code",
    "experiences",
    "profession",
    "job_role",
    "education",
    "cuisines",
    "languages",
    "certifications",
    "current_ctc",
    "expected_ctc",
    "notice_period",
    "preferred_location",
    "linkedin_profile",
    "portfolio_website",
    "bio",
    "passport",
    "photo",
    "resume_file",
    "verified",
  ] as const;

  for (const field of textFields) {
    if (input[field] !== undefined) {
      (updates as Record<string, unknown>)[field] = emptyToNull(input[field]);
    }
  }

  if (input.experience_years !== undefined) {
    const parsed =
      typeof input.experience_years === "number"
        ? input.experience_years
        : Number(input.experience_years);
    updates.experience_years = Number.isFinite(parsed) ? parsed : null;
  }

  if (input.gender !== undefined) {
    updates.gender = normalizeGender(input.gender);
  }
  if (input.training !== undefined) {
    updates.training = normalizeEnum(input.training, TRAINING_VALUES);
  }
  if (input.joining !== undefined) {
    updates.joining = normalizeEnum(input.joining, JOINING_VALUES);
  }
  if (input.work_type !== undefined) {
    updates.work_type = normalizeEnum(input.work_type, WORK_TYPE_VALUES);
  }
  if (input.business_type !== undefined) {
    updates.business_type = normalizeEnum(input.business_type, BUSINESS_TYPE_VALUES);
  }

  return updates;
}
