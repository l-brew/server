from django.urls import path
from django.contrib import admin
import t_profile.views


urlpatterns = [
    path('get/',t_profile.views.get),
    path('load/', t_profile.views.load),
    path('start/', t_profile.views.start),
]
