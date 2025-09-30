import mongoose from 'mongoose';

const { MONGODB_URI } = process.env;

export async function conectarMongo() {
  if (!MONGODB_URI) {
    throw new Error('Falta la variable MONGODB_URI en .env');
  }
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado a MongoDB');
}
