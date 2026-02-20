"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { addMediaBatchAction } from "@/app/dashboard/actions";

type AdminMediaUploadAccordionProps = {
  totalMedia: number;
  maxUploadMb: number;
};

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function UploadSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="cursor-pointer rounded-xl bg-[#2ea2cc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2387aa] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Uploading..." : "Upload Media"}
    </button>
  );
}

export function AdminMediaUploadAccordion({ totalMedia, maxUploadMb }: AdminMediaUploadAccordionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [manualOpen, setManualOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasUploadQuery = searchParams.get("upload") === "1";
  const open = manualOpen || hasUploadQuery;

  function closeAccordion() {
    setManualOpen(false);
    if (hasUploadQuery) {
      router.replace("/dashboard/media");
    }
  }

  function syncInputFiles(files: File[]) {
    if (!inputRef.current) return;
    const transfer = new DataTransfer();
    for (const file of files) {
      transfer.items.add(file);
    }
    inputRef.current.files = transfer.files;
  }

  function appendFiles(incoming: File[]) {
    const nextIncoming = incoming.filter((file) => file.type.startsWith("image/"));
    if (nextIncoming.length === 0) return;

    setSelectedFiles((previous) => {
      const seen = new Set(previous.map((item) => fileKey(item)));
      const merged = [...previous];
      for (const file of nextIncoming) {
        const key = fileKey(file);
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(file);
      }
      syncInputFiles(merged);
      return merged;
    });
  }

  function removeFile(index: number) {
    setSelectedFiles((previous) => {
      const next = previous.filter((_, fileIndex) => fileIndex !== index);
      syncInputFiles(next);
      return next;
    });
  }

  function clearFiles() {
    setSelectedFiles([]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Total media: <span className="font-semibold text-slate-900">{totalMedia}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            if (open) {
              closeAccordion();
              return;
            }
            setManualOpen(true);
          }}
          className="cursor-pointer rounded-lg bg-[#2ea2cc] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#2387aa]"
          aria-expanded={open}
        >
          {open ? "Close Upload" : "New Media"}
        </button>
      </div>

      {open ? (
        <form action={addMediaBatchAction} className="mt-4 space-y-4 border-t border-slate-200 pt-4">
          <input type="hidden" name="redirectTo" value="/dashboard/media" />
          <input
            ref={inputRef}
            name="mediaFiles"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => appendFiles(Array.from(event.target.files ?? []))}
            className="hidden"
          />

          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              appendFiles(Array.from(event.dataTransfer.files ?? []));
            }}
            className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-12 text-center transition ${
              dragActive
                ? "border-[#2ea2cc] bg-[#2ea2cc]/10"
                : "border-slate-300 bg-slate-100 hover:border-slate-400"
            }`}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                closeAccordion();
              }}
              className="absolute right-3 top-3 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-base leading-none text-slate-600 shadow-sm transition hover:scale-105 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
              aria-label="Close upload panel"
            >
              x
            </button>
            <p className="text-lg font-medium text-slate-800">Drop files to upload</p>
            <p className="mt-1 text-sm text-slate-600">or</p>
            <div className="mt-3">
              <span className="inline-flex h-11 items-center rounded-md border border-[#1d6fd6] bg-white px-8 text-sm font-medium text-[#1d6fd6]">
                Select Files
              </span>
            </div>
            <p className="mt-6 text-sm text-slate-600">Maximum upload file size: {maxUploadMb} MB.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Select Files
            </button>
            <button
              type="button"
              onClick={clearFiles}
              disabled={selectedFiles.length === 0}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
            <span className="text-xs font-semibold text-slate-500">{selectedFiles.length} file(s) selected</span>
          </div>

          {selectedFiles.length > 0 ? (
            <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
              {selectedFiles.map((file, index) => (
                <div key={fileKey(file)} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">{file.name}</p>
                    <p className="text-[11px] text-slate-500">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="cursor-pointer rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex justify-end">
            <UploadSubmitButton disabled={selectedFiles.length === 0} />
          </div>
        </form>
      ) : null}
    </div>
  );
}
