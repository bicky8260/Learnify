import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadBufferToCloudinary } from '@/utils/cloudinary/cloudinary';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
});

function sanitizePublicId(fileName: string): string {
  const decodedFileName = decodeURIComponent(fileName);
  const normalized = decodedFileName.replace(/\\/g, '/');
  const ext = path.extname(normalized);
  const withoutExt = ext ? normalized.slice(0, -ext.length) : normalized;
  return withoutExt.replace(/[^a-zA-Z0-9/_-]/g, '_');
}

export async function getPreSignedUrl(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: false,
        msg: 'file is required',
      });
    }

    const fallbackName = req.file.originalname || `file-${Date.now()}`;
    const incomingName = (req.body?.fileName || req.query?.fileName || fallbackName) as string;
    const publicId = sanitizePublicId(incomingName);

    const uploadedFile = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'moni',
      public_id: publicId,
      resource_type: 'auto',
      overwrite: true,
      use_filename: false,
    });

    const fileUrl = uploadedFile.secure_url;
    const uploadUrl = fileUrl;
    return res.status(200).json({ uploadUrl, fileUrl });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: false,
      msg: 'internal server error !',
      log: 'error uploading file',
    });
  }
}