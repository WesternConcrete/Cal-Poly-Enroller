import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      redirectUri: 'http://localhost:3000/api/auth/callback/google'

    })
  ],
  database: process.env.DATABASE_URL
})

