import { UploadCloud } from "lucide-react";

export default function UploadDropzone() {
    return (
        <div className="border-2 border-dashed border-slate-300 rounded-xl h-72 flex flex-col items-center justify-center bg-white hover:border-blue-500 transition cursor-pointer">

            <UploadCloud size={60} className="text-blue-600" />

            <h2 className="text-xl font-semibold mt-4">
                Drag & Drop CAD File
            </h2>

            <p className="text-slate-500 mt-2">
                or click to browse
            </p>

            <input
                type="file"
                className="hidden"
                id="upload"
            />

            <label
                htmlFor="upload"
                className="mt-5 px-5 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
            >
                Select File
            </label>

        </div>
    );
}