from fastapi import APIRouter, UploadFile, File, HTTPException, Query

from ..services.cad_service import CADService

router = APIRouter()

cad_service = CADService()


@router.get("/")
def home():
    return {
        "message": "BeyondDraw AI API"
    }


@router.get("/hello")
def hello():
    return {
        "message": "Welcome to BeyondDraw AI"
    }


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        return await cad_service.upload(file)

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.post("/drawings/{model_id}")
def generate_drawing(model_id: str, format: str = Query("dxf", pattern="^(dxf|dwg)$")):
    return cad_service.generate_drawing(model_id, format)
