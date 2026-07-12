from pydantic import BaseModel


class Projection(BaseModel):

    name: str

    svg_file: str = ""

    width: int = 0

    height: int = 0