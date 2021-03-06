const fetch = require("node-fetch")
const FormData = require("form-data")
const RFC3986 = require("rfc-3986")
const {
  read,
  pipe,
  reduce,
  startsWith,
  trim,
  when,
  same,
  toLower,
  isEmpty,
} = require("@asd14/m")

const { setProps } = require("./fn.set-props")
const { HTTPError } = require("./fn.http-error")

/**
 * Config
 */
const props = {
  baseURL: "",
  headers: {},
  queryStringifyFn: null,
}

/**
 * `node-fetch` with qs support, default headers and rejects on status
 * outside 200
 *
 * @param  {String} path        API endpoint
 * @param  {String} opt.method  HTTP Method
 * @param  {Object} opt.headers HTTP Headers
 * @param  {Object} opt.body    HTTP Body
 * @param  {Object} opt.query   Query params
 *
 * @return {Promise}            Resolves with response object if code is 20*.
 *                              Reject all other response codes.
 */
const request = (
  path,
  { method, body = {}, headers = {}, query = {} } = {}
) => {
  if (!isEmpty(query) && isEmpty(props.queryStringifyFn)) {
    throw new TypeError(
      `@asd14/fetch-node: ${method}:${path} - Cannot send query params without providing "queryStringifyFn"`
    )
  }

  const isPathURI = new RegExp(RFC3986.uri).test(path)

  if (isEmpty(props.baseURL) && !isPathURI) {
    throw new TypeError(
      `@asd14/fetch-node: ${method}:${path} - Cannot make request with non-absolute path and no "baseURL"`
    )
  }

  // - Remove all undefined values
  // - toLower all keys
  const HEADERS = reduce(
    (acc, [key, value]) =>
      value === undefined
        ? acc
        : {
            ...acc,
            [toLower(key)]: value,
          },
    {},
    Object.entries({
      accept: "application/json",
      "content-type": "application/json",
      ...props.headers,
      ...headers,
    })
  )

  const isReqJSON = pipe(
    read("content-type"),
    startsWith("application/json")
  )(HEADERS)

  const URI = pipe(
    when(
      isEmpty,
      same(path),
      source => `${path}?${props.queryStringifyFn(source)}`
    ),
    trim("/"),
    source => (isPathURI ? source : `${props.baseURL}/${source}`)
  )(query)

  return fetch(URI, {
    method,
    headers: HEADERS,

    // Avoid "HEAD or GET Request cannot have a body"
    ...(method === "GET"
      ? {}
      : { body: isReqJSON ? JSON.stringify(body) : body }),
  })
    .then(response => {
      const isResJSON = startsWith("application/json")(
        response.headers.get("Content-Type")
      )

      return Promise.all([
        response,
        isResJSON ? response.json() : response.text(),
      ])
    })
    .then(([response, data]) => {
      /*
       * The Promise returned from fetch() won't reject on HTTP error status
       * even if the response is an HTTP 404 or 500. Instead, it will resolve
       * normally, and it will only reject on network failure or if anything
       * prevented the request from completing.
       */
      if (response.ok) {
        return data
      }

      throw new HTTPError(response.statusText, {
        status: response.status,
        body: data,
        path: URI,
      })
    })
}

const set = setProps(props)

const GET = (url, { query, headers } = {}) =>
  request(url, { method: "GET", query, headers })

const POST = (url, { body, query, headers } = {}) =>
  request(url, { method: "POST", body, query, headers })

const PATCH = (url, { body, query, headers } = {}) =>
  request(url, { method: "PATCH", body, query, headers })

const DELETE = (url, { body, query, headers } = {}) =>
  request(url, { method: "DELETE", body, query, headers })

const MULTIPART = (url, { body = {}, headers } = {}) => {
  const form = new FormData()

  return request(url, {
    method: "POST",
    body: reduce((acc, [key, value]) => {
      acc.append(key, value)

      return acc
    }, form)(Object.entries(body)),
    headers: {
      ...form.getHeaders(),
      ...headers,
    },
  })
}

module.exports = {
  set,
  GET,
  POST,
  PATCH,
  DELETE,
  MULTIPART,
}
