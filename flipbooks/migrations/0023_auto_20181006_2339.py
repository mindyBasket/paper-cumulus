# Generated by Django 2.1.1 on 2018-10-07 03:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flipbooks', '0022_strip_children_index'),
    ]

    operations = [
        migrations.AlterField(
            model_name='strip',
            name='children_index',
            field=models.TextField(blank=True, default='', max_length=500, null=True),
        ),
        migrations.AlterField(
            model_name='strip',
            name='children_li',
            field=models.TextField(blank=True, default='', max_length=500, null=True),
        ),
    ]