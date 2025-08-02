import { z, ZodType } from "zod";

export class AuthValidation {
  static readonly RequestSignin: ZodType = z.object({
    email: z.string({ message: "Email is required" }).email({ message: "Invalid email format (ex: example@domain.com)" }),
    password: z.string({ message: "Password is required" }).min(1, { message: "Password is required" }),
  });
}
