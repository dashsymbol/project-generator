import uuid
from django.db import models
from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Client(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    client_type = models.CharField(max_length=100, blank=True, null=True)
    industry = models.CharField(max_length=255, blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    what_they_do = models.TextField(blank=True, null=True)
    target_audience = models.TextField(blank=True, null=True)
    primary_need = models.TextField(blank=True, null=True)
    preferences = models.JSONField(default=list)  # List or structured text
    dislikes = models.JSONField(default=list)  # List or structured text
    communication_style = models.CharField(max_length=255, blank=True, null=True)
    decision_style = models.CharField(max_length=255, blank=True, null=True)
    constraints = models.JSONField(default=list)
    success_definition = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Project(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        DELIVERED = 'DELIVERED', 'Delivered'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        GENERATING = 'GENERATING', 'Generating'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects', null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projects', db_index=True)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, db_index=True)
    subcategory = models.CharField(max_length=100, blank=True, null=True)
    objective = models.TextField()
    basic_details = models.TextField(blank=True, null=True)
    
    # Client Criteria & Requirements
    client_criteria = models.JSONField(default=dict)
    requirements = models.JSONField(default=dict)  # { must_include, must_avoid }
    
    # Resources
    resources_provided = models.JSONField(default=list)
    resources_excluded = models.JSONField(default=list)
    
    # Deliverables & Evaluation
    deliverables = models.JSONField(default=list)
    evaluation_criteria_technical = models.JSONField(default=list)
    evaluation_criteria_creative = models.JSONField(default=list)
    tone_rules = models.JSONField(default=list)
    
    # Scope
    scope_included = models.JSONField(default=list)
    scope_excluded = models.JSONField(default=list)
    
    # Timestamps & Status
    created_at = models.DateTimeField(auto_now_add=True)
    user_defined_deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True)
    approval_log = models.JSONField(default=list)  # Log of approval events

    # Added to keep backward compatibility or use as generic bucket for old fields if needed
    source_answers = models.JSONField(default=dict)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class UserSkillProfile(models.Model):
    class SkillLevel(models.TextChoices):
        BASIC = 'BASIC', 'Basic'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skill_profile', db_index=True)
    skills = models.JSONField(default=list)
    skill_level = models.CharField(max_length=20, choices=SkillLevel.choices)
    preferred_tools = models.JSONField(default=list)
    excluded_tools = models.JSONField(default=list)

    def __str__(self):
        return f"{self.user.username}'s Profile ({self.skill_level})"

class LearningOption(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project_category = models.CharField(max_length=100, db_index=True)
    suggested_tool_or_skill = models.CharField(max_length=255)
    reason_for_suggestion = models.TextField()
    learning_resource_link = models.URLField()
    is_optional = models.BooleanField(default=True) # Flag: True=Optional, False=Recommended

    def __str__(self):
        return f"{self.suggested_tool_or_skill} ({self.project_category})"
