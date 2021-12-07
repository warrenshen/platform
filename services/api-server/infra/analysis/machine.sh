# machine.sh for setting up the run_metrc_analysis machine
sudo apt-get update

# copy paste the key so we can download into GitHub
sudo vi ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa

# Setup Python 3.7
sudo apt-get install -y python3.7
sudo apt-get install -y python3-pip
sudo apt-get install -y python3-dev
python3.7 -m pip install pip-tools

# Install all requirements
cd platform/services/api-server
python3.7 -m pip install -r requirements.txt

# Setup env variables and secrets
vi .env
# Key variables to include
# DATABASE_URL=
# BIGQUERY_CREDENTIALS_PATH=/home/ubuntu/creds/bespoke-financial-80c0458dcaab_biquery_credentials.json
#
# 

PYTHONPATH=src python3.7 scripts/analysis/compute_monthly_inventory.py --use_cached_dataframes --save_dataframes