import base64
import os
from typing import Dict, List, Tuple

import requests
from dateutil import parser
from dotenv import load_dotenv
from mypy_extensions import TypedDict
from requests.auth import HTTPBasicAuth

AuthDict = TypedDict('AuthDict', {
	'vendor_key': str,
	'user_key': str
})

def _dicts_to_rows(
	dicts: List[Dict],
	col_specs: List[Tuple[str, str]],
	include_header: bool) -> List[List[str]]:
	title_row = []
	rows: List[List[str]] = []

	for t in dicts:
		row = []
		for i in range(len(col_specs)):
			col_spec = col_specs[i]
			if len(rows) == 0: # its the first row we are dealing with
				title_row.append(col_spec[0])

			key_name = col_spec[1]
			val = t[key_name]
			if val is None:
				val = ''
			row.append('{}'.format(val))

		rows.append(row)

	if include_header:
		return [title_row] + rows

	return rows

class TransferPackages(object):

	def __init__(self, delivery_id: str, transfer_packages: List[Dict]) -> None:
		self.delivery_id = delivery_id
		self._packages = transfer_packages
		for package in self._packages:
			package['DeliveryId'] = delivery_id

	def get_package_ids(self) -> List[str]:
		return [t['PackageId'] for t in self._packages]

	def to_rows(self, include_header: bool) -> List[List[str]]:
		col_specs = [
				('Delivery Id', 'DeliveryId'),
				('Package Id', 'PackageId'),
				('Package', 'PackageLabel'),
				('Package Type', 'PackageType'),
				('Item', 'ProductName'),
				('Item Category', 'ProductCategoryName'),
				('Item Strain Name', 'ItemStrainName'),
				('Item State', 'ShipmentPackageState'),
				('Received Qty', 'ReceivedQuantity'),
				('UoM', 'ReceivedUnitOfMeasureName'),
				('Item Unit Qty', 'ItemUnitQuantity'),
				('Item Unit Weight', 'ItemUnitWeight'),
				('Is Testing Sample', 'IsTestingSample')
				# ReceiverDollarAmount
		]
		return _dicts_to_rows(self._packages, col_specs, include_header)

class Transfers(object):

	def __init__(self, transfers: List[Dict]) -> None:
		self._transfers = transfers

	@staticmethod
	def build(transfers: List[Dict]) -> 'Transfers':
		return Transfers(transfers)

	def get_delivery_ids(self) -> List[str]:
		return [t['DeliveryId'] for t in self._transfers]

	def to_rows(self, include_header: bool) -> List[List[str]]:
		col_specs = [
				('Transfer Id', 'Id'),
				('Delivery Id', 'DeliveryId'),
				('Manifest', 'ManifestNumber'),
				('Origin Lic', 'ShipperFacilityLicenseNumber'),
				('Origin Facility', 'ShipperFacilityName'),
				# Origin Facility Type
				('Dest Lic', 'RecipientFacilityLicenseNumber'),
				('Destination Facility', 'RecipientFacilityName'),
				('Type', 'ShipmentTypeName'),
				('Received', 'ReceivedDateTime'),
				('Num Packages', 'PackageCount')
		]

		return _dicts_to_rows(self._transfers, col_specs, include_header)

class REST(object):

	def __init__(self, auth_dict: AuthDict, license_id: str, us_state: str, debug: bool = False) -> None:
		self.auth = HTTPBasicAuth(auth_dict['vendor_key'], auth_dict['user_key'])
		self.license_id = license_id
		abbr = us_state.lower()
		self.base_url = f'https://api-{abbr}.metrc.com'
		self.debug = debug

	def get(self, path: str, time_range: List = None) -> requests.models.Response:
		url = self.base_url + path

		needs_q_mark = '?' not in path
		if needs_q_mark:
			url += '?licenseNumber=' + self.license_id
		else:
			url += '&licenseNumber=' + self.license_id

		if time_range:
			if len(time_range) == 1:
				lastModifiedStart = parser.parse(time_range[0]).isoformat()
				url += '&lastModifiedStart=' + lastModifiedStart
			else:
				lastModifiedStart = parser.parse(time_range[0]).isoformat()
				lastModifiedEnd = parser.parse(time_range[1]).isoformat()
				url += '&lastModifiedStart=' + lastModifiedStart + '&lastModifiedEnd=' + lastModifiedEnd

		if self.debug:
			print(url)

		resp = requests.get(url, auth=self.auth)

		if not resp.ok:
				raise Exception('Code: {}. Reason: {}. Response: {}'.format(resp.status_code, resp.reason, resp.content.decode('utf-8')))

		return resp

