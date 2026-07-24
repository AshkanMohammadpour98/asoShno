"use client";

import React, { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/image-utils';

interface ImageCropModalProps {
  image: string;
  aspect: number;
  onCropComplete: (croppedImage: Blob) => void;
  onClose: () => void;
  title?: string;
}

export default function ImageCropModal({ image, aspect, onCropComplete, onClose, title }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsPending] = useState(false);

  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    try {
      setIsPending(true);
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        if (croppedImage) {
          onCropComplete(croppedImage);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-fade-in border border-slate-100 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-xl font-black text-slate-800 dark:text-white">{title || 'برش تصویر'}</h3>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-red-500 transition-colors">✕</button>
        </div>

        <div className="relative h-96 w-full bg-slate-100 dark:bg-slate-950">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaComplete}
          />
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
             <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>بزرگنمایی (Zoom)</span>
                <span>{Math.round(zoom * 100)}%</span>
             </div>
             <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
             />
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 font-black text-sm"
            >
              انصراف
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-[2] h-14 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'تایید و ذخیره کادربندی'}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 text-center font-bold">
            💡 با کشیدن موس یا استفاده از دو انگشت در موبایل می‌توانید تصویر را جابه‌جا کنید.
          </p>
        </div>
      </div>
    </div>
  );
}
