from django.db import models
from status.models import Status
import pytz


class Data_logger(models.Model):
    filename = models.CharField(max_length=51)
    time = models.DateTimeField()
    actuating_value = models.FloatField()
    tilt_grav = models.FloatField(null=True)
    tilt_temp = models.FloatField(null=True)
    set_point = models.FloatField()
    temp = models.FloatField()

    @classmethod
    def log(cls):
        dlm = Data_logger_meta.objects.first()
        dl_prev = cls.objects.filter(filename=dlm.filename).order_by('-time').first()
        stat: Status = Status.objects.first()
        c1=c2=c3=c4=False
        if dl_prev is not None:
            comp = Data_logger_compression.objects.first()
            c1 = abs(dl_prev.temp - stat.temp) > comp.temp
            c2 = (stat.time - dl_prev.time).seconds > comp.time
            c3 = abs(dl_prev.set_point- stat.set_point) > comp.set_point
            if dl_prev.tilt_grav is not None and stat.tilt_grav is not None:
                c4 = abs(dl_prev.tilt_grav- stat.tilt_grav) > comp.tilt_grav
            c5 = abs(dl_prev.actuating_value- stat.actuating_value) > comp.actuating_value
        else:
            c1=True
        if c1 or c2 or c3 or c4 :
            dl = cls()
            dl.temp = stat.temp
            dl.time = stat.time
            dl.set_point = stat.set_point
            dl.tilt_grav = stat.tilt_grav
            dl.tilt_temp = stat.tilt_temp
            dl.actuating_value = stat.actuating_value
            dl.filename=dlm.filename
            dl.save()


    @classmethod
    def get_newer_than(cls,filename,time):
        return cls.get_by_filename(filename).filter(time__gt=time)



    @classmethod
    def get_by_filename(cls,filename):
        return cls.objects.filter(filename=filename)


class Data_logger_meta(models.Model):
    filename = models.CharField(max_length=50)

class Data_logger_compression(models.Model):
    temp=models.FloatField(default=0.1)
    time=models.FloatField(default=300)
    set_point=models.FloatField(default=0.1)
    actuating_value=models.FloatField(default=1)
    tilt_grav=models.FloatField(default=0.1)
    tilt_temp=models.FloatField(default=0.1)

class Logfiles(models.Model):
    filename = models.CharField(max_length=50,primary_key=True)
