from django.contrib import admin

from . import models

class SeriesModelAdmin(admin.ModelAdmin):
    list_display = ("id", 'title', "slug", "is_demo")

class FlipbookModelAdmin(admin.ModelAdmin):
    list_display = ("id", "__str__", "id64", "title")

# Register your models here.
admin.site.register(models.Series, SeriesModelAdmin)
admin.site.register(models.Flipbook, FlipbookModelAdmin)