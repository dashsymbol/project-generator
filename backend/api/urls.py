from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import health, questionnaire_config, ProjectViewSet, UserSkillProfileViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'skills', UserSkillProfileViewSet, basename='skill-profile')

urlpatterns = [
    path("health", health),
    path("config/questionnaire", questionnaire_config),
    path("", include(router.urls)),
]
