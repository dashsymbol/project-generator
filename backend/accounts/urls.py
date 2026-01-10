from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('signup/', views.CreateUserView.as_view(), name='signup'),
    path('login/', views.CreateTokenView.as_view(), name='token'),
    path('me/', views.ManageUserView.as_view(), name='me'),
]
