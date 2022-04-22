import axios from 'axios';
import { getSession } from 'next-auth/react';

const baseURL = 'http://3.0.102.186/api/';

const ApiClient = () => {
   const defaultOptions = {
      baseURL,
   };

   const instance = axios.create(defaultOptions);

   instance.interceptors.request.use(async (request) => {
      const session = await getSession();
      if (session && request.headers) {
         request.headers.Authorization = `Bearer ${session.accessToken}`;
      }
      return request;
   });

   instance.interceptors.response.use(
      (response) => {
         return response;
      },
      (error) => {
         console.log(`error`, error);
      }
   );

   return instance;
};

export default ApiClient();
