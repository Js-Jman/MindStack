"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            Application Error Page Working
          </h1>
          <button
            onClick={() => reset()}
            className="mt-4 rounded bg-black px-4 py-2 text-white"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
