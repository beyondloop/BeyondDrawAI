from .importer import CADImporter


class ModelLoader:

    def __init__(self):

        self.importer = CADImporter()

    def load(self, filename):

        return self.importer.load(filename)