export const TG_CREDS = {
  apiId: Number(process.env.TG_API_ID),
  apiHash: process.env.TG_API_HASH
}

// export const COOKIE_AGE = 3.154e+12
export const COOKIE_AGE = 54e6

export const CONNECTION_RETRIES = 10

export const PLANS = {
  free: {
    sharedFiles: 3000,
    publicFiles: 1000,
    sharingUsers: 5000
  },
  premium: {
    sharedFiles: 4000,
    publicFiles: 2000,
    sharingUsers: 60000
  },
  business: {
    sharedFiles: Infinity,
    publicFiles: Infinity,
    sharingUsers: Infinity
  }
}