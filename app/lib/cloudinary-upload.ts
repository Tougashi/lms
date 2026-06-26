import axios from 'axios';

interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  resourceType: 'image' | 'video' | 'raw';
}

interface UploadDirectResult {
  url: string;
  fileName: string;
}

export async function uploadToCloudinary(
  file: File,
  fileType?: string,
  onProgress?: (percent: number) => void,
): Promise<UploadDirectResult> {
  const params = new URLSearchParams();
  if (fileType) params.set('fileType', fileType);

  const sigRes = await fetch(`/api-backend/upload/signature?${params}`, {
    credentials: 'include',
  });

  if (!sigRes.ok) {
    const err = await sigRes.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal mendapatkan signature upload');
  }

  const sig: UploadSignature = await sigRes.json();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sig.apiKey);
  formData.append('timestamp', String(sig.timestamp));
  formData.append('signature', sig.signature);
  formData.append('folder', sig.folder);

  if (sig.resourceType === 'raw') {
    formData.append('access_mode', 'public');
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`;

  const uploadRes = await axios.post(uploadUrl, formData, {
    onUploadProgress: (e) => {
      if (e.total && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return { url: uploadRes.data.secure_url, fileName: uploadRes.data.public_id };
}
