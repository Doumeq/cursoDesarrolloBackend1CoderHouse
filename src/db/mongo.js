import mongoose from 'mongoose';

export default async function connectMongo() {
  const { MONGO_URL } = process.env;
  if (!MONGO_URL) {
    throw new Error('Falta MONGO_URL en .env');
  }

  await mongoose.connect(MONGO_URL);
  console.log('Conectado a MongoDB');
}
