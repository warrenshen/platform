# machine.sh for setting up the run_metrc_analysis machine
sudo apt-get update

# copy paste the key so we can download into GitHub
sudo vi ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa

# Setup Python 3.8
sudo apt-get install -y python3.8
sudo apt-get install -y python3-pip
sudo apt-get install -y python3-dev
python3.8 -m pip install pip-tools

# Install all requirements
cd platform/services/api-server
python3.8 -m pip install -r requirements.txt

# Setup env variables and secrets
vi .env
# Key variables to include
# SENDGRID_API_KEY=
# DATABASE_URL=
# BIGQUERY_CREDENTIALS_PATH=/home/ubuntu/creds/bespoke-financial-80c0458dcaab_biquery_credentials.json
#
# 
# Use --use_cached_dataframes if doing a re-run where you are fixing a bug
PYTHONPATH=src python3.8 scripts/analysis/compute_monthly_inventory.py --save_dataframes --num_threads=2 --num_processes=2 --write_to_db

# Then to grab the files onto your local computer
scp -i  ~/.ssh/bespoke_ec2_machine.pem ubuntu@54.218.119.190:/home/ubuntu/platform/services/api-server/out/many_companies_analysis_summary.xls ~/Downloads/many_companies_analysis_summary_12_09_2021.xls