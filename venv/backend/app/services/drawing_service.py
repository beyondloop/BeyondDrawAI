from backend.app.drawing_engine.drawing_engine import DrawingEngine


class DrawingService:

    def generate_front_view(self, model):

        print("Generating Front View")

    def generate_top_view(self, model):

        print("Generating Top View")

    def generate_side_view(self, model):

        print("Generating Side View")

    def generate_dimensions(self, model):

        print("Generating Dimensions")
    
    def __init__(self):

        self.engine = DrawingEngine()

    def generate(self, cad_model):

        return self.engine.generate(cad_model)