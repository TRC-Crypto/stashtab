# Rails Stashtab Template

Ruby on Rails template for integrating Stashtab into your Rails application.

## Quick Start

```bash
# Install dependencies
bundle install
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# CHAIN_ID=8453
# RPC_URL=https://mainnet.base.org

# Run development server
rails server
```

## Features

- Rails controller integration
- View helpers
- Asset pipeline support
- Stashtab SDK via Node.js bridge

## Usage

### Controller Example

```ruby
class StashtabController < ApplicationController
  def balance
    address = params[:address]
    # Use Node.js bridge to call Stashtab SDK
    balance = StashtabClient.get_balance(address)
    render json: { balance: balance }
  end
end
```

## Next Steps

1. Set up Node.js bridge (see `lib/stashtab_bridge.rb`)
2. Add your own controllers
3. Customize views
4. Deploy to production

## Documentation

- [Stashtab SDK Docs](https://github.com/TRC-Crypto/stashtab#readme)
- [Rails Docs](https://guides.rubyonrails.org/)
