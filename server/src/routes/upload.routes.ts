import { getPreSignedUrl, upload } from '@/controllers/upload.controller';
import {Router} from 'express'
const router = Router();

router.post('/presigned', upload.single('file'), getPreSignedUrl);

export default router