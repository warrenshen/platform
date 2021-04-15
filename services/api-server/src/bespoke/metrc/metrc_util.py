import base64
import requests
import os
from dotenv import load_dotenv
from mypy_extensions import TypedDict
from typing import Dict
from requests.auth import HTTPBasicAuth

def main():
	load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))

	user_key = os.environ.get('METRC_USER_KEY')
	vendor_key_CA = os.environ.get('METRC_VENDOR_KEY_CA')

	if not user_key or not vendor_key_CA:
		raise Exception('METRC_USER_KEY or METRC_VENDOR_KEY_CA not set')

	auth_dict = {'vendor_key': vendor_key_CA, 'user_key': user_key}

	#url = 'https://sandbox-api-ca.metrc.com/facilities/v1'
	base_url = 'https://api-ca.metrc.com'
	#url = f'{base_url}/facilities/v1'
	#url = f'{base_url}/packages/v1/active?licenseNumber=123-ABC&lastModifiedStart=2018-01-17T06:30:00Z&lastModifiedEnd=2018-01-17T17:30:00Z'
	url = 'https://api-ca.metrc.com/packages/v1/active?licenseNumber=C11-0000995-LIC&lastModifiedStart=2020-04-10&lastModifiedEnd=2020-04-20'
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