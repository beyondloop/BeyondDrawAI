export default function DrawingViewer() {
    return (
        <section className="min-w-0 overflow-hidden border-r border-slate-700 bg-slate-800 p-3">
            <div className="flex h-full flex-col border border-slate-600 bg-slate-100 text-slate-700">
                <div className="flex h-8 items-center border-b border-slate-300 px-3 text-xs font-medium">2D Drawing Panel</div>
                <div className="flex flex-1 items-center justify-center bg-[linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] bg-[size:16px_16px]"><span className="rounded bg-white/80 px-3 py-2 text-xs text-slate-500 shadow-sm">Drawing sheet</span></div>
            </div>
        </section>
    );
}
