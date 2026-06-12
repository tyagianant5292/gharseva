import { z } from "zod";
import { SERVICE_KEYS } from "./services";

const mobile = z
  .string()
  .trim()
  .regex(/^[+]?[0-9\s-]{7,15}$/, "Enter a valid mobile number");

// Optional email: empty string / undefined is allowed; if present it must be valid.
const optionalEmail = z
  .union([z.string().trim().toLowerCase().email("Invalid email"), z.literal(""), z.undefined()])
  .transform((v) => (v ? v : undefined));

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short").max(80),
    email: optionalEmail,
    mobile,
    password: z.string().min(6, "Password must be at least 6 characters").max(100),
    role: z.enum(["CUSTOMER", "PROVIDER"]),
    // Provider-only fields (required when role === PROVIDER, validated below)
    services: z.array(z.enum(SERVICE_KEYS as [string, ...string[]])).optional(),
    country: z.enum(["IN", "AE"]).optional(),
    city: z.string().trim().max(80).optional(),
    locality: z.string().trim().max(120).optional(),
    pincode: z.string().trim().optional(),
    gender: z.string().trim().optional(),
    experienceYears: z.coerce.number().int().min(0).max(60).optional(),
    expectedSalary: z.coerce.number().int().min(0).max(1_000_000).optional(),
    instantAvailable: z.coerce.boolean().optional(),
    instantRates: z.record(z.coerce.number().int().min(1).max(100_000)).optional(),
    otherService: z.string().trim().max(60).optional(),
    otherServiceDesc: z.string().trim().max(300).optional(),
    bio: z.string().trim().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "PROVIDER") {
      // At least one service — monthly (services) OR daily (instantRates).
      const hasInstant = data.instantRates && Object.keys(data.instantRates).length > 0;
      if ((!data.services || data.services.length === 0) && !hasInstant)
        ctx.addIssue({ code: "custom", path: ["services"], message: "Select at least one service" });
      // Naming required when "Other" is offered (monthly or daily).
      const offersOther = data.services?.includes("OTHER") || (data.instantRates && "OTHER" in data.instantRates);
      if (offersOther && !data.otherService)
        ctx.addIssue({ code: "custom", path: ["otherService"], message: "Please name your other service" });
      if (!data.city)
        ctx.addIssue({ code: "custom", path: ["city"], message: "City is required" });
      if (!data.locality)
        ctx.addIssue({ code: "custom", path: ["locality"], message: "Locality is required" });
      // Pincode is required only in India — the UAE doesn't use postal codes.
      if (data.country !== "AE" && (!data.pincode || !/^[0-9]{4,8}$/.test(data.pincode)))
        ctx.addIssue({ code: "custom", path: ["pincode"], message: "Enter a valid pincode" });
    }
  });

// Login by mobile number OR email.
export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your mobile number or email"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  // May be empty for daily-only helpers (validated together with instantRates in the route).
  services: z.array(z.enum(SERVICE_KEYS as [string, ...string[]])).default([]),
  country: z.enum(["IN", "AE"]).optional(),
  city: z.string().trim().min(1, "City is required").max(80),
  locality: z.string().trim().min(1, "Locality is required").max(120),
  // Optional — required in India (form-enforced); the UAE has no pincodes.
  pincode: z
    .union([z.string().trim().regex(/^[0-9]{4,8}$/, "Enter a valid pincode"), z.literal("")])
    .optional(),
  gender: z.string().trim().optional(),
  experienceYears: z.coerce.number().int().min(0).max(60),
  expectedSalary: z.coerce.number().int().min(0).max(1_000_000).optional(),
  instantAvailable: z.coerce.boolean().optional(),
  instantRates: z.record(z.coerce.number().int().min(1).max(100_000)).optional(),
  otherService: z.string().trim().max(60).optional(),
  otherServiceDesc: z.string().trim().max(300).optional(),
  bio: z.string().trim().max(1000).optional(),
  mobile,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
