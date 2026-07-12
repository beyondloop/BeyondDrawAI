class CADKernel:

    def __init__(self):

        self.model = None

    def load(self, model):

        self.model = model

    def get_model(self):

        return self.model