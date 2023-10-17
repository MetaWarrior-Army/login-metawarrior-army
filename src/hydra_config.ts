// Copyright © 2023 Ory Corp
// SPDX-License-Identifier: Apache-2.0

'use server'
import { Configuration, OAuth2Api } from "@ory/hydra-client"


const hydraAdmin = new OAuth2Api(
  new Configuration({
    basePath: process.env.HYDRA_ADMIN_URL,
  }),
)

export { hydraAdmin }

