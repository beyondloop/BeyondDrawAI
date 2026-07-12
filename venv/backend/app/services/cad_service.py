from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from ..cad_engine.model_loader import ModelLoader


class CADService:
    """Stores an uploaded CAD file and prepares metadata for drawing generation."""

    allowed_extensions = {".step", ".stp", ".iges", ".igs", ".stl"}
    max_file_size = 100 * 1024 * 1024

    def __init__(self):
        self.upload_dir = Path(__file__).resolve().parents[2] / "uploads"
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.model_loader = ModelLoader()

    async def upload(self, file: UploadFile):
        filename = Path(file.filename or "").name
        extension = Path(filename).suffix.lower()

        if not filename or extension not in self.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail="Unsupported model format. Use STEP/STP, IGES/IGS, or STL.",
            )

        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")
        if len(contents) > self.max_file_size:
            raise HTTPException(status_code=413, detail="The model must be 100 MB or smaller.")

        stored_name = f"{uuid4().hex}{extension}"
        stored_path = self.upload_dir / stored_name
        stored_path.write_bytes(contents)

        try:
            imported = self.model_loader.load(str(stored_path))
        except Exception as error:
            stored_path.unlink(missing_ok=True)
            raise HTTPException(status_code=422, detail=f"Could not read the CAD file: {error}") from error

        return {
            "success": True,
            "message": "Model uploaded successfully.",
            "model": {
                "id": stored_name,
                "filename": filename,
                "file_type": imported["type"],
                "units": "mm",
                "size_bytes": len(contents),
                "bounding_box": imported.get("bounding_box"),
            },
            "drawing": {
                "status": "ready" if extension == ".stl" else "pending_cad_kernel",
                "message": (
                    "Envelope dimensions were generated from the STL mesh."
                    if extension == ".stl"
                    else "The model is stored. Install an OpenCascade CAD kernel to generate precise STEP/IGES drawings and feature dimensions."
                ),
                "dimensions": imported.get("dimensions", []),
            },
        }
