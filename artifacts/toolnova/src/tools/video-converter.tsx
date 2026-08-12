import { useEffect, useMemo, useState } from 'react';
import { Check, Download, FileVideo, LoaderCircle, TriangleAlert } from 'lucide-react';
import { FileUploader, ToolFrame } from '@/components/toolnova-ui';

const button = 'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50';
const outline = 'inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50';

type OutputFormat = {
  label: string;
  mimeType: string;
  extension: string;
  description: string;
};

const formatCandidates: OutputFormat[] = [
  {
    label: 'WebM · VP9',
    mimeType: 'video/webm;codecs=vp9,opus',
    extension: 'webm',
    description: 'Best compression for modern browsers',
  },
  {
    label: 'WebM · VP8',
    mimeType: 'video/webm;codecs=vp8,opus',
    extension: 'webm',
    description: 'Broad WebM compatibility',
  },
  {
    label: 'MP4 · H.264',
    mimeType: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    extension: 'mp4',
    description: 'Available only in browsers with MP4 recording support',
  },
];

type ConversionResult = {
  url: string;
  size: number;
  format: OutputFormat;
};

type CapturableVideo = HTMLVideoElement & {
  captureStream: () => MediaStream;
};

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds)) return '—';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function getSupportedFormats() {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return [];
  }
  return formatCandidates.filter((format) => MediaRecorder.isTypeSupported(format.mimeType));
}

export default function VideoConverter() {
  const [file, setFile] = useState<File>();
  const [selectedMimeType, setSelectedMimeType] = useState('');
  const [supportedFormats, setSupportedFormats] = useState<OutputFormat[]>([]);
  const [result, setResult] = useState<ConversionResult>();
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  useEffect(() => {
    const formats = getSupportedFormats();
    setSupportedFormats(formats);
    setSelectedMimeType(formats[0]?.mimeType ?? '');
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result?.url]);

  const selectedFormat = supportedFormats.find((format) => format.mimeType === selectedMimeType);

  const resetFile = (files: File[]) => {
    setFile(files[0]);
    setResult(undefined);
    setProgress(0);
    setError('');
  };

  const convert = async () => {
    if (!file) {
      setError('Choose a video first.');
      return;
    }
    if (!selectedFormat) {
      setError('This browser cannot record a supported output format.');
      return;
    }
    if (!('captureStream' in HTMLMediaElement.prototype)) {
      setError('This browser cannot capture video for conversion. Try the latest Chrome, Edge or Firefox.');
      return;
    }

    setBusy(true);
    setResult(undefined);
    setError('');
    setProgress(0);

    const video = document.createElement('video');
    video.preload = 'auto';
    video.src = previewUrl;
    video.playsInline = true;
    video.muted = false;

    try {
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('The video could not be read.'));
      });

      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        throw new Error('The video has no readable duration.');
      }

      const stream = (video as CapturableVideo).captureStream();
      if (!stream.getVideoTracks().length) {
        throw new Error('The browser did not provide a video track.');
      }

      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream, { mimeType: selectedFormat.mimeType });
      const duration = video.duration;
      let finished = false;

      const stopRecording = () => {
        if (finished) return;
        finished = true;
        if (recorder.state !== 'inactive') recorder.stop();
      };

      await new Promise<void>((resolve, reject) => {
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onerror = () => reject(new Error('The browser could not encode this video.'));
        recorder.onstop = () => resolve();
        video.ontimeupdate = () => setProgress(Math.min(99, Math.round((video.currentTime / duration) * 100)));
        video.onended = stopRecording;
        recorder.start(250);
        video.play().catch(reject);
      });

      const blob = new Blob(chunks, { type: selectedFormat.mimeType });
      if (!blob.size) throw new Error('The converted video was empty.');
      setProgress(100);
      setResult({
        url: URL.createObjectURL(blob),
        size: blob.size,
        format: selectedFormat,
      });
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : 'Video conversion failed.');
    } finally {
      video.pause();
      video.removeAttribute('src');
      video.load();
      setBusy(false);
    }
  };

  return (
    <ToolFrame title="Video Format Converter">
      <FileUploader
        accept="video/*"
        maxSize={250}
        onFiles={resetFile}
        files={file ? [file] : []}
        label={file ? 'Replace video' : 'Choose a video'}
      />

      {file && (
        <div className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="overflow-hidden rounded-xl border border-border bg-black">
              <video src={previewUrl} controls className="max-h-72 w-full" aria-label="Selected video preview" />
            </div>
            <div className="rounded-xl bg-muted p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Source file</p>
              <p className="mt-3 truncate text-sm font-semibold" title={file.name}>{file.name}</p>
              <dl className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3"><dt>Size</dt><dd className="font-mono">{formatBytes(file.size)}</dd></div>
                <div className="flex justify-between gap-3"><dt>Type</dt><dd className="font-mono">{file.type || 'video'}</dd></div>
              </dl>
            </div>
          </div>

          {supportedFormats.length > 0 ? (
            <fieldset>
              <legend className="text-sm font-semibold">Output format</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {supportedFormats.map((format) => (
                  <label key={format.mimeType} className={`cursor-pointer rounded-xl border p-4 transition-colors ${selectedMimeType === format.mimeType ? 'border-primary bg-secondary/50' : 'border-border hover:border-primary/50'}`}>
                    <input
                      type="radio"
                      name="video-output-format"
                      value={format.mimeType}
                      checked={selectedMimeType === format.mimeType}
                      onChange={() => setSelectedMimeType(format.mimeType)}
                      className="sr-only"
                    />
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                      {format.label}
                      {selectedMimeType === format.mimeType && <Check size={15} className="text-primary" />}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{format.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-3 text-sm text-destructive" role="alert">
              <TriangleAlert size={17} className="mt-0.5 shrink-0" />
              This browser does not support video recording for conversion. Try the latest Chrome, Edge or Firefox.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button className={button} onClick={convert} disabled={busy || !selectedFormat} data-testid="button-convert-video">
              {busy ? <LoaderCircle className="animate-spin" size={16} /> : <FileVideo size={16} />}
              {busy ? 'Converting…' : 'Convert video'}
            </button>
            {result && (
              <button className={outline} onClick={() => {
                const link = document.createElement('a');
                link.href = result.url;
                link.download = `toolnova-video-converted.${result.format.extension}`;
                link.click();
              }} data-testid="button-download-video">
                <Download size={16} /> Download {result.format.extension.toUpperCase()}
              </button>
            )}
          </div>

          {busy && (
            <div className="space-y-2" role="status" aria-live="polite">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Converting locally in your browser</span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {result && !busy && (
            <p className="rounded-xl bg-secondary px-3 py-2 text-sm text-primary" role="status">
              <Check size={15} className="mr-1 inline" /> Ready · {formatBytes(result.size)} · {result.format.label}
            </p>
          )}
          {error && !busy && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}
        </div>
      )}
    </ToolFrame>
  );
}