"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createProductPreviewSilentlyAction,
  publishProductSilentlyAction,
  saveProductDraftSilentlyAction,
} from "@/app/dashboard/actions";

type ProductVisibility = "Public" | "LoggedUsers" | "Password";

type AdminNewProductPublishPanelProps = {
  formId: string;
  initialReservedId?: string;
  embedded?: boolean;
  initialProductId?: string;
  initialSlug?: string;
  initialStatus?: "Draft" | "Published";
  initialVisibility?: ProductVisibility;
  initialVisibilityPassword?: string;
  canMoveToTrash?: boolean;
  trashFormId?: string;
};

type PersistedEditDraft = {
  version: 1;
  productId: string;
  savedAt: number;
  valuesByName: Record<string, string[]>;
  checkedByNameValue: Record<string, boolean>;
};

const EDIT_DRAFT_STORAGE_PREFIX = "bli:product-edit-last-changes:";

function buildFormSnapshot(form: HTMLFormElement): string {
  const rows: string[] = [];
  const elements = Array.from(form.elements);
  for (const element of elements) {
    if (
      !(element instanceof HTMLInputElement) &&
      !(element instanceof HTMLTextAreaElement) &&
      !(element instanceof HTMLSelectElement)
    ) {
      continue;
    }

    const name = element.name?.trim();
    if (!name) continue;

    if (element instanceof HTMLInputElement && element.type === "file") {
      const files = Array.from(element.files ?? [])
        .map((file) => `${file.name}:${file.size}`)
        .join("|");
      rows.push(`${name}=[${files}]`);
      continue;
    }

    if (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")) {
      rows.push(`${name}:${element.checked ? "1" : "0"}:${element.value}`);
      continue;
    }

    rows.push(`${name}=${element.value}`);
  }

  rows.sort((a, b) => a.localeCompare(b));
  return rows.join("&");
}

function buildEditDraftStorageKey(productId: string): string {
  return `${EDIT_DRAFT_STORAGE_PREFIX}${productId}`;
}

function captureFormDraftState(form: HTMLFormElement, productId: string): PersistedEditDraft {
  const valuesByName: Record<string, string[]> = {};
  const checkedByNameValue: Record<string, boolean> = {};

  for (const node of Array.from(form.elements)) {
    if (
      !(node instanceof HTMLInputElement) &&
      !(node instanceof HTMLTextAreaElement) &&
      !(node instanceof HTMLSelectElement)
    ) {
      continue;
    }

    const name = node.name?.trim();
    if (!name) continue;

    if (node instanceof HTMLInputElement && node.type === "file") {
      continue;
    }

    if (node instanceof HTMLInputElement && (node.type === "checkbox" || node.type === "radio")) {
      checkedByNameValue[`${name}::${node.value}`] = node.checked;
      continue;
    }

    if (node instanceof HTMLSelectElement && node.multiple) {
      valuesByName[name] = Array.from(node.selectedOptions).map((item) => item.value);
      continue;
    }

    valuesByName[name] = [node.value];
  }

  return {
    version: 1,
    productId,
    savedAt: Date.now(),
    valuesByName,
    checkedByNameValue,
  };
}

function applyFormDraftState(form: HTMLFormElement, draft: PersistedEditDraft): void {
  for (const node of Array.from(form.elements)) {
    if (
      !(node instanceof HTMLInputElement) &&
      !(node instanceof HTMLTextAreaElement) &&
      !(node instanceof HTMLSelectElement)
    ) {
      continue;
    }

    const name = node.name?.trim();
    if (!name) continue;

    if (node instanceof HTMLInputElement && node.type === "file") {
      continue;
    }

    if (node instanceof HTMLInputElement && (node.type === "checkbox" || node.type === "radio")) {
      const key = `${name}::${node.value}`;
      if (Object.prototype.hasOwnProperty.call(draft.checkedByNameValue, key)) {
        node.checked = Boolean(draft.checkedByNameValue[key]);
      }
      continue;
    }

    if (node instanceof HTMLSelectElement && node.multiple) {
      const selected = new Set(draft.valuesByName[name] ?? []);
      for (const option of Array.from(node.options)) {
        option.selected = selected.has(option.value);
      }
      continue;
    }

    const values = draft.valuesByName[name];
    if (!values || values.length === 0) continue;
    node.value = values[0] ?? "";
  }

  form.dispatchEvent(new Event("input", { bubbles: true }));
  form.dispatchEvent(new Event("change", { bubbles: true }));
}

