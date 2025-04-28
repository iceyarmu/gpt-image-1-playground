"use client";

import * as React from "react";
import { useTranslation } from "@/lib/i18n";
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Copy, Check, Layers, DollarSign, Pencil, Sparkles as SparklesIcon } from "lucide-react";
import type { HistoryMetadata } from '@/app/page'; 
import { cn } from "@/lib/utils";

type HistoryPanelProps = {
  history: HistoryMetadata[];
  onSelectImage: (item: HistoryMetadata) => void; 
  onClearHistory: () => void;
};

const formatDuration = (ms: number): string => {
    if (ms < 1000) {
        return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
}

const calculateCost = (value: number, rate: number): string => {
    
    const cost = value * rate;
    return isNaN(cost) ? 'N/A' : cost.toFixed(4);
}


export function HistoryPanel({ history, onSelectImage, onClearHistory }: HistoryPanelProps) {
  const { t } = useTranslation();
  const [openPromptDialogTimestamp, setOpenPromptDialogTimestamp] = React.useState<number | null>(null);
  const [openCostDialogTimestamp, setOpenCostDialogTimestamp] = React.useState<number | null>(null);
  const [isTotalCostDialogOpen, setIsTotalCostDialogOpen] = React.useState(false);
  const [copiedTimestamp, setCopiedTimestamp] = React.useState<number | null>(null);

  const { totalCost, totalImages } = React.useMemo(() => {
    let cost = 0;
    let images = 0;
    history.forEach(item => {
      if (item.costDetails) {
        cost += item.costDetails.estimated_cost_usd;
      }
      images += item.images?.length ?? 0;
    });
    
    return { totalCost: Math.round(cost * 10000) / 10000, totalImages: images };
  }, [history]);

  const averageCost = totalImages > 0 ? totalCost / totalImages : 0;


  const handleCopy = async (text: string | null | undefined, timestamp: number) => {
    if (!text) return; 
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTimestamp(timestamp);
      setTimeout(() => setCopiedTimestamp(null), 1500); 
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Card className="w-full h-full border border-white/10 bg-black overflow-hidden flex flex-col rounded-lg">
      <CardHeader className="py-3 px-4 border-b border-white/10 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
           <CardTitle className="text-lg font-medium text-white">{t('history.title')}</CardTitle>
           {totalCost > 0 && (
               <Dialog open={isTotalCostDialogOpen} onOpenChange={setIsTotalCostDialogOpen}>
                   <DialogTrigger asChild>
                       <button
                           className="bg-green-600/80 hover:bg-green-500/90 text-white text-[12px] px-1.5 py-0.5 rounded-full flex items-center gap-1 mt-0.5 transition-colors"
                           aria-label="Show total cost summary"
                       >
                           {t('history.totalCost', { cost: totalCost.toFixed(4) })}
                       </button>
                   </DialogTrigger>
                   <DialogContent className="sm:max-w-[450px] bg-neutral-900 border-neutral-700 text-white">
                       <DialogHeader>
                           <DialogTitle className="text-white">{t('history.totalCostTitle')}</DialogTitle>
                           <DialogDescription className="sr-only">{t('history.totalCostDescription')}</DialogDescription>
                       </DialogHeader>
                       <div className="text-neutral-400 text-xs pt-1 space-y-1">
                           <p>{t('history.pricingIntro')}</p>
                           <ul className="list-disc pl-4">
                              <li>{t('history.pricingTextInput')}</li>
                              <li>{t('history.pricingImageInput')}</li>
                              <li>{t('history.pricingImageOutput')}</li>
                           </ul>
                       </div>
                       <div className="py-4 text-sm space-y-2 text-neutral-300">
                          <div className="flex justify-between"><span>{t('history.totalImagesGenerated')}:</span> <span>{totalImages.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>{t('history.averageCostPerImage')}:</span> <span>${averageCost.toFixed(4)}</span></div>
                          <hr className="border-neutral-700 my-2"/>
                          <div className="flex justify-between font-medium text-white">
                              <span>{t('history.totalEstimatedCost')}:</span>
                              <span>${totalCost.toFixed(4)}</span>
                          </div>
                       </div>
                       <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="secondary" size="sm" className="bg-neutral-700 hover:bg-neutral-600 text-neutral-200">{t('history.close')}</Button>
                         </DialogClose>
                       </DialogFooter>
                   </DialogContent>
               </Dialog>
           )}
        </div>
        {history.length > 0 && (
           <Button
             variant="ghost"
             size="sm"
             onClick={onClearHistory}
             className="text-white/60 hover:text-white hover:bg-white/10 px-2 py-1 h-auto rounded-md"
           >
             {t('history.clear')}
           </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/40">
            <p>{t('history.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...history].reverse().map((item) => { 
              const firstImage = item.images?.[0]; 
              const imageCount = item.images?.length ?? 0;
              const isMultiImage = imageCount > 1;
              const itemKey = item.timestamp; 

              return (
                <div key={itemKey} className="flex flex-col">
                  <div className="relative group">
                    <button
                      onClick={() => onSelectImage(item)}
                      className="aspect-square rounded-t-md overflow-hidden border border-white/20 group-hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition-all duration-150 block w-full relative"
                      aria-label={t('history.viewImageBatch', { date: new Date(item.timestamp).toLocaleString() })}
                    >
                      {firstImage ? (
                        <Image
                          src={`/api/image/${firstImage.filename}`}
                          alt={t('history.previewAlt', { date: new Date(item.timestamp).toLocaleString() })}
                          width={150}
                          height={150}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-500">?</div>
                      )}
                      <div className={cn(
                          "absolute top-1 left-1 text-white text-[11px] px-1.5 py-0.5 rounded-full flex items-center gap-1 pointer-events-none z-10",
                          item.mode === 'edit' ? 'bg-orange-600/80' : 'bg-blue-600/80'
                      )}>
                         {item.mode === 'edit' ? <Pencil size={12} /> : <SparklesIcon size={12} />}
                         {item.mode === 'edit' ? t('history.editMode') : t('history.createMode')}
                      </div>
                      {isMultiImage && (
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[12px] px-1.5 py-0.5 rounded-full flex items-center gap-1 pointer-events-none z-10">
                           <Layers size={16} />
                           {imageCount}
                        </div>
                      )}
                    </button>
                    {item.costDetails && (
                       <Dialog open={openCostDialogTimestamp === itemKey} onOpenChange={(isOpen) => !isOpen && setOpenCostDialogTimestamp(null)}>
                         <DialogTrigger asChild>
                           <button
                             onClick={(e) => { e.stopPropagation(); setOpenCostDialogTimestamp(itemKey); }} 
                             className="absolute top-1 right-1 bg-green-600/80 hover:bg-green-500/90 text-white text-[11px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 transition-colors z-20" 
                             aria-label="Show cost breakdown"
                           >
                             <DollarSign size={12} />
                             {item.costDetails.estimated_cost_usd.toFixed(4)}
                           </button>
                         </DialogTrigger>
                         <DialogContent className="sm:max-w-[450px] bg-neutral-900 border-neutral-700 text-white">
                           <DialogHeader>
                             <DialogTitle className="text-white">{t('history.costBreakdownTitle')}</DialogTitle>
                             <DialogDescription className="sr-only">{t('history.costBreakdownDescription')}</DialogDescription>
                           </DialogHeader>
                           <div className="text-neutral-400 text-xs pt-1 space-y-1">
                               <p>{t('history.pricingIntro')}</p>
                               <ul className="list-disc pl-4">
                                  <li>{t('history.pricingTextInput')}</li>
                                  <li>{t('history.pricingImageInput')}</li>
                                  <li>{t('history.pricingImageOutput')}</li>
                               </ul>
                           </div>
                           <div className="py-4 text-sm space-y-2 text-neutral-300">
                              <div className="flex justify-between">
                                  <span>{t('history.textInputTokens')}:</span>
                                  <span>{t('history.tokens', { count: item.costDetails.text_input_tokens.toLocaleString(), cost: calculateCost(item.costDetails.text_input_tokens, 0.000005) })}</span>
                              </div>
                              {item.costDetails.image_input_tokens > 0 && (
                                  <div className="flex justify-between">
                                      <span>{t('history.imageInputTokens')}:</span>
                                      <span>{t('history.tokens', { count: item.costDetails.image_input_tokens.toLocaleString(), cost: calculateCost(item.costDetails.image_input_tokens, 0.000010) })}</span>
                                  </div>
                              )}
                              <div className="flex justify-between">
                                  <span>{t('history.imageOutputTokens')}:</span>
                                  <span>{t('history.tokens', { count: item.costDetails.image_output_tokens.toLocaleString(), cost: calculateCost(item.costDetails.image_output_tokens, 0.000040) })}</span>
                              </div>
                              <hr className="border-neutral-700 my-2"/>
                              <div className="flex justify-between font-medium text-white">
                                  <span>{t('history.totalEstimatedCost')}:</span>
                                  <span>${item.costDetails.estimated_cost_usd.toFixed(4)}</span>
                              </div>
                           </div>
                           <DialogFooter>
                             <DialogClose asChild>
                                <Button type="button" variant="secondary" size="sm" className="bg-neutral-700 hover:bg-neutral-600 text-neutral-200">{t('history.close')}</Button>
                             </DialogClose>
                           </DialogFooter>
                         </DialogContent>
                       </Dialog>
                    )}
                 </div>

                  <div className="bg-black border border-t-0 border-neutral-700 rounded-b-md p-2 text-xs text-white/60 space-y-1">
                     <p title={`Generated on: ${new Date(item.timestamp).toLocaleString()}`}>
                       <span className="font-medium text-white/80">{t('history.time')}:</span> {formatDuration(item.durationMs)}
                     </p>
                     <p><span className="font-medium text-white/80">{t('history.quality')}:</span> {item.quality}</p>
                     <p><span className="font-medium text-white/80">{t('history.background')}:</span> {item.background}</p>
                     <p><span className="font-medium text-white/80">{t('history.moderation')}:</span> {item.moderation}</p>
                     <Dialog open={openPromptDialogTimestamp === itemKey} onOpenChange={(isOpen) => !isOpen && setOpenPromptDialogTimestamp(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-1 h-6 px-2 py-1 text-xs border-white/20 hover:bg-white/10 text-white/70 hover:text-white"
                            onClick={() => setOpenPromptDialogTimestamp(itemKey)}
                          >
                            {t('history.showPrompt')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[625px] bg-neutral-900 border-neutral-700 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-white">{t('history.promptTitle')}</DialogTitle>
                            <DialogDescription className="sr-only">{t('history.promptDescription')}</DialogDescription>
                          </DialogHeader>
                          <div className="py-4 max-h-[400px] overflow-y-auto text-sm text-neutral-300 bg-neutral-800 p-3 rounded-md border border-neutral-600">
                            {item.prompt || t('history.noPrompt')}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(item.prompt, itemKey)}
                              className="border-neutral-600 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                            >
                              {copiedTimestamp === itemKey ? <Check className="h-4 w-4 mr-2 text-green-400" /> : <Copy className="h-4 w-4 mr-2" />}
                              {copiedTimestamp === itemKey ? t('history.copied') : t('history.copy')}
                            </Button>
                            <DialogClose asChild>
                               <Button type="button" variant="secondary" size="sm" className="bg-neutral-700 hover:bg-neutral-600 text-neutral-200">
                                 {t('history.close')}
                               </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}