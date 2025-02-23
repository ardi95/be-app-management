import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 60, // Maksimal 10 request per menit
  message: {
    status: 429,
    message: 'Too many request!',
  },
  headers: true, // Menampilkan header RateLimit
});

export default limiter;
