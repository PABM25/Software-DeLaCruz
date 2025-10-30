import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    // --- Configuración para el FRONTEND (React en 'src') ---
    files: ['src/**/*.{js,jsx}'], // MODIFICADO: Ahora solo aplica a 'src'
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser, // Correcto: 'window', 'document', etc.
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  // --- BLOQUE AÑADIDO PARA EL BACKEND (Node.js en 'server') ---
  {
    files: ['server/**/*.js'], // Se aplica solo a la carpeta 'server'
    extends: [
      js.configs.recommended, // Buenas prácticas de JS
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node, // ¡LA SOLUCIÓN! Define 'require', 'process', 'module', etc.
      parserOptions: {
        sourceType: 'commonjs', // Le dice a ESLint que usas require/module.exports
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])