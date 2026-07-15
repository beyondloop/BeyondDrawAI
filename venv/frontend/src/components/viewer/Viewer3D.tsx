import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import { Box3, BufferAttribute, BufferGeometry, Color, DoubleSide, Group, Mesh, MeshStandardMaterial, SRGBColorSpace, Vector3 } from "three";
import occtimportjs from "occt-import-js";
import occtWasmUrl from "occt-import-js/dist/occt-import-js.wasm?url";

type UploadedModel = { filename: string; file_type: string; file: File };
export type CameraView = "isometric" | "top" | "front" | "right";

function CadScene({ object, view }: { object: Group; view: CameraView }) {
    const cameraPosition: Record<CameraView, [number, number, number]> = {
        isometric: [4, 4, 4],
        top: [0, 6, 0],
        front: [0, 0, 6],
        right: [6, 0, 0],
    };
    return (
        <Canvas key={view} camera={{ position: cameraPosition[view], fov: 40 }} dpr={[1, 2]}>
            <color attach="background" args={["#172033"]} />
            <ambientLight intensity={0.75} />
            <directionalLight position={[5, 8, 5]} intensity={1.8} />
            <gridHelper args={[10, 20, "#64748b", "#334155"]} />
            <primitive object={object} />
            <TrackballControls makeDefault rotateSpeed={3} dynamicDampingFactor={0.12} />
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
        const makeMaterial = (color?: number[] | null) => {
            const [red = 0.35, green = 0.68, blue = 0.95] = color ?? source.color ?? [];
            return new MeshStandardMaterial({
            // CAD colours are encoded as sRGB values between 0 and 1.
            color: new Color().setRGB(red, green, blue, SRGBColorSpace),
            metalness: 0.1,
            roughness: 0.38,
            side: DoubleSide,
            });
        };
        const materials = [makeMaterial(source.color)];
        for (const face of source.brep_faces ?? []) {
            const materialIndex = face.color ? materials.push(makeMaterial(face.color)) - 1 : 0;
            geometry.addGroup(face.first * 3, (face.last - face.first + 1) * 3, materialIndex);
        }
        const mesh = new Mesh(geometry, materials);
        mesh.name = source.name ?? "CAD mesh";
        group.add(mesh);
    }

    const bounds = new Box3().setFromObject(group);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z);
    // Keep the model's geometric centre exactly at the scene origin (0, 0, 0).
    // The translation must account for the fit-to-view scale; otherwise scaling
    // would move the centre away from the origin.
    const scale = largestDimension > 0 ? 3 / largestDimension : 1;
    group.scale.setScalar(scale);
    group.position.copy(center).multiplyScalar(-scale);
    return group;
}

export default function Viewer3D({ model, onUpload, view }: { model: UploadedModel | null; onUpload: (file: File) => void; view: CameraView }) {
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
                const buffer = await sourceModel.file.arrayBuffer();
                const occt = await occtimportjs({ locateFile: () => occtWasmUrl });
                const result = extension === "step" || extension === "stp"
                    ? occt.ReadStepFile(new Uint8Array(buffer), { linearUnit: "millimeter", linearDeflection: 0.02 })
                    : occt.ReadIgesFile(new Uint8Array(buffer), { linearUnit: "millimeter", linearDeflection: 0.02 });
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
        <section
            className="relative h-full overflow-hidden rounded border border-slate-700 bg-slate-900"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files[0];
                if (file) onUpload(file);
            }}
        >
            <div className="absolute inset-x-0 top-0 z-10 flex h-9 items-center justify-between border-b border-slate-700 bg-slate-900/90 px-3 text-xs text-slate-400">
                <span className="font-medium text-slate-200">3D Viewer</span><div className="flex gap-3"><span>Perspective</span><span>Shaded</span></div>
            </div>
            <div className="absolute left-3 top-12 z-10 flex flex-col gap-1 rounded border border-slate-700 bg-slate-900/90 p-1">
                <button className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-700">Select</button><button className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-700">Measure</button>
            </div>
            <div className="h-full pt-9">
                {object ? <CadScene object={object} view={view} /> : <div className="flex h-full items-center justify-center text-center"><div>
                    <p className="text-sm text-slate-300">{loading ? "Converting CAD geometry…" : model?.filename ?? "3D workspace"}</p>
                    <p className="mt-1 max-w-sm text-xs text-slate-500">{error ?? (model ? "Preparing 3D preview…" : "Drop a STEP/STP or IGES/IGS file here, or use the upload button above")}</p>
                </div></div>}
            </div>
        </section>
    );
}
