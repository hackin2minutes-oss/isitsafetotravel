export CLOUDFLARE_API_TOKEN="cfat_wNUcaAyK2x2idLxp2FRsbiBpN8xyc2yIJuV8FyL8a9b848a2"
export CLOUDFLARE_ACCOUNT_ID="cc550ad7cbc3497604af4e34ed34634e"
export PATH="/opt/homebrew/bin:$PATH"
node_modules/.bin/wrangler pages deploy .vercel/output/static --project-name=isitsafetotravel --branch=main --commit-dirty=true
