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
#           children_li helpers
# -------------------------------------------
# -------------------------------------------

''' Note: I am planning to make children_orders -> children_li
          The original name is not intuitive.
'''

''' The children_order may be blank or invalid. 
Use this function refresh/recreate the order based on
the order the children appears in db'''

def refresh_children_li(obj):
    
    children_li = None
    if isinstance(obj, Strip):
        children_li = obj.frame_set.all()
    elif isinstance(obj, Scene):
        children_li = obj.strip_set.all()
    else:
        print("Not a valid object to extract children_orders")
        return False
        
    #retrieve children
    children_id_li = [ch_obj.id for ch_obj in children_li]
    return ','.join(str(obj_id) for obj_id in children_id_li)



''' Updates children_li. This function most likely runs when save()'''

def update_children_li(obj, target_child_id, insert_at):
    
    new_children_li = []
    
    # if object's order_list is empty, 
    # it means it was never initialized or there is a problem
    if obj.children_orders == "":
        new_children_li = refresh_children_li(obj) #Make new list by id
        new_children_li = new_children_li.split(",")
    else: 
        new_children_li = obj.children_orders.split(",")
        

    print("-- Swapping {} to index {}...".format(target_child_id, insert_at))
    print("------------BEFORE: {}".format(new_children_li))
    
    # Check if id is already there. Then you have to swap
    if str(target_child_id) in new_children_li:
         new_children_li.remove(str(target_child_id))
        
    if insert_at < 0:
        new_children_li.append(str(target_child_id))
    else:
        new_children_li.insert(int(insert_at), str(target_child_id))   
        
    print("------------AFTER: {}".format(new_children_li))
 
    #turn it back to stringy list
    return ','.join(str(order) for order in new_children_li)
    

        
''' Removes an id out of the children_orders '''
def remove_order(obj, target_child_id):
    
    new_children_li = []
    
    # if object's order_list is empty, 
    # it means it was never initialized or there is a problem
    if obj.children_orders == "":
        new_children_li = refresh_children_li(obj) #Make new list by id
        new_children_li = new_children_li.split(",")
    else: 
        new_children_li = obj.children_orders.split(",")
    
    print("-- Removing {}...".format(target_child_id))
    print("------------BEFORE: {}".format(new_children_li))
    
    # Check if id is already there. Then you have to swap
    if str(target_child_id) in new_children_li:
         new_children_li.remove(str(target_child_id))
    
    print("------------AFTER: {}".format(new_children_li))
    
    #turn it back to stringy list
    return ','.join(str(order) for order in new_children_li)