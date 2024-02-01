## Configure
1. clone repo from terminal
```bash
    git clone https://github.com/kibo-kevinwatts/warm-up-site.git
```

2. copy env template
```bash
    cp .env.template .env
```

3. populate env values
```
KIBO_CLIENT_ID= application id
KIBO_SHARED_SECRET= application secret
KIBO_TENANT= 12345
KIBO_SITE= 1235
HEADLESS_STOREFRONT_URL=https://nextjs-storefront-kibo-commerce.vercel.app/
```

4. install deps
```bash
    npm install
```

5. run script
```bash
npm start
```
