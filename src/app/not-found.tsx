export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-base px-6 text-text-primary">
      <div className="rounded-2xl border border-border bg-bg-card p-8 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-text-muted">Lemo</p>
        <h1 className="mt-4 text-4xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-text-muted">
          O caminho solicitado não existe na calculadora de juros compostos.
        </p>
      </div>
    </main>
  );
}
