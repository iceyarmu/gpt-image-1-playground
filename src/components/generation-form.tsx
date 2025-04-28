"use client";

import * as React from "react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ModeToggle } from "@/components/mode-toggle";
import {
    Square,
    RectangleHorizontal,
    RectangleVertical,
    Sparkles,
    Eraser,
    ShieldCheck,
    ShieldAlert,
    FileImage,
    Tally1,
    Tally2,
    Tally3,
    Loader2,
    BrickWall
} from 'lucide-react';

export type GenerationFormData = {
  prompt: string;
  n: number;
  size: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
  quality: "low" | "medium" | "high" | "auto";
  output_format: "png" | "jpeg" | "webp";
  output_compression?: number;
  background: "transparent" | "opaque" | "auto";
  moderation: "low" | "auto";
};

type GenerationFormProps = {
  onSubmit: (data: GenerationFormData) => void;
  isLoading: boolean;
  currentMode: "generate" | "edit";
  onModeChange: (mode: "generate" | "edit") => void;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  n: number[];
  setN: React.Dispatch<React.SetStateAction<number[]>>;
  size: GenerationFormData['size'];
  setSize: React.Dispatch<React.SetStateAction<GenerationFormData['size']>>;
  quality: GenerationFormData['quality'];
  setQuality: React.Dispatch<React.SetStateAction<GenerationFormData['quality']>>;
  outputFormat: GenerationFormData['output_format'];
  setOutputFormat: React.Dispatch<React.SetStateAction<GenerationFormData['output_format']>>;
  compression: number[];
  setCompression: React.Dispatch<React.SetStateAction<number[]>>;
  background: GenerationFormData['background'];
  setBackground: React.Dispatch<React.SetStateAction<GenerationFormData['background']>>;
  moderation: GenerationFormData['moderation'];
  setModeration: React.Dispatch<React.SetStateAction<GenerationFormData['moderation']>>;
};

const RadioItemWithIcon = ({ value, id, label, Icon }: { value: string; id: string; label: string; Icon: React.ElementType }) => (
    <div className="flex items-center space-x-2">
        <RadioGroupItem value={value} id={id} className="border-white/40 data-[state=checked]:border-white text-white data-[state=checked]:text-white" />
        <Label htmlFor={id} className="flex items-center gap-2 cursor-pointer text-white/80 text-base">
            <Icon className="h-5 w-5 text-white/60" />
            {label}
        </Label>
    </div>
);

