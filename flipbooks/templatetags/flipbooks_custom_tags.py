from django import template

register = template.Library()

# Format:
# in .py: 
#   def func_name(value, arg):
# in template:
#   {{ value|func_name:arg }}

@register.filter(name='get_by_index')
def get_by_index(li, index):
    return li[index]

# retrieves obj in queryset by the id
# This function returns an array. An experiment to see if I can 
# temporarily "store" the return value in template.
@register.filter(name='get_by_id')
def get_by_id(obj_li, ref_id):
    for obj in obj_li:
        if str(obj.id) == str(ref_id):
            return [obj]
    return [False]


@register.filter(name='order_by_id_ref')
def order_by_id_ref(obj_li, ref_id_li):
    #make array same size as the object list
    obj_li_ordered = [None] * len(obj_li)
    
    for obj in obj_li:
        #where is it in ref list
        order_position = ref_id_li.index(int(obj.id))
        obj_li_ordered[order_position] = obj

    return obj_li_ordered