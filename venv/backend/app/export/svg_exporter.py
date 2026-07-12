from .base_exporter import BaseExporter


class SVGExporter(BaseExporter):

    def format_name(self):
        return "SVG"

    def export(self, drawing, output_path):

        print("Exporting SVG...")

        return {
            "success": True,
            "format": "SVG",
            "file": output_path
        }