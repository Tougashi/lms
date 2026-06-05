"use client";

import { useState, useCallback } from "react";
import { uploadApi } from "../../lib/api";
import type { ModulContentType } from "../../lib/types/guru";

export function useUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = useCallback(
        async (file: File, type: ModulContentType): Promise<string> => {
            setIsUploading(true);
            setError(null);

            try {
                const res = await uploadApi.upload(file, type);
                return res.url;
            } catch (err: unknown) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Gagal mengunggah file";
                setError(message);
                throw err;
            } finally {
                setIsUploading(false);
            }
        },
        [],
    );

    const reset = useCallback(() => {
        setIsUploading(false);
        setError(null);
    }, []);

    return { upload, isUploading, error, reset };
}
