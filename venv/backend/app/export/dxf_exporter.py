from .base_exporter import BaseExporter


class DXFExporter(BaseExporter):

    def format_name(self):
        return "DXF"

    def export(self, drawing, output_path):

        print("Exporting DXF...")

        return {
            "success": True,
            "format": "DXF",
            "file": output_path
        }