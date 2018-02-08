# See examples of these functions being used in views.py 

def string2List(stringyList):
    # assumes items are listed with "," only (for now)
    li = stringyList.split(",")
    
    #clean up
    return list( item.strip() for item in li )
    
def list2String(li):
    return ','.join(str(item) for item in li)

def order_by_id_ref(obj_li, ref_id_li):
   
    if not isinstance(ref_id_li, list):
        ref_id_li = string2List(ref_id_li)

    #make array same size as the object list
    print("ref_id_li: {}".format(ref_id_li))
    print("obj_li: {}".format(obj_li))
    obj_li_ordered = [None] * len(obj_li)
    
    for obj in obj_li:
        # Place obj in index matching its id in the ref list 
        # If not, value will remain None
        if str(obj.id) in ref_id_li:
            order_position = ref_id_li.index(str(obj.id))
            try: 
                obj_li_ordered[order_position] = obj
            except IndexError as error:
                print(error.args)
                print("Trying to place obj#{} at index {} out of {}.".format(obj.id, order_position, len(obj_li_ordered)))
                # if cannot handle: 
                #     raise
                raise
            
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

''' Checks if children_li is valid '''
# Accepts children_li in form of stringy list or a list
def is_valid_children_li(cli):
    
    if isinstance(cli, unicode) or isinstance(cli, str): # is it a string?
        # note, 'unicode' was renamed to 'str' in Python 3
        cli = cli.split(",")
    elif isinstance(cli, list): # is it a list?
        pass
    else: 
        return False
        
    cli = ''.join(cli)
    cli = cli.replace(" ","")
    if cli == '' : return False
    
    return True
        


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
        print("Not a valid object to extract children_li")
        return False
        
    #retrieve children
    children_id_li = [ch_obj.id for ch_obj in children_li]
    return ','.join(str(obj_id) for obj_id in children_id_li)



''' Updates children_li. This function most likely runs when save()
    Note: the insert_at number describes 'position', starts from 1.
          Make sure to -1 when using as an index, which starts from 0.
          
          '-1' = append at end
          '0' = no change in order'''

def update_children_li(obj, target_child_id, insert_at):
    
    new_children_li = []
    
    # if object's order_list is empty, 
    # it means it was never initialized or there is a problem
    if obj.children_li == "":
        new_children_li = refresh_children_li(obj) #Make new list by id
        new_children_li = new_children_li.split(",")
    else: 
        new_children_li = obj.children_li.split(",")
    
    
    if insert_at < 0: # append at the end
        
        # Prevent duplicate
        if str(target_child_id) in new_children_li:
            new_children_li.remove(str(target_child_id))
         
        new_children_li.append(str(target_child_id))
        print("------------APPENDED: {}".format(new_children_li))
        
    elif insert_at == 0: # no change

        # But it is possible a new object is created with order '0'
        # This should not happen, but just in case.
        if not str(target_child_id) in new_children_li:
            print("-----------no change, but this instance is new. Adding to Children_li")
            new_children_li.append(str(target_child_id))
            print("------------APPENDED: {}".format(new_children_li))
            
        print("-----------no change to children_li")
        
    else: # Insert at position
        
        # Prevent duplicate
        if str(target_child_id) in new_children_li:
            new_children_li.remove(str(target_child_id))
            
        print("-- Insert {} to position {}...".format(target_child_id, insert_at))
        print("------------BEFORE: {}".format(new_children_li))
        new_children_li.insert(int(insert_at-1), str(target_child_id)) 
        print("------------AFTER: {}".format(new_children_li))
 
    #turn it back to stringy list
    return ','.join(str(order) for order in new_children_li)
    

        
''' Removes an id out of the children_li '''
def remove_child(obj, target_child_id):
    
    new_children_li = []
    
    # if object's order_list is empty, 
    # it means it was never initialized or there is a problem
    if obj.children_li == "":
        new_children_li = refresh_children_li(obj) #Make new list by id
        new_children_li = new_children_li.split(",")
    else: 
        new_children_li = obj.children_li.split(",")
    
    print("-- Removing {}...".format(target_child_id))
    print("------------BEFORE: {}".format(new_children_li))
    
    # Check if id is already there. Then you have to swap
    if str(target_child_id) in new_children_li:
         new_children_li.remove(str(target_child_id))
    
    print("------------AFTER: {}".format(new_children_li))
    
    #turn it back to stringy list
    return ','.join(str(order) for order in new_children_li)