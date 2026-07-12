from abc import ABC, abstractmethod


class BaseExporter(ABC):

    @abstractmethod
    def export(self, drawing, output_path):
        """
        Export a drawing to a specific format.
        """
        pass

    @abstractmethod
    def format_name(self):
        pass