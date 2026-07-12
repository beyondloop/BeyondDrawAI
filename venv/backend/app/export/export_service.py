from .exporter_factory import ExporterFactory


class ExportService:

    def export(self, drawing, fmt, output_path):

        exporter = ExporterFactory.get_exporter(fmt)

        return exporter.export(drawing, output_path)