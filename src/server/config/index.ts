export const config = {
  port: process.env.PORT || 3000,
  cors: {
    origin: 'http://localhost:5173', // Vite dev server default port
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  },
  upload: {
    dest: 'uploads/'
  }
};