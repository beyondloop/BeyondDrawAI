import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Box3, BufferAttribute, BufferGeometry, Color, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import occtWasmUrl from "occt-import-js/dist/occt-import-js.wasm?url";

type UploadedModel = { filename: string; file_type: string; file: File };

function CadScene({ object }: { object: Group }) {
    return (
        <Canvas camera={{ position: [4, 4, 4], fov: 40 }} dpr={[1, 2]}>
            <color attach="background" args={["#172033"]} />
            <ambientLight intensity={0.75} />
            <directionalLight position={[5, 8, 5]} intensity={1.8} />
            <gridHelper args={[10, 20, "#64748b", "#334155"]} />
            <primitive object={object} />
            <OrbitControls makeDefault />
        </Canvas>
    );
}

function buildModel(result: any): Group {
    const group = new Group();
    for (const source of result.meshes) {
        const geometry = new BufferGeometry();
        geometry.setAttribute("position", new BufferAttribute(new Float32Array(source.attributes.position.array), 3));
        if (source.attributes.normal) {
            geometry.setAttribute("normal", new BufferAttribute(new Float32Array(source.attributes.normal.array), 3));
        } else {
            geometry.computeVertexNormals();
        }
        geometry.setIndex(new BufferAttribute(new Uint32Array(source.index.array), 1));
        const [red = 0.35, green = 0.68, blue = 0.95] = source.color ?? [];
        const mesh = new Mesh(geometry, new MeshStandardMaterial({ color: new Color(red, green, blue), metalness: 0.15, roughness: 0.55 }));
        mesh.name = source.name ?? "CAD mesh";
        group.add(mesh);
    }

    const bounds = new Box3().setFromObject(group);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z);
    group.position.sub(center);
    if (largestDimension > 0) group.scale.setScalar(3 / largestDimension);
    return group;
}

export default function Viewer3D({ model }: { model: UploadedModel | null }) {
    const [object, setObject] = useState<Group | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        if (!model) {
            setObject(null);
            setError(null);
            return;
        }

        setObject(null);

        const sourceModel = model;
        const extension = sourceModel.filename.split(".").pop()?.toLowerCase();
        if (extension !== "step" && extension !== "stp" && extension !== "iges" && extension !== "igs") {
            setObject(null);
            setError("3D preview is currently available for STEP and IGES files.");
            return;
        }

        async function loadModel() {
            setLoading(true);
            setError(null);
            try {
                const [{ default: occtimportjs }, buffer] = await Promise.all([
                    import("occt-import-js"),
                    sourceModel.file.arrayBuffer(),
                ]);
                const occt = await occtimportjs({ locateFile: () => occtWasmUrl });
                const result = extension === "step" || extension === "stp"
                    ? occt.ReadStepFile(new Uint8Array(buffer), { linearUnit: "millimeter", linearDeflection: 0.1 })
                    : occt.ReadIgesFile(new Uint8Array(buffer), { linearUnit: "millimeter", linearDeflection: 0.1 });
                if (!result.success || result.meshes.length === 0) throw new Error("No renderable geometry was found in this file. Check that it is a valid STEP or IGES solid.");
                if (!cancelled) setObject(buildModel(result));
            } catch (reason) {
                if (!cancelled) setError(reason instanceof Error ? reason.message : "The CAD model could not be rendered.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadModel();
        return () => { cancelled = true; };
    }, [model]);

    return (
        <section className="relative h-full overflow-hidden rounded border border-slate-700 bg-slate-900">
            <div className="absolute inset-x-0 top-0 z-10 flex h-9 items-center justify-between border-b border-slate-700 bg-slate-900/90 px-3 text-xs text-slate-400">
                <span className="font-medium text-slate-200">3D Viewer</span><div className="flex gap-3"><span>Perspective</span><span>Shaded</span></div>
            </div>
            <div className="absolute left-3 top-12 z-10 flex flex-col gap-1 rounded border border-slate-700 bg-slate-900/90 p-1">
                <button className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-700">Select</button><button className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-700">Measure</button>
            </div>
            <div className="h-full pt-9">
                {object ? <CadScene object={object} /> : <div className="flex h-full items-center justify-center text-center"><div>
                    <p className="text-sm text-slate-300">{loading ? "Converting CAD geometry…" : model?.filename ?? "3D workspace"}</p>
                    <p className="mt-1 max-w-sm text-xs text-slate-500">{error ?? (model ? "Preparing 3D preview…" : "Upload a STEP or IGES model to begin editing")}</p>
                </div></div>}
            </div>
        </section>
    );
}
