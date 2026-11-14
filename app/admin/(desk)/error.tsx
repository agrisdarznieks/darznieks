"use client";

export default function DeskError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="max-w-xl">
      <h1 className="font-serif text-3xl">The desk hit a problem</h1>
      <p className="mt-3 font-serif text-base leading-7 text-muted-foreground">
        {error.message || "Something failed while reading this page."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 font-sans text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        Try again
      </button>
    </div>
  );
}
