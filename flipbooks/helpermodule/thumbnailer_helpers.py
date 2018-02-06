import re
 
''' Takes path to thumbnail image and its dimension to 
    figure out what easy-thumbnail alias it is under.
    Returns dict in format of {<alias>: <path>} so that you can
    update() it onto response object.'''
# thumbnail_path: string, describing path to the image
# thumbnail_dimension: tuple of (width, height)
# alias_dict: dictionary of format like this:
#   {'cell': {'autocrop': True, 'size': (100, 100)}, 'thumb': {'autocrop': True, 'size': (300, 300)}}
def get_alias_dict(thumbnail_path, thumbnail_dimension, alias_dict):
    # get name of image
    last_slash = thumbnail_path.rfind("/")
    thumbnail_name = thumbnail_path[last_slash:]

    match_result = re.search(r'(\d{2,4}[x]\d{2,4})', thumbnail_name, flags=0)
    
    # see if valid. 
    # For now, I will assume all thumbnail alias dimension is [num]x[same num]
    di = match_result.group().split("x")
    if len(di) == 2 and di[0] == di[1]:
        #find alias of this size
        alias_match = ''
        for alias in alias_dict:
            if int(alias_dict[alias]['size'][0]) == int(di[0]):
                alias_match = alias
                break 
        
        # did you find a match?
        if alias_match == '':
            return False
        else:
            return {alias_match: thumbnail_path}