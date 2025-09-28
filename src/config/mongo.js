import mongoose from 'mongoose';
import { config } from './config.js';

export async function conectarMongo() {
  await mongoose.connect(config.mongoUrl);
  console.log('MongoDB conectado');
}
