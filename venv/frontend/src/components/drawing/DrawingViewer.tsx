type DrawingViewerProps = {
    svg?: string;
    generating?: boolean;
    onGenerate: () => void;
    canGenerate: boolean;
};

export default function DrawingViewer({ svg, generating, onGenerate, canGenerate }: DrawingViewerProps) {
    return (
        <section className="min-w-0 overflow-hidden border-r border-slate-700 bg-slate-800 p-3">
            <div className="flex h-full flex-col border border-slate-600 bg-slate-100 text-slate-700">
                <div className="flex h-8 items-center justify-between border-b border-slate-300 px-3 text-xs font-medium"><span>2D Drawing Panel</span><button type="button" onClick={onGenerate} disabled={!canGenerate || generating} className="rounded bg-blue-600 px-2 py-1 text-white disabled:cursor-not-allowed disabled:bg-slate-400">{generating ? "Generating…" : "Generate Drawing"}</button></div>
                <div className="flex flex-1 items-center justify-center overflow-auto bg-[linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] bg-[size:16px_16px]">{svg ? <div className="h-full w-full p-2" dangerouslySetInnerHTML={{ __html: svg }} /> : <span className="rounded bg-white/80 px-3 py-2 text-xs text-slate-500 shadow-sm">{canGenerate ? "Generate an SVG drawing from the model" : "Upload a model first"}</span>}</div>
            </div>
        </section>
    );
}
