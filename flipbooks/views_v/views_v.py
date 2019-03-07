from pathlib import Path, PurePath, PurePosixPath #new in Python 3.4+
from django.conf import settings

from django.http import JsonResponse, HttpResponseNotFound
from django.core.files.storage import default_storage as storage

# TODO: this exact function is currently in thumbnailer_helpers.py! 
#       You might be able to put this in a separate module so that you can import.

def get_rel_path(path, reldir):
    ''' 
    path = string
    reldir = string, relative dir that the path should start with
    resulting relative path will START WITH reldir.
    '''
    # Remove everyhing before the dir provided (reldir), basically removing 
    # any leading slash.
    path = Path(path)
    start_i = 0    
    for pathpart in path.parts:
        if pathpart != reldir:
            start_i += 1
        else:
            break

    # join the path starting from where reldir is
    result_path = Path("").joinpath(*path.parts[start_i:])
    return result_path


'''
Reads only one relative url at a time, and returns absolute path to the storage
'''

def get_store_URL(request, *args, **kwargs):

    # these urls are relative for s3
    rel_url = request.GET.get('rel_url', None)

    # just need to convert it to s3 url. That's all.

    # Note: storage starts from INSIDE 'media' folder, because that's 
    #       the media url provided in the settings. 

    # print("...storage.exists? {}".format(storage.listdir(""))) # I have NO idea where I am
    # print("...converting url: {}".format(rel_url))

    rel_obj_path = get_rel_path(rel_url, "frame_images")
    print("------ rel_obj_path: {}".format(rel_obj_path))
    abs_obj_path = ''
    store_path = ''
    if storage.exists(str(rel_obj_path)):
        print("EXISTS! Object at {}".format(rel_obj_path))
        # print("Path check: {}".format(storage.path(str(rel_obj_path)) )) # fails here on heroku

        if hasattr(settings, 'USE_S3') and settings.USE_S3 == True:
            # Generate path for S3
            if hasattr(settings, 'MEDIA_URL'):
                store_path = "{}{}".format(settings.MEDIA_URL, rel_obj_path)
            else:
                return JsonResponse({
                    'status':'false',
                    'message': "Cannot get S3 media url from settings."
                    }, status=500
                )
        else:
            store_path = PurePosixPath(storage.path(str(rel_obj_path)))
            # abs_obj_path = store_path.joinpath(rel_obj_path) # no need?

        abs_obj_path = store_path
        print("------- joined path = {}".format(store_path))
    else:
        print("ERROR: Could not find object at {}".format(rel_obj_path))

    # Response
    return JsonResponse({'url': str(abs_obj_path)})