def main() -> None:
	load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))

	user_key = os.environ.get('METRC_USER_KEY')
	vendor_key_CA = os.environ.get('METRC_VENDOR_KEY_CA')

	if not user_key or not vendor_key_CA:
		raise Exception('METRC_USER_KEY or METRC_VENDOR_KEY_CA not set')

	auth_dict = {'vendor_key': vendor_key_CA, 'user_key': user_key}

	#url = 'https://sandbox-api-ca.metrc.com/facilities/v1'
	base_url = 'https://api-ca.metrc.com'
	url = f'{base_url}/facilities/v1'
	#url = f'{base_url}/packages/v1/active?licenseNumber=123-ABC&lastModifiedStart=2018-01-17T06:30:00Z&lastModifiedEnd=2018-01-17T17:30:00Z'
	#url = 'https://api-ca.metrc.com/packages/v1/active?licenseNumber=C11-0000995-LIC&lastModifiedStart=2020-04-10&lastModifiedEnd=2020-04-20'
	#url = f'{base_url}/harvests/v1/waste/types'

	# json = json_data
	resp = requests.get(url, auth=HTTPBasicAuth(vendor_key_CA, user_key))
	if resp.status_code != 200:
		print('!ERROR')
		print(resp.content)
	else:
		print(resp.content)

if __name__ == '__main__':
	main()

"""

response = requests.get(url, auth=HTTPBasicAuth(vendor_key, user_key))
response.status_code


# In[6]:


response.json()


# In[ ]:


GET /packages/v1/active?licenseNumber=123-ABC&lastModifiedStart=2018-01-17T06:30:00Z&lastModifiedEnd=2018-01-17T17:30:00Z


# In[34]:


url = 'https://api-ca.metrc.com/packages/v1/active?licenseNumber=C11-0000995-LIC&lastModifiedStart=2020-04-10&lastModifiedEnd=2020-04-20'


# In[42]:


url = 'https://api-ca.metrc.com/packages/v1/active?licenseNumber=C11-0000995-LIC&lastModifiedStart=2020-04-14'


# In[43]:


response = requests.get(url, auth=HTTPBasicAuth(vendor_key, user_key))
response.status_code


# In[44]:


response.json()


# In[10]:


url = 'https://api-ca.metrc.com/transfers/v1/types?licenseNumber=C11-0000995-LIC'


# In[11]:


response = requests.get(url, auth=HTTPBasicAuth(vendor_key, user_key))
response.status_code


# In[12]:


response.json()


# In[7]:


url = 'https://api-ca.metrc.com/transfers/v1/incoming?licenseNumber=CCL19-0005288&lastModifiedStart=2020-04-20'


# In[22]:


url = 'https://api-ca.metrc.com/transfers/v1/incoming?licenseNumber=CDPH-10002016&lastModifiedStart=2020-04-01'


# In[25]:


url = 'https://api-ca.metrc.com/transfers/v1/incoming?licenseNumber=C11-0000425-LIC&lastModifiedStart=2020-04-01'


# In[26]:


response = requests.get(url, auth=HTTPBasicAuth(vendor_key, user_key))
response.status_code


# In[27]:


response.json()


# In[19]:


url = 'https://api-ca.metrc.com/transfers/v1/outgoing?licenseNumber=CCL19-0005288&lastModifiedStart=2020-04-10'


# In[48]:


url = 'https://api-ca.metrc.com/transfers/v1/outgoing?licenseNumber=CDPH-10002016&lastModifiedStart=2020-04-10&lastModifiedEnd=2020-04-11'


# In[46]:


url = 'https://api-ca.metrc.com/transfers/v1/outgoing?licenseNumber=CDPH-10002016&lastModifiedStart=2020-04-10&lastModifiedEnd=2020-04-12'


# In[ ]:


url = 'https://api-ca.metrc.com/transfers/v1/outgoing?licenseNumber=C11-0000425-LIC&lastModifiedStart=2020-04-10'


# In[49]:


response = requests.get(url, auth=HTTPBasicAuth(vendor_key, user_key))
response.status_code


# In[50]:


response.json()


# In[53]:


url = 'https://api-ca.metrc.com/transfers/v1/delivery/ 438326/packages'


# In[54]:


response = requests.get(url, auth=HTTPBasicAuth(vendor_key, user_key))
response.status_code


# In[ ]:


# 0000438326
"""
