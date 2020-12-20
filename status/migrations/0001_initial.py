# Generated by Django 3.1.3 on 2020-11-22 11:00

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Status',
            fields=[
                ('time', models.DateTimeField()),
                ('temp', models.FloatField()),
                ('set_point', models.FloatField()),
                ('k_i', models.FloatField()),
                ('k_p', models.FloatField()),
                ('actuating_value', models.FloatField()),
                ('err', models.FloatField()),
                ('i_err', models.FloatField()),
                ('heater', models.BooleanField()),
                ('cooler', models.BooleanField()),
                ('stirrer', models.BooleanField()),
                ('power', models.FloatField()),
                ('reg', models.BooleanField()),
                ('ramp', models.FloatField()),
                ('target', models.FloatField()),
                ('period', models.FloatField()),
                ('frozen', models.BooleanField()),
                ('tilt_temp', models.FloatField(null=True)),
                ('tilt_grav', models.FloatField(null=True)),
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('server_time', models.DateTimeField()),
            ],
        ),
    ]
