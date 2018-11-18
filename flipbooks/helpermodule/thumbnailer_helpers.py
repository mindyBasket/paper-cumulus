import os, re
from pathlib import Path, PurePath #new in Python 3.4+
from django.conf import settings

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage as storage
import easy_thumbnails.files as easy_th_files

from . import helpers


''' Takes path to thumbnail image and its dimension to 
    figure out what easy-thumbnail alias it is under.
    Returns dict in format of {<alias>: <path>} so that you can
    update() it onto response object.'''
# thumbnail_path: string, describing path to the image
# thumbnail_dimension: tuple of (width, height)
# alias_dict: dictionary of format like this:
#   {'cell': {'autocrop': True, 'size': (100, 100)}, 'thumb': {'autocrop': True, 'size': (300, 300)}}
def get_alias_dict(thumbnail_path, thumbnail_dimension):
    # get name of image
    last_slash = thumbnail_path.rfind("/")
    thumbnail_name = thumbnail_path[last_slash:]

    match_result = re.search(r'([\.]\d{2,4}[x]\d{1,4})', thumbnail_name, flags=0)
    # second digit matches 1-4, because height may be set to "0" to indicate "auto".
    
    # see if valid. 
    # Current assumption: thumbnail alias dimension is [num]x[0], 0 means "auto"
    try:
        # remove period
        match_result = match_result.replace(".", "")
        di = match_result.group().split("x")
    except AttributeError: 
        print("Thumbnail's name does not match with expected pattern of [num{2,4}]x[num{1,4}]")
        return {"error": thumbnail_path}

    if len(di) == 2:
        #find alias of this size
        alias_match = ''
        alias_dict = settings.THUMBNAIL_ALIASES['']
        for alias in alias_dict:
            if int(alias_dict[alias]['size'][0]) == int(di[0]):
                alias_match = alias
                break 
        
        # did you find a match?
        if alias_match == '':
            return False
        else:
            return {alias_match: thumbnail_path}


def get_rel_path(path, reldir):
    ''' 
    path = string
    reldir = string, relative dir that the path should start with
    resulting relative path will START WITH reldir.
    '''

    # need to remove everyhing before media, basically removing 
    # any leading slash.
    # WARNING: but I don't remember this happening on windows machine...?
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





def regenerate_frame_images(frame):

    im_path = Path(frame.frame_image.url)
    image_name = im_path.stem
    folder_name = im_path.parts[-2]
    if str(folder_name) == str(image_name):
        
        media_dir = settings.MEDIA_URL if hasattr(settings, 'MEDIA_URL') else False
        if not media_dir:
            raise Exception('[ERROR] MEDIA_URL not set in settings')
            return False
        media_dir = media_dir.strip("/")

        # make destination for copy image 
        rel_im_path = get_rel_path(im_path, "frame_images")
        print("------ rel_im_path: {}".format(rel_im_path))

        # copy
        try: 
            if storage.exists(rel_im_path):
                print("File to copy: {}".format(rel_im_path))

                # https://docs.djangoproject.com/en/2.1/topics/files/
                # print("Size check: {}".format(storage.size(rel_im_path)))
                f = storage.open(rel_im_path)
                cf = ContentFile(f.read())

                # make copy dir
                file_iden = "{}_copy-{}".format(rel_im_path.stem, helpers.get_rand_base64(6)) 
                file_iden_name = "{}{}".format(file_iden, rel_im_path.suffix)
                dest_strip_path = rel_im_path.parent.parent
                copy_im_name = dest_strip_path.joinpath(file_iden, file_iden_name)

      
                output_name = storage.save(str(copy_im_name), cf) #output appears to be just string
                # The code above copies successfully. The problem now is...how to make it point to this?

                # save?
                frame.frame_image.name = output_name
                frame.save()
                print("[FRAME COPIED] to: {}".format(frame.frame_image.url))

        except FileNotFoundError: 
            print("[FILE NOT FOUND] Cannot find file to copy at: {}".format(frame.frame_image.url))


        # regenerate thumbnails
        thumbnailer = easy_th_files.get_thumbnailer(frame.frame_image)
        alias_dict = settings.THUMBNAIL_ALIASES['']
        for alias in alias_dict:
            thumbnailer.get_thumbnail(alias_dict[alias])
  
    else:
        raise Exception('[ERROR] Image name and the folder does not match')


    # # Regenerate frames
    # alias_dict = settings.THUMBNAIL_ALIASES['']
    # for alias in alias_dict:
    #     print("Regenerate frame image using this options: {}".format(alias_dict[alias]))
    #     thumb = thumbnailer.get_thumbnail(alias_dict[alias])
    #     print("[FRAME REGEN] : {}".format(thumb.url))



