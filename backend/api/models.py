import uuid
from django.db import models

class Client(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField()
    summary = models.TextField()
    target_audience = models.TextField()
    primary_problem = models.TextField()
    constraints = models.JSONField(default=list)  # List of strings
    brand_voice = models.TextField(blank=True, null=True)
    success_definition = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projects')
    category = models.TextField()
    title = models.TextField()
    objective = models.TextField()
    problem_statement = models.TextField()
    
    # Detailed structured fields
    deliverables = models.JSONField(default=list)  # List of objects
    requirements = models.JSONField(default=dict)  # Object { must_include: [], must_avoid: [] }
    evaluation_criteria = models.JSONField(default=list)  # List of objects
    tone_rules = models.JSONField(default=list)  # List of strings
    source_answers = models.JSONField(default=dict)  # The original Q&A
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
