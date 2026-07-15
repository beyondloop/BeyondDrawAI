from typing import Any


class BoundingBox:

    def __init__(
        self,
        xmin=0.0,
        ymin=0.0,
        zmin=0.0,
        xmax=0.0,
        ymax=0.0,
        zmax=0.0,
    ):
        self.xmin = xmin
        self.ymin = ymin
        self.zmin = zmin

        self.xmax = xmax
        self.ymax = ymax
        self.zmax = zmax

    @property
    def width(self):
        return self.xmax - self.xmin

    @property
    def height(self):
        return self.ymax - self.ymin

    @property
    def depth(self):
        return self.zmax - self.zmin


class CADModel:

    def __init__(self):

        self.filename = ""

        self.file_type = ""

        self.units = "mm"

        # OpenCascade Shape
        self.shape: Any = None

        # CadQuery Workplane
        self.workplane: Any = None

        self.bounding_box = None

        self.volume = 0.0

        self.surface_area = 0.0

        self.solids = 0

        self.faces = 0

        self.edges = 0

        self.vertices = 0