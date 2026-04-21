import frappe
import hashlib
import json
from frappe.utils import now_datetime


# ─── Room management ──────────────────────────────────────────────────────────

@frappe.whitelist()
def get_or_create_room():
    req = frappe._dict(json.loads(frappe.request.data))
    ad_id = req.ad_id
    sales_user = req.get("seller")

    buyer = frappe.session.user
    room_id = _make_room_id(ad_id, buyer)

    if frappe.db.exists("Chat Room", room_id):
        return {"room_id": room_id}

    if not sales_user:
        sales_user = frappe.db.get_value("Ad", ad_id, "user")
    if not sales_user:
        frappe.throw("Ad not found or has no seller", frappe.DoesNotExistError)

    room = frappe.get_doc({
        "doctype": "Chat Room",
        "name": room_id,
        "ad": ad_id,
        "sales_user": sales_user,
        "buyer": buyer,
        "status": "Open",
    })
    room.insert(ignore_permissions=True)
    frappe.db.commit()

    return {"room_id": room_id}


def _make_room_id(ad_id: str, buyer: str) -> str:
    raw = f"{ad_id}::{buyer}"
    return hashlib.md5(raw.encode()).hexdigest()[:16]


def _assert_participant(room_id: str):
    user = frappe.session.user
    row = frappe.db.get_value(
        "Chat Room", room_id, ["sales_user", "buyer"], as_dict=True
    )
    if not row or user not in (row.sales_user, row.buyer):
        frappe.throw("Not authorised for this chat room", frappe.PermissionError)


# ─── Messages ─────────────────────────────────────────────────────────────────

@frappe.whitelist()
def send_message():
    req = frappe._dict(json.loads(frappe.request.data))
    room_id = req.room_id
    message = req.message

    _assert_participant(room_id)

    user = frappe.session.user
    role = _get_role(user)

    msg = frappe.get_doc({
        "doctype": "Chat Message",
        "room": room_id,
        "sender": user,
        "sender_role": role,
        "message": message,
        "message_type": "Text",
        "sent_at": now_datetime(),
    })
    msg.insert(ignore_permissions=True)

    frappe.db.set_value("Chat Room", room_id, "last_message_at", msg.sent_at)

    frappe.publish_realtime(
    event="chat_message",
    message={
        "room_id": room_id,
        "message_id": msg.name,
        "sender": user,
        "sender_role": role,
        "message": message,
        "sent_at": str(msg.sent_at),
    },
    doctype="Chat Room",
    docname=room_id,
    after_commit=True,
)

    return {"message_id": msg.name}


@frappe.whitelist()
def get_messages():
    req = frappe._dict(json.loads(frappe.request.data))
    room_id = req.room_id
    limit = int(req.get("limit", 30))
    before = req.get("before")

    _assert_participant(room_id)

    filters = {"room": room_id}
    if before:
        filters["sent_at"] = ["<", before]

    return frappe.get_all(
        "Chat Message",
        filters=filters,
        fields=[
            "name", "sender", "sender_role",
            "message", "message_type", "is_read", "sent_at",
        ],
        order_by="sent_at desc",
        limit=limit,
    )


@frappe.whitelist()
def mark_room_read():
    req = frappe._dict(json.loads(frappe.request.data))
    room_id = req.room_id

    _assert_participant(room_id)

    user = frappe.session.user
    frappe.db.sql(
        """UPDATE `tabChat Message`
           SET is_read = 1
           WHERE room = %s AND sender != %s AND is_read = 0""",
        (room_id, user),
    )
    frappe.db.commit()
    return {"ok": True}


# ─── Inbox ────────────────────────────────────────────────────────────────────

@frappe.whitelist()
def get_buyer_inbox():
    buyer = frappe.session.user

    rooms = frappe.db.sql(
        """
        SELECT
            cr.name          AS room_id,
            cr.sales_user        AS other_user,
            cr.ad,
            cr.last_message_at
        FROM `tabChat Room` cr
        WHERE cr.buyer = %(buyer)s
          AND cr.status != 'Archived'
        ORDER BY COALESCE(cr.last_message_at, cr.creation) DESC
        """,
        {"buyer": buyer},
        as_dict=True,
    )

    result = []
    for r in rooms:
        seller_info = frappe.db.get_value(
            "User",
            r.other_user,
            ["full_name", "user_image"],
            as_dict=True,
        ) or {}

        try:
            ad = frappe.get_doc("Ad", r.ad)
            make  = ad.make or ""
            model = ad.model or ""
            year  = str(ad.year or "")
        except frappe.DoesNotExistError:
            make = model = year = ""

        last_msg = frappe.db.get_value(
            "Chat Message",
            {"room": r.room_id},
            "message",
            order_by="sent_at desc",
        )

        unread = frappe.db.count(
            "Chat Message",
            {"room": r.room_id, "sender": r.other_user, "is_read": 0},
        )

        result.append({
            "room_id":               r.room_id,
            "other_user":            r.other_user,
            "other_user_full_name":  seller_info.get("full_name", r.other_user),
            "other_user_avatar":     seller_info.get("user_image"),
            "ad":                    r.ad,
            "make":                  make,
            "model":                 model,
            "year":                  year,
            "last_message":          last_msg,
            "last_message_at":       str(r.last_message_at) if r.last_message_at else None,
            "unread_count":          unread,
        })

    return result


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _get_role(user: str) -> str:
    roles = frappe.get_roles(user)
    if "Sales User" in roles:
        return "Seller"
    if "Buyer" in roles:
        return "Buyer"
    return "Unknown"