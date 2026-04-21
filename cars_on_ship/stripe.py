import frappe
import stripe
import json
from werkzeug.wrappers import Response

@frappe.whitelist()
def test_stripe_connection():
    settings = frappe.get_single("Custom Stripe Settings")
    secret_key = settings.get_password("secret_key")

    if not secret_key:
        frappe.throw("Stripe Secret Key not found in settings.")

    # 2. Set the key for the Stripe library
    stripe.api_key = secret_key

    try:
        # 3. Make a simple, safe request to Stripe (fetching account balance)
        balance = stripe.Balance.retrieve()

        return {
            "status": "success",
            "message": "Successfully connected to Stripe!",
            "data": balance,
        }
    except stripe.error.AuthenticationError:
        return {
            "status": "error",
            "message": "Authentication failed. Check your Secret Key.",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# @frappe.whitelist(allow_guest=True)
# def handle_stripe_webhook():
#     # 1. Setup keys
#     settings = frappe.get_single("Custom Stripe Settings")
#     stripe.api_key = settings.get_password("secret_key")
#     webhook_secret = settings.get_password("webhook_secret")

#     # 2. Get the data from the request
#     payload = frappe.request.get_data()
#     sig_header = frappe.get_request_header('Stripe-Signature')

#     try:
#         # 3. Verify that this actually came from Stripe
#         event = stripe.Webhook.construct_event(
#             payload, sig_header, webhook_secret
#         )

#     except Exception as e:
#         # If verification fails, return error
#         frappe.local.response.http_status_code = 400
#         return {"status": "error", "message": str(e)}

#     # 4. Handle the specific event
#     if event['type'] == 'payment_intent.succeeded':
#         intent = event['data']['object']
#         # This is where you will eventually put logic to create a Payment Entry
#         frappe.log_error(title="Stripe Webhook Success", message=frappe.as_json(intent))

#     return {"status": "success"}



# @frappe.whitelist(allow_guest=True)
# def handle_stripe_webhook():
#     data = {"status": "success", "data": "value"}
#     


@frappe.whitelist(allow_guest=True)
def handle_stripe_webhook():
    settings = frappe.get_single("Custom Stripe Settings")
    stripe.api_key = settings.get_password("secret_key")
    webhook_secret = settings.get_password("webhook_secret")
    frappe.log_error("api hit")

    payload = frappe.request.get_data()
    sig_header = frappe.get_request_header('Stripe-Signature')

    if not payload:
        frappe.local.response.http_status_code = 400
        return {"status": "error", "message": "Empty payload"}

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except Exception as e:
        frappe.log_error("Webhook Error", str(e))
        frappe.local.response.http_status_code = 400
        return {"status": "error", "message": str(e)}

    if event['type'] == 'payment_intent.succeeded':
        frappe.log_error("Stripe Success", frappe.as_json(event['data']['object']))

    frappe.local.response.http_status_code = 200
    return {"status": "ok"}



@frappe.whitelist(allow_guest=True)
def create_payment_intent():
    amount = int(frappe.request.json.get('amount'))
    settings = frappe.get_single("Custom Stripe Settings")
    stripe.api_key = settings.get_password("secret_key")
    
    intent = stripe.PaymentIntent.create(amount=amount, currency="usd")
    return {"client_secret": intent.client_secret}


import stripe
import frappe

@frappe.whitelist()
def create_checkout_session(amount=None):
    # If Frappe doesn't pass it as an argument, grab it from the request body
    if not amount:
        amount = frappe.request.json.get("amount")
    
    if not amount:
        frappe.throw("Amount is required to create a session.")

    settings = frappe.get_single("Custom Stripe Settings")
    stripe.api_key = settings.get_password("secret_key")
    user_email = frappe.session.user
    
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'Wallet Top-up',
                    },
                    # Convert to cents
                    'unit_amount': int(float(amount) * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            metadata={
                "user_email": user_email
            },
            success_url=f"{frappe.utils.get_url()}/wallet-success",
            cancel_url=f"{frappe.utils.get_url()}/wallet-payment",
        )
        
        return {"url": session.url}
    except Exception as e:
        frappe.log_error("Stripe Error", str(e))
        frappe.throw(str(e))