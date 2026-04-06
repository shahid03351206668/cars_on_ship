import frappe
from frappe.utils.password import update_password, check_password

#-----------------------------  kace api    -----------------------------------------------#

#-----------------------------  kace api    -----------------------------------------------#

@frappe.whitelist(allow_guest=True)
def get_makes():
    """Fetch all available Car Makes"""
    return frappe.get_all("Make", fields=["name"])


@frappe.whitelist(allow_guest=True)
def get_models(make=None):
    """Fetch models, optionally filtered by a specific make"""
    filters = {"make": make} if make else {}
    return frappe.get_all("Model", fields=["name", "make"], filters=filters)

@frappe.whitelist(allow_guest=True)
def get_variants(model=None):
    """Fetch variants, optionally filtered by a specific model"""
    filters = {"model": model} if model else {}
    return frappe.get_all("Variant", fields=["name", "model"], filters=filters)


@frappe.whitelist(allow_guest=True)
def get_years():
    """Fetch years for the primary search and advanced range filters"""
    return frappe.get_all("Year", fields=["name", "year"], order_by="year desc")


@frappe.whitelist(allow_guest=True)
def get_ports():
    """Fetch all available ports"""
    return frappe.get_all("Port", fields=["name"])


@frappe.whitelist(allow_guest=True)
def get_vehicle_statuses():
    """Fetch statuses like 'At Sea', 'Landed', etc."""
    return frappe.get_all("Vehicle Status", fields=["name"])


@frappe.whitelist(allow_guest=True)
def get_gearboxes():
    """Fetch transmission types (Automatic, Manual, etc.)"""
    return frappe.get_all("Gearbox", fields=["name"])


@frappe.whitelist(allow_guest=True)
def get_body_types():
    """Fetch body styles (SUV, Sedan, Hatchback, etc.)"""
    return frappe.get_all("Body type", fields=["name"])


@frappe.whitelist(allow_guest=True)
def get_colours():
    """Fetch available car colors"""
    return frappe.get_all("Colour", fields=["name","color_code"])


@frappe.whitelist(allow_guest=True)
def get_door_options():
    """Fetch door count options (2, 4, 5, etc.)"""
    return frappe.get_all("Doors", fields=["name"])


@frappe.whitelist(allow_guest=True)
def get_seat_options():
    """Fetch seating capacity options"""
    return frappe.get_all("Seats", fields=["name"])


@frappe.whitelist(allow_guest=True)
def get_fuel_types():
    """Fetch engine fuel categories (Petrol, Diesel, Hybrid, Electric)"""
    return frappe.get_all("Fuel type", fields=["name"])


@frappe.whitelist(allow_guest=True)
def get_acceleration_ranges():
    """Fetch acceleration brackets (e.g., 0-62mph times)"""
    return frappe.get_all("Acceleration", fields=["name"])


@frappe.whitelist(allow_guest=True)
def get_drive_types():
    """Fetch drivetrain options (AWD, FWD, RWD)"""
    return frappe.get_all("Drive type", fields=["name"])


@frappe.whitelist(allow_guest=True)
def get_boot_spaces():
    """Fetch trunk/boot capacity categories"""
    return frappe.get_all("Boot space", fields=["name"])


@frappe.whitelist(allow_guest=True)
def get_seller_types():
    """Fetch seller categories (Private, Dealer, etc.)"""
    return frappe.get_all("Seller type", fields=["name"])


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
            a.name, a.user, a.seller_type, a.boot_space,
            a.make, a.model, a.colour, a.colour_code,
            a.body_type, a.vehicle_status, a.year, a.acceleration,
            a.fuel_type, a.seats, a.doors, a.gearbox, a.description,
            a.price, a.mileage, a.drive_type, a.from_port, a.to_port,
            GROUP_CONCAT(ab.image ORDER BY ab.idx) as images
        FROM `tabAd` a
        LEFT JOIN `tabAd detail` ab ON a.name = ab.parent
        WHERE a.name = %(name)s
        GROUP BY a.name
    """, values={"name": name}, as_dict=1)

    if not data:
        frappe.throw("Ad not found", frappe.DoesNotExistError)

    row = data[0]
    row["images"] = row["images"].split(",") if row["images"] else []
    return row


@frappe.whitelist(allow_guest=True)
def get_userwise_ad():
    user = frappe.session.user
    data = frappe.db.sql("""
        SELECT
            a.name, a.user, a.seller_type, a.boot_space,
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