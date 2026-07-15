from ..models.cad_model import BoundingBox


class BoundingBoxCalculator:

    def calculate(self, workplane):

        shape = workplane.val()

        box = shape.BoundingBox()

        return BoundingBox(

            xmin=box.xmin,
            ymin=box.ymin,
            zmin=box.zmin,

            xmax=box.xmax,
            ymax=box.ymax,
            zmax=box.zmax

        )