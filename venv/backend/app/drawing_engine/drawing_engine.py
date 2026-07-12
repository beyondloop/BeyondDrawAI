from .projection_engine import ProjectionEngine
from .dimension_engine import DimensionEngine
from .annotation_engine import AnnotationEngine


class DrawingEngine:

    def __init__(self):

        self.projection = ProjectionEngine()

        self.dimension = DimensionEngine()

        self.annotation = AnnotationEngine()

    def generate(self, cad_model):

        drawing = {}

        drawing["views"] = self.projection.generate(cad_model)

        drawing["dimensions"] = self.dimension.generate(cad_model)

        drawing["annotations"] = self.annotation.generate(cad_model)

        return drawing