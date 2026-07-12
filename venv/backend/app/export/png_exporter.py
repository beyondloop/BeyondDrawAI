from .base_exporter import BaseExporter


class PNGExporter(BaseExporter):

    def format_name(self):
        return "PNG"

    def export(self, drawing, output_path):

        print("Exporting PNG...")

        return {
            "success": True,
            "format": "PNG",
            "file": output_path
        }