# Generated by Django 3.1.3 on 2020-12-06 10:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('status', '0002_status_ntc1'),
    ]

    operations = [
        migrations.AddField(
            model_name='status',
            name='ntc2',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
    ]
