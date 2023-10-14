// Copyright © 2023 Ory Corp
// SPDX-License-Identifier: Apache-2.0

'use server'
import { Configuration, OAuth2Api } from "@ory/hydra-client"


const hydraAdmin = new OAuth2Api(
  new Configuration({
    basePath: "http://127.0.0.1:4445/",
  }),
)

export { hydraAdmin }

/*
acceptOAuth2LoginRequest(requestParameters, options) {
  return exports.OAuth2ApiFp(this.configuration).acceptOAuth2LoginRequest(requestParameters.loginChallenge, requestParameters.acceptOAuth2LoginRequest, options).then((request) => request(this.axios, this.basePath));
}

acceptOAuth2LoginRequest(loginChallenge, acceptOAuth2LoginRequest, options) {
  return __awaiter(this, void 0, void 0, function* () {
      const localVarAxiosArgs = yield localVarAxiosParamCreator.acceptOAuth2LoginRequest(loginChallenge, acceptOAuth2LoginRequest, options);
      return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
  });
},

function test (loginChallenge, acceptOAuth2LoginRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
  // verify required parameter 'loginChallenge' is not null or undefined
  common_1.assertParamExists('acceptOAuth2LoginRequest', 'loginChallenge', loginChallenge);
  const localVarPath = `/admin/oauth2/auth/requests/login/accept`;
  // use dummy base URL string because the URL constructor only accepts absolute URLs.
  const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
  let baseOptions;
  if (configuration) {
      baseOptions = configuration.baseOptions;
  }
  const localVarRequestOptions = Object.assign(Object.assign({ method: 'PUT' }, baseOptions), options);
  const localVarHeaderParameter = {};
  const localVarQueryParameter = {};
  if (loginChallenge !== undefined) {
      localVarQueryParameter['login_challenge'] = loginChallenge;
  }
  localVarHeaderParameter['Content-Type'] = 'application/json';
  common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
  let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
  localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
  localVarRequestOptions.data = common_1.serializeDataIfNeeded(acceptOAuth2LoginRequest, localVarRequestOptions, configuration);
  return {
      url: common_1.toPathString(localVarUrlObj),
      options: localVarRequestOptions,
  };
}),

*/