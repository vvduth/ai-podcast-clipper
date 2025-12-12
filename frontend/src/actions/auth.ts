"use server"

import type { SignUpFormValues } from "~/components/signup-form";
import { hashPassword } from "~/lib/auth";
import { signupSchema } from "~/schemas/auth";
import { db } from "~/server/db";
import Stripe from "stripe"
import { env } from "~/env";
type SignUpResult = {
    success: boolean;
    error?: string;
}

export async function signUp(formData: SignUpFormValues) : Promise<SignUpResult> {
    const validationresult = signupSchema.safeParse(formData);
    if (!validationresult.success) {
        return {
            success: false,
            error: validationresult.error.issues[0]?.message || "Invalid input",
        }
    }
    const { email, password } = validationresult.data;
    try {
        const existingUser = await db.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return {
                success: false,
                error: "User with this email already exists",
            }
        }

        const hashedPassword = await hashPassword(password);

        // sign user up in stripe too
        const stripe = new Stripe(env.STRIPE_SECRET_KEY)
        const stripeCustomer = await stripe.customers.create({
            email: email.toLowerCase(),
        })

        await db.user.create({
            data: {
                email,
                password: hashedPassword,
                stripeCustomerId: stripeCustomer.id,
            }
        });

        return {
            success: true,
            error: undefined,
        }
    } catch (error) {
        return {
            success: false,
            error: "Failed to create user",
        }
    }
}