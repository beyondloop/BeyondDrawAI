import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import { Box3, BufferAttribute, BufferGeometry, Color, DoubleSide, Group, Mesh, MeshStandardMaterial, SRGBColorSpace, Vector3 } from "three";
import occtimportjs from "occt-import-js";
import occtWasmUrl from "occt-import-js/dist/occt-import-js.wasm?url";

type UploadedModel = { filename: string; file_type: string; file: File };
export type CameraView = "isometric" | "top" | "front" | "bottom" | "right";

/** Build a clean orthographic drawing from the loaded mesh for a feature-tree view. */
export function buildProjectionSvg(group: Group, filename: string, view: Exclude<CameraView, "isometric">) {
    const triangles: Array<Array<[number, number]>> = [];
    const edges = new Map<string, { a: [number, number]; b: [number, number]; normals: Vector3[]; z: number; count: number }>();
    const points: Array<[number, number]> = [];
    const projection = {
        // These axes exactly match each camera's on-screen right/up directions.
        top: { label: "TOP", project: (point: Vector3): [number, number] => [-point.x, point.z], direction: new Vector3(0, 1, 0) },
        front: { label: "FRONT", project: (point: Vector3): [number, number] => [point.x, point.y], direction: new Vector3(0, 0, 1) },
        bottom: { label: "BOTTOM", project: (point: Vector3): [number, number] => [point.x, point.z], direction: new Vector3(0, -1, 0) },
        right: { label: "RIGHT", project: (point: Vector3): [number, number] => [point.y, point.z], direction: new Vector3(1, 0, 0) },
    }[view];
    group.updateMatrixWorld(true);
    group.traverse((child) => {
        if (!(child instanceof Mesh)) return;
        const geometry = child.geometry as BufferGeometry;
        const position = geometry.getAttribute("position");
        const index = geometry.getIndex();
        if (!position || !index) return;
        const worldPoint = (vertexIndex: number) => {
            return new Vector3().fromBufferAttribute(position, vertexIndex).applyMatrix4(child.matrixWorld);
        };
        const project = projection.project;
        for (let i = 0; i < index.count; i += 3) {
            const indices = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
            const world = indices.map(worldPoint);
            const normal = new Vector3().subVectors(world[1], world[0]).cross(new Vector3().subVectors(world[2], world[0])).normalize();
            const triangle = world.map(project);
            triangles.push(triangle);
            points.push(...triangle);
            for (let side = 0; side < 3; side += 1) {
                const next = (side + 1) % 3;
                const key = `${child.uuid}:${Math.min(indices[side], indices[next])}:${Math.max(indices[side], indices[next])}`;
                const existing = edges.get(key);
                if (existing) {
                    existing.normals.push(normal);
                    existing.z += (world[side].z + world[next].z) / 2;
                    existing.count += 1;
                } else {
                    edges.set(key, { a: triangle[side], b: triangle[next], normals: [normal], z: (world[side].z + world[next].z) / 2, count: 1 });
                }
            }
        }
    });
    if (!triangles.length) return undefined;
    const xs = points.map(([x]) => x), ys = points.map(([, y]) => y);
    const xmin = Math.min(...xs), xmax = Math.max(...xs), ymin = Math.min(...ys), ymax = Math.max(...ys);
    const spanX = Math.max(xmax - xmin, 0.001), spanY = Math.max(ymax - ymin, 0.001);
    const scale = Math.min(760 / spanX, 340 / spanY);
    const ox = 450 - ((xmin + xmax) / 2) * scale, oy = 250 + ((ymin + ymax) / 2) * scale;
    // The preview group is fitted to the viewer.  Convert its projected values
    // back to the imported model's millimetres before placing dimension text.
    const modelScale = Number(group.userData.modelScale) || 1;
    const modelUnitsPerProjectionUnit = 1 / modelScale;
    const centreX = (xmin + xmax) / 2, centreY = (ymin + ymax) / 2;
    const toScreen = ([x, y]: [number, number]) => [x * scale + ox, oy - y * scale] as const;
    const [left, top] = toScreen([xmin, ymax]);
    const [right, bottom] = toScreen([xmax, ymin]);
    const [centreScreenX, centreScreenY] = toScreen([centreX, centreY]);
    const horizontalHalf = (spanX / 2) * modelUnitsPerProjectionUnit;
    const verticalHalf = (spanY / 2) * modelUnitsPerProjectionUnit;
    // These are baseline (ordinate) dimensions: both directions originate at
    // the centre datum, instead of being chained from one feature to another.
    const dimensions = `
<g class="dimensions">
  <path class="extension" d="M${left.toFixed(1)} ${centreScreenY.toFixed(1)}V${(bottom + 8).toFixed(1)} M${centreScreenX.toFixed(1)} ${centreScreenY.toFixed(1)}V${(bottom + 8).toFixed(1)} M${right.toFixed(1)} ${centreScreenY.toFixed(1)}V${(bottom + 8).toFixed(1)}"/>
  <path class="linear-dim" d="M${left.toFixed(1)} ${(bottom + 18).toFixed(1)}L${centreScreenX.toFixed(1)} ${(bottom + 18).toFixed(1)}"/><path class="linear-dim" d="M${centreScreenX.toFixed(1)} ${(bottom + 18).toFixed(1)}L${right.toFixed(1)} ${(bottom + 18).toFixed(1)}"/>
  <text x="${((left + centreScreenX) / 2).toFixed(1)}" y="${(bottom + 14).toFixed(1)}" text-anchor="middle" class="dim-label">X− ${horizontalHalf.toFixed(2)} mm</text>
  <text x="${((centreScreenX + right) / 2).toFixed(1)}" y="${(bottom + 14).toFixed(1)}" text-anchor="middle" class="dim-label">X+ ${horizontalHalf.toFixed(2)} mm</text>
  <path class="extension" d="M${centreScreenX.toFixed(1)} ${top.toFixed(1)}H${(left - 8).toFixed(1)} M${centreScreenX.toFixed(1)} ${centreScreenY.toFixed(1)}H${(left - 8).toFixed(1)} M${centreScreenX.toFixed(1)} ${bottom.toFixed(1)}H${(left - 8).toFixed(1)}"/>
  <path class="linear-dim" d="M${(left - 18).toFixed(1)} ${top.toFixed(1)}L${(left - 18).toFixed(1)} ${centreScreenY.toFixed(1)}"/><path class="linear-dim" d="M${(left - 18).toFixed(1)} ${centreScreenY.toFixed(1)}L${(left - 18).toFixed(1)} ${bottom.toFixed(1)}"/>
  <text x="${(left - 23).toFixed(1)}" y="${((top + centreScreenY) / 2).toFixed(1)}" text-anchor="end" class="dim-label">Y+ ${verticalHalf.toFixed(2)} mm</text>
  <text x="${(left - 23).toFixed(1)}" y="${((centreScreenY + bottom) / 2).toFixed(1)}" text-anchor="end" class="dim-label">Y− ${verticalHalf.toFixed(2)} mm</text>
</g>`;
    // Fill the projected faces without stroking every tessellation triangle.
    const path = triangles.map((triangle) => {
        const coords = triangle.map(([x, y]) => `${(x * scale + ox).toFixed(1)},${(oy - y * scale).toFixed(1)}`);
        return `<polygon points="${coords.join(" ")}"/>`;
    }).join("");
    // Keep only silhouettes and sharp machining transitions. The stricter angle
    // removes the dense tessellation lines produced by smooth CAD surfaces.
    const edgeMarkup = [...edges.values()].filter((edge) => {
        if (edge.count === 1) return true;
        const [first, second] = edge.normals;
        return Boolean(first && second && first.dot(second) < 0.8);
    }).map((edge) => {
        const x1 = (edge.a[0] * scale + ox).toFixed(1), y1 = (oy - edge.a[1] * scale).toFixed(1);
        const x2 = (edge.b[0] * scale + ox).toFixed(1), y2 = (oy - edge.b[1] * scale).toFixed(1);
        const hidden = edge.normals.every((normal) => normal.dot(projection.direction) <= 0);
        return `<path class="feature${hidden ? " hidden" : ""}" d="M${x1} ${y1}L${x2} ${y2}"/>`;
    }).join("");
    const title = filename.replace(/[<&>\"']/g, "");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500" viewBox="0 0 900 500">
<style>text{font:12px Arial;fill:#0f172a}.title{font:bold 20px Arial}.part{fill:#dbeafe;fill-opacity:.72;stroke:none}.feature{stroke:#172554;stroke-width:1.5;fill:none}.hidden{stroke:#475569;stroke-dasharray:7 5;stroke-width:1.2}.centre{stroke:#64748b;stroke-dasharray:10 4 2 4;fill:none}.linear-dim{stroke:#2563eb;stroke-width:1.2;fill:none}.extension{stroke:#94a3b8;stroke-dasharray:3 3;fill:none}.dim-label{font:bold 11px Arial;fill:#1d4ed8}</style>
<rect width="900" height="500" fill="white"/><rect x="15" y="15" width="870" height="470" fill="none" stroke="#64748b"/>
<text x="35" y="50" class="title">${title} — ${projection.label} View</text><text x="35" y="73">Orthographic projection with hidden and machining feature lines</text>
<text x="35" y="91" class="dim-label">DATUM A: view centre — baseline dimensions are measured from this centreline</text>
<path class="centre" d="M70 ${centreScreenY.toFixed(1)}H830 M${centreScreenX.toFixed(1)} 95V425"/><g class="part">${path}</g><g>${edgeMarkup}</g>${dimensions}<circle cx="${centreScreenX.toFixed(1)}" cy="${centreScreenY.toFixed(1)}" r="3" fill="#0f172a"/><text x="450" y="455" text-anchor="middle">${projection.label} VIEW</text></svg>`;
}

function CameraOrientation({ view }: { view: CameraView }) {
    const { camera } = useThree();
    useEffect(() => {
        const cameraPosition: Record<CameraView, [number, number, number]> = {
        isometric: [4, 4, 4],
        top: [0, 6, 0],
        front: [0, 0, 6],
        bottom: [0, -6, 0],
        right: [6, 0, 0],
        };
        camera.position.set(...cameraPosition[view]);
        camera.up.set(0, 0, 1);
        if (view === "front" || view === "isometric") camera.up.set(0, 1, 0);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
    }, [camera, view]);
    return null;
}

function CadScene({ object, view }: { object: Group; view: CameraView }) {
    return (
        <Canvas key={view} camera={{ fov: 40 }} dpr={[1, 2]}>
            <CameraOrientation view={view} />
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
    group.userData.modelScale = scale;
    return group;
}

export default function Viewer3D({ model, onUpload, view, onProjection }: { model: UploadedModel | null; onUpload: (file: File) => void; view: CameraView; onProjection?: (svg: string | undefined) => void }) {
    const [object, setObject] = useState<Group | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        if (!model) {
            setObject(null);
            setError(null);
            onProjection?.(undefined);
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
                if (!cancelled) {
                    const nextObject = buildModel(result);
                    setObject(nextObject);
                }
            } catch (reason) {
                if (!cancelled) setError(reason instanceof Error ? reason.message : "The CAD model could not be rendered.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadModel();
        return () => { cancelled = true; };
    }, [model]);

    useEffect(() => {
        if (!object || !model || view === "isometric") {
            onProjection?.(undefined);
            return;
        }
        onProjection?.(buildProjectionSvg(object, model.filename, view));
    }, [object, model, onProjection, view]);

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
