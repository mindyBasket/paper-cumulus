# See examples of these functions being used in views.py 

def string2List(stringyList):
    # assumes items are listed with "," only (for now)
    li = stringyList.split(",")
    
    #clean up
    return list( item.strip() for item in li )
    
def list2String(li):
    return ','.join(str(item) for item in li)

def order_by_id_ref(obj_li, ref_id_li):
    #note: ref_id_li: list with id in string. It's converted straight from string2List above.
    
    #make array same size as the object list
    obj_li_ordered = [None] * len(obj_li)
    
    for obj in obj_li:
        # Place obj in index matching its id in the ref list 
        # If not, value will remain None
        if str(obj.id) in ref_id_li:
            order_position = ref_id_li.index(str(obj.id))
            obj_li_ordered[order_position] = obj
            
    return obj_li_ordered
    
    
def shout():
    #for testing if this module is imported successfully
    print("Hello world!")
    







from ..models import (
    Scene,
    Strip,
    Frame
)


# -------------------------------------------
# -------------------------------------------
#           children_order helpers
# -------------------------------------------
# -------------------------------------------

''' The children_order may be blank or invalid. 
Use this function refresh/recreate the order based on
the order the children appears in db'''

def refresh_children_order(obj):
    
    children_li = None
    if isinstance(obj, Strip):
        children_li = obj.frame_set.all()
    else:
        print("Not a valid object to extract children_orders")
        return False
        
    #retrieve children
    children_id_li = [ch_obj.id for ch_obj in children_li]
    return ','.join(str(obj_id) for obj_id in children_id_li)
