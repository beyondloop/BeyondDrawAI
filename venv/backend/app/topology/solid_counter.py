class SolidCounter:
    """Counts solid bodies in a CadQuery workplane or shape."""

    def count(self, source) -> int:
        return len(self._shape(source).Solids())

    @staticmethod
    def _shape(source):
        if source is None:
            raise ValueError("A CAD workplane or shape is required.")

        return source.val() if hasattr(source, "val") else source