def delete_frame_images_s3(frame):

    # image_path = frame.frame_image.path # aws not happy with accessing 'path'..?
    image_path = frame.frame_image.url

    # New in python 3.4+: 'Path'
    # A subclass of PurePath, which represents concrete paths of the SYSTEM's path flavour
    im_path = Path(image_path)
    print("Image_path: {}".format(im_path))

    image_name = im_path.stem
    folder_name = im_path.parts[-2]

    print("[S3] Image in right folder?: {} ==? {}".format(image_name, folder_name))

    if str(folder_name) == str(image_name):
        print("[S3] Image name and folder name matches. Getting file list...")
        # you are already in 'media', so exclude it
        target_dir = Path("").joinpath(*im_path.parts[3:])
        target_dir = target_dir.parent
        print("Folder_path extracted: {}".format(target_dir))

        target_file_li = [] # target_dir is nested list
        for dir_li in storage.listdir(str(target_dir)):
            if len(dir_li) > 0:
                target_file_li = dir_li
                break

    
        for f in target_file_li:
            f_path = target_dir.joinpath(f)
            print("[S3 file] {}".format(f_path))
            print("[S3 confirm exist] {}".format(storage.exists(str(f_path)) ))
            storage.delete(str(f_path))
            print("[S3 deleted]")

        # WEIRD: the folder deletes itself...

        # THESE DO NOT WORK. It only checks for files, not dirs
        # print(storage.exists(str(target_dir) ))
        # print(storage.exists('frame_images'))
    else:
        print("[S3][ERROR] Image not in a valid frame image folder")




            
''' Assuming the image_path is valid and all the related images
    and thumbnails are stored in a folder represending that 
    frame object, clears all image and removes the folder. '''
def delete_frame_images(frame):
    
    if frame and frame.frame_image: 
        print("========= deleting frame images ==========")
        if hasattr(settings, 'USE_S3') and settings.USE_S3 == True:
            print("===== delete from s3 ======")
            delete_frame_images_s3(frame)

        else: 
            # image_path = frame.frame_image.path # aws not happy with accessing path..?
            image_path = frame.frame_image.url

            # New in python 3.4+: 'Path'
            # A subclass of PurePath, which represents concrete paths of the SYSTEM's path flavour
            im_path = Path(image_path)
            print(im_path.parts)

            # print(im_path.name)
            # print(im_path.suffix)
            image_name = im_path.stem
            folder_name = im_path.parts[-2]

            print("[PATH] Removing folder: {} ==? {}".format(image_name, folder_name))
          
            if str(folder_name) == str(image_name):
                print("Image name and folder name matches. Getting folder path...")

                # need to remove everyhing before media, basically removing 
                # any leading slash.
                # WARNING: but I don't remember this happening on windows machine...?
                start_i = 0
                media_dir = settings.MEDIA_URL if hasattr(settings, 'MEDIA_URL') else False
                if not media_dir:
                    raise Exception('[ERROR] MEDIA_URL not set in settings')
                    return False

                # remove slashes
                media_dir = media_dir.strip("/")
                for pathpart in im_path.parts:
                    if pathpart != media_dir:
                        start_i += 1
                    else:
                        break

                # join the path starting from where the MEDIA_URL is
                target_dir = Path("").joinpath(*im_path.parts[start_i:])
                target_dir = target_dir.parent
                #remove contents of folder 
                folder_path = target_dir
                print("Folder_path extracted: {}".format(folder_path))

                # for p in os.listdir("."):
                #     print(p)
                #print("Media folder exists?: {}".format(os.path.exists("media")))

                if os.path.exists(folder_path):
                    # list all items 
                    # from os.path import isfile, join
                    # onlyfiles = [f for f in listdir(mypath) if isfile(join(mypath, f))]
                    counter = 0
                    for f in os.listdir(folder_path):
                        f_path = os.path.join(folder_path, f)
                        if os.path.isfile(f_path):
                            counter = counter+1
                            os.remove(f_path)
                    
                    # should be empty now
                    print("{} Images in {} removed.".format(counter, folder_name))
                    os.rmdir(folder_path) 
                    ## TODO: does this a little naively. Need to add an exception
                else:
                    print("[ERROR] Cannot find dir of that folder_path ): : {}".format(folder_path))
        
            else: 
                print("Image does not match with folder. Older system?")
                # assume it is in an old upload path; no subfolder, just dumped
                # in a large "reservoir". Do your best to remove them.
                
                frame.frame_image.delete_thumbnails() # not 100% successful
                image_path = frame.frame_image.path
                if image_path and os.path.isfile(image_path):
                    os.remove(image_path)
                
    else:
        # frame object or image not valid
        return False