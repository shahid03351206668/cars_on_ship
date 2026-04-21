import frappe
from frappe.utils.password import update_password, check_password
import json

#-----------------------------  kace api    -----------------------------------------------#

#-----------------------------  kace api    -----------------------------------------------#


@frappe.whitelist(allow_guest=True)
def get_ad(
    make=None,
    model=None,
    variant=None,
    year_from=None,
    year_to=None,
    price_from=None,
    price_to=None,
    mileage_from=None,
    mileage_to=None,
    eta=None,
    engine_size_from=None,
    engine_size_to=None,
    from_port=None,
    to_port=None,
    from_posting_date=None,
    to_posting_date=None,
    vehicle_statuses=None,
    gearboxes=None,
    body_types=None,
    colours=None,
    doors=None,
    seats=None,
    fuel_types=None,
    accelerations=None,
    drive_types=None,
    boot_spaces=None,
    seller_types=None,
):
    conditions = []
    values = {}

    # ── Single-value filters ──────────────────────────────────
    if make:
        conditions.append("a.make = %(make)s")
        values["make"] = make

    if model:
        conditions.append("a.model = %(model)s")
        values["model"] = model
    if variant:
        conditions.append("a.variant = %(variant)s")
        values["variant"] = variant

    if year_from:
        conditions.append("a.year >= %(year_from)s")
        values["year_from"] = int(year_from)

    if year_to:
        conditions.append("a.year <= %(year_to)s")
        values["year_to"] = int(year_to)

    if price_from:
        conditions.append("a.price >= %(price_from)s")
        values["price_from"] = float(price_from)

    if price_to:
        conditions.append("a.price <= %(price_to)s")
        values["price_to"] = float(price_to)

    if mileage_from:
        conditions.append("a.mileage >= %(mileage_from)s")
        values["mileage_from"] = int(mileage_from)

    if mileage_to:
        conditions.append("a.mileage <= %(mileage_to)s")
        values["mileage_to"] = int(mileage_to)

    if engine_size_from:
        conditions.append("a.engine_size >= %(engine_size_from)s")
        values["engine_size_from"] = int(engine_size_from)

    if engine_size_to:
        conditions.append("a.engine_size <= %(engine_size_to)s")
        values["engine_size_to"] = int(engine_size_to)

    if eta:
        conditions.append("a.eta_days <= %(eta)s")
        values["eta"] = int(eta)

    if from_port:
        conditions.append("a.from_port = %(from_port)s")
        values["from_port"] = from_port

    if to_port:
        conditions.append("a.to_port = %(to_port)s")
        values["to_port"] = to_port

    if from_posting_date:
        conditions.append("DATE(a.creation) >= DATE(%(from_posting_date)s)")
        values["from_posting_date"] = from_posting_date

    if to_posting_date:
        conditions.append("DATE(a.creation) <= DATE(%(to_posting_date)s)")
        values["to_posting_date"] = to_posting_date

    # ── Multi-value filters (comma-separated strings → IN clause) ──
    def add_in_filter(field, raw_value, alias="a"):
        if not raw_value:
            return
        items = [v.strip() for v in raw_value.split(",") if v.strip()]
        if not items:
            return
        placeholders = ", ".join(f"%({field}_{i})s" for i in range(len(items)))
        conditions.append(f"{alias}.{field} IN ({placeholders})")
        for i, val in enumerate(items):
            values[f"{field}_{i}"] = val

    add_in_filter("vehicle_status", vehicle_statuses)
    add_in_filter("gearbox", gearboxes)
    add_in_filter("body_type", body_types)
    add_in_filter("colour", colours)
    add_in_filter("doors", doors)
    add_in_filter("seats", seats)
    add_in_filter("fuel_type", fuel_types)
    add_in_filter("acceleration", accelerations)
    add_in_filter("drive_type", drive_types)
    add_in_filter("boot_space", boot_spaces)
    add_in_filter("seller_type", seller_types)

    # ── Build query ───────────────────────────────────────────
    where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    data = frappe.db.sql(
        f"""
        SELECT
            a.name,a.user,a.seller_type, a.boot_space , a.make, a.model, a.colour,a.colour_code,
            a.body_type, a.vehicle_status, a.year,a.acceleration,
            a.fuel_type,
            a.seats,
            a.doors,
            a.gearbox,
            a.description,
            a.from_port,
            a.to_port,
            a.chassis_number,
            GROUP_CONCAT(ab.image) as images
        FROM `tabAd` a
        LEFT JOIN `tabAd detail` ab ON a.name = ab.parent
        {where_clause}
        GROUP BY a.name
    """,
        values=values,
        as_dict=1,
    )

    for row in data:
        row["images"] = row["images"].split(",") if row["images"] else []

    return data




