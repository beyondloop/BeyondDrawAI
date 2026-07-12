from .base import CADReader


class StepReader(CADReader):

    def supported_extensions(self):
        return [".step", ".stp"]

    def load(self, filename):

        print(f"Reading STEP : {filename}")

        return {
            "type": "STEP",
            "filename": filename
        }
