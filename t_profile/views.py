from django.shortcuts import render
import time
import traceback, sys
from openpyxl import Workbook, load_workbook
from django.http import HttpResponse,HttpRequest,HttpResponseBadRequest
import json
import os
import datetime
import sys
import json
from brewserver import settings
import commands.models
from .temp_profile import Temp_profile
from django.template import loader
from threading import Thread


t_profile=Temp_profile(commands.models.queue)

def get(request:HttpRequest):
    files = []
    for file in os.listdir( os.path.join(settings.BASE_DIR, 'temp_profiles')):
        if file.endswith(".xlsx"):
            files.append(str(file))
    return HttpResponse(json.dumps({"profiles": files}),content_type='application/json')

def start(request:HttpRequest):
    Thread(target=t_profile.run).start()
    return HttpResponse("")


def load(request:HttpRequest):
    if request.method=='POST' :
        global t_profile
        t_profile.open(request.POST['file'])
        return HttpResponse("")
    else:
        template = loader.get_template('errors/error_code.html')
        return HttpResponseBadRequest(template.render({
            'error': 401,
            'description': 'Only POST is allowed'
        }))
    pass

