import { useRef } from "react";
import type { ChangeEvent, SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            {...props}
        >
            {children}
        </svg>
    );
}

type NavbarProps = {
    onUpload: (file: File) => void;
    uploading: boolean;
};

export default function Navbar({ onUpload, uploading }: NavbarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    function selectFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) onUpload(file);
        event.target.value = "";
    }

    return (
        <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
                <Icon className="h-6 w-6">
                    <path d="M21 16V8l-9-5-9 5v8l9 5 9-5Z" />
                    <path d="m3.3 7.8 8.7 5 8.7-5M12 22V12.8" />
                </Icon>
                <span className="text-xl font-bold">
                    BeyondDraw AI
                </span>
            </div>

            <div className="flex gap-5">
                <Icon className="h-6 w-6 cursor-pointer">
                    <path d="M2 7h5l2 3h13v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7Z" />
                    <path d="M2 10h20" />
                </Icon>
                <input ref={inputRef} className="hidden" type="file" accept=".step,.stp,.iges,.igs,.stl" onChange={selectFile} />
                <button
                    type="button"
                    title="Upload CAD model"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="rounded p-1 hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
                >
                    <Icon className="h-6 w-6">
                        <path d="M12 16V3M7 8l5-5 5 5M5 21h14" />
                    </Icon>
                </button>
                <Icon className="h-6 w-6 cursor-pointer">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.2 2.2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3.1v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.2-2.2.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5v-3.1h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.2-2.2.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3.5h3.1v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.2 2.2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V13h-.2a1.7 1.7 0 0 0-1.5 1Z" />
                </Icon>
            </div>
        </header>
    );
}
