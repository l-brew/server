from django.shortcuts import render
import json
# Create your views here.
from django.http import HttpResponse,HttpRequest,HttpResponseBadRequest
from django.template import loader
from .models import Status,StatusLock
import time
import logging
from data_logger.views import Data_logger
from django.utils import timezone
import data_logger.models
import t_profile.views

logger = logging.getLogger(__name__)


def index(request):
    template = loader.get_template('status/index.html')
    test = Status.objects.first()

    return HttpResponse(template.render(test.get_dict() ,request))


def full_status(request):
    logger.info("Index")
    stat_o = Status.objects.first()
    wort = data_logger.models.Data_logger.objects.filter(filename=data_logger.models.Data_logger_meta.objects.first().filename).first().tilt_grav
    stat = stat_o.get_dict()
    auth = False
    if 'authorized' in request.session:
        auth = request.session['authorized']
    last_update = stat_o.server_time
    if (timezone.now() - last_update).seconds > 10:
        stat.update({'online': False})
    else:
        stat.update({'online':True})
    stat.update({'authorized':auth})
    stat.update({'temp_profile': t_profile.views.t_profile.getFile()})
    stat.update({'temp_profile_running': t_profile.views.t_profile.running})
    stat.update({'temp_profile_status': t_profile.views.t_profile.status()})
    stat.update({'wort': wort})
    return HttpResponse(json.dumps(stat),content_type='application/json')

def listen(request):
    lock = StatusLock()
    online=lock.acquire()
    return full_status(request)


def report_status(request: HttpRequest):
    if request.method == 'POST':
        stat: Status = Status.objects.first()
        stat.update(request.POST)
        StatusLock.release_all()
        Data_logger.log()
        return HttpResponse(str(request.body))
    else:
        template = loader.get_template('errors/error_code.html')
        return HttpResponseBadRequest(template.render({
            'error':401,
            'description':'Only POST is allowed'
        }))

