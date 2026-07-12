import UploadDropzone from "./UploadDropzone";
import FileInfo from "./FileInfo";
import UploadProgress from "./UploadProgress";
import SupportedFormats from "./SupportedFormats";
import RecentProjects from "./RecentProjects";

export default function UploadDashboard() {
    return (
        <div className="p-6 space-y-6">

            <div>
                <h1 className="text-3xl font-bold">
                    Upload CAD Model
                </h1>

                <p className="text-slate-500">
                    Upload any supported 3D CAD file to generate engineering drawings.
                </p>
            </div>

            <UploadDropzone />

            <SupportedFormats />

            <div className="grid grid-cols-2 gap-6">

                <FileInfo />

                <UploadProgress />

            </div>

            <RecentProjects />

        </div>
    );
}