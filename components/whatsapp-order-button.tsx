"use client";

type WhatsAppOrderButtonProps = {
  productPath: string;
  className?: string;
};

const WHATSAPP_PHONE = "355693342213";

export function WhatsAppOrderButton({ productPath, className }: WhatsAppOrderButtonProps) {
  const handleClick = () => {
    const currentUrl =
      typeof window !== "undefined"
        ? window.location.href
        : productPath.startsWith("http")
          ? productPath
          : `https://bli.al${productPath}`;
    const text = `Dua te porosis kete produkt: ${currentUrl}`;
    const href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
    if (typeof window !== "undefined") {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${className ?? ""} inline-flex cursor-pointer items-center justify-center gap-2`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M12 3.5a8.5 8.5 0 0 0-7.4 12.7L4 20l3.9-.9A8.5 8.5 0 1 0 12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.2 8.8c.2-.4.5-.4.7-.4h.6c.2 0 .4.1.5.3l.8 1.8c.1.2.1.4 0 .6l-.5.8c-.1.2-.1.4 0 .5.4.7 1 1.3 1.7 1.7.2.1.4.1.5 0l.8-.5c.2-.1.4-.1.6 0l1.8.8c.2.1.3.3.3.5v.6c0 .2 0 .5-.4.7-.5.3-1.4.3-2.7-.3a8.1 8.1 0 0 1-3.8-3.8c-.6-1.3-.6-2.2-.3-2.7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Porosit me WhatsApp
    </button>
  );
}
