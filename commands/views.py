import urllib.parse

from django.http import HttpResponse,HttpRequest,HttpResponseBadRequest
from django.template import loader
from django.shortcuts import render
from commands import models
# Create your views here.
import queue

def send(request:HttpRequest):
    if request.method == 'POST':
        auth = False
        if 'authorized' in request.session:
            auth = request.session['authorized']

        if auth:

            cmd= urllib.parse.unquote(request.POST['cmd'])
            models.queue.put(cmd,block=False)
            return HttpResponse(urllib.parse.unquote(request.POST['cmd']))
        else:
            return HttpResponse('unauthorized')
    else:
        template = loader.get_template('errors/error_code.html')
        return HttpResponseBadRequest(template.render({
            'error':401,
            'description':'Only POST is allowed'
        }))

    return HttpResponse("TEST")

def listen(request):
    try:
        msg = models.queue.get(timeout=5)
    except queue.Empty:
        msg=""
    return HttpResponse(msg)
