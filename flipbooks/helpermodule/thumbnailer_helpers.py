import os, re
from pathlib import Path #new in Python 3.4+
from django.conf import settings

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
            
''' Assuming the image_path is valid and all the related images
    and thumbnails are stored in a folder represending that 
    frame object, clears all image and removes the folder. '''
def delete_frame_images(frame):
    
    if frame and frame.frame_image: 
        image_path = frame.frame_image.path

        # New in python 3.4+: 'Path'
        # A subclass of PurePath, which represents concrete paths of the SYSTEM's path flavour
        im_path = Path(image_path)
        print(im_path.parts)

        # print(im_path.name)
        # print(im_path.suffix)
        image_name = im_path.stem
        folder_name = im_path.parts[-2]

        print("[PATH] Removing folder: {} ==? {}".format(image_name, folder_name))

        # image_name = image_path.split("/")[-1].split(".")[0]
        # print("Image_path: {}".format(image_path.split("/")))
        # folder_name = image_path.split("/")[-2]
        # print("Removing folder: {} ==? {}".format(image_name, folder_name))
        
        if str(folder_name) == str(image_name):
            print("Image name and folder name matches. Getting folder path...")
            #remove contents of folder 
            folder_path = im_path.parent
            print("Folder_path extracted: {}".format(folder_path))
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