import frappe

def create_saler_profile(doc, method):
    frappe.log_error("Function Triggered", "DEBUG")

    # Log user
    frappe.log_error(f"User: {doc.name}", "DEBUG")

    # Get roles
    roles = frappe.get_roles(doc.name)
    frappe.log_error(f"Roles: {roles}", "DEBUG")

    # Check role
    if "Sales User" not in roles:
        frappe.log_error("Sales User role NOT found", "DEBUG")
        return

    frappe.log_error("Sales User role FOUND", "DEBUG")

    # Check existing profile
    if frappe.db.exists("Saler Profile", {"user": doc.name}):
        frappe.log_error("Saler Profile already exists", "DEBUG")
        return

    frappe.log_error("Creating Saler Profile...", "DEBUG")

    # Create profile
    sales_profile = frappe.get_doc({
        "doctype": "Saler Profile",
        "user": doc.name,
        "full_name": doc.full_name,
        "email": doc.email
    })

    sales_profile.insert(ignore_permissions=True)

    frappe.log_error("Saler Profile CREATED", "DEBUG")