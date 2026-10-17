import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "ثبت‌نام", robots: { index: false, follow: true } };
export default function Page() { return <RegisterForm />; }
