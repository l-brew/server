from django.shortcuts import render
from django.http import HttpResponse,HttpRequest,HttpResponseBadRequest
from datetime import datetime
from .models import Data_logger,Logfiles,Data_logger_meta
import json
import pytz

from django.template import loader

def data_http_response(logs,timestamp):
    data=[]
    if len(logs)>0:
        for e in logs:
            row=[]
            row.append(e.time.timestamp())
            row.append(e.actuating_value)
            row.append(e.set_point)
            row.append(e.temp)
            row.append(e.tilt_grav)
            data.append(row)
        body={'data':data,'time':data[-1][0]}
    else:
        body={'data':[],'time':timestamp}
    return HttpResponse(json.dumps(body),content_type='application/json')

def data_by_filename(request:HttpRequest):
    if request.method=='GET':
        logs = Data_logger.get_by_filename('test')
        return data_http_response(logs,0)

    if request.method=='POST':
        timestamp=float(request.POST['timestamp'])
        filename=(request.POST['filename'])
        if filename == '' :
            filename = Data_logger_meta.objects.first().filename
        dt=datetime.fromtimestamp(timestamp,tz=pytz.utc)
        logs = Data_logger.get_newer_than(filename,dt)
        return data_http_response(logs,timestamp)

def logfiles(request:HttpRequest):
    files=[]
    for file in Logfiles.objects.all():
        files.append(str(file.filename))
    res={"logfiles": files}
    return HttpResponse(json.dumps(res), content_type='application/json')

def newfile(request:HttpRequest):
    if request.method == 'POST':
        if 'filename'  in request.POST:
            lf = Logfiles()
            lf.filename=request.POST['filename']
            lf.save()
            dlm=Data_logger_meta.objects.first()
            dlm.filename=request.POST['filename']
            dlm.save()
        return HttpResponse("")
    else:
        template = loader.get_template('errors/error_code.html')
        return HttpResponseBadRequest(template.render({
            'error': 401,
            'description': 'Only POST is allowed'
        }))

