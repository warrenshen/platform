
class PipelineName(object):
	SYNC_METRC_DATA_PER_CUSTOMER = 'sync_metrc_data_per_customer'

class PipelineState(object):
	SUBMITTED = 'submitted'
	IN_PROGRESS = 'in_progress' 
	COMPLETE = 'complete'
	FAILURE = 'failure'