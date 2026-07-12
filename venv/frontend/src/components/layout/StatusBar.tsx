export default function StatusBar({ message = "Ready" }: { message?: string }) {
    return (
        <footer className="flex items-center justify-between border-t border-slate-700 bg-slate-950 px-3 text-xs text-slate-400">
            <span className="max-w-[60%] truncate">{message}</span><div className="flex gap-4"><span>MMGS</span><span>Viewing: Perspective</span><span>0 selected</span></div>
        </footer>
    );
}
