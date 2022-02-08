class PipelineName(object):
	SYNC_METRC_DATA_PER_CUSTOMER = 'sync_metrc_data_per_customer'
	SYNC_METRC_DATA_ALL_CUSTOMERS = 'sync_metrc_data_all_customers'

	UPDATE_METRC_ROWS_ON_LICENSE_CHANGE = 'update_metrc_rows_on_license_change'

class PipelineState(object):
	SUBMITTED = 'submitted'
	IN_PROGRESS = 'in_progress' 
	COMPLETE = 'complete'
	FAILURE = 'failure'
