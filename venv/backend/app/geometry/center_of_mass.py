class CenterOfMassCalculator:

    def calculate(self, workplane):

        center = workplane.val().Center()

        return {

            "x": center.x,

            "y": center.y,

            "z": center.z

        }