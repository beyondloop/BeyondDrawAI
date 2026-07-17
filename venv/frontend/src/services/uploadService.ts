import api from "../api/api";

export async function uploadCAD(file: File) {

    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post("/upload", formData);

    return response.data;
}

export async function generateDrawing(modelId: string, format: "dxf" | "dwg") {
    const response = await api.post(`/drawings/${encodeURIComponent(modelId)}?format=${format}`);
    return response.data as { success: boolean; filename: string; preview_svg: string; content: string; media_type: string };
}
