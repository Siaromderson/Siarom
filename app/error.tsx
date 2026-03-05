"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8">
      <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-800">Algo deu errado</h2>
        <p className="mt-2 text-sm text-slate-600">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
