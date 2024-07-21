from django.db import models


class Msc(models.Model):
    pw_hash=models.CharField(max_length=100)


# Create your models here.
