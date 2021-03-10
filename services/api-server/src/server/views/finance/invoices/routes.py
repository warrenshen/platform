from server.views.finance.invoices.crud import (
	CreateInvoiceView,
	UpdateInvoiceView
)
from server.views.finance.invoices.approval import SubmitForApprovalView
from flask import Blueprint

handler = Blueprint('finance_invoices', __name__)

handler.add_url_rule('/create', view_func=CreateInvoiceView.as_view('create'))
handler.add_url_rule('/update', view_func=UpdateInvoiceView.as_view('update'))
handler.add_url_rule('/submit_for_approval', view_func=SubmitForApprovalView.as_view('submit_for_approval'))
