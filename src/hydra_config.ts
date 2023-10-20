'use server'
import { Configuration, OAuth2Api } from "@ory/hydra-client"


const hydraAdmin = new OAuth2Api(
  new Configuration({
    basePath: process.env.HYDRA_ADMIN_URL,
  }),
)

export { hydraAdmin }

