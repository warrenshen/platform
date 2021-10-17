import pandas

def dedupe_sales_transactions(sales_receipts_with_transactions_dataframe):
    sales_receipt_records = sales_receipts_with_transactions_dataframe.to_dict('records')

    receipt_number_to_transactions = {}
    for sales_receipt_record in sales_receipt_records:
        receipt_number = sales_receipt_record['receipt_number']
        if receipt_number in receipt_number_to_transactions:
            receipt_number_to_transactions[receipt_number] += [sales_receipt_record]
        else:
            receipt_number_to_transactions[receipt_number] = [sales_receipt_record]

    fixed_sales_receipt_records = []
    receipt_numbers_set = set([])

    for sales_receipt_record in sales_receipt_records:
        receipt_number = sales_receipt_record['receipt_number']
        if receipt_number in receipt_numbers_set:
            continue
        else:
            receipt_numbers_set.add(receipt_number)

        receipt_transactions = receipt_number_to_transactions[receipt_number]
        receipt_package_ids_set = set([])
        for receipt_transaction in receipt_transactions:
            package_id = receipt_transaction['tx_package_id']
            if package_id in receipt_package_ids_set:
                continue
            else:
                fixed_sales_receipt_records += [receipt_transaction]
                receipt_package_ids_set.add(package_id)

    post_processed_sales_receipts_with_transactions_dataframe = pandas.DataFrame(
        fixed_sales_receipt_records,
        columns=sales_receipts_with_transactions_dataframe.columns,
    )
    return post_processed_sales_receipts_with_transactions_dataframe
