from pathlib import Path

from .base import CADReader
from app.models.cad_model import CADModel


class StepReader(CADReader):

    def supported_extensions(self):
        return [".step", ".stp"]

    def load(self, filename: str) -> CADModel:

        file_path = Path(filename)

        if not file_path.exists():
            raise FileNotFoundError(f"STEP file not found: {filename}")

        print(f"Loading STEP File: {filename}")

        try:
            import cadquery as cq

            # Load STEP file using CadQuery
            workplane = cq.importers.importStep(str(file_path))

            # Create CAD Model
            cad_model = CADModel()

            cad_model.filename = file_path.name
            cad_model.file_type = "STEP"
            cad_model.units = "mm"

            # Store the CadQuery Workplane
            cad_model.workplane = workplane

            # Store the underlying OpenCascade Shape
            cad_model.shape = workplane.val()

            return cad_model

        except Exception as e:
            raise RuntimeError(f"Unable to read STEP file: {e}") from e
