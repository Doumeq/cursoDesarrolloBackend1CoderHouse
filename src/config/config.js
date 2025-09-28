import 'dotenv/config';

export const config = {
  puerto: process.env.PORT ?? 8080,
  mongoUrl: process.env.MONGO_URL
};
