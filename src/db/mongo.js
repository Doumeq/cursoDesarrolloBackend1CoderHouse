import mongoose from 'mongoose';

export default async function connectMongo() {
  const url = process.env.MONGO_URL || process.env.MONGO_URI;
  if (!url) throw new Error('Falta MONGO_URL o MONGO_URI en .env');

  const dbName = process.env.MONGO_DB_NAME || 'CoderHouse';

  mongoose.set('debug', true); 

  await mongoose.connect(url, {
    dbName,                       
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 10,
  });

  console.log('Mongo conectado → host:', mongoose.connection.host, 'db:', mongoose.connection.name);
}
