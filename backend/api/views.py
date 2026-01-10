import json
import logging
import threading
from pathlib import Path
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .models import Project, Client
from .serializers import ProjectSerializer
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

def run_background_generation(project_id, category, answers):
    """
    Background worker to call LLM and update Project/Client.
    """
    logger.info(f"Starting background generation for Project {project_id}")
    try:
        service = LLMService()
        client_data, project_data = service.generate_project(category, answers)

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

    @action(detail=False, methods=['post'])
    def generate(self, request):
        category = request.data.get("category")
        answers = request.data.get("answers")

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
            title="Generating Project...",
            category=category,
            objective="Project brief is being generated...",
            status=Project.Status.GENERATING,
            source_answers=answers
        )

        # 2. Spawn Background Thread
        thread = threading.Thread(
            target=run_background_generation,
            args=(project.id, category, answers)
        )
        thread.start()

        # 3. Serialize and Return Immediately
        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
