const appUrl = process.env.NEXT_PUBLIC_APP_URL

if (!appUrl) {
  throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set. Production deployments must configure this to generate valid client intake links.')
}

export const NEXT_PUBLIC_APP_URL: string = appUrl
