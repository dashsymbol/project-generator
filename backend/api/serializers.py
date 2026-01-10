from rest_framework import serializers
from .models import Client, Project

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    # Allows client_id to be passed if needed for creation, though usually generated together
    
    class Meta:
        model = Project
        fields = '__all__'