function parsePersistedEditDraft(raw: string | null): PersistedEditDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Record<string, unknown>;
    if (record.version !== 1) return null;
    if (typeof record.productId !== "string" || !record.productId.trim()) return null;
    if (!Number.isFinite(Number(record.savedAt))) return null;
    if (!record.valuesByName || typeof record.valuesByName !== "object") return null;
    if (!record.checkedByNameValue || typeof record.checkedByNameValue !== "object") return null;
    return {
      version: 1,
      productId: record.productId,
      savedAt: Number(record.savedAt),
      valuesByName: record.valuesByName as Record<string, string[]>,
      checkedByNameValue: record.checkedByNameValue as Record<string, boolean>,
    };
  } catch {
    return null;
  }
}

export function AdminNewProductPublishPanel({
  formId,
  initialReservedId = "",
  embedded = false,
  initialProductId = "",
  initialSlug = "",
  initialStatus = "Draft",
  initialVisibility = "Public",
  initialVisibilityPassword = "",
  canMoveToTrash = false,
  trashFormId = "",
}: AdminNewProductPublishPanelProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(initialProductId);
  const [status, setStatus] = useState<"Draft" | "Published">(initialStatus);
  const [knownSlug, setKnownSlug] = useState(initialSlug);
  const [visibility, setVisibility] = useState<ProductVisibility>(initialVisibility);
  const [visibilityPassword, setVisibilityPassword] = useState(initialVisibilityPassword);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [publishNotice, setPublishNotice] = useState<"published" | "updated" | null>(null);
  const [restoreNotice, setRestoreNotice] = useState("");
  const [editingRow, setEditingRow] = useState<"status" | "visibility" | "publish" | null>(null);

  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localAutosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialSnapshotRef = useRef("");
  const serverStateRef = useRef<PersistedEditDraft | null>(null);
  const lastObservedSnapshotRef = useRef("");
  const lastSavedSnapshotRef = useRef("");
  const hasPendingChangesRef = useRef(false);

  const getForm = useCallback((): HTMLFormElement | null => {
    const node = document.getElementById(formId);
    return node instanceof HTMLFormElement ? node : null;
  }, [formId]);

  const refreshSavedSnapshotSoon = useCallback(() => {
    const form = getForm();
    if (!form) return;
    setTimeout(() => {
      const next = buildFormSnapshot(form);
      lastObservedSnapshotRef.current = next;
      lastSavedSnapshotRef.current = next;
    }, 0);
  }, [getForm]);

  const resolveSlugFromForm = useCallback((): string => {
    const form = getForm();
    if (!form) return knownSlug.trim();
    const slugField = form.querySelector<HTMLInputElement>('input[name="slug"]');
    const slugFromForm = slugField?.value.trim() ?? "";
    return slugFromForm || knownSlug.trim();
  }, [getForm, knownSlug]);

  const resolvePersistedProductId = useCallback((): string => {
    return (productId || initialProductId).trim();
  }, [initialProductId, productId]);

  const clearLocalEditDraft = useCallback((explicitProductId?: string) => {
    if (typeof window === "undefined") return;
    const id = (explicitProductId ?? resolvePersistedProductId()).trim();
    if (!id) return;
    window.localStorage.removeItem(buildEditDraftStorageKey(id));
  }, [resolvePersistedProductId]);

  const saveLocalEditDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    const id = resolvePersistedProductId();
    if (!id) return;
    const form = getForm();
    if (!form) return;
    const snapshot = buildFormSnapshot(form);
    if (snapshot === lastSavedSnapshotRef.current) {
      clearLocalEditDraft(id);
      return;
    }
    const payload = captureFormDraftState(form, id);
    window.localStorage.setItem(buildEditDraftStorageKey(id), JSON.stringify(payload));
  }, [clearLocalEditDraft, getForm, resolvePersistedProductId]);

  const saveDraft = useCallback(async (options?: { force?: boolean; silent?: boolean }) => {
    const force = Boolean(options?.force);
    const silent = Boolean(options?.silent);
    if (isSavingDraft || isPublishing) return { ok: false as const };

    const form = getForm();
    if (!form) return { ok: false as const };

    const currentSnapshot = buildFormSnapshot(form);
    const hasUserChanges = currentSnapshot !== initialSnapshotRef.current;
    const changedSinceLastSave = currentSnapshot !== lastSavedSnapshotRef.current;
    if (!force && (!hasUserChanges || !changedSinceLastSave)) {
      return { ok: true as const, skipped: true as const };
    }

    if (!silent) {
      setFeedback("");
    }
    setIsSavingDraft(true);
    try {
      const formData = new FormData(form);
      formData.set("publishStatus", "Draft");
      formData.set("productId", productId);
      formData.set("visibility", visibility);
      formData.set("visibilityPassword", visibility === "Password" ? visibilityPassword : "");
      const result = await saveProductDraftSilentlyAction(formData);
      if (!result?.ok || !result.productId) {
        if (!silent) {
          setFeedback(result?.message || "Draft was not saved.");
        }
        return { ok: false as const };
      }

      setProductId(result.productId);
      setStatus("Draft");
      if (result.slug) {
        setKnownSlug(result.slug);
      } else {
        const fallbackSlug = resolveSlugFromForm();
        if (fallbackSlug) setKnownSlug(fallbackSlug);
      }
      hasPendingChangesRef.current = false;
      refreshSavedSnapshotSoon();
      if (!silent) {
        setFeedback("Draft saved.");
      }
      return {
        ok: true as const,
        productId: result.productId,
        slug: result.slug || "",
      };
    } finally {
      setIsSavingDraft(false);
    }
  }, [getForm, isPublishing, isSavingDraft, productId, refreshSavedSnapshotSoon, resolveSlugFromForm, visibility, visibilityPassword]);

  const scheduleAutosave = useCallback(() => {
    if (status !== "Draft") return;
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      autosaveTimerRef.current = null;
      void saveDraft({ force: false, silent: true });
    }, 700);
  }, [saveDraft, status]);

  const scheduleLocalDraftAutosave = useCallback(() => {
    if (status !== "Published") return;
    if (localAutosaveTimerRef.current) {
      clearTimeout(localAutosaveTimerRef.current);
    }
    localAutosaveTimerRef.current = setTimeout(() => {
      localAutosaveTimerRef.current = null;
      saveLocalEditDraft();
    }, 5000);
  }, [saveLocalEditDraft, status]);

  async function handleSaveDraftClick() {
    setPublishNotice(null);
    setRestoreNotice("");
    await saveDraft({ force: true, silent: false });
  }

  async function handlePreviewClick() {
    setFeedback("");
    if (status === "Published") {
      const form = getForm();
      if (!form) return;

      const currentSnapshot = buildFormSnapshot(form);
      const hasChanges = currentSnapshot !== lastSavedSnapshotRef.current;
      let previewSlug = resolveSlugFromForm();

      if (hasChanges) {
        if (isPublishing || isSavingDraft || isPreparingPreview) return;
        setIsPreparingPreview(true);
        setPublishNotice(null);
        try {
          const formData = new FormData(form);
          formData.set("productId", productId);
          formData.set("visibility", visibility);
          formData.set("visibilityPassword", visibility === "Password" ? visibilityPassword : "");
          const result = await createProductPreviewSilentlyAction(formData);
          if (!result?.ok || !result.slug || !result.draftToken) {
            setFeedback(result?.message || "Preview is unavailable.");
            return;
          }
          previewSlug = result.slug || resolveSlugFromForm();
          if (previewSlug) {
            setKnownSlug(previewSlug);
          }
          window.open(`/product/${previewSlug}?preview=1&draftToken=${encodeURIComponent(result.draftToken)}`, "_blank", "noopener,noreferrer");
          return;
        } finally {
          setIsPreparingPreview(false);
        }
      }

      if (!previewSlug) {
        setFeedback("View product is unavailable until slug is set.");
        return;
      }
      window.open(`/product/${previewSlug}`, "_blank", "noopener,noreferrer");
      return;
    }

    const saved = await saveDraft({ force: true, silent: true });
    if (!saved.ok || !saved.productId || !saved.slug) {
      setFeedback("Preview is unavailable until draft is saved.");
      return;
    }
    const previewUrl = `/product/${saved.slug}?preview=1`;
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  }

  async function handlePublishClick() {
    if (isPublishing || isSavingDraft) return;
    if (visibility === "Password" && !visibilityPassword.trim()) {
      setFeedback("Set a password for protected visibility.");
      return;
    }

    const form = getForm();
    if (!form) return;

    setFeedback("");
    setPublishNotice(null);
    setIsPublishing(true);
    try {
      const wasPublished = status === "Published";
      const formData = new FormData(form);
      formData.set("publishStatus", "Published");
      formData.set("productId", productId);
      formData.set("visibility", visibility);
      formData.set("visibilityPassword", visibility === "Password" ? visibilityPassword : "");
      const result = await publishProductSilentlyAction(formData);
      if (!result?.ok || !result.productId) {
        setFeedback(result?.message || "Publish failed.");
        return;
      }
      setProductId(result.productId);
      setStatus(result.publishStatus === "Published" ? "Published" : "Draft");
      if (result.slug) {
        setKnownSlug(result.slug);
      } else {
        const fallbackSlug = resolveSlugFromForm();
        if (fallbackSlug) setKnownSlug(fallbackSlug);
      }
      hasPendingChangesRef.current = false;
      refreshSavedSnapshotSoon();
      clearLocalEditDraft(result.productId);
      setRestoreNotice("");
      setPublishNotice(wasPublished ? "updated" : "published");
      router.push(`/dashboard/products/${result.productId}`);
      router.refresh();
    } finally {
      setIsPublishing(false);
    }
  }

  const handleDiscardRestoredChanges = useCallback(() => {
    const form = getForm();
    if (!form || !serverStateRef.current) return;
    applyFormDraftState(form, serverStateRef.current);
    const nextSnapshot = buildFormSnapshot(form);
    lastObservedSnapshotRef.current = nextSnapshot;
    hasPendingChangesRef.current = nextSnapshot !== lastSavedSnapshotRef.current;
    clearLocalEditDraft();
    setRestoreNotice("");
    setFeedback("");
  }, [clearLocalEditDraft, getForm]);

  useEffect(() => {
    const form = getForm();
    if (!form) return;

    const serverSnapshot = buildFormSnapshot(form);
    initialSnapshotRef.current = serverSnapshot;
    lastSavedSnapshotRef.current = serverSnapshot;
    serverStateRef.current = captureFormDraftState(form, resolvePersistedProductId() || "__server__");

    let observedSnapshot = serverSnapshot;
    if (typeof window !== "undefined" && status === "Published") {
      const id = resolvePersistedProductId();
      if (id) {
        const stored = parsePersistedEditDraft(window.localStorage.getItem(buildEditDraftStorageKey(id)));
        if (stored && stored.productId === id) {
          applyFormDraftState(form, stored);
          observedSnapshot = buildFormSnapshot(form);
          if (observedSnapshot !== serverSnapshot) {
            setRestoreNotice("Last changes restored.");
          } else {
            clearLocalEditDraft(id);
          }
        }
      }
    }
    lastObservedSnapshotRef.current = observedSnapshot;
    hasPendingChangesRef.current = observedSnapshot !== lastSavedSnapshotRef.current;

    pollTimerRef.current = setInterval(() => {
      const activeForm = getForm();
      if (!activeForm) return;
      const nextSnapshot = buildFormSnapshot(activeForm);
      if (nextSnapshot === lastObservedSnapshotRef.current) return;
      lastObservedSnapshotRef.current = nextSnapshot;
      hasPendingChangesRef.current = nextSnapshot !== lastSavedSnapshotRef.current;
      if (status === "Draft") {
        scheduleAutosave();
      } else if (status === "Published") {
        scheduleLocalDraftAutosave();
      }
    }, 450);

    const onVisibilityChange = () => {
      if (!document.hidden || !hasPendingChangesRef.current) return;
      if (status === "Draft") {
        void saveDraft({ force: false, silent: true });
      } else if (status === "Published") {
        saveLocalEditDraft();
      }
    };

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasPendingChangesRef.current) return;
      if (status === "Published") {
        saveLocalEditDraft();
      }
      event.preventDefault();
      event.returnValue = "";
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      if (localAutosaveTimerRef.current) {
        clearTimeout(localAutosaveTimerRef.current);
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [
    clearLocalEditDraft,
    getForm,
    resolvePersistedProductId,
    saveDraft,
    saveLocalEditDraft,
    scheduleAutosave,
    scheduleLocalDraftAutosave,
    status,
  ]);

  const visibilityLabel = useMemo(() => {
    if (visibility === "LoggedUsers") return "Logged Users";
    if (visibility === "Password") return "Password";
    return "Public";
  }, [visibility]);

  return (
    <article className={embedded ? "" : "rounded-2xl border border-slate-300 bg-[#ececed]"}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="publishStatus" value={status} />
      <input type="hidden" name="visibility" value={visibility} />
      <input type="hidden" name="visibilityPassword" value={visibility === "Password" ? visibilityPassword : ""} />

      {!embedded ? (
        <div className="border-b border-slate-300 px-4 py-3">
          <p className="text-[15px] font-semibold leading-none text-slate-900">Publish</p>
        </div>
      ) : null}

      <div className={`space-y-3 ${embedded ? "px-4 py-3" : "px-4 py-4"}`}>
        <div className={`grid gap-3 ${status === "Published" ? "grid-cols-1" : "grid-cols-2"}`}>
          {status === "Draft" ? (
            <button
              type="button"
              onClick={handleSaveDraftClick}
              disabled={isSavingDraft || isPublishing || isPreparingPreview}
              className="w-full cursor-pointer rounded-md border border-[#2271b1] bg-white px-4 py-2 text-sm font-semibold text-[#2271b1] transition hover:bg-[#f0f7ff] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingDraft ? "Saving..." : "Save Draft"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handlePreviewClick}
            disabled={isSavingDraft || isPublishing || isPreparingPreview}
            className="w-full cursor-pointer rounded-md border border-[#2271b1] bg-white px-4 py-2 text-sm font-semibold text-[#2271b1] transition hover:bg-[#f0f7ff] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPreparingPreview ? "Preparing..." : status === "Published" ? "Preview Changes" : "Preview"}
          </button>
        </div>

        <p className="text-sm text-slate-700">
          Status: <span className="font-semibold">{status}</span>{" "}
          <button
            type="button"
            onClick={() => setEditingRow((prev) => (prev === "status" ? null : "status"))}
            className="cursor-pointer text-[#2271b1] hover:underline"
          >
            Edit
          </button>
        </p>
        {editingRow === "status" ? (
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value === "Published" ? "Published" : "Draft")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#2271b1]"
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        ) : null}

        <p className="text-sm text-slate-700">
          Visibility: <span className="font-semibold">{visibilityLabel}</span>{" "}
          <button
            type="button"
            onClick={() => setEditingRow((prev) => (prev === "visibility" ? null : "visibility"))}
            className="cursor-pointer text-[#2271b1] hover:underline"
          >
            Edit
          </button>
        </p>
        {editingRow === "visibility" ? (
          <div className="space-y-2 rounded-md border border-slate-300 bg-white p-3">
            <select
              value={visibility}
              onChange={(event) => {
                const next = event.target.value as ProductVisibility;
                setVisibility(next === "LoggedUsers" || next === "Password" ? next : "Public");
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#2271b1]"
            >
              <option value="Public">Public</option>
              <option value="LoggedUsers">Logged Users</option>
              <option value="Password">Password Protected</option>
            </select>
            {visibility === "Password" ? (
              <input
                type="text"
                value={visibilityPassword}
                onChange={(event) => setVisibilityPassword(event.target.value)}
                placeholder="Set password"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#2271b1]"
              />
            ) : null}
          </div>
        ) : null}

        <p className="text-sm text-slate-700">
          Publish immediately{" "}
          <button
            type="button"
            onClick={() => setEditingRow((prev) => (prev === "publish" ? null : "publish"))}
            className="cursor-pointer text-[#2271b1] hover:underline"
          >
            Edit
          </button>
        </p>
        {editingRow === "publish" ? (
          <p className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-600">
            Product publishes instantly when you click Publish.
          </p>
        ) : null}

        <p className="text-sm text-slate-700">
          Catalog visibility: <span className="font-semibold">Shop and search results</span>
        </p>

        {productId ? (
          <p className="text-xs font-semibold text-slate-600">ID: {productId}</p>
        ) : (
          <p className="text-xs text-slate-500">
            ID: {initialReservedId || "Auto"} (reserved until first save)
          </p>
        )}

        {feedback ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            {feedback}
          </p>
        ) : null}

        {restoreNotice ? (
          <div className="flex items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
            <span>{restoreNotice}</span>
            <button
              type="button"
              onClick={handleDiscardRestoredChanges}
              className="cursor-pointer rounded border border-amber-300 bg-white px-2 py-1 text-[11px] font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              Cancel
            </button>
          </div>
        ) : null}

        {publishNotice ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            {publishNotice === "published" ? "Product published." : "Product updated."}{" "}
            <button
              type="button"
              onClick={() => {
                const slug = resolveSlugFromForm();
                if (!slug) return;
                window.open(`/product/${slug}`, "_blank", "noopener,noreferrer");
              }}
              className="cursor-pointer underline underline-offset-2 hover:text-emerald-800"
            >
              View Product
            </button>
          </p>
        ) : null}
      </div>

      <div className={`${embedded ? "px-4 pb-4 pt-1" : "border-t border-slate-300 px-4 py-3"}`}>
        <div className="flex items-center justify-between gap-3">
          {canMoveToTrash && trashFormId ? (
            <button
              type="submit"
              form={trashFormId}
              className="cursor-pointer text-sm font-semibold text-rose-700 underline underline-offset-2 transition hover:text-rose-800"
            >
              Move to Trash
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={handlePublishClick}
            disabled={isPublishing || isSavingDraft || isPreparingPreview}
            className="cursor-pointer rounded-md bg-[#2271b1] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1a5a8f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPublishing ? "Publishing..." : status === "Published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>
    </article>
  );
}
