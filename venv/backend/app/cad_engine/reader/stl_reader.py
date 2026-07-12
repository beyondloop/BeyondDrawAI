from .base import CADReader
import struct


def _mesh_bounds(data: bytes):
    """Return an STL mesh envelope for binary or ASCII STL files."""
    if len(data) >= 84:
        triangle_count = struct.unpack_from("<I", data, 80)[0]
        expected_size = 84 + triangle_count * 50
        if expected_size == len(data):
            points = []
            for offset in range(84, len(data), 50):
                points.extend(struct.unpack_from("<9f", data, offset + 12))
            return _bounds_from_values(points)

    values = []
    for line in data.decode("utf-8", errors="ignore").splitlines():
        parts = line.strip().split()
        if len(parts) == 4 and parts[0].lower() == "vertex":
            try:
                values.extend(float(value) for value in parts[1:])
            except ValueError:
                continue
    if not values:
        raise ValueError("The STL file does not contain readable vertices")
    return _bounds_from_values(values)


def _bounds_from_values(values):
    points = list(zip(values[0::3], values[1::3], values[2::3]))
    if not points:
        raise ValueError("The STL file does not contain any vertices")
    xs, ys, zs = zip(*points)
    xmin, xmax = min(xs), max(xs)
    ymin, ymax = min(ys), max(ys)
    zmin, zmax = min(zs), max(zs)
    return {
        "xmin": xmin, "xmax": xmax, "ymin": ymin, "ymax": ymax, "zmin": zmin, "zmax": zmax,
        "width": xmax - xmin, "height": ymax - ymin, "depth": zmax - zmin,
    }


class StlReader(CADReader):

    def supported_extensions(self):
        return [".stl"]

    def load(self, filename):

        print(f"Reading STL : {filename}")

        bounding_box = _mesh_bounds(open(filename, "rb").read())
        return {
            "type": "STL",
            "filename": filename,
            "bounding_box": bounding_box,
            "dimensions": [
                {"name": "Overall width", "value": bounding_box["width"], "unit": "model units"},
                {"name": "Overall height", "value": bounding_box["height"], "unit": "model units"},
                {"name": "Overall depth", "value": bounding_box["depth"], "unit": "model units"},
            ],
        }
