import React from "react";

// Simple inline SVG replacements for lucide-react icons to avoid dependency
const Icon = ({ children, size = 20 }: { children: React.ReactNode; size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
    >
        {children}
    </svg>
);

const Home = (props: { size?: number }) => (
    <Icon size={props.size}>
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
    </Icon>
);

const Folder = (props: { size?: number }) => (
    <Icon size={props.size}>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </Icon>
);

const Upload = (props: { size?: number }) => (
    <Icon size={props.size}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </Icon>
);

const FileText = (props: { size?: number }) => (
    <Icon size={props.size}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </Icon>
);

const Brain = (props: { size?: number }) => (
    <Icon size={props.size}>
        <path d="M12 3a4 4 0 0 0-4 4v1H6a4 4 0 0 0 0 8h2v1a4 4 0 0 0 8 0v-1h2a4 4 0 0 0 0-8h-2V7a4 4 0 0 0-4-4z" />
    </Icon>
);

const Settings = (props: { size?: number }) => (
    <Icon size={props.size}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.69 0 1.28-.44 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.5 3.5l.06.06c.45.45 1.06.72 1.71.72H9a1.65 1.65 0 0 0 1.51-1C10.9 2.44 11.49 2 12 2h0" />
    </Icon>
);

const menus = [
    { icon: Home, label: "Dashboard" },
    { icon: Folder, label: "Projects" },
    { icon: Upload, label: "Upload" },
    { icon: FileText, label: "Drawings" },
    { icon: Brain, label: "AI Analysis" },
    { icon: Settings, label: "Settings" }
];

export default function Sidebar() {
    return (
        <aside className="w-64 bg-slate-800 text-white h-full border-r border-slate-700">
            {menus.map((item) => (
                <div
                    key={item.label}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-slate-700 cursor-pointer"
                >
                    <item.icon size={20} />
                    {item.label}
                </div>
            ))}
        </aside>
    );
}