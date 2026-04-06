import frappe
from frappe.utils import cint

@frappe.whitelist(allow_guest=True)
def login(usr):
    try:
        login_manager = frappe.auth.LoginManager()
        login_manager.authenticate(user=usr, pwd = usr)
        login_manager.post_login()
        
        user_details = get_user_details()
        
        if user_details:
            make_response(
                success=True,
                message="Authentication success",
                data=user_details,
            )
    except Exception as e:
        create_log("API Test", f"{e}\n{frappe.get_traceback()}")
        make_response(success=False, message="Invalid login credentials!")

@frappe.whitelist(allow_guest=True)
def create_user(
    user,
    email,
    phone=None,
    role=None
):
    try:
        allowed_roles = ["Buyer", "Sales User"]
        if role not in allowed_roles:
            frappe.throw("Invalid role selected.")

        user_doc = frappe.new_doc("User")
        user_doc.flags.ignore_permissions = True
        user_doc.flags.ignore_mandatory = True
        user_doc.username = user
        user_doc.email = email
        user_doc.new_password = phone
        user_doc.first_name = user

        if phone:
            user_doc.mobile_no = phone
            user_doc.phone = phone

        user_doc.send_welcome_email = 0
        user_doc.append("roles", {"role": role})
        user_doc.save()

        if user_doc.name:
            frappe.db.commit()
            make_response(success=True, message="User created")
        else:
            make_response(success=False, message="Failed to create user!")
    except Exception as e:
        make_response(success=False, message=str(e))

@frappe.whitelist()
def update_user(name=None, location=None, territory=None, phone=None):
    try:
        user_details = get_user_details()

        if user_details:
            if name or phone or location or territory:
                user_doc = frappe.get_doc("User", {"email": user_details.email})
                user_doc.flags.ignore_permissions = True
                user_doc.flags.ignore_mandatory = True

                if name:
                    user_doc.first_name = name
                if phone:
                    user_doc.mobile_no = phone
                    user_doc.phone = phone
                if location:
                    user_doc.location = location

                user_doc.save()
                frappe.db.commit()
                make_response(success=True, message="User Updated")
            else:
                make_response(success=False, message="Failed to Update user!")
        else:
            make_response(success=False, message="Invalid user!")
    except Exception as e:
        make_response(success=False, message=str(e))

@frappe.whitelist(allow_guest=True)
def change_pass(old_password=None, new_password=None):
    try:
        user = frappe.session.user

        if user and user not in ["Administrator", "Guest"]:
            if old_password and new_password:
                u = frappe.get_doc("User", user)
                u.new_password = new_password
                u.save()
                make_response(success=True, message="Password Changed.")
            else:
                make_response(success=False, message="Data Missing.")
        else:
            make_response(
                success=False, message="Session Not Found.", session_success=False
            )
    except Exception as e:
        create_log("Failed to change Password", e)
        make_response(success=False, message=e)

def create_log(title="App Api", message=""):
    frappe.log_error(title, message)

def make_response(success=True, message="Success", data={}, session_success=True):
    frappe.local.response["message"] = {
        "session_success": session_success,
        "success": success,
        "success_key": cint(success),
        "message": message,
        "data": data,
    }

def get_user_details(user=None):
    try:
        if not user:
            user = frappe.session.user

        if user and user not in ["Guest"]:
            user_doc = frappe.get_doc("User", user)
            user = frappe.get_doc("User", user)
            user_roles = [r.role for r in user_doc.roles]

            assigned_role = "Buyer"  # Default
            if "Sales User" in user_roles:
                assigned_role = "Sales User"
            elif "Buyer" in user_roles:
                assigned_role = "Buyer"

            data = {
                "name": user.name,
                "sid": frappe.session.sid,
                "username": user.username,
                "email": user.email,
                "user_image": user.user_image,
                "role": assigned_role,
            }
            return frappe._dict(data)
        else:
            make_response(
                success=False, message="Session Not Found.", session_success=False
            )
    except Exception as e:
        create_log("API Test", f"{e}\n{frappe.get_traceback()}")
        make_response(success=False, message="Invalid login credentials!")

def set_session_from_header():
    """
    Cross-origin dev requests can't forward cookies.
    We read the sid from a custom header and restore the session manually.
    
    This function runs on every request via the before_request hook.
    
    DEBUGGING: Logs what's happening so we can diagnose issues.
    """
    # Only process if we're currently a Guest
    if frappe.session.user != "Guest":
        return  # Already authenticated via cookies, skip

    # Read the custom header
    sid = frappe.get_request_header("X-Frappe-Session-Id")
    if not sid:
        return  # No header provided, stay as Guest

    try:
        # Try multiple ways to get session data
        
        # Method 1: Check in shared cache
        session_data = frappe.cache().hget("session", sid, shared=True)
        
        if session_data:
            user = session_data.get("data", {}).get("user")
            if user and user != "Guest":
                frappe.set_user(user)
                frappe.local.session["user"] = user
                frappe.local.session["sid"] = sid
                return
        
        # Method 2: Check in regular (non-shared) cache
        session_data = frappe.cache().hget("session", sid, shared=False)
        
        if session_data:
            user = session_data.get("data", {}).get("user")
            if user and user != "Guest":
                frappe.set_user(user)
                frappe.local.session["user"] = user
                frappe.local.session["sid"] = sid
                return
        
        # Method 3: Try direct cache get
        session_data = frappe.cache().get(f"session:{sid}")
        
        if session_data:
            user = session_data.get("user")
            if user and user != "Guest":
                frappe.set_user(user)
                frappe.local.session["user"] = user
                frappe.local.session["sid"] = sid
                return
        
        # If we get here, session wasn't found anywhere
        # Log for debugging (comment out in production)
        create_log(
            "Session Auth Debug",
            f"SID header provided but session not found: {sid}"
        )
        
    except Exception as e:
        # Log the error for debugging
        create_log("Session Header Auth Error", f"SID: {sid}\nError: {str(e)}\n{frappe.get_traceback()}")