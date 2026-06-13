#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r ./Tumer-Detection/DBackend/requirements.txt

# Run migrations and collect static files
python ./Tumer-Detection/DBackend/manage.py collectstatic --no-input
python ./Tumer-Detection/DBackend/manage.py migrate
