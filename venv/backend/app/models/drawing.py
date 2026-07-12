from pydantic import BaseModel
from typing import List

from .dimension import Dimension
from .projection import Projection


class Drawing(BaseModel):

    drawing_name: str

    projections: List[Projection] = []

    dimensions: List[Dimension] = []
