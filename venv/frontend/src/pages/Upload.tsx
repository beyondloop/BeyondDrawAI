import { useState } from "react";

import UploadDashboard from "../components/upload/UploadDashboard";
import { uploadCAD } from "../services/uploadService";

export default function Upload() {

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
    };

    const handleUpload = async () => {

        if (!file) {
            alert("Please select a CAD file.");
            return;
        }

        try {

            setUploading(true);

            const result = await uploadCAD(file);

            setUploadResult(result);

            alert("CAD File Uploaded Successfully");

            console.log(result);

        } catch (error) {

            console.error(error);

            alert("Upload Failed");

        } finally {

            setUploading(false);

        }
    };

    const UploadDashboardAny = UploadDashboard as any;

    return (
        <UploadDashboardAny
            file={file}
            uploading={uploading}
            uploadResult={uploadResult}
            onFileSelect={handleFileSelect}
            onUpload={handleUpload}
        />
    );
}