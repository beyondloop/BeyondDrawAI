from .bounding_box import BoundingBoxCalculator
from .volume import VolumeCalculator
from .surface_area import SurfaceAreaCalculator
from .center_of_mass import CenterOfMassCalculator


class GeometryEngine:

    def __init__(self):

        self.bounding = BoundingBoxCalculator()

        self.volume = VolumeCalculator()

        self.area = SurfaceAreaCalculator()

        self.center = CenterOfMassCalculator()

    def analyze(self, cad_model):

        wp = cad_model.workplane

        cad_model.bounding_box = self.bounding.calculate(wp)

        cad_model.volume = self.volume.calculate(wp)

        cad_model.surface_area = self.area.calculate(wp)

        cad_model.center_of_mass = self.center.calculate(wp)

        return cad_model