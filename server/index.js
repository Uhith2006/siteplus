import express from 'express';
import multer from 'multer';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'inspections.json');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

const readInspections = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const writeInspections = (rows) => fs.writeFileSync(DB_FILE, JSON.stringify(rows, null, 2));
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname).toLowerCase()}`)
  }),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});

const demoProjects = [
  { id: 'SP-2401', name: 'Northline Residences', location: 'Bengaluru, IN', phase: 'Structure', progress: 68, target: 72, health: 'On track', color: 'cyan', due: '18 Dec 2026', budget: '₹8.4 Cr' },
  { id: 'SP-2402', name: 'Aster Business Park', location: 'Chennai, IN', phase: 'MEP installation', progress: 42, target: 55, health: 'Needs attention', color: 'violet', due: '04 Feb 2027', budget: '₹12.8 Cr' },
  { id: 'SP-2403', name: 'The Canopy', location: 'Coimbatore, IN', phase: 'Finishing', progress: 86, target: 82, health: 'Ahead', color: 'lime', due: '29 Nov 2026', budget: '₹5.2 Cr' }
];

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'SitePulse AI API', timestamp: new Date().toISOString() }));
app.get('/api/dashboard', (_req, res) => {
  const inspections = readInspections();
  res.json({ projects: demoProjects, inspections: inspections.slice(0, 8), stats: { activeProjects: demoProjects.length, avgProgress: Math.round(demoProjects.reduce((a, p) => a + p.progress, 0) / demoProjects.length), pendingReviews: inspections.filter(x => !x.verified).length + 4, siteUpdates: inspections.length + 128 } });
});
app.get('/api/inspections', (_req, res) => res.json(readInspections()));
app.post('/api/inspections', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Upload a JPG, PNG or WebP image (max 12 MB).' });
  const progress = Math.max(0, Math.min(100, Number(req.body.progress) || 0));
  const record = {
    id: `IN-${Date.now().toString().slice(-7)}`,
    project: req.body.project || 'Northline Residences',
    package: req.body.package || 'Structural work',
    progress,
    notes: (req.body.notes || '').slice(0, 1000),
    photo: `/uploads/${req.file.filename}`,
    filename: req.file.originalname,
    verified: false,
    createdAt: new Date().toISOString(),
    estimateType: 'User-reported progress'
  };
  const rows = readInspections(); rows.unshift(record); writeInspections(rows);
  res.status(201).json(record);
});
app.patch('/api/inspections/:id/verify', (req, res) => {
  const rows = readInspections(); const item = rows.find(x => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Inspection not found.' });
  item.verified = true; item.verifiedAt = new Date().toISOString(); writeInspections(rows); res.json(item);
});

const distDir = path.resolve(__dirname, '../dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => req.path.startsWith('/api') ? next() : res.sendFile(path.join(distDir, 'index.html')));
}
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err instanceof multer.MulterError ? 400 : 500).json({ error: err instanceof multer.MulterError ? err.message : 'Unexpected server error.' });
});
app.listen(PORT, () => console.log(`SitePulse AI server running on http://localhost:${PORT}`));
