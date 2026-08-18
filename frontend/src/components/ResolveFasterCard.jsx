import React from "react";

function ResolveFasterCard({
  title = "Login",
  description = "Login issues, forgot password, OTP not received, account locked",
  url = "https://www.mstock.com/faqs",
  onOpenApp,
  lightTheme = true,
}) {
  const handleOpen = () => {
    if (onOpenApp) {
      onOpenApp();
    } else if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.open("https://www.mstock.com/faqs", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={`
        w-full
        rounded-2xl
        border
        transition-all
        duration-200
        p-5
        md:p-6
        mb-6
        flex
        flex-col
        sm:flex-row
        sm:items-center
        justify-between
        gap-4
        shadow-sm
        ${
          lightTheme
            ? "bg-[#f8fbff] border-[#d8e6fa]"
            : "bg-slate-900/80 border-slate-700/80 text-white"
        }
      `}
    >
      <div className="flex-1">
        <p
          className={`
            text-[11px]
            md:text-xs
            font-bold
            tracking-wider
            uppercase
            mb-1
            ${lightTheme ? "text-blue-600" : "text-blue-400"}
          `}
        >
          RESOLVE FASTER — GO DIRECTLY TO
        </p>

        <h3
          className={`
            text-lg
            md:text-xl
            font-bold
            leading-tight
            ${lightTheme ? "text-[#102a43]" : "text-white"}
          `}
        >
          {title}
        </h3>

        <p
          className={`
            text-xs
            md:text-sm
            mt-1
            ${lightTheme ? "text-[#627d98]" : "text-slate-400"}
          `}
        >
          {description}
        </p>
      </div>

      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={handleOpen}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            bg-[#1765ff]
            hover:bg-[#0f52d6]
            active:scale-[0.98]
            text-white
            font-semibold
            text-sm
            px-5
            py-2.5
            rounded-xl
            shadow-sm
            transition-all
            duration-150
            cursor-pointer
          "
        >
          <span>Open in App</span>
          <span className="text-base leading-none">→</span>
        </button>
      </div>
    </div>
  );
}

export default ResolveFasterCard;
