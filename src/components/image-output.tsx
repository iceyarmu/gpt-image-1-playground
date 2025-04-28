"use client";

import Image from 'next/image';
import { useTranslation } from "@/lib/i18n";
import { Loader2, Send, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ImageInfo = {
  path: string;
  filename: string;
};

type ImageOutputProps = {
  imageBatch: ImageInfo[] | null;
  viewMode: 'grid' | number;
  onViewChange: (view: 'grid' | number) => void;
  altText?: string;
  isLoading: boolean;
  onSendToEdit: (filename: string) => void;
  currentMode: "generate" | "edit";
  baseImagePreviewUrl: string | null;
};

const getGridColsClass = (count: number): string => {
  if (count <= 1) return 'grid-cols-1';
  if (count <= 4) return 'grid-cols-2';
  if (count <= 9) return 'grid-cols-3';
  return 'grid-cols-3';
};

export function ImageOutput({
  imageBatch,
  viewMode,
  onViewChange,
  altText = "Generated image output",
  isLoading,
  onSendToEdit,
  currentMode,
  baseImagePreviewUrl
}: ImageOutputProps) {
  const { t } = useTranslation();

  const handleSendClick = () => {
    // Send to edit only works when a single image is selected
    if (typeof viewMode === 'number' && imageBatch && imageBatch[viewMode]) {
      onSendToEdit(imageBatch[viewMode].filename);
    }
  };

  const showCarousel = imageBatch && imageBatch.length > 1;
  const isSingleImageView = typeof viewMode === 'number';
  const canSendToEdit = !isLoading && isSingleImageView && imageBatch && imageBatch[viewMode];

  return (
    <div className="w-full h-full min-h-[300px] border border-white/20 rounded-lg flex flex-col items-center justify-between bg-black overflow-hidden p-4 gap-4">

      <div className="flex-grow flex items-center justify-center w-full h-full overflow-hidden relative">
        {isLoading ? (
          currentMode === 'edit' && baseImagePreviewUrl ? (
            <div className="w-full h-full flex items-center justify-center relative">
              <Image
                src={baseImagePreviewUrl}
                alt={t('imageOutput.baseImageAlt')}
                fill
                style={{ objectFit: 'contain' }}
                className="filter blur-md"
                unoptimized
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white/80">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>{t('imageOutput.editingImage')}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-white/60">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>{t('imageOutput.generatingImage')}</p>
            </div>
          )
        ) : imageBatch && imageBatch.length > 0 ? (
          viewMode === 'grid' ? (
            <div className={`grid ${getGridColsClass(imageBatch.length)} gap-1 p-1 w-full max-w-full max-h-full`}>
              {imageBatch.map((img, index) => (
                <div key={img.filename} className="relative aspect-square overflow-hidden rounded border border-white/10">
                  <Image
                    src={img.path}
                    alt={t('imageOutput.generatedImageAlt', { index: index + 1 })}
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          ) : (
            imageBatch[viewMode] ? (
              <Image
                src={imageBatch[viewMode].path}
                alt={altText}
                width={512}
                height={512}
                className="object-contain max-w-full max-h-full"
                unoptimized
              />
            ) : (
              <div className="text-center text-white/40">
                <p>{t('imageOutput.errorDisplaying')}</p>
              </div>
            )
          )
        ) : (
          <div className="text-center text-white/40">
            <p>{t('imageOutput.willAppearHere')}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 w-full shrink-0 h-10">
        {showCarousel && (
          <div className="flex items-center gap-1.5 bg-neutral-800/50 p-1 rounded-md border border-white/10">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 p-1 rounded",
                viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white/80'
              )}
              onClick={() => onViewChange('grid')}
              aria-label={t('imageOutput.showGridView')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            {imageBatch.map((img, index) => (
              <Button
                key={img.filename}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 p-0.5 rounded overflow-hidden",
                  viewMode === index ? 'ring-2 ring-offset-1 ring-offset-black ring-white' : 'opacity-60 hover:opacity-100'
                )}
                onClick={() => onViewChange(index)}
                aria-label={t('imageOutput.selectImage', { index: index + 1 })}
              >
                <Image
                  src={img.path}
                  alt={t('imageOutput.thumbnailAlt', { index: index + 1 })}
                  width={28}
                  height={28}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </Button>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleSendClick}
          disabled={!canSendToEdit}
          className={cn(
            "text-white/80 border-white/20 hover:bg-white/10 hover:text-white shrink-0 disabled:opacity-50 disabled:pointer-events-none",
            // Hide button completely if grid view is active and there are multiple images
            showCarousel && viewMode === 'grid' ? 'invisible' : 'visible'
          )}
        >
          <Send className="h-4 w-4 mr-2" />
          {t('imageOutput.sendToEdit')}
        </Button>
      </div>
    </div>
  );
}