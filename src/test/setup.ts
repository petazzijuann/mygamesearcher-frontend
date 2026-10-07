// Se carga antes de cada test unitario (ver "test.setupFiles" en vite.config.ts).
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
// Suma comparaciones como toBeChecked() o toBeDisabled() a expect().
import '@testing-library/jest-dom/vitest'

// Desmonta lo que dibujó cada test para que no se mezcle con el siguiente.
afterEach(() => {
  cleanup()
})
