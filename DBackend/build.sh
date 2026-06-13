#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r DBackend/requirements.txt

# Run migrations and collect static files
python DBackend/manage.py collectstatic --no-input
python DBackend/manage.py migrate
