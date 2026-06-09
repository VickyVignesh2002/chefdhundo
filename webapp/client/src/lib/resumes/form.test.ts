import { describe, expect, it } from "vitest";
import { normalizeGender, normalizeResumeUpdateInput } from "./form";

describe("normalizeGender", () => {
  it("normalizes legacy and lowercase gender values to database-safe values", () => {
    expect(normalizeGender("male")).toBe("Male");
    expect(normalizeGender(" FEMALE ")).toBe("Female");
    expect(normalizeGender("others")).toBe("Other");
    expect(normalizeGender("prefer_not_to_say")).toBe("Prefer not to say");
  });

  it("returns null for blank or unsupported gender values", () => {
    expect(normalizeGender("")).toBeNull();
    expect(normalizeGender("unknown")).toBeNull();
    expect(normalizeGender(null)).toBeNull();
  });
});

describe("normalizeResumeUpdateInput", () => {
  it("keeps free-text city updates while sanitizing constrained fields", () => {
    expect(
      normalizeResumeUpdateInput({
        city: "Chennai, Anna Nagar",
        gender: "male",
        training: "yes",
        joining: "immediate",
        work_type: "full",
        business_type: "any",
      })
    ).toMatchObject({
      city: "Chennai, Anna Nagar",
      gender: "Male",
      training: "yes",
      joining: "immediate",
      work_type: "full",
      business_type: "any",
    });
  });

  it("removes unsupported enum values before they reach Supabase constraints", () => {
    expect(
      normalizeResumeUpdateInput({
        gender: "not-valid",
        training: "later",
        joining: "",
        work_type: "freelance",
        business_type: "legacy",
      })
    ).toMatchObject({
      gender: null,
      training: null,
      joining: null,
      work_type: null,
      business_type: null,
    });
  });
});