@frappe.whitelist(allow_guest=True)
def get_ad_detail(name):
    data = frappe.db.sql("""
        SELECT
            a.*,
            GROUP_CONCAT(ab.image SEPARATOR '||') as images
        FROM `tabAd` a
        LEFT JOIN `tabAd detail` ab ON a.name = ab.parent
        WHERE a.name = %(name)s
        GROUP BY a.name
    """, values={"name": name}, as_dict=1)

    if not data:
        frappe.throw("Ad not found", frappe.DoesNotExistError)

    row = data[0]

    # ✅ safe split
    row["images"] = row["images"].split("||") if row["images"] else []

    # ✅ features (fixed)
    features = frappe.get_all(
        "Ad Features",
        filters={"parent": name},
        fields=["features"],
        order_by="idx"
    )

    row["features"] = [f.feature for f in features]

    return row


@frappe.whitelist(allow_guest=True)
def get_userwise_ad():
    user = frappe.session.user
    data = frappe.db.sql("""
        SELECT
            a.chassis number,a.name,a.sold,a.user, a.seller_type, a.boot_space,
            a.make, a.model, a.colour, a.colour_code,
            a.body_type, a.vehicle_status, a.year, a.acceleration,
            a.fuel_type, a.seats, a.doors, a.gearbox, a.description,
            a.price, a.mileage, a.drive_type, a.from_port, a.to_port,
            GROUP_CONCAT(ab.image ORDER BY ab.idx) as images
        FROM `tabAd` a
        LEFT JOIN `tabAd detail` ab ON a.name = ab.parent
        WHERE a.user = %(user)s
        GROUP BY a.name
    """, values={"user": user}, as_dict=1, debug=1)
    return data




@frappe.whitelist()
def get_my_profile():
    user = frappe.session.user
    
    if user == "Guest":
        frappe.throw("Not logged in", frappe.AuthenticationError)
    
    profile = frappe.db.get_value(
        "Saler Profile",
        filters={"user": user},
        fieldname=[
            "name", "user", "full_name", "email", "phone",
            "date_of_birth", "nationality", "default_port", "shipping_address",
            "billing_address", "preffered_shipping_route",
            "two_factor_authentication", "verification"
        ],
        as_dict=True
    )
    
    if not profile:
        frappe.throw("Profile not found", frappe.DoesNotExistError)
    
    return profile





@frappe.whitelist()
def get_favorite_ads():
    """Get all favorite ads for the current user"""
    user = frappe.session.user
    
    # Fetch all enabled favorite ads for this user
    favorites = frappe.get_list(
        "Favourite Ad",
        filters={"user": user, "enable": 1},
        fields=["name", "ad", "user", "enable"]
    )
    
    return favorites

 
