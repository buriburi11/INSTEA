import { readEnv } from './env.js'

describe('readEnv', () => {
  it('reads configured VITE_ variables', () => {
    const config = readEnv({
      VITE_APP_NAME: 'INSTEA Test',
      VITE_API_BASE_URL: 'https://api.example.com',
      VITE_APP_ENV: 'staging',
    })
    expect(config).toEqual({
      appName: 'INSTEA Test',
      apiBaseUrl: 'https://api.example.com',
      appEnv: 'staging',
    })
  })

  it('falls back to defaults when variables are missing', () => {
    expect(readEnv({})).toEqual({
      appName: 'INSTEA',
      apiBaseUrl: 'http://localhost:8080/api',
      appEnv: 'development',
    })
  })
})
