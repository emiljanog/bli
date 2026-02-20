"use client";

import { uploadMediaSilentlyAction } from "@/app/dashboard/actions";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";

type UploadFieldMediaItem = {
  id: string;
  url: string;
  label: string;
  uploadedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type UploadFieldProps = {
  title: string;
  mediaItems: UploadFieldMediaItem[];
  fileInputName: string;
  valueInputName: string;
  defaultValue?: string;
  defaultValues?: string[];
  multiple?: boolean;
  dropzone?: boolean;
  maxUploadMb?: number;
  triggerLabel?: string;
  currentUsername?: string;
  onSelectionChange?: (urls: string[]) => void;
  emptyActionLabel?: string;
  filledActionLabel?: string;
};

type UploadTabKey = "media" | "url";

function parseUrlList(raw: string): string[] {
  return raw
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function withPreviewVersion(url: string): string {
  const safe = url.trim();
  if (!safe) return "";
  const sep = safe.includes("?") ? "&" : "?";
  return `${safe}${sep}picker=1`;
}

function toMonthBucketLabel(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = String(date.getFullYear()).slice(-2);
  return `${month} ${year}`;
}

function revokeObjectUrls(urls: string[]) {
  for (const url of urls) {
    URL.revokeObjectURL(url);
  }
}

function mergeMediaUnique(
  previous: UploadFieldMediaItem[],
  incoming: UploadFieldMediaItem[],
): UploadFieldMediaItem[] {
  const seen = new Set<string>();
  const ordered = [...incoming, ...previous];
  const output: UploadFieldMediaItem[] = [];
  for (const item of ordered) {
    const key = item.url.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

export function UploadField({
  title,
  mediaItems,
  fileInputName,
  valueInputName,
  defaultValue = "",
  defaultValues = [],
  multiple = false,
  dropzone = false,
  maxUploadMb = 15,
  triggerLabel = "Upload",
  currentUsername = "",
  onSelectionChange,
  emptyActionLabel,
  filledActionLabel,
}: UploadFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<UploadTabKey>("media");
  const [search, setSearch] = useState("");
  const [uploadByFilter, setUploadByFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [mediaLibrary, setMediaLibrary] = useState<UploadFieldMediaItem[]>(mediaItems);
  const [selectedUrls, setSelectedUrls] = useState<string[]>(() => {
    if (multiple) return defaultValues.filter(Boolean);
    return defaultValue ? [defaultValue] : [];
  });
  const [mediaDraft, setMediaDraft] = useState<string[]>([]);
  const [urlDraft, setUrlDraft] = useState("");
  const [isUploadingToMedia, setIsUploadingToMedia] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [localCount, setLocalCount] = useState(0);
  const [localPreviews, setLocalPreviews] = useState<string[]>([]);

  const localInputRef = useRef<HTMLInputElement | null>(null);
  const modalUploadInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMediaLibrary((previous) => mergeMediaUnique(previous, mediaItems));
  }, [mediaItems]);

  useEffect(() => {
    if (!onSelectionChange) return;
    onSelectionChange(selectedUrls);
  }, [onSelectionChange, selectedUrls]);

  useEffect(() => {
    return () => {
      revokeObjectUrls(localPreviews);
    };
  }, [localPreviews]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function syncLocalFiles(nextFiles: File[]) {
    const files = multiple ? nextFiles : nextFiles.slice(0, 1);
    if (localInputRef.current) {
      const transfer = new DataTransfer();
      for (const file of files) {
        transfer.items.add(file);
      }
      localInputRef.current.files = transfer.files;
    }

    revokeObjectUrls(localPreviews);
    setLocalCount(files.length);
    setLocalPreviews(files.slice(0, 12).map((file) => URL.createObjectURL(file)));
  }

  function handleLocalChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    syncLocalFiles(files);
  }

  function appendLocalFiles(incomingFiles: File[]) {
    const incoming = incomingFiles.filter((file) => file.type.startsWith("image/"));
    if (incoming.length === 0) return;

    const previousFiles = Array.from(localInputRef.current?.files ?? []);
    const seen = new Set(previousFiles.map((file) => `${file.name}:${file.size}:${file.lastModified}`));
    const merged = [...previousFiles];
    for (const file of incoming) {
      const key = `${file.name}:${file.size}:${file.lastModified}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(file);
    }
    syncLocalFiles(merged);
  }

  function removeLocalAt(index: number) {
    if (!localInputRef.current) return;
    const files = Array.from(localInputRef.current.files ?? []);
    if (index < 0 || index >= files.length) return;
    const nextFiles = files.filter((_, itemIndex) => itemIndex !== index);
    syncLocalFiles(nextFiles);
  }

  function removeSelectedUrl(targetUrl: string) {
    setSelectedUrls((previous) => previous.filter((url) => url !== targetUrl));
    setMediaDraft((previous) => previous.filter((url) => url !== targetUrl));
  }

  function openModal() {
    setActiveTab("media");
    setSearch("");
    setUploadByFilter("all");
    setDateFilter("all");
    setUploadFeedback("");
    setMediaDraft(selectedUrls);
    setUrlDraft(multiple ? selectedUrls.join("\n") : selectedUrls[0] ?? "");
    setIsOpen(true);
  }

  function applySelection() {
    if (activeTab === "media") {
      const next = multiple ? mediaDraft : mediaDraft.slice(0, 1);
      setSelectedUrls(next);
      setIsOpen(false);
      return;
    }
    const urls = parseUrlList(urlDraft);
    setSelectedUrls(multiple ? urls : urls.slice(0, 1));
    setIsOpen(false);
  }

  async function handleModalUpload(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    event.target.value = "";
    if (picked.length === 0) return;

    setUploadFeedback("");
    setIsUploadingToMedia(true);
    try {
      const files = multiple ? picked : picked.slice(0, 1);
      const formData = new FormData();
      for (const file of files) {
        formData.append("mediaFiles", file);
      }
      const result = await uploadMediaSilentlyAction(formData);
      if (!result.ok || !result.items || result.items.length === 0) {
        setUploadFeedback(result.message || "Upload failed.");
        return;
      }

      const uploadedItems = result.items;
      setMediaLibrary((previous) => mergeMediaUnique(previous, uploadedItems));
      const uploadedUrls = uploadedItems.map((item) => item.url);
      const nextSelected = multiple
        ? Array.from(new Set([...selectedUrls, ...uploadedUrls]))
        : [uploadedUrls[uploadedUrls.length - 1]];

      setSelectedUrls(nextSelected);
      setMediaDraft(nextSelected);
      setActiveTab("media");
      setUploadFeedback(`${uploadedItems.length} image uploaded and selected.`);
    } finally {
      setIsUploadingToMedia(false);
    }
  }

  const monthOptions = useMemo(() => {
    const buckets = new Map<string, { label: string; sortKey: string }>();
    for (const item of mediaLibrary) {
      const sourceDate = (item.createdAt || item.updatedAt || "").slice(0, 10);
      if (!sourceDate) continue;
      const label = toMonthBucketLabel(sourceDate);
      if (!label) continue;
      const existing = buckets.get(label);
      if (!existing || sourceDate > existing.sortKey) {
        buckets.set(label, { label, sortKey: sourceDate });
      }
    }
    return Array.from(buckets.values())
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
      .map((item) => item.label);
  }, [mediaLibrary]);

  const uploadByOptions = useMemo(() => {
    const uploaders = new Set(
      mediaLibrary
        .map((item) => (item.uploadedBy ?? "").trim())
        .filter((value) => Boolean(value)),
    );
    const list = Array.from(uploaders).sort((a, b) => a.localeCompare(b));
    const mine = currentUsername.trim();
    const others = list.filter((value) => value !== mine);
    const options: Array<{ value: string; label: string }> = [{ value: "all", label: "All Users" }];
    if (mine) options.push({ value: "mine", label: "Mine" });
    for (const user of others) {
      options.push({ value: `user:${user}`, label: user });
    }
    return options;
  }, [currentUsername, mediaLibrary]);

  const filteredMedia = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mediaLibrary.filter((item) => {
      const matchesQuery =
        !query ||
        item.label.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query);
      if (!matchesQuery) return false;

      const uploader = (item.uploadedBy ?? "").trim();
      if (uploadByFilter === "mine" && uploader !== currentUsername.trim()) return false;
      if (uploadByFilter.startsWith("user:")) {
        const target = uploadByFilter.slice("user:".length);
        if (uploader !== target) return false;
      }

      if (dateFilter !== "all") {
        const sourceDate = (item.createdAt || item.updatedAt || "").slice(0, 10);
        if (!sourceDate) return false;
        return toMonthBucketLabel(sourceDate) === dateFilter;
      }

      return true;
    });
  }, [currentUsername, dateFilter, mediaLibrary, search, uploadByFilter]);

  const hasLocalSelection = localCount > 0;
  const hasRemoteSelection = selectedUrls.length > 0;
  const hasAnySelection = hasLocalSelection || hasRemoteSelection;
  const resolvedValue = multiple ? selectedUrls.join("\n") : selectedUrls[0] ?? "";
  const resolvedEmptyActionLabel = emptyActionLabel || (multiple ? "Add Photo" : "Add Image");
  const resolvedFilledActionLabel = filledActionLabel || (multiple ? "Add more" : resolvedEmptyActionLabel);
  const launcherLabel = hasAnySelection ? resolvedFilledActionLabel : resolvedEmptyActionLabel;

  const tabs: Array<{ key: UploadTabKey; label: string }> = [
    { key: "media", label: "Media" },
    { key: "url", label: "Choose from URL" },
  ];

  const modal = isOpen && typeof document !== "undefined"
    ? createPortal(
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/55 p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="flex h-[80vh] w-[80vw] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-semibold leading-none text-slate-600 transition hover:scale-105 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
              aria-label="Close media picker"
            >
              x
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "site-primary-bg text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={modalUploadInputRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleModalUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => modalUploadInputRef.current?.click()}
                disabled={isUploadingToMedia}
                className="cursor-pointer rounded-lg border border-[#2271b1] bg-white px-3 py-1.5 text-sm font-semibold text-[#2271b1] transition hover:bg-[#f0f7ff] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUploadingToMedia ? "Uploading..." : "Choose Image From Computer"}
              </button>
              <span className="text-xs text-slate-500">Max {maxUploadMb} MB</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {uploadFeedback ? (
              <p className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                {uploadFeedback}
              </p>
            ) : null}

            {activeTab === "media" ? (
              <div className="space-y-3">
                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_250px_180px]">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search media..."
                      className="w-full bg-transparent text-sm outline-none"
                    />
                    {search.trim() ? (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="cursor-pointer rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>
                  <select
                    value={uploadByFilter}
                    onChange={(event) => setUploadByFilter(event.target.value)}
                    className="cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                  >
                    {uploadByOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {`Upload by: ${option.label}`}
                      </option>
                    ))}
                  </select>
                  <select
                    value={dateFilter}
                    onChange={(event) => setDateFilter(event.target.value)}
                    className="cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="all">All Dates</option>
                    {monthOptions.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                {filteredMedia.length === 0 ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    No image found.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {filteredMedia.map((item) => {
                      const checked = mediaDraft.includes(item.url);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (multiple) {
                              setMediaDraft((previous) =>
                                previous.includes(item.url)
                                  ? previous.filter((url) => url !== item.url)
                                  : [...previous, item.url],
                              );
                              return;
                            }
                            setMediaDraft([item.url]);
                          }}
                          className={`cursor-pointer rounded-xl border p-2 text-left transition ${
                            checked
                              ? "site-primary-border site-primary-soft-bg"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <img
                            src={withPreviewVersion(item.url)}
                            alt={item.label}
                            className="h-24 w-full rounded-lg object-cover"
                          />
                          <p className="mt-2 truncate text-xs font-semibold text-slate-700">{item.label}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === "url" ? (
              <div className="space-y-3">
                {multiple ? (
                  <textarea
                    rows={8}
                    value={urlDraft}
                    onChange={(event) => setUrlDraft(event.target.value)}
                    placeholder={"https://example.com/a.jpg\nhttps://example.com/b.png"}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                ) : (
                  <input
                    type="url"
                    value={urlDraft}
                    onChange={(event) => setUrlDraft(event.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                )}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center justify-start gap-2 border-t border-slate-200 px-4 py-3">
            <button
              type="button"
              onClick={applySelection}
              className="min-w-[92px] cursor-pointer rounded-lg site-primary-bg px-3 py-1.5 text-sm font-semibold text-white transition site-primary-bg-hover"
            >
              Choose
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )
    : null;

  return (
    <div className="space-y-2">
      <input
        ref={localInputRef}
        name={fileInputName}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleLocalChange}
        className="hidden"
      />
      <input type="hidden" name={valueInputName} value={resolvedValue} />

      {dropzone ? (
        <button
          type="button"
          onClick={openModal}
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
            appendLocalFiles(Array.from(event.dataTransfer.files ?? []));
          }}
          className={`flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed text-sm font-semibold transition ${
            dragActive
              ? "border-[#2ea2cc] bg-[#2ea2cc]/10 text-[#2271b1]"
              : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
          }`}
        >
          <span className="text-xl leading-none">+</span>
          <span>{launcherLabel}</span>
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openModal}
            className="cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {triggerLabel}
          </button>
        </div>
      )}

      {localCount > 0 ? (
        <p className="text-xs font-semibold text-slate-600">{localCount} local image(s) selected.</p>
      ) : selectedUrls.length > 0 ? (
        <p className="text-xs font-semibold text-slate-600">{selectedUrls.length} remote image(s) selected.</p>
      ) : (
        <p className="text-xs text-slate-500">No image selected yet.</p>
      )}

      {localPreviews.length > 0 ? (
        <div className={`grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 ${multiple ? "grid-cols-3 md:grid-cols-4" : "grid-cols-1"}`}>
          {localPreviews.map((url, index) => (
            <div key={`${url}-local-${index}`} className="relative">
              <img src={url} alt="Local selected preview" className={`${multiple ? "h-16" : "h-44"} w-full rounded-lg object-cover`} />
              <button
                type="button"
                onClick={() => removeLocalAt(index)}
                className="absolute right-1 top-1 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-slate-900/70 text-[12px] font-semibold text-white shadow-sm transition hover:scale-105 hover:bg-rose-600"
                aria-label="Remove selected image"
              >
                x
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {selectedUrls.length > 0 ? (
        <div className={`grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 ${multiple ? "grid-cols-3 md:grid-cols-4" : "grid-cols-1"}`}>
          {selectedUrls.slice(0, multiple ? 12 : 1).map((url) => (
            <div key={url} className="relative">
              <img
                src={withPreviewVersion(url)}
                alt="Selected media"
                className={`${multiple ? "h-16" : "h-44"} w-full rounded-lg object-cover`}
              />
              <button
                type="button"
                onClick={() => removeSelectedUrl(url)}
                className="absolute right-1 top-1 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-slate-900/70 text-[12px] font-semibold text-white shadow-sm transition hover:scale-105 hover:bg-rose-600"
                aria-label="Remove selected image"
              >
                x
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {modal}
    </div>
  );
}
