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
    city: z.string().trim().max(80).optional(),
    locality: z.string().trim().max(120).optional(),
    pincode: z.string().trim().optional(),
    gender: z.string().trim().optional(),
    experienceYears: z.coerce.number().int().min(0).max(60).optional(),
    expectedSalary: z.coerce.number().int().min(0).max(1_000_000).optional(),
    bio: z.string().trim().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "PROVIDER") {
      if (!data.services || data.services.length === 0)
        ctx.addIssue({ code: "custom", path: ["services"], message: "Select at least one service" });
      if (!data.city)
        ctx.addIssue({ code: "custom", path: ["city"], message: "City is required" });
      if (!data.locality)
        ctx.addIssue({ code: "custom", path: ["locality"], message: "Locality is required" });
      if (!data.pincode || !/^[0-9]{4,8}$/.test(data.pincode))
        ctx.addIssue({ code: "custom", path: ["pincode"], message: "Enter a valid pincode" });
    }
  });

// Login by mobile number OR email.
export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your mobile number or email"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  services: z.array(z.enum(SERVICE_KEYS as [string, ...string[]])).min(1, "Select at least one service"),
  city: z.string().trim().min(1, "City is required").max(80),
  locality: z.string().trim().min(1, "Locality is required").max(120),
  pincode: z.string().trim().regex(/^[0-9]{4,8}$/, "Enter a valid pincode"),
  gender: z.string().trim().optional(),
  experienceYears: z.coerce.number().int().min(0).max(60),
  expectedSalary: z.coerce.number().int().min(0).max(1_000_000).optional(),
  bio: z.string().trim().max(1000).optional(),
  available: z.boolean().optional(),
  mobile,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
