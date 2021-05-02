from flask import Blueprint
from server.views.finance.invoices.approval import (
    RespondToApprovalRequestView, SubmitForApprovalView)
from server.views.finance.invoices.crud import (CreateUpdateAsDraftView,
                                                DeleteInvoiceView)
from server.views.finance.invoices.payment import (
    RespondToPaymentRequestView, SubmitForPaymentView,
    SubmitNewInvoiceForPaymentView)

handler = Blueprint('finance_invoices', __name__)

handler.add_url_rule('/create_update_as_draft', view_func=CreateUpdateAsDraftView.as_view('create_update_as_draft'))
handler.add_url_rule('/delete', view_func=DeleteInvoiceView.as_view('delete'))

handler.add_url_rule(
	'/submit_for_approval',
	view_func=SubmitForApprovalView.as_view('submit_for_approval'))

handler.add_url_rule(
	'/respond_to_approval_request',
	view_func=RespondToApprovalRequestView.as_view('respond_to_approval_request'))

handler.add_url_rule(
	'/submit_for_payment',
	view_func=SubmitForPaymentView.as_view('submit_for_payment'))

handler.add_url_rule(
	'/respond_to_payment_request',
	view_func=RespondToPaymentRequestView.as_view('respond_to_payment_request'))

handler.add_url_rule(
	'/submit_new_invoice_for_payment',
	view_func=SubmitNewInvoiceForPaymentView.as_view('submit_new_invoice_for_payment'))
