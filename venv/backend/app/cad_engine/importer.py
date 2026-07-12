import os

from .reader.step_reader import StepReader
from .reader.iges_reader import IgesReader
from .reader.stl_reader import StlReader


class CADImporter:

    def __init__(self):

        self.readers = [
            StepReader(),
            IgesReader(),
            StlReader(),
        ]

    def load(self, filename):

        extension = os.path.splitext(filename)[1].lower()

        for reader in self.readers:

            if extension in reader.supported_extensions():

                return reader.load(filename)

        raise Exception(f"Unsupported file : {extension}")