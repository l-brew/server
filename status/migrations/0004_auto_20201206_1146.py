# Generated by Django 3.1.3 on 2020-12-06 10:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('status', '0003_status_ntc2'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='status',
            name='ntc1',
        ),
        migrations.AddField(
            model_name='status',
            name='ntc0',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
    ]