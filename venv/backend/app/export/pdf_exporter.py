from .base_exporter import BaseExporter


class PDFExporter(BaseExporter):

    def format_name(self):
        return "PDF"

    def export(self, drawing, output_path):

        print("Exporting PDF...")

        # TODO:
        # reportlab
        # drawing rendering

        return {
            "success": True,
            "format": "PDF",
            "file": output_path
        }