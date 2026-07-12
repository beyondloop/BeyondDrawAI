from pydantic import BaseModel
from typing import List


class BoundingBox(BaseModel):
    xmin: float
    ymin: float
    zmin: float

    xmax: float
    ymax: float
    zmax: float

    width: float
    height: float
    depth: float


class CADModel(BaseModel):
    filename: str
    file_type: str
    units: str = "mm"

    volume: float = 0.0
    surface_area: float = 0.0

    bounding_box: BoundingBox | None = None

    solids: int = 0
    faces: int = 0
    edges: int = 0
    vertices: int = 0