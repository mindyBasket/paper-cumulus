from django import template

#custom helper functions 
from ..helpermodule import helpers


register = template.Library()

# Format:
# in .py: 
#   def func_name(value, arg):
# in template:
#   {{ value|func_name:arg }}

''' Retrieves element in an list'''
@register.filter(name='get_by_index')
def get_by_index(li, index):
    return li[index]

''' Retrieves obj in list of objects (fake queryset) by the id '''
# This function returns an array. An experiment to see if I can 
# temporarily "store" the return value in template.
@register.filter(name='get_by_id')
def get_by_id(obj_li, ref_id):
    for obj in obj_li:
        if str(obj.id) == str(ref_id):
            return [obj]
    return [False]

''' Maps queryset by ids given in a list '''
# ref_ids is going to a stringy list called children_li, but in case it has been
# converted into a list, it works for that too. If reference list is not valid
# it spits out original queryset, untouched.
@register.filter(name='map_queryset')
def map_queryset(qs, ref_ids):
    
    print("------ref_id recieved-------")
    print(ref_ids)
    
    if helpers.is_valid_children_li(ref_ids): 
        # checks for both stringy list and list
        ref_ids = ref_ids.split(",")
        ref_ids = [int(stringy_id) for stringy_id in ref_ids]
    else: return qs
    
    qs = list(qs)
    # Can you get into a problem where the id is not in the ref_ids?
    qs.sort(key=lambda frame: ref_ids.index(frame.id) if frame.id in ref_ids else -1)
  
    return qs



''' Returns true if the frame object is displayable. '''
# Similar to checking if the object is valid, but the model_level validation
# does not take care of possibility of a strip with a blank frame because it is
# not filled out yet.

# Note: it only works for frame for now, but could make it work for other objects
# Note: Used like this: {% if frame|is_displayable:"frame" %} 
@register.filter(name='is_displayable')
def is_displayable(obj, validation_type=''):
    
    if validation_type=='':
        #type not specified
        return False
    elif validation_type=='frame':
        frame = obj
        # Below works in template language, but does not work in python
        # print(len(frame.frame_image) is 0)
        
        # Alternative empty image test
        #print(str(frame.frame_image) is "")
    
        return not((frame is None) or (frame.frame_image is None) or (str(frame.frame_image) is ""))
        
    


''' Duplicate?? '''
# Note: there is a duplicate of this function in helpers.py
@register.filter(name='order_by_id_ref')
def order_by_id_ref(obj_li, ref_id_li):
    #make array same size as the object list
    obj_li_ordered = [None] * len(obj_li)
    
    for obj in obj_li:
        #where is it in ref list
        order_position = ref_id_li.index(int(obj.id))
        obj_li_ordered[order_position] = obj

    return obj_li_ordered

