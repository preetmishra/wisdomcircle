export default (): {
  port: number;
  mongoDBUri: string;
  jwtSecret: string;
} => ({
  port: parseInt(process.env.API_SERVER_PORT, 10) || 3000,
  mongoDBUri: process.env.API_MONGODB_URI,
  jwtSecret: process.env.API_JWT_SECRET,
});
