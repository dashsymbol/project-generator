from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import health, questionnaire_config, ProjectViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    path("health", health),
    path("config/questionnaire", questionnaire_config),
    path("", include(router.urls)),
]
