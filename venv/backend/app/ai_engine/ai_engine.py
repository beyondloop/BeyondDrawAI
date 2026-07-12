from .feature_detector import FeatureDetector
from .dimension_ai import DimensionAI
from .annotation_ai import AnnotationAI
from .section_ai import SectionAI
from .view_selector_ai import ViewSelectorAI
from .tolerance_ai import ToleranceAI


class AIEngine:

    def __init__(self):

        self.feature = FeatureDetector()

        self.dimension = DimensionAI()

        self.annotation = AnnotationAI()

        self.section = SectionAI()

        self.view = ViewSelectorAI()

        self.tolerance = ToleranceAI()

    def process(self, cad_model):

        features = self.feature.detect(cad_model)

        dimensions = self.dimension.generate(cad_model)

        annotations = self.annotation.generate(cad_model)

        sections = self.section.generate(cad_model)

        views = self.view.select(cad_model)

        tolerance = self.tolerance.generate(cad_model)

        return {

            "features": features,

            "dimensions": dimensions,

            "annotations": annotations,

            "sections": sections,

            "views": views,

            "tolerance": tolerance

        }