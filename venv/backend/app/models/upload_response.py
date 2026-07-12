from pydantic import BaseModel

from .cad_model import CADModel


class UploadResponse(BaseModel):

    success: bool

    message: str

    model: CADModel
