from pydantic import BaseModel


class Dimension(BaseModel):

    name: str

    value: float

    unit: str = "mm"

    dimension_type: str