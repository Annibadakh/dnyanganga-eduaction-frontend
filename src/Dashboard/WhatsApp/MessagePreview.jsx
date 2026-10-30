import { FileText, Image as ImageIcon, Video } from "lucide-react";
import { fileUrl } from "../../utils/fileUrl";

// WhatsApp-style bubble showing how a template will look. `values` maps var_index → text;
// a variable without a value shows its label (or {{n}}) highlighted.
const MessagePreview = ({ body = "", headerType = "none", headerUrl = "", labels = {}, values = {} }) => {
  const parts = body.split(/(\{\{\d+\}\})/g);

  const headerSrc = fileUrl(headerUrl);

  return (
    <div className="rounded-lg bg-[#e5ddd5] p-3 sm:p-4">
      <div className="max-w-sm rounded-lg rounded-tl-none bg-white shadow-sm overflow-hidden">
        {headerType !== "none" && (
          <div className="p-1">
            {headerType === "image" && headerSrc ? (
              <img src={headerSrc} alt="Header" className="w-full max-h-48 object-cover rounded" />
            ) : (
              <div className="h-24 rounded bg-gray-100 flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                {headerType === "image" && <ImageIcon size={22} />}
                {headerType === "video" && <Video size={22} />}
                {headerType === "document" && <FileText size={22} />}
                <span className="capitalize">{headerType} header</span>
              </div>
            )}
          </div>
        )}

        <p className="px-3 py-2 text-sm text-customblack whitespace-pre-wrap break-words">
          {body.trim() ? (
            parts.map((part, i) => {
              const match = part.match(/^\{\{(\d+)\}\}$/);
              if (!match) return part;
              const value = values[match[1]];
              if (value) return <span key={i} className="font-medium">{value}</span>;
              return (
                <span key={i} className="bg-blue-100 text-primary rounded px-1">
                  {labels[match[1]]?.trim() || part}
                </span>
              );
            })
          ) : (
            <span className="text-gray-400">Your message will appear here</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default MessagePreview;
