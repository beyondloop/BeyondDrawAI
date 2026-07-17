type DrawingViewerProps = {
    svg?: string;
    generating?: boolean;
    format: "dxf" | "dwg" | "svg";
    onFormatChange: (format: "dxf" | "dwg" | "svg") => void;
    onGenerate: () => void;
    canGenerate: boolean;
};

export default function DrawingViewer({ svg, generating, format, onFormatChange, onGenerate, canGenerate }: DrawingViewerProps) {
    return (
        <section className="min-w-0 overflow-hidden border-r border-slate-700 bg-slate-800 p-3">
            <div className="flex h-full flex-col border border-slate-600 bg-slate-100 text-slate-700">
                <div className="flex h-8 items-center justify-between gap-2 border-b border-slate-300 px-3 text-xs font-medium"><span>2D Drawing Panel</span><div className="flex items-center gap-2"><label className="text-slate-600" htmlFor="drawing-format">Export</label><select id="drawing-format" value={format} onChange={(event) => onFormatChange(event.target.value as "dxf" | "dwg" | "svg")} className="rounded border border-slate-300 bg-white px-1 py-0.5 text-slate-700"><option value="dxf">DXF</option><option value="dwg">DWG</option><option value="svg">SVG</option></select><button type="button" onClick={onGenerate} disabled={!canGenerate || generating} className="rounded bg-blue-600 px-2 py-1 text-white disabled:cursor-not-allowed disabled:bg-slate-400">{generating ? "Generating…" : `Export ${format.toUpperCase()}`}</button></div></div>
                <div className="flex flex-1 items-center justify-center overflow-auto bg-[linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] bg-[size:16px_16px]">{svg ? <div className="h-full w-full p-2" dangerouslySetInnerHTML={{ __html: svg }} /> : <span className="rounded bg-white/80 px-3 py-2 text-xs text-slate-500 shadow-sm">{canGenerate ? "Generate front and side datum drawing" : "Upload a model first"}</span>}</div>
            </div>
        </section>
    );
}
