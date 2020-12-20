import weakref

from django.db import models
import threading
import logging
from django.utils import timezone
from datetime import datetime
import pytz


class Status(models.Model):
    time = models.DateTimeField()
    temp = models.FloatField()
    set_point = models.FloatField()
    k_i = models.FloatField()
    k_p = models.FloatField()
    # plotMinutes = 0
    actuating_value = models.FloatField()
    err = models.FloatField()
    i_err = models.FloatField()
    heater = models.BooleanField()
    cooler = models.BooleanField()
    stirrer = models.BooleanField()
    power = models.FloatField()
    reg = models.BooleanField()
    ramp = models.FloatField()
    target = models.FloatField()
    period = models.FloatField()
    frozen = models.BooleanField()
    tilt_temp = models.FloatField(null=True)
    tilt_grav = models.FloatField(null=True)
    id = models.IntegerField(primary_key=True)
    server_time = models.DateTimeField()
    ntc1 = models.FloatField()
    ntc2 = models.FloatField()




    def get_dict(self):
        time = self.time.astimezone(pytz.timezone('Europe/Berlin'))
        return {
            'time': time.strftime("%d.%m.%Y %H:%M:%S"),
            'temp': self.temp,
            'set_point': self.set_point,
            'k_i': self.k_i,
            'k_p': self.k_p,
            'actuating_value': self.actuating_value,
            'err': self.err,
            'i_err': self.i_err,
            'heater': self.heater,
            'cooler': self.cooler,
            'stirrer': self.stirrer,
            'power': self.power,
            'reg': self.reg,
            'ramp': self.ramp,
            'target': self.target,
            'period': self.period,
            'frozen': self.frozen,
            'tilt_temp': self.tilt_temp,
            'tilt_grav': self.tilt_grav,
            'ntc1': self.ntc1,
            'ntc2': self.ntc2
        }

    def update(self,d:dict):
        if 'time' in d:
            berlin = pytz.timezone('Europe/Berlin')
            self.time = berlin.localize(datetime.strptime(d['time'],'%Y-%m-%d %H:%M:%S'))
        if 'temp' in d:
            self.temp =round(float( d['temp']),2)
        if 'set_point' in d:
            self.set_point = d['set_point']
        if 'k_i' in d:
            self.k_i = d['k_i']
        if 'k_p' in d:
            self.k_p = d['k_p']
        if 'actuating_value' in d:
            self.actuating_value =round(float( d['actuating_value']),2)
        if 'err' in d:
            self.err =round(float( d['err']),2)
        if 'i_err' in d:
            self.i_err =round(float( d['i_err']),2)
        if 'heater' in d:
            self.heater = d['heater']
        if 'cooler' in d:
            self.cooler = d['cooler']
        if 'stirrer' in d:
            self.stirrer = d['stirrer']
        if 'power' in d:
            self.power = d['power']
        if 'reg' in d:
            self.reg = d['reg']
        if 'ramp' in d:
            self.ramp = d['ramp']
        if 'target' in d:
            self.target = d['target']
        if 'period' in d:
            self.period = d['period']
        if 'frozen' in d:
            self.frozen = d['frozen']
        if 'tilt_temp' in d:
            if d['tilt_temp']=='None':
                self.tilt_temp =None
            else:
                self.tilt_temp =round(float( d['tilt_temp']),2)
        if 'tilt_grav' in d:
            if d['tilt_grav']=='None':
                self.tilt_grav=None
            else:
                self.tilt_grav =round(float( d['tilt_grav']),2)
        if 'ntc1' in d:
            self.ntc1 = round(float(d['ntc1']), 2)
        if 'ntc2' in d:
            self.ntc2 =round(float( d['ntc2']),2)
        self.server_time=timezone.now()
        self.save()

class StatusLock():
    managed=False
    instances = []
    lock=threading.Lock()
    def __init__(self):
        super(StatusLock, self).__init__()
        self.__class__.instances.append(self)
        self.lock.acquire(blocking=False)

    def acquire(self):
        self.lock.acquire(blocking=True,timeout=10)

    @classmethod
    def release_all(cls):
        for i,lock in enumerate(cls.instances) :
            if lock.lock.locked():
                lock.lock.release()
                logging.getLogger('django').debug(i)
            del lock
