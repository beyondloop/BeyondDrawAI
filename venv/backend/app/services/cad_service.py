from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from ..cad_engine.model_loader import ModelLoader
from ..geometry.geometry_engine import GeometryEngine
from ..topology.topology_engine import TopologyEngine


class CADService:
    """Stores uploaded CAD files and extracts geometry information."""

    allowed_extensions = {
        ".step",
        ".stp",
        ".iges",
        ".igs",
        ".stl",
        ".obj",
        ".brep",
        ".x_t",
        ".x_b",
        ".gltf",
        ".glb",
    }

    max_file_size = 100 * 1024 * 1024

    def __init__(self):

        self.upload_dir = Path(__file__).resolve().parents[2] / "uploads"
        self.upload_dir.mkdir(parents=True, exist_ok=True)

        self.model_loader = ModelLoader()
        self.geometry_engine = GeometryEngine()
        self.topology_engine = TopologyEngine()

    async def upload(self, file: UploadFile):

        filename = Path(file.filename or "").name
        extension = Path(filename).suffix.lower()

        if not filename:
            raise HTTPException(
                status_code=400,
                detail="Filename is missing."
            )

        if extension not in self.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported CAD format: {extension}"
            )

        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        if len(contents) > self.max_file_size:
            raise HTTPException(
                status_code=413,
                detail="Maximum file size is 100 MB."
            )

        stored_name = f"{uuid4().hex}{extension}"
        stored_path = self.upload_dir / stored_name

        stored_path.write_bytes(contents)

        try:

            # STEP / IGES / STL Reader
            cad_model = self.model_loader.load(str(stored_path))

            # Geometry Analysis
            cad_model = self.geometry_engine.analyze(cad_model)

            # Topology Analysis
            cad_model = self.topology_engine.analyze(cad_model)

        except Exception as e:

            stored_path.unlink(missing_ok=True)

            raise HTTPException(
                status_code=422,
                detail=str(e)
            )

        return {

            "success": True,

            "message": "CAD Model Loaded Successfully",

            "model": {

                "id": stored_name,

                "filename": filename,

                "file_type": cad_model.file_type,

                "units": cad_model.units,

                "size_bytes": len(contents),

                "volume": cad_model.volume,

                "surface_area": cad_model.surface_area,

                "bounding_box": {

                    "xmin": cad_model.bounding_box.xmin,
                    "ymin": cad_model.bounding_box.ymin,
                    "zmin": cad_model.bounding_box.zmin,

                    "xmax": cad_model.bounding_box.xmax,
                    "ymax": cad_model.bounding_box.ymax,
                    "zmax": cad_model.bounding_box.zmax,

                    "width": cad_model.bounding_box.width,
                    "height": cad_model.bounding_box.height,
                    "depth": cad_model.bounding_box.depth

                } if cad_model.bounding_box else None,

                "solids": cad_model.solids,

                "faces": cad_model.faces,

                "edges": cad_model.edges,

                "vertices": cad_model.vertices

            },

            "drawing": {

                "status": "geometry_ready",

                "message": "Geometry extracted successfully."

            }

        }
