import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
  ],
  secret: "cfac4ba301c3a44d6dd4e9f5d0b1f1b1f1629433e34ae11a3c95e5753df238ea",
});
