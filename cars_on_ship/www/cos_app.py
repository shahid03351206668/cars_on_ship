import frappe

def get_context(context):
    context.no_cache = 1
    # This tells Frappe this page is a website page, not a desk page
    context.show_sidebar = 0
    context.base_template_path = "templates/web.html"