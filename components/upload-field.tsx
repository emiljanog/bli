"use client";

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
  triggerLabel?: string;
  currentUsername?: string;
};

type UploadTabKey = "choose" | "media" | "url";

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

export function UploadField({
  title,
  mediaItems,
  fileInputName,
  valueInputName,
  defaultValue = "",
  defaultValues = [],
  multiple = false,
  triggerLabel = "Upload",
  currentUsername = "",
}: UploadFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<UploadTabKey>("choose");
  const [search, setSearch] = useState("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>(() => {
    if (multiple) {
      return defaultValues.filter(Boolean);
    }
    return defaultValue ? [defaultValue] : [];
  });
  const [mediaDraft, setMediaDraft] = useState<string[]>([]);
  const [urlDraft, setUrlDraft] = useState("");
  const [localNames, setLocalNames] = useState<string[]>([]);
  const [localPreviews, setLocalPreviews] = useState<string[]>([]);
  const [localCount, setLocalCount] = useState(0);
  const [uploadByFilter, setUploadByFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const localInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      localPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [localPreviews]);

  function handleLocalChange(event: ChangeEvent<HTMLInputElement>) {
    localPreviews.forEach((url) => URL.revokeObjectURL(url));
    const files = Array.from(event.target.files ?? []);
    setLocalCount(files.length);
    setLocalNames(files.map((file) => file.name));
    setLocalPreviews(files.slice(0, 12).map((file) => URL.createObjectURL(file)));
  }

  function removeSelectedUrl(targetUrl: string) {
    setSelectedUrls((previous) => previous.filter((url) => url !== targetUrl));
    setMediaDraft((previous) => previous.filter((url) => url !== targetUrl));
  }

  function removeLocalAt(index: number) {
    if (!localInputRef.current) return;
    const files = Array.from(localInputRef.current.files ?? []);
    if (files.length === 0 || index < 0 || index >= files.length) return;

    const nextFiles = files.filter((_, itemIndex) => itemIndex !== index);
    const dataTransfer = new DataTransfer();
    nextFiles.forEach((file) => dataTransfer.items.add(file));
    localInputRef.current.files = dataTransfer.files;

    setLocalNames(nextFiles.map((file) => file.name));
    setLocalCount(nextFiles.length);
    setLocalPreviews((previous) => {
      const target = previous[index];
      if (target) URL.revokeObjectURL(target);
      return previous.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function openModal() {
    setActiveTab("choose");
    setSearch("");
    setUploadByFilter("all");
    setDateFilter("all");
    setMediaDraft(selectedUrls);
    setUrlDraft(multiple ? selectedUrls.join("\n") : selectedUrls[0] ?? "");
    setIsOpen(true);
  }

  function applySelection() {
    if (activeTab === "choose") {
      setSelectedUrls([]);
      setIsOpen(false);
      return;
    }

    if (activeTab === "media") {
      setSelectedUrls(multiple ? mediaDraft : mediaDraft.slice(0, 1));
      setIsOpen(false);
      return;
    }

    const urls = parseUrlList(urlDraft);
    setSelectedUrls(multiple ? urls : urls.slice(0, 1));
    setIsOpen(false);
  }

  const monthOptions = useMemo(() => {
    const buckets = new Map<string, { label: string; sortKey: string }>();
    for (const item of mediaItems) {
      const sourceDate = (item.createdAt || item.updatedAt || "").slice(0, 10);
      if (!sourceDate) continue;
      const label = toMonthBucketLabel(sourceDate);
      if (!label) continue;
      const current = buckets.get(label);
      if (!current || sourceDate > current.sortKey) {
        buckets.set(label, { label, sortKey: sourceDate });
      }
    }
    return Array.from(buckets.values())
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
      .map((item) => item.label);
  }, [mediaItems]);

  const uploadByOptions = useMemo(() => {
    const set = new Set(
      mediaItems.map((item) => (item.uploadedBy ?? "").trim()).filter((value) => Boolean(value)),
    );
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    const mine = currentUsername.trim();
    const others = list.filter((value) => value !== mine);
    const options: Array<{ value: string; label: string }> = [{ value: "all", label: "All Users" }];
    if (mine) {
      options.push({ value: "mine", label: "Mine" });
    }
    for (const user of others) {
      options.push({ value: `user:${user}`, label: user });
    }
    return options;
  }, [currentUsername, mediaItems]);

  const filteredMedia = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mediaItems.filter((item) => {
      const label = item.label.toLowerCase();
      const url = item.url.toLowerCase();
      const matchesQuery = !query || label.includes(query) || url.includes(query);
      if (!matchesQuery) return false;

      const uploader = (item.uploadedBy ?? "").trim();
      if (uploadByFilter === "mine") {
        if (uploader !== currentUsername.trim()) return false;
      }
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
  }, [currentUsername, dateFilter, mediaItems, search, uploadByFilter]);

  const resolvedValue = multiple ? selectedUrls.join("\n") : selectedUrls[0] ?? "";
  const tabs: Array<{ key: UploadTabKey; label: string }> = [
    { key: "choose", label: "Choose Image" },
    { key: "media", label: "Media" },
    { key: "url", label: "Choose from URL" },
  ];

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

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={openModal}
          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          {triggerLabel}
        </button>
      </div>

      {localCount > 0 ? (
        <p className="text-xs font-semibold text-slate-600">{localCount} local image(s) selected.</p>
      ) : selectedUrls.length > 0 ? (
        <p className="text-xs font-semibold text-slate-600">{selectedUrls.length} remote image(s) selected.</p>
      ) : (
        <p className="text-xs text-slate-500">No image selected yet.</p>
      )}

      {localPreviews.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 md:grid-cols-4">
          {localPreviews.map((url, index) => (
            <div key={`${url}-outside-${index}`} className="relative">
              <img src={url} alt="Local selected preview" className="h-16 w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => removeLocalAt(index)}
                className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/75 text-xs font-bold text-white transition hover:bg-slate-900"
              >
                X
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {selectedUrls.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 md:grid-cols-4">
          {selectedUrls.slice(0, 8).map((url) => (
            <div key={url} className="relative">
              <img src={withPreviewVersion(url)} alt="Selected media" className="h-16 w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => removeSelectedUrl(url)}
                className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/75 text-xs font-bold text-white transition hover:bg-slate-900"
              >
                X
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {isOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/55 p-4">
          <div className="flex h-[80vh] w-[80vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "site-primary-bg text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {activeTab === "choose" ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => localInputRef.current?.click()}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Choose Image From Computer
                  </button>
                  {localNames.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-700">Selected files:</p>
                      <p className="mt-1 text-xs text-slate-600">{localNames.join(", ")}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">No local file selected.</p>
                  )}

                  {localPreviews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      {localPreviews.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative">
                          <img src={url} alt="Local preview" className="h-28 w-full rounded-lg object-cover" />
                          <button
                            type="button"
                            onClick={() => removeLocalAt(index)}
                            className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/75 text-xs font-bold text-white transition hover:bg-slate-900"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
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
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Clear
                        </button>
                      ) : null}
                    </div>
                    <select
                      value={uploadByFilter}
                      onChange={(event) => setUploadByFilter(event.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
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
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
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
                            className={`rounded-xl border p-2 text-left transition ${
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
                className="min-w-[92px] rounded-lg site-primary-bg px-3 py-1.5 text-sm font-semibold text-white transition site-primary-bg-hover"
              >
                Choose
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
