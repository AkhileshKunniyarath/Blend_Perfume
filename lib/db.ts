import mongoose from 'mongoose';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

/**
 * Builds the MongoDB URI from separate env vars, properly encoding
 * special characters in the password (like @, #, etc.).
 */
function buildMongoURI(): string {
  const user = process.env.MONGODB_USER;
  const pass = process.env.MONGODB_PASS;
  const host = process.env.MONGODB_HOST;
  const app = process.env.MONGODB_APP || 'Cluster0';

  if (user && pass && host) {
    const encodedPass = encodeURIComponent(pass);
    return `mongodb+srv://${user}:${encodedPass}@${host}/?appName=${app}`;
  }

  // Fallback to MONGODB_URI if individual vars aren't set
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'Please define MONGODB_USER, MONGODB_PASS, MONGODB_HOST (or MONGODB_URI) in .env.local'
    );
  }
  return uri;
}

const MONGODB_URI = buildMongoURI();

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
const cached: MongooseCache =
  global.mongooseCache ?? (global.mongooseCache = { conn: null, promise: null });

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
