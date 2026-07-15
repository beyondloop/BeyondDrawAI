from pydantic import BaseModel


class BoundingBoxResponse(BaseModel):

    xmin: float
    ymin: float
    zmin: float

    xmax: float
    ymax: float
    zmax: float

    width: float
    height: float
    depth: float


class CADResponse(BaseModel):

    filename: str

    file_type: str

    units: str

    volume: float

    surface_area: float

    solids: int

    faces: int

    edges: int

    vertices: int

    bounding_box: BoundingBoxResponse