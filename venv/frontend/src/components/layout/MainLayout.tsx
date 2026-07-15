import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Viewer3D, { type CameraView } from "../viewer/Viewer3D";
import DrawingViewer from "../drawing/DrawingViewer";
import StatusBar from "./StatusBar";
import { generateDrawing, uploadCAD } from "../../services/uploadService";

type UploadedModel = { id?: string; filename: string; file_type: string; file: File };

export default function MainLayout() {
    const [model, setModel] = useState<UploadedModel | null>(null);
    const [status, setStatus] = useState("Ready");
    const [uploading, setUploading] = useState(false);
    const [drawingSvg, setDrawingSvg] = useState<string>();
    const [generatingDrawing, setGeneratingDrawing] = useState(false);
    const [cameraView, setCameraView] = useState<CameraView>("isometric");

    async function handleUpload(file: File) {
        setUploading(true);
        const fileType = file.name.split(".").pop()?.toUpperCase() ?? "CAD";
        // Keep the local file in state first: the 3D viewer must not depend on the API
        // being online before it can display a STEP/IGES model.
        setModel({ filename: file.name, file_type: fileType, file });
        setDrawingSvg(undefined);
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
        if (!model?.id) {
            setStatus("Wait for the model upload to finish before generating a drawing.");
            return;
        }
        setGeneratingDrawing(true);
        setStatus("Generating orthographic SVG drawing…");
        try {
            const drawing = await generateDrawing(model.id);
            setDrawingSvg(drawing.svg);
            const blob = new Blob([drawing.svg], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url; anchor.download = drawing.filename; anchor.click();
            URL.revokeObjectURL(url);
            setStatus("Drawing generated and downloaded.");
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
                    <Viewer3D model={model} onUpload={handleUpload} view={cameraView} />
                </main>
            </div>

            <section className="grid min-h-0 grid-cols-[15.5rem_minmax(20rem,1fr)_19rem] border-t border-slate-700 bg-slate-900">
                <FeatureTree modelName={model?.filename} activeView={cameraView} onSelectView={setCameraView} />
                <DrawingViewer svg={drawingSvg} generating={generatingDrawing} onGenerate={handleGenerateDrawing} canGenerate={Boolean(model?.id)} />
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
