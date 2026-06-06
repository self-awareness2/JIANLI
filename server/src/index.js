import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import sectionRoutes from './routes/section.js';
import exportRoutes from './routes/export.js';
import paymentRoutes from './routes/payment.js';
import importRoutes from './routes/import.js';
import aiRoutes from './routes/ai.js';
import galleryRoutes from './routes/gallery.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/import', importRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gallery', galleryRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 处理 - 必须放在所有路由之后
app.use(notFoundHandler);

// 全局错误处理 - 必须放在最后
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