export function GenerationForm({
    onSubmit,
    isLoading,
    currentMode,
    onModeChange,
    prompt,
    setPrompt,
    n,
    setN,
    size,
    setSize,
    quality,
    setQuality,
    outputFormat,
    setOutputFormat,
    compression,
    setCompression,
    background,
    setBackground,
    moderation,
    setModeration
}: GenerationFormProps) {
  const { t } = useTranslation();
  const showCompression = outputFormat === "jpeg" || outputFormat === "webp";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData: GenerationFormData = {
      prompt,
      n: n[0],
      size,
      quality,
      output_format: outputFormat,
      background,
      moderation,
    };
    if (showCompression) {
      formData.output_compression = compression[0];
    }
    onSubmit(formData);
  };

  return (
    <Card className="w-full h-full border border-white/10 bg-black overflow-hidden flex flex-col rounded-lg">
      <CardHeader className="pb-4 border-b border-white/10 flex justify-between items-start">
        <div>
            <CardTitle className="text-lg font-medium text-white">{t('generate.title')}</CardTitle>
            <CardDescription className="text-white/60 mt-1">
              {t('generate.description')}
            </CardDescription>
        </div>
        <ModeToggle currentMode={currentMode} onModeChange={onModeChange} />
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 h-full overflow-hidden">
        <CardContent className="p-4 space-y-5 flex-1 overflow-y-auto">
          <div className="space-y-1.5">
            <Label htmlFor="prompt" className="text-white">{t('generate.prompt')}</Label>
            <Textarea
              id="prompt"
              placeholder={t('generate.promptPlaceholder')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              disabled={isLoading}
              className="min-h-[80px] bg-black border border-white/20 text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/50 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="n-slider" className="text-white">{t('generate.numImages')}: {n[0]}</Label>
            <Slider
              id="n-slider"
              min={1}
              max={10}
              step={1}
              value={n}
              onValueChange={setN}
              disabled={isLoading}
              className="[&>span:first-child]:h-1 [&>span:first-child>span]:bg-white [&>button]:bg-white [&>button]:border-black [&>button]:ring-offset-black mt-3"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-white block">{t('generate.size')}</Label>
            <RadioGroup
                value={size}
                onValueChange={(value) => setSize(value as GenerationFormData['size'])}
                disabled={isLoading}
                className="flex flex-wrap gap-x-5 gap-y-3"
            >
                <RadioItemWithIcon value="auto" id="size-auto" label={t('generate.sizeAuto')} Icon={Sparkles} />
                <RadioItemWithIcon value="1024x1024" id="size-square" label={t('generate.sizeSquare')} Icon={Square} />
                <RadioItemWithIcon value="1536x1024" id="size-landscape" label={t('generate.sizeLandscape')} Icon={RectangleHorizontal} />
                <RadioItemWithIcon value="1024x1536" id="size-portrait" label={t('generate.sizePortrait')} Icon={RectangleVertical} />
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-white block">{t('generate.quality')}</Label>
             <RadioGroup
                value={quality}
                onValueChange={(value) => setQuality(value as GenerationFormData['quality'])}
                disabled={isLoading}
                className="flex flex-wrap gap-x-5 gap-y-3"
            >
                <RadioItemWithIcon value="auto" id="quality-auto" label={t('generate.qualityAuto')} Icon={Sparkles} />
                <RadioItemWithIcon value="low" id="quality-low" label={t('generate.qualityLow')} Icon={Tally1} />
                <RadioItemWithIcon value="medium" id="quality-medium" label={t('generate.qualityMedium')} Icon={Tally2} />
                <RadioItemWithIcon value="high" id="quality-high" label={t('generate.qualityHigh')} Icon={Tally3} />
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-white block">{t('generate.background')}</Label>
             <RadioGroup
                value={background}
                onValueChange={(value) => setBackground(value as GenerationFormData['background'])}
                disabled={isLoading}
                className="flex flex-wrap gap-x-5 gap-y-3"
            >
                <RadioItemWithIcon value="auto" id="bg-auto" label={t('generate.backgroundAuto')} Icon={Sparkles} />
                <RadioItemWithIcon value="opaque" id="bg-opaque" label={t('generate.backgroundOpaque')} Icon={BrickWall} />
                <RadioItemWithIcon value="transparent" id="bg-transparent" label={t('generate.backgroundTransparent')} Icon={Eraser} />
            </RadioGroup>
          </div>

           <div className="space-y-3">
            <Label className="text-white block">{t('generate.format')}</Label>
             <RadioGroup
                value={outputFormat}
                onValueChange={(value) => setOutputFormat(value as GenerationFormData['output_format'])}
                disabled={isLoading}
                className="flex flex-wrap gap-x-5 gap-y-3"
            >
                <RadioItemWithIcon value="png" id="format-png" label="PNG" Icon={FileImage} />
                <RadioItemWithIcon value="jpeg" id="format-jpeg" label="JPEG" Icon={FileImage} />
                <RadioItemWithIcon value="webp" id="format-webp" label="WebP" Icon={FileImage} />
            </RadioGroup>
          </div>

          {showCompression && (
            <div className="space-y-2 transition-opacity duration-300 pt-2">
              <Label htmlFor="compression-slider" className="text-white">{t('generate.compression')}: {compression[0]}%</Label>
              <Slider
                id="compression-slider"
                min={0}
                max={100}
                step={1}
                value={compression}
                onValueChange={setCompression}
                disabled={isLoading}
                className="[&>span:first-child]:h-1 [&>span:first-child>span]:bg-white [&>button]:bg-white [&>button]:border-black [&>button]:ring-offset-black mt-3"
              />
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-white block">{t('generate.moderation')}</Label>
             <RadioGroup
                value={moderation}
                onValueChange={(value) => setModeration(value as GenerationFormData['moderation'])}
                disabled={isLoading}
                className="flex flex-wrap gap-x-5 gap-y-3"
            >
                <RadioItemWithIcon value="auto" id="mod-auto" label={t('generate.moderationAuto')} Icon={ShieldCheck} />
                <RadioItemWithIcon value="low" id="mod-low" label={t('generate.moderationLow')} Icon={ShieldAlert} />
            </RadioGroup>
          </div>

        </CardContent>
        <CardFooter className="p-4 border-t border-white/10">
          <Button type="submit" disabled={isLoading || !prompt} className="w-full bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-white/40 rounded-md flex items-center justify-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? t('generate.loading') : t('generate.submit')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}