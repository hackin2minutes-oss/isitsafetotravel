export CLOUDFLARE_API_TOKEN="cfat_bQzvFJR3VJFuMm0cgMn1IN2jPBYAM4x8f4HpMvuT245c7a1d"
export CLOUDFLARE_ACCOUNT_ID="cc550ad7cbc3497604af4e34ed34634e"
export PATH="$PATH:/usr/local/bin:/opt/homebrew/bin"

if [ -d "$HOME/.nvm/versions/node" ]; then
  LATEST_NODE=$(ls -1 $HOME/.nvm/versions/node | tail -n 1)
  export PATH="$PATH:$HOME/.nvm/versions/node/$LATEST_NODE/bin"
fi

npx wrangler pages deploy .vercel/output/static --project-name=isitsafetotravel --branch=main --commit-dirty=true
