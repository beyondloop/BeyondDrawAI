import {
  Box,
  FileCode,
  Cuboid,
  Layers3,
  Package,
  ScanLine,
  Shapes,
} from "lucide-react";

const formats = [
  {
    name: "STEP",
    extension: ".step / .stp",
    icon: Box,
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "IGES",
    extension: ".iges / .igs",
    icon: Layers3,
    color: "bg-green-100 text-green-700",
  },
  {
    name: "Parasolid",
    extension: ".x_t / .x_b",
    icon: Cuboid,
    color: "bg-purple-100 text-purple-700",
  },
  {
    name: "BREP",
    extension: ".brep",
    icon: Package,
    color: "bg-orange-100 text-orange-700",
  },
  {
    name: "STL",
    extension: ".stl",
    icon: ScanLine,
    color: "bg-pink-100 text-pink-700",
  },
  {
    name: "OBJ",
    extension: ".obj",
    icon: Shapes,
    color: "bg-cyan-100 text-cyan-700",
  },
  {
    name: "GLTF",
    extension: ".gltf / .glb",
    icon: FileCode,
    color: "bg-indigo-100 text-indigo-700",
  },
];

export default function SupportedFormats() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          Supported CAD Formats
        </h2>

        <p className="text-slate-500 mt-1">
          BeyondDraw AI can import multiple industry-standard CAD and mesh
          formats.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">

        {formats.map((format) => {

          const Icon = format.icon;

          return (

            <div
              key={format.name}
              className="border rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-blue-500 cursor-pointer"
            >

              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${format.color}`}
              >
                <Icon size={24} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                {format.name}
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {format.extension}
              </p>

            </div>

          );
        })}

      </div>

    </div>
  );
}