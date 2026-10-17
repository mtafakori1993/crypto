"use client";
import { ErrorState } from "@/components/ui/misc";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md items-center justify-center">
      <ErrorState title="خطایی رخ داد" hint="لطفاً دوباره تلاش کنید." onRetry={reset} />
    </main>
  );
}
