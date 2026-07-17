import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Viewer3D, { type CameraView } from "../viewer/Viewer3D";
import DrawingViewer from "../drawing/DrawingViewer";
import StatusBar from "./StatusBar";
import { uploadCAD } from "../../services/uploadService";

type UploadedModel = { id?: string; filename: string; file_type: string; file: File };

function svgProjectionToDxf(svg: string, title: string) {
    const pair = (code: number, value: string | number) => `${code}\n${value}\n`;
    const line = (x1: string, y1: string, x2: string, y2: string, layer: string) => [pair(0, "LINE"), pair(8, layer), pair(10, x1), pair(20, (-Number(y1)).toFixed(3)), pair(30, 0), pair(11, x2), pair(21, (-Number(y2)).toFixed(3)), pair(31, 0)].join("");
    const entities = [...svg.matchAll(/<path class="(feature(?: hidden)?|centre|linear-dim)" d="M([\d.-]+) ([\d.-]+)L([\d.-]+) ([\d.-]+)"\/>/g)]
        .map(([, className, x1, y1, x2, y2]) => line(x1, y1, x2, y2, className.includes("hidden") ? "HIDDEN" : className === "centre" ? "CENTRE" : className === "linear-dim" ? "DIMENSION" : "OUTLINE"))
        .join("");
    const dimensionText = [...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)]
        .map(([, attributes, value]) => {
            if (!/class="dim-label"/.test(attributes)) return "";
            const x = attributes.match(/\bx="([\d.-]+)"/)?.[1];
            const y = attributes.match(/\by="([\d.-]+)"/)?.[1];
            return x && y ? [pair(0, "TEXT"), pair(8, "DIMENSION"), pair(10, x), pair(20, (-Number(y)).toFixed(3)), pair(30, 0), pair(40, 8), pair(1, value)].join("") : "";
        }).join("");
    const text = title.replace(/[\r\n]/g, " ");
    return [pair(0, "SECTION"), pair(2, "HEADER"), pair(0, "ENDSEC"), pair(0, "SECTION"), pair(2, "ENTITIES"), pair(0, "TEXT"), pair(8, "TEXT"), pair(10, 25), pair(20, -30), pair(30, 0), pair(40, 12), pair(1, text), entities, dimensionText, pair(0, "ENDSEC"), pair(0, "EOF")].join("");
}

