import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Viewer3D from "../viewer/Viewer3D";
import DrawingViewer from "../drawing/DrawingViewer";
import StatusBar from "./StatusBar";
import { uploadCAD } from "../../services/uploadService";

type UploadedModel = { filename: string; file_type: string; file: File };

export default function MainLayout() {
    const [model, setModel] = useState<UploadedModel | null>(null);
    const [status, setStatus] = useState("Ready");
    const [uploading, setUploading] = useState(false);

    async function handleUpload(file: File) {
        setUploading(true);
        const fileType = file.name.split(".").pop()?.toUpperCase() ?? "CAD";
        // Keep the local file in state first: the 3D viewer must not depend on the API
        // being online before it can display a STEP/IGES model.
        setModel({ filename: file.name, file_type: fileType, file });
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

    return (
        <div className="grid h-screen min-h-[680px] grid-rows-[3.5rem_minmax(0,1fr)_13rem_1.75rem] overflow-hidden bg-slate-950 text-slate-100">
            <Navbar onUpload={handleUpload} uploading={uploading} />

            <div className="grid min-h-0 grid-cols-[15.5rem_minmax(0,1fr)] overflow-hidden">
                <Sidebar />
                <main className="min-w-0 bg-slate-900 p-3">
                    <Viewer3D model={model} />
                </main>
            </div>

            <section className="grid min-h-0 grid-cols-[15.5rem_minmax(20rem,1fr)_19rem] border-t border-slate-700 bg-slate-900">
                <FeatureTree modelName={model?.filename} />
                <DrawingViewer />
                <Properties />
            </section>

            <StatusBar message={status} />
        </div>
    );
}

function FeatureTree({ modelName }: { modelName?: string }) {
    return <aside className="min-w-0 overflow-auto border-r border-slate-700 bg-slate-900 p-3 text-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Feature Tree</h2>
        <ul className="space-y-1 text-slate-300">
            <li className="rounded bg-sky-500/15 px-2 py-1.5 text-sky-200">▾ {modelName ?? "Part Studio"}</li>
            <li className="pl-6">▸ Origin</li><li className="pl-6">▸ Top Plane</li>
            <li className="pl-6">▸ Front Plane</li><li className="pl-6">▸ Right Plane</li>
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
