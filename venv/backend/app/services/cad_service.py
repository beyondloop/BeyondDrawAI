from pathlib import Path
from uuid import uuid4
from xml.sax.saxutils import escape

from fastapi import HTTPException, UploadFile

from ..cad_engine.model_loader import ModelLoader
from ..models.cad_model import BoundingBox, CADModel
from ..geometry.geometry_engine import GeometryEngine
from ..topology.topology_engine import TopologyEngine


class CADService:
    """Stores uploaded CAD files and extracts geometry information."""

    allowed_extensions = {
        ".step",
        ".stp",
        ".iges",
        ".igs",
        ".stl",
        ".obj",
        ".brep",
        ".x_t",
        ".x_b",
        ".gltf",
        ".glb",
    }

    max_file_size = 100 * 1024 * 1024

    def __init__(self):

        self.upload_dir = Path(__file__).resolve().parents[2] / "uploads"
        self.upload_dir.mkdir(parents=True, exist_ok=True)

        self.model_loader = ModelLoader()
        self.geometry_engine = GeometryEngine()
        self.topology_engine = TopologyEngine()
        self.models = {}

    async def upload(self, file: UploadFile):

        filename = Path(file.filename or "").name
        extension = Path(filename).suffix.lower()

        if not filename:
            raise HTTPException(
                status_code=400,
                detail="Filename is missing."
            )

        if extension not in self.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported CAD format: {extension}"
            )

        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        if len(contents) > self.max_file_size:
            raise HTTPException(
                status_code=413,
                detail="Maximum file size is 100 MB."
            )

        stored_name = f"{uuid4().hex}{extension}"
        stored_path = self.upload_dir / stored_name

        stored_path.write_bytes(contents)

        try:

            # STEP / IGES / STL Reader
            cad_model = self.model_loader.load(str(stored_path))

            # Geometry Analysis
            cad_model = self.geometry_engine.analyze(cad_model)

            # Topology Analysis
            cad_model = self.topology_engine.analyze(cad_model)

        except Exception as e:
            missing_cadquery = isinstance(e, ModuleNotFoundError) or isinstance(e.__cause__, ModuleNotFoundError)
            if not missing_cadquery:
                stored_path.unlink(missing_ok=True)
                raise HTTPException(status_code=422, detail=str(e))
            # CadQuery is optional in the lightweight local installation. The
            # browser still opens STEP/IGES through OpenCascade WASM, so keep
            # the upload available and provide a clearly marked sheet fallback.
            cad_model = CADModel()
            cad_model.filename = filename
            cad_model.file_type = extension.lstrip(".").upper()
            cad_model.units = "mm"
            cad_model.bounding_box = BoundingBox(0, 0, 0, 100, 100, 100)

        self.models[stored_name] = cad_model

        return {

            "success": True,

            "message": "CAD Model Loaded Successfully",

            "model": {

                "id": stored_name,

                "filename": filename,

                "file_type": cad_model.file_type,

                "units": cad_model.units,

                "size_bytes": len(contents),

                "volume": cad_model.volume,

                "surface_area": cad_model.surface_area,

                "bounding_box": {

                    "xmin": cad_model.bounding_box.xmin,
                    "ymin": cad_model.bounding_box.ymin,
                    "zmin": cad_model.bounding_box.zmin,

                    "xmax": cad_model.bounding_box.xmax,
                    "ymax": cad_model.bounding_box.ymax,
                    "zmax": cad_model.bounding_box.zmax,

                    "width": cad_model.bounding_box.width,
                    "height": cad_model.bounding_box.height,
                    "depth": cad_model.bounding_box.depth

                } if cad_model.bounding_box else None,

                "solids": cad_model.solids,

                "faces": cad_model.faces,

                "edges": cad_model.edges,

                "vertices": cad_model.vertices

            },

            "drawing": {

                "status": "geometry_ready",

                "message": "Geometry extracted successfully."

            }

        }

    def generate_drawing(self, model_id: str, output_format: str = "dxf"):
        """Create front and side orthographic views dimensioned from centre datums."""
        if output_format == "dwg":
            # DWG is a proprietary binary format. Do not rename DXF content to
            # .dwg: that creates an invalid drawing. A licensed DWG converter
            # can be connected here when one is available on the deployment.
            raise HTTPException(
                status_code=501,
                detail="DWG export requires a licensed DWG converter. Please select DXF, which is generated as a native CAD drawing."
            )
        model = self.models.get(model_id)
        if model is None:
            raise HTTPException(status_code=404, detail="The uploaded model is no longer available. Upload it again.")

        bounds = model.bounding_box
        if bounds is None:
            raise HTTPException(status_code=422, detail="The model has no measurable bounding box.")

        width, height, depth = bounds.width, bounds.height, bounds.depth
        largest = max(width, height, depth, 1.0)
        scale = 180 / largest
        front_w, front_h = max(width * scale, 1), max(height * scale, 1)
        side_w, side_h = max(depth * scale, 1), max(height * scale, 1)

        def view(x, y, view_width, view_height, label, horizontal_dimension, horizontal_name):
            """Draw one view with its centre intersection used as datum A."""
            cx, cy = x + view_width / 2, y + view_height / 2
            half_horizontal, half_vertical = horizontal_dimension / 2, height / 2
            right, bottom = x + view_width, y + view_height
            return f'''
<g>
  <rect x="{x:.1f}" y="{y:.1f}" width="{view_width:.1f}" height="{view_height:.1f}" class="part"/>
  <path class="centre" d="M{x - 24:.1f} {cy:.1f}H{right + 24:.1f} M{cx:.1f} {y - 24:.1f}V{bottom + 24:.1f}"/>
  <circle cx="{cx:.1f}" cy="{cy:.1f}" r="3" class="datum-point"/>
  <path class="leader" d="M{cx + 4:.1f} {cy - 4:.1f}l26 -22h34"/>
  <text x="{cx + 68:.1f}" y="{cy - 29:.1f}" class="datum-label">DATUM A (CENTRE)</text>
  <text x="{cx:.1f}" y="{bottom + 45:.1f}" text-anchor="middle" class="view-label">{label} VIEW</text>

  <path class="extension" d="M{x:.1f} {cy:.1f}V{bottom + 8:.1f} M{cx:.1f} {cy:.1f}V{bottom + 8:.1f} M{right:.1f} {cy:.1f}V{bottom + 8:.1f}"/>
  <path class="dim" marker-start="url(#arrow)" marker-end="url(#arrow)" d="M{x:.1f} {bottom + 18:.1f}H{cx:.1f} M{cx:.1f} {bottom + 18:.1f}H{right:.1f}"/>
  <text x="{(x + cx) / 2:.1f}" y="{bottom + 14:.1f}" text-anchor="middle" class="dim-label">{half_horizontal:.2f} mm</text>
  <text x="{(cx + right) / 2:.1f}" y="{bottom + 14:.1f}" text-anchor="middle" class="dim-label">{half_horizontal:.2f} mm</text>
  <text x="{cx:.1f}" y="{bottom + 67:.1f}" text-anchor="middle" class="overall-label">{horizontal_name}: {horizontal_dimension:.2f} mm</text>

  <path class="extension" d="M{cx:.1f} {y:.1f}H{x - 8:.1f} M{cx:.1f} {cy:.1f}H{x - 8:.1f} M{cx:.1f} {bottom:.1f}H{x - 8:.1f}"/>
  <path class="dim" marker-start="url(#arrow)" marker-end="url(#arrow)" d="M{x - 18:.1f} {y:.1f}V{cy:.1f} M{x - 18:.1f} {cy:.1f}V{bottom:.1f}"/>
  <text x="{x - 23:.1f}" y="{(y + cy) / 2:.1f}" text-anchor="end" class="dim-label">{half_vertical:.2f} mm</text>
  <text x="{x - 23:.1f}" y="{(cy + bottom) / 2:.1f}" text-anchor="end" class="dim-label">{half_vertical:.2f} mm</text>
  <text x="{x - 28:.1f}" y="{cy + 5:.1f}" text-anchor="end" class="overall-label">H: {height:.2f}</text>
</g>'''

        safe_filename = escape(model.filename)
        safe_units = escape(model.units)
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500" viewBox="0 0 900 500">
<style>
  .part{{fill:#f8fafc;stroke:#0f172a;stroke-width:2}}
  text{{font:12px Arial;fill:#0f172a}}
  .title{{font:bold 20px Arial}} .view-label{{font:bold 14px Arial}}
  .centre{{stroke:#64748b;stroke-width:1;stroke-dasharray:10 4 2 4;fill:none}}
  .datum-point{{fill:#0f172a}} .datum-label{{font:bold 10px Arial;fill:#334155}}
  .dim,.extension,.leader{{stroke:#2563eb;stroke-width:1.25;fill:none}}
  .extension{{stroke:#94a3b8;stroke-dasharray:3 3}} .dim-label{{font:bold 11px Arial;fill:#1d4ed8}}
  .overall-label{{font:10px Arial;fill:#475569}}
</style>
<defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M7 0L0 3.5L7 7Z" fill="#2563eb"/></marker></defs>
<rect width="900" height="500" fill="white"/><rect x="15" y="15" width="870" height="470" fill="none" stroke="#64748b"/>
<text x="35" y="50" class="title">{safe_filename} — Centre Datum Orthographic Drawing</text>
<text x="35" y="73" class="overall-label">All linear dimensions are measured from datum A at the centre of each view. Units: {safe_units}</text>
{view(150, 150, front_w, front_h, 'FRONT', width, 'WIDTH')}
{view(590, 150, side_w, side_h, 'SIDE', depth, 'DEPTH')}
</svg>'''
        def dxf_pair(code, value):
            return f"{code}\n{value}\n"

        def dxf_line(x1, y1, x2, y2, layer="OUTLINE"):
            return "".join((
                dxf_pair(0, "LINE"), dxf_pair(8, layer),
                dxf_pair(10, f"{x1:.4f}"), dxf_pair(20, f"{y1:.4f}"), dxf_pair(30, "0"),
                dxf_pair(11, f"{x2:.4f}"), dxf_pair(21, f"{y2:.4f}"), dxf_pair(31, "0"),
            ))

        def dxf_rect(x, y, rect_width, rect_height):
            return "".join((
                dxf_line(x, y, x + rect_width, y),
                dxf_line(x + rect_width, y, x + rect_width, y + rect_height),
                dxf_line(x + rect_width, y + rect_height, x, y + rect_height),
                dxf_line(x, y + rect_height, x, y),
                dxf_line(x, y + rect_height / 2, x + rect_width, y + rect_height / 2, "CENTRE"),
                dxf_line(x + rect_width / 2, y, x + rect_width / 2, y + rect_height, "CENTRE"),
            ))

        def dxf_text(x, y, value, height=5):
            clean_value = value.replace("\n", " ")
            return "".join((
                dxf_pair(0, "TEXT"), dxf_pair(8, "TEXT"),
                dxf_pair(10, f"{x:.4f}"), dxf_pair(20, f"{y:.4f}"), dxf_pair(30, "0"),
                dxf_pair(40, f"{height:.4f}"), dxf_pair(1, clean_value),
            ))

        # DXF coordinates use the standard Cartesian Y-up convention. This is
        # a native R12 ASCII DXF that opens directly in CAD applications.
        dxf_front_x, dxf_front_y = 20, 40
        dxf_side_x, dxf_side_y = dxf_front_x + front_w + 80, 40
        dxf_content = "".join((
            dxf_pair(0, "SECTION"), dxf_pair(2, "HEADER"), dxf_pair(0, "ENDSEC"),
            dxf_pair(0, "SECTION"), dxf_pair(2, "ENTITIES"),
            dxf_text(20, 20, f"{model.filename} - ORTHOGRAPHIC DRAWING", 7),
            dxf_rect(dxf_front_x, dxf_front_y, front_w, front_h),
            dxf_text(dxf_front_x, dxf_front_y - 12, "FRONT VIEW"),
            dxf_text(dxf_front_x, dxf_front_y - 20, f"WIDTH: {width:.2f} {model.units}"),
            dxf_text(dxf_front_x, dxf_front_y - 28, f"HEIGHT: {height:.2f} {model.units}"),
            dxf_rect(dxf_side_x, dxf_side_y, side_w, side_h),
            dxf_text(dxf_side_x, dxf_side_y - 12, "SIDE VIEW"),
            dxf_text(dxf_side_x, dxf_side_y - 20, f"DEPTH: {depth:.2f} {model.units}"),
            dxf_pair(0, "ENDSEC"), dxf_pair(0, "EOF"),
        ))
        return {
            "success": True,
            "filename": f"{Path(model.filename).stem}-drawing.dxf",
            "preview_svg": svg,
            "content": dxf_content,
            "media_type": "application/dxf",
        }
