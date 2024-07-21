import json

from django.http import HttpResponse
from django.shortcuts import render
import bcrypt
import logging
from .models import Msc
# Create your views here.

def home_view(request):
    logging.info("Test")
    return HttpResponse(render(request,'frontend/index.html',{}))

def login(request):
    if request.method=='GET':
        return HttpResponse(json.dumps({"uuid":"123"}),content_type='application/json')
    if request.method=='POST':
        hash=Msc.objects.first().pw_hash
        if bcrypt.checkpw(bytes(request.POST['passwd'], 'utf-8'),bytes(hash,'utf-8')):
            request.session['authorized']=True
        return HttpResponse(json.dumps({"uuid":"123"}),content_type='application/json')


def logout(request):
    request.session['authorized']=False

    return HttpResponse('')

def authorized(request):
    auth=False
    if 'authorized' in request.session:
        auth = request.session['authorized']
    return HttpResponse(auth)
