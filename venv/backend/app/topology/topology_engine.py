from .edge_counter import EdgeCounter
from .face_counter import FaceCounter
from .solid_counter import SolidCounter
from .vertex_counter import VertexCounter


class TopologyEngine:
    """Extracts topological counts from a loaded CAD model."""

    def __init__(self):
        self.solids = SolidCounter()
        self.faces = FaceCounter()
        self.edges = EdgeCounter()
        self.vertices = VertexCounter()

    def analyze(self, cad_model):
        source = cad_model.workplane or cad_model.shape

        cad_model.solids = self.solids.count(source)
        cad_model.faces = self.faces.count(source)
        cad_model.edges = self.edges.count(source)
        cad_model.vertices = self.vertices.count(source)

        return cad_model