export default function MainLayout() {
    const [model, setModel] = useState<UploadedModel | null>(null);
    const [status, setStatus] = useState("Ready");
    const [uploading, setUploading] = useState(false);
    const [projectionSvg, setProjectionSvg] = useState<string>();
    const [drawingFormat, setDrawingFormat] = useState<"dxf" | "dwg" | "svg">("dxf");
    const [generatingDrawing, setGeneratingDrawing] = useState(false);
    const [cameraView, setCameraView] = useState<CameraView>("isometric");

    async function handleUpload(file: File) {
        setUploading(true);
        const fileType = file.name.split(".").pop()?.toUpperCase() ?? "CAD";
        // Keep the local file in state first: the 3D viewer must not depend on the API
        // being online before it can display a STEP/IGES model.
        setModel({ filename: file.name, file_type: fileType, file });
        setProjectionSvg(undefined);
        setCameraView("top");
        setStatus(`Loading ${file.name} in the 3D workspace…`);
        try {
            const response = await uploadCAD(file);
            setModel({ ...response.model, file });
            setStatus(response.drawing.message);
        } catch (error) {
            const detail = error instanceof Error ? error.message : "Upload failed.";
            setStatus(`3D preview is local. Server upload failed: ${detail}`);
        } finally {
            setUploading(false);
        }
    }

    async function handleGenerateDrawing() {
        if (!model || !projectionSvg || cameraView === "isometric") {
            setStatus("Select Top, Front, Bottom, or Right Plane after the model preview has loaded.");
            return;
        }
        const currentModel = model;
        setGeneratingDrawing(true);
        setStatus(`Generating ${drawingFormat.toUpperCase()} ${cameraView} drawing from the loaded 3D mesh…`);
        try {
            if (drawingFormat === "dwg") {
                throw new Error("DWG is a proprietary binary format and needs a licensed DWG converter. Select DXF for a native CAD drawing with the same geometry.");
            }
            const isSvg = drawingFormat === "svg";
            const content = isSvg ? projectionSvg : svgProjectionToDxf(projectionSvg, `${currentModel.filename} - ${cameraView.toUpperCase()} VIEW`);
            const blob = new Blob([content], { type: isSvg ? "image/svg+xml" : "application/dxf" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url; anchor.download = `${currentModel.filename.replace(/\.[^.]+$/, "")}-${cameraView}-view.${drawingFormat}`; anchor.click();
            URL.revokeObjectURL(url);
            setStatus(`${drawingFormat.toUpperCase()} drawing generated and downloaded.`);
        } catch (error) {
            const detail = error instanceof Error ? error.message : "Drawing generation failed.";
            setStatus(detail);
        } finally { setGeneratingDrawing(false); }
    }

    return (
        <div className="grid h-screen min-h-[680px] grid-rows-[3.5rem_minmax(0,1fr)_13rem_1.75rem] overflow-hidden bg-slate-950 text-slate-100">
            <Navbar onUpload={handleUpload} uploading={uploading} />

            <div className="grid min-h-0 grid-cols-[15.5rem_minmax(0,1fr)] overflow-hidden">
                <Sidebar />
                <main className="min-w-0 bg-slate-900 p-3">
                <Viewer3D model={model} onUpload={handleUpload} view={cameraView} onProjection={setProjectionSvg} />
                </main>
            </div>

            <section className="grid min-h-0 grid-cols-[15.5rem_minmax(20rem,1fr)_19rem] border-t border-slate-700 bg-slate-900">
                <FeatureTree modelName={model?.filename} activeView={cameraView} onSelectView={setCameraView} />
                <DrawingViewer svg={projectionSvg} generating={generatingDrawing} format={drawingFormat} onFormatChange={setDrawingFormat} onGenerate={handleGenerateDrawing} canGenerate={Boolean(model && projectionSvg && cameraView !== "isometric")} />
                <Properties />
            </section>

            <StatusBar message={status} />
        </div>
    );
}

function FeatureTree({ modelName, activeView, onSelectView }: { modelName?: string; activeView: CameraView; onSelectView: (view: CameraView) => void }) {
    const planes: Array<{ label: string; view: CameraView }> = [
        { label: "Top Plane", view: "top" },
        { label: "Front Plane", view: "front" },
        { label: "Bottom Plane", view: "bottom" },
        { label: "Right Plane", view: "right" },
    ];
    return <aside className="min-w-0 overflow-auto border-r border-slate-700 bg-slate-900 p-3 text-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Feature Tree</h2>
        <ul className="space-y-1 text-slate-300">
            <li className="rounded bg-sky-500/15 px-2 py-1.5 text-sky-200">▾ {modelName ?? "Part Studio"}</li>
            <li className="pl-6"><button type="button" onClick={() => onSelectView("isometric")} className={`w-full rounded px-2 py-1 text-left hover:bg-slate-700 ${activeView === "isometric" ? "bg-sky-500/15 text-sky-200" : ""}`}>▸ Origin</button></li>
            {planes.map(({ label, view }) => <li key={view} className="pl-6"><button type="button" onClick={() => onSelectView(view)} className={`w-full rounded px-2 py-1 text-left hover:bg-slate-700 ${activeView === view ? "bg-sky-500/15 text-sky-200" : ""}`}>▸ {label}</button></li>)}
        </ul>
    </aside>;
}

function Properties() {
    return <aside className="min-w-0 overflow-auto bg-slate-900 p-3 text-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Properties</h2>
        <dl className="grid grid-cols-[5rem_1fr] gap-x-2 gap-y-2 text-slate-300">
            <dt className="text-slate-500">Selection</dt><dd>None</dd>
            <dt className="text-slate-500">Material</dt><dd>Default</dd>
            <dt className="text-slate-500">Units</dt><dd>Millimeters</dd>
        </dl>
    </aside>;
}
