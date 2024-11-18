import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 5001;

const UPLOAD_FOLDER = path.join(__dirname, 'images');
app.use('/images', express.static(UPLOAD_FOLDER));

const storage = multer.diskStorage({
    destination: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, UPLOAD_FOLDER);
    },
    filename: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

app.post('/upload', upload.single('file'), (req: express.Request, res: express.Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `http://localhost:${PORT}/images/${req.file.filename}`;
    res.status(200).json({ message: 'File uploaded successfully', filepath: imageUrl });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Image server running on http://localhost:${PORT}`);
});
