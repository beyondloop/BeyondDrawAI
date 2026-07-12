from abc import ABC, abstractmethod


class CADReader(ABC):

    @abstractmethod
    def load(self, filename):
        pass

    @abstractmethod
    def supported_extensions(self):
        pass