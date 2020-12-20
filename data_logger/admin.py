from django.contrib import admin


from .models import Data_logger_meta,Data_logger,Logfiles,Data_logger_compression

admin.site.register(Data_logger_meta)
admin.site.register(Data_logger)
admin.site.register(Logfiles)
admin.site.register(Data_logger_compression)
# Register your models here.
# Register your models here.
