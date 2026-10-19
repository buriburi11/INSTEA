// Reads configuration from Vite environment variables.
// Values come from .env files (see .env.example); only VITE_-prefixed
// variables are available here, and they are public in the built app.

export function readEnv(source = import.meta.env) {
  return {
    appName: source.VITE_APP_NAME || 'INSTEA',
    apiBaseUrl: source.VITE_API_BASE_URL || 'http://localhost:8080/api',
    appEnv: source.VITE_APP_ENV || source.MODE || 'development',
  }
}

export const env = readEnv()
