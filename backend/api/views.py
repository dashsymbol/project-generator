import json
import logging
import threading
from pathlib import Path
from django.conf import settings
from django.conf import settings
from rest_framework import viewsets, status, authentication, permissions
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .models import Project, Client, UserSkillProfile
from .serializers import ProjectSerializer, UserSkillProfileSerializer
from .llm import LLMService

logger = logging.getLogger('api')

@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})

@api_view(["GET"])
def questionnaire_config(request):
    config_path = settings.BASE_DIR / "config" / "questionnaire.json"
    try:
        with open(config_path, "r") as f:
            data = json.load(f)
        return Response(data)
    except FileNotFoundError:
        return Response({"error": "Configuration file not found"}, status=500)
    except json.JSONDecodeError:
        return Response({"error": "Invalid configuration file"}, status=500)

def run_background_generation(project_id, category, answers, profile_data=None, difficulty=None, focus_area=None, language="en"):
    """
    Background worker to call LLM and update Project/Client.
    """
    logger.info(f"Starting background generation for Project {project_id} (Lang: {language})")
    try:
        service = LLMService()
        client_data, project_data = service.generate_project(
            category, 
            answers, 
            profile_data=profile_data, 
            difficulty=difficulty, 
            focus_area=focus_area,
            language=language
        )

        # Retrieve the placeholder project
        try:
            project = Project.objects.get(id=project_id)
            client = project.client
            
            # Update Client
            for key, value in client_data.items():
                setattr(client, key, value)
            client.save()

            # Update Project
            for key, value in project_data.items():
                if key != 'client' and key != 'id': # Don't overwrite ID or FK
                     setattr(project, key, value)
            
            project.status = Project.Status.DRAFT # Or whatever the LLM returned, usually DRAFT
            project.save()
            
            logger.info(f"Successfully generated Project {project_id}")

        except Project.DoesNotExist:
            logger.error(f"Project {project_id} not found during background generation.")

    except Exception as e:
        logger.error(f"Background generation failed for Project {project_id}", exc_info=True)
        # Update status to FAILED
        try:
            project = Project.objects.get(id=project_id)
            project.status = Project.Status.FAILED
            project.save()
        except:
             pass

class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    authentication_classes = (authentication.TokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        """Retrieve projects for the authenticated user"""
        return self.queryset.filter(owner=self.request.user)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Project generate validation failed: {serializer.errors}")
            # We still proceed with the custom logic below to extract fields manually 
            # as it was implemented before, but logging helps debug.
        
        category = request.data.get("category")
        answers = request.data.get("answers")
        difficulty = request.data.get("difficulty")
        focus_area = request.data.get("focus_area")

        # Extract language from header
        accept_language = request.headers.get('Accept-Language', 'en')
        language = accept_language.split(',')[0].strip()[:2]
        if language not in ['en', 'es']:
            language = 'en'

        if not category or not answers:
            return Response(
                {"error": "Category and answers are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Create Placeholders
        # Create a pending client
        client = Client.objects.create(
            name="Generating Client...",
            industry=category,
            summary="Client profile is being generated."
        )

        # Create a pending project
        project = Project.objects.create(
            client=client,
            owner=request.user,
            title="Generating Project...",
            category=category,
            objective="Project brief is being generated...",
            status=Project.Status.GENERATING,
            source_answers=answers
        )

        # 2. Spawn Background Thread
        # Fetch profile data to pass to thread
        profile = None
        try:
             user_profile = UserSkillProfile.objects.get(user=request.user)
             # Basic serialization
             profile = {
                 "skills": user_profile.skills,
                 "skill_level": user_profile.skill_level,
                 "preferred_tools": user_profile.preferred_tools,
                 "excluded_tools": user_profile.excluded_tools
             }
        except UserSkillProfile.DoesNotExist:
             pass

        thread = threading.Thread(
            target=run_background_generation,
            args=(project.id, category, answers, profile, difficulty, focus_area, language)
        )
        thread.start()

        # 3. Serialize and Return Immediately
        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserSkillProfileViewSet(viewsets.ModelViewSet):
    """Manage user skill profile"""
    serializer_class = UserSkillProfileSerializer
    authentication_classes = (authentication.TokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)
    queryset = UserSkillProfile.objects.all()

    def get_queryset(self):
        """Retrieve profile for authenticated user"""
        return self.queryset.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"UserSkillProfile validation failed: {serializer.errors}")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
        if not serializer.is_valid():
            logger.warning(f"UserSkillProfile update validation failed: {serializer.errors}")
        return super().update(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Link profile to user"""
        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            logger.error(f"Error saving UserSkillProfile: {str(e)}")
            raise

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get my profile specifically (convenience)"""
        profile = self.get_queryset().first()
        if profile:
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate skill profile suggestions using AI"""
        user_input = request.data.get('user_input', '')
        
        if not user_input or len(user_input.strip()) < 10:
            return Response(
                {"error": "Please provide a description of your goals (at least 10 characters)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extract language from header
        accept_language = request.headers.get('Accept-Language', 'en')
        language = accept_language.split(',')[0].strip()[:2]
        if language not in ['en', 'es']:
            language = 'en'

        try:
            from .llm import LLMService
            llm = LLMService()
            suggestions = llm.generate_skill_profile(user_input, language=language)
            
            logger.info(f"Generated skill profile suggestions for user {request.user.id}")
            return Response(suggestions, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error generating skill profile: {str(e)}")
            return Response(
                {"error": "Failed to generate profile suggestions. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
