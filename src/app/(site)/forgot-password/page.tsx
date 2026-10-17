import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "بازیابی رمز عبور", robots: { index: false, follow: true } };
export default function Page() { return <ForgotForm />; }
