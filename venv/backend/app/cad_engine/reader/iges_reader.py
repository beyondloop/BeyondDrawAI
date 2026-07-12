from .base import CADReader


class IgesReader(CADReader):

    def supported_extensions(self):
        return [".iges", ".igs"]

    def load(self, filename):

        print(f"Reading IGES : {filename}")

        return {
            "type": "IGES",
            "filename": filename
        }   