import api from "../api/api";

export async function uploadCAD(file: File) {

    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post("/upload", formData);

    return response.data;
}

export async function generateDrawing(modelId: string) {
    const response = await api.post(`/drawings/${encodeURIComponent(modelId)}`);
    return response.data as { success: boolean; filename: string; svg: string };
}
