# Generated by Django 2.1.1 on 2018-11-11 05:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flipbooks', '0030_strip_frame_duration'),
    ]

    operations = [
        migrations.AlterField(
            model_name='strip',
            name='frame_duration',
            field=models.IntegerField(blank=True, default='400'),
        ),
    ]