@frappe.whitelist()
def toggle_favorite():
    """Toggle favorite status for an ad"""
    resp = frappe._dict(json.loads(frappe.request.data))
    frappe.log_error("Toggle Favorite API", f"Received: {resp}")
    
    user = frappe.session.user
    enable_bool = 1 if resp.enable == "true" else 0
    
    # Check if favorite record exists
    favorite = frappe.db.exists("Favourite Ad", {"user": user, "ad": resp.ad})
    
    if favorite:
        doc = frappe.get_doc("Favourite Ad", favorite)
        doc.enable = enable_bool
        doc.save(ignore_permissions=True)
    else:
        frappe.get_doc({
            "doctype": "Favourite Ad",
            "user": user,
            "ad": resp.ad,
            "enable": enable_bool
        }).insert(ignore_permissions=True)
    
    return {"status": "success", "is_enabled": bool(enable_bool)}

@frappe.whitelist()
def create_offer():
    """Create an offer for an ad or update existing offer"""
    resp = frappe._dict(json.loads(frappe.request.data))
    frappe.log_error("Create Offer API", f"Received: {resp}")
    
    user = frappe.session.user
    amount = float(resp.amount)
    ad_name = resp.ad
    
    # Validate ad exists
    if not frappe.db.exists("Ad", ad_name):
        frappe.throw(f"Ad '{ad_name}' not found", frappe.DoesNotExistError)
    
    # Validate amount
    if amount <= 0:
        frappe.throw("Offer amount must be greater than 0", frappe.ValidationError)
    
    # Check if offer already exists for this user and ad
    existing_offer = frappe.db.exists("Offer", {"user": user, "ad": ad_name})
    
    if existing_offer:
        # Update existing offer
        offer = frappe.get_doc("Offer", existing_offer)
        offer.amount = amount
        offer.save(ignore_permissions=True)
        frappe.db.commit()
        
        return {
            "status": "success",
            "offer_id": offer.name,
            "message": f"Offer updated to PKR {amount:,.0f}",
            "action": "updated"
        }
    else:
        # Create new offer
        offer = frappe.get_doc({
            "doctype": "Offer",
            "user": user,
            "amount": amount,
            "ad": ad_name
        })
        
        offer.insert(ignore_permissions=True)
        frappe.db.commit()
        
        return {
            "status": "success",
            "offer_id": offer.name,
            "message": f"Offer of PKR {amount:,.0f} has been submitted successfully",
            "action": "created"
        }


@frappe.whitelist()
def get_existing_offer():
    """Get existing offer for current user and ad"""
    resp = frappe._dict(json.loads(frappe.request.data))
    
    user = frappe.session.user
    ad_name = resp.ad
    
    # Check if offer exists
    existing_offer = frappe.db.exists("Offer", {"user": user, "ad": ad_name})
    
    if existing_offer:
        offer = frappe.get_doc("Offer", existing_offer)
        return {
            "name": offer.name,
            "amount": offer.amount,
            "creation": offer.creation
        }
    
    # Return empty dict instead of None for consistency
    return {}


@frappe.whitelist()
def cancel_offer():
    """Cancel an existing offer"""
    resp = frappe._dict(json.loads(frappe.request.data))
    frappe.log_error("Cancel Offer API", f"Received: {resp}")
    
    user = frappe.session.user
    offer_id = resp.offer_id
    
    # Validate offer exists and belongs to user
    offer = frappe.db.exists("Offer", {"name": offer_id, "user": user})
    
    if not offer:
        frappe.throw("Offer not found or doesn't belong to you", frappe.PermissionError)
    
    # Delete offer
    frappe.delete_doc("Offer", offer_id, ignore_permissions=True)
    frappe.db.commit()
    
    return {
        "status": "success",
        "message": "Offer cancelled successfully"
    }

import frappe
from frappe.client import get_value

