# Django Stashtab Template

Django template for integrating Stashtab into your Python/Django application.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# CHAIN_ID=8453
# RPC_URL=https://mainnet.base.org

# Run development server
python manage.py runserver
```

## Features

- Django views integration
- Template tags
- Django REST framework support
- Stashtab SDK via Node.js bridge

## Usage

### View Example

```python
from django.http import JsonResponse
from stashtab.client import get_stashtab_client

def balance(request, address):
    client = get_stashtab_client()
    balance = client.yield.aave.get_user_balance(address, 0)
    return JsonResponse({'balance': str(balance)})
```

## Next Steps

1. Set up Node.js bridge (see `stashtab/bridge.py`)
2. Add your own views
3. Customize templates
4. Deploy to production

## Documentation

- [Stashtab SDK Docs](https://github.com/TRC-Crypto/stashtab#readme)
- [Django Docs](https://docs.djangoproject.com/)
