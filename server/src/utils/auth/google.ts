import { google } from "googleapis"
import dotenv from "dotenv"
dotenv.config()

const GoogleClient = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  `${process.env.SERVER_URL}/auth/google/callback`
)

google.options({ auth: GoogleClient })

export { GoogleClient }
