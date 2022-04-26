import axios from 'axios';
import { BASE_URL_API, ERROR_TOKEN, ROUTES } from 'constant';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { IResLogin, IToken } from 'shared/types';

const handleRefreshToken = async (token: JWT) => {
   try {
      const tokenData: IToken = await axios
         .post(`${BASE_URL_API}/auth/refresh-token`, {
            refresh_token: token.refreshToken,
         })
         .then((value) => value.data.data);

      console.log('refresh token here:', tokenData);
      const { access_token: accessToken, refresh_token: refreshToken } =
         tokenData;
      const accessTokenExpirationTime =
         (jwt_decode<JwtPayload>(accessToken).exp as number) * 1000 - 10;
      return {
         ...token,
         accessToken,
         accessTokenExpires: accessTokenExpirationTime,
         refreshToken: refreshToken ?? token.refreshToken, // Fall back to old refresh token
      };
   } catch (error) {
      return {
         ...token,
         error: ERROR_TOKEN,
      };
   }
};

export default NextAuth({
   // Configure one or more authentication providers
   providers: [
      CredentialsProvider({
         name: 'Credentials',
         credentials: {
            email: {
               label: 'Email',
               type: 'email',
               placeholder: 'email@domain.com',
            },
            password: { label: 'Password', type: 'password' },
         },
         //@ts-ignore
         authorize: async (credentials) => {
            try {
               //login
               const data: IResLogin = await axios
                  .post(`${BASE_URL_API}/auth/login`, {
                     email: credentials?.email,
                     password: credentials?.password,
                  })
                  .then((value) => value.data.data);

               if (data) {
                  // neu co data
                  const {
                     access_token: accessToken,
                     refresh_token: refreshToken,
                  } = data.token;

                  const accessTokenExpirationTime =
                     (jwt_decode<JwtPayload>(accessToken).exp as number) *
                        1000 -
                     10; // parse tk token ra de lay cai gia tri het han * 1000 de lay ms

                  return {
                     ...data.user,
                     accessToken,
                     accessTokenExpires: accessTokenExpirationTime,
                     refreshToken,
                  };
               }
               return null;
            } catch (e: any) {
               console.log(e);
               throw new Error(e.response.data.message);
            }
         },
      }),
   ],
   callbacks: {
      async jwt({ token, user }) {
         if (token && user) {
            const {
               accessToken,
               accessTokenExpires,
               refreshToken,
               ...userData
            } = user;
            return {
               accessToken,
               accessTokenExpires,
               refreshToken,
               user: userData,
            };
         }
         // get time => tg hien tai theo kieu ms check thu neu ma thoi gian hien tai nho hon cai thoi gian het han thi k lam di het :)
         // @ts-ignore
         if (new Date().getTime() < token.accessTokenExpires) {
            return token;
         }

         // refresh token here
         // nguoc lai thi refresh token
         return await handleRefreshToken(token);
      },
      async session({ session, token }) {
         //@ts-ignore
         session.user = token.user;
         session.accessToken = token.accessToken;
         session.error = token.error;
         return session;
      },
   },
   pages: {
      signIn: ROUTES.LOGIN,
   },
});