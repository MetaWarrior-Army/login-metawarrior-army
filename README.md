# login-metawarrior-army
A web3 authentication application backed by OAuth2 provided by Ory Hydra.

## API Dependencies
### Ory Hydra
Ory Hydra is the OAuth2 implementation. We access the admin interface via `127.0.0.1:4445`.

### Moralis
Moralis is our blockchain api. Metamask and other wallets are beginning to disable eth.sign() by default to protect users.

### WalletConnect
WalletConnect allows us to support mobile and hardware wallet users.

### Infura
Infura is our backup web3 connector if all else fails.

# Dependencies
NodeJS (16+ for NextJS)

`apt install nodejs`

Moralis Next-Auth Next React React-Dom

`npm install moralis @moralisweb3/next next-auth next@12.3.4 react react-dom`

wagmi & viem (web3) for MetaMask

`npm install wagmi viem`

Net, TLS, fs 

`npm install net tls fs`

# Installing

Clone this repo.

Modify `env.local.example` and save as `.env.local`.

```
TEST=test
MORALIS_API_KEY=YOURAPIKEY

APP_DOMAIN=auth.example.com
NEXTAUTH_URL=https://auth.example.com
NEXTAUTH_SECRET=YOURNEXTAUTHSECRET

INFURA_API_KEY=YOURINFURAAPIKEY

HYDRA_ADMIN_URL=http://127.0.0.1:4445/

WALLETCONNECT_PROJECTID=YOURPROJECTID

PROJECT_NAME="My Project"
PROJECT_URL=https://www.example.com
PROJECT_LOGO_URL=https://www.example.com/media/img/logo.png
PROJECT_ICON_URL=https://www.example.com/media/img/logo.ico

```

Modify `src/config_example.jsx` and save to `src/config.jsx`.

```
export const project = {
    'WALLETCONNECT_PROJECTID': "YOURAPIKEY",
    'PROJECT_NAME': 'My Project',
    'PROJECT_URL': 'https://www.example.com',
    'PROJECT_LOGO_URL': 'https://www.example.com/media/img/logo.png',
    'PROJECT_ICON_URL': 'https://www.example.com/media/img/logo.ico',
    'INFURA_API_KEY': 'YOURAPIKEY'
};
```

# Running
First try `npm run dev` in the cloned directory to make sure the application works. The application starts on port `4000`. Feel free to setup some sort of proxy for public access. The app only supports `http` by default.

You'll need to create a client and client application to interact with the OAuth server. Ory Hydra has solid documentation on how to install and test your OAuth implementation.

if `npm run dev` works and you've tested it. Feel free to `npm run build` and `npm run start` to compile and run.

![screenshot](relative%20path/github/pics/login_oauth2.png?raw=true)

![screenshot](https://raw.githubusercontent.com/MetaWarrior-Army/login-metawarrior-army/61dc3a694c486926407704c47891f232d9d46b8c/github/pics/wc_oauth2.png  )

![screenshot](https://github.com/MetaWarrior-Army/login-metawarrior-army/blob/61dc3a694c486926407704c47891f232d9d46b8c/github/pics/consent_oauth.png)


# References
- https://docs.moralis.io/web3-data-api/evm/quickstart-nextjs
- https://docs.moralis.io/authentication-api/evm/how-to-sign-in-with-metamask
