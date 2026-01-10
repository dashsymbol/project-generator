from rest_framework import serializers
from .models import Client, Project, UserSkillProfile, LearningOption

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('id', 'owner', 'created_at', 'status', 'approval_log')

class UserSkillProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = UserSkillProfile
        fields = '__all__'
        read_only_fields = ('id', 'user')

class LearningOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningOption
        fields = '__all__'
