from .pdf_exporter import PDFExporter
from .svg_exporter import SVGExporter
from .dxf_exporter import DXFExporter
from .png_exporter import PNGExporter


class ExporterFactory:

    exporters = {
        "pdf": PDFExporter(),
        "svg": SVGExporter(),
        "dxf": DXFExporter(),
        "png": PNGExporter()
    }

    @classmethod
    def get_exporter(cls, fmt):

        fmt = fmt.lower()

        if fmt not in cls.exporters:
            raise Exception(f"Unsupported export format: {fmt}")

        return cls.exporters[fmt]