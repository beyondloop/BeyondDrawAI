from ..ai_engine.ai_engine import AIEngine


class AIService:

    def __init__(self):

        self.engine = AIEngine()

    def analyze(self, cad_model):

        return self.engine.process(cad_model)