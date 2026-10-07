// Se muestra si una pantalla falla al renderizar, para no dejar la página en blanco.
export function ErrorInesperado() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="max-w-xl text-center">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Algo salió mal</h1>
        <p className="mt-2 text-slate-600">
          Ocurrió un error inesperado. Probá recargar la página o volver al inicio.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-md bg-indigo-700 px-4 py-2 font-medium text-white hover:bg-indigo-600"
        >
          Volver al inicio
        </a>
      </section>
    </main>
  )
}