@frappe.whitelist()
def get_user_offers():
    """
    Fetch all offers for the current user with related Ad details.
    Returns combined data from Offer and Ad doctypes.
    """
    user = frappe.session.user
    
    try:
        # Get all offers for current user
        offers = frappe.get_list(
            "Offer",
            filters={"user": user},
            fields=["name", "ad", "amount", "creation", "status"],
            order_by="creation desc"
        )
        
        if not offers:
            return []
        
        # Enrich offers with Ad details
        result = []
        for offer in offers:
            ad_doc = frappe.get_doc("Ad", offer["ad"])
            
            result.append({
                "name": offer["name"],
                "ad": offer["ad"],
                "user": user,
                "amount": offer["amount"],
                "creation": offer["creation"],
                "make": ad_doc.make,
                "model": ad_doc.model,
                "year": ad_doc.year,
                "image": ad_doc.images[0]["image"] if ad_doc.images else None,
                "chassisNo": ad_doc.vin or "N/A",
                "importerName": ad_doc.user,  # Assuming user field contains importer name
                "eta": ad_doc.eta or "N/A",
                "dealStatus": offer.get("status", "active"),
                "expiryDate": None,  # Will be calculated based on offer creation + days
            })
        
        return result
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_user_offers")
        frappe.throw(f"Error fetching offers: {str(e)}")


import frappe
from frappe.client import get_value

@frappe.whitelist()
def get_user_offers():
    """
    Fetch all offers for the current user with related Ad details.
    Returns combined data from Offer and Ad doctypes.
    """
    user = frappe.session.user
    
    try:
        # Get all offers for current user
        offers = frappe.get_list(
            "Offer",
            filters={"user": user},
            fields=["name", "ad", "amount", "creation", "status"],
            order_by="creation desc"
        )
        
        if not offers:
            return []
        
        # Enrich offers with Ad details
        result = []
        for offer in offers:
            ad_doc = frappe.get_doc("Ad", offer["ad"])
            
            result.append({
                "name": offer["name"],
                "ad": offer["ad"],
                "user": user,
                "amount": offer["amount"],
                "creation": offer["creation"],
                "make": ad_doc.make,
                "model": ad_doc.model,
                "year": ad_doc.year,
                "image": ad_doc.images[0]["image"] if ad_doc.images else None,
                "chassisNo": ad_doc.vin or "N/A",
                "importerName": ad_doc.user,  # Assuming user field contains importer name
                "eta": ad_doc.eta or "N/A",
                "dealStatus": offer.get("status", "active"),
                "expiryDate": None,  # Will be calculated based on offer creation + days
            })
        
        return result
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_user_offers")
        frappe.throw(f"Error fetching offers: {str(e)}")


@frappe.whitelist()
def get_user_offers_by_status(status=None):
    import json

    if not status:
        request_data = json.loads(frappe.request.data)
        status = request_data.get("status")
        
    """
    Fetch offers for current user filtered by status (active, cancelled, expired).
    """
    user = frappe.session.user
    
    try:
        # Map status to offer status field value
        status_map = {
            "active": "Active",
            "cancelled": "Cancelled",
            "expired": "Expired"
        }
        # user = '{user}' and 
        
        offer_status = status_map.get(status, "Active")
        offers = frappe.db.sql(f"select name, ad, amount, creation, status from `tabOffer` where status='{offer_status}' ORDER BY creation desc",
                               as_dict=True,
                               debug=True
        )
        
        if not offers:
            return []
        
        # Enrich offers with Ad details
        result = []
        for offer in offers:
            try:
                ad_doc = frappe.get_doc("Ad", offer["ad"])
                cover_image = None
                for i in ad_doc.attachments:
                    if i.image:
                        cover_image = i.name
                        break

                result.append({
                    "name": offer["name"],
                    "ad": offer["ad"],
                    "user": user,
                    "amount": offer["amount"],
                    "creation": offer["creation"],
                    "make": ad_doc.make,
                    "model": ad_doc.model,
                    "year": ad_doc.year,
                    "image": cover_image,
                    "chassisNo": ad_doc.vin or "N/A",
                    "importerName": ad_doc.user,
                    "eta": ad_doc.eta or "N/A",
                    "dealStatus": offer.get("status", "Active").lower(),
                    "expiryDate": None,
                })
            except frappe.DoesNotExistError:
                # Skip if Ad doesn't exist
                continue
        
        return result
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_user_offers_by_status")
        frappe.throw(f"Error fetching offers by status: {str(e)}")