<!-- markdownlint-disable line-length -->

# fetch-node

Thin wrapper over [`node-fetch`](https://github.com/node-fetch/node-fetch). Sister libray of [`@asd14/fetch-browser`](https://github.com/asd-xiv/fetch-browser).

<!-- vim-markdown-toc GFM -->

* [Install](#install)
* [Initialize](#initialize)
  * [Default headers](#default-headers)
  * [Query string parameters](#query-string-parameters)
* [`GET`](#get)
* [`PATCH`](#patch)
* [`POST`](#post)
* [`DELETE`](#delete)
* [`MULTIPART`](#multipart)
* [Changelog](#changelog)

<!-- vim-markdown-toc -->

## Install

```bash
npm i @asd14/fetch-node
```

## Initialize

```javascript
import { set } from "@asd14/fetch-node"

set({
  // Throws if not set and using relative paths
  baseURL: "http://localhost",
})
```

### Default headers

```javascript
import { set } from "@asd14/fetch-node"

set({
  // Persistent headers
  headers: {
    // Library defaults
    "accept": "application/json",
    "content-type": "application/json",

    // Set JWT for authorized requests
    authorization: "signed-payload-with-base64-over",
  },
})
```

### Query string parameters

There is no built-in way to handle query params but you can set a custom
transform function.

```javascript
import { set } from "@asd14/fetch-node"
import { stringify } from "qs"

set({
  // Throws if query params passed and no stringify function defined
  queryStringifyFn: source =>
    stringify(source, {
      allowDots: true,
      encode: false,
      arrayFormat: "brackets",
      strictNullHandling: true,
    })
})
```

## `GET`

```javascript
import { GET } from "@asd14/fetch-node"

const myIP = await GET("https://api.ipify.org", {
  query: {
    format: "json"
  }
})
// => {"ip":"213.127.80.141"}
```

## `PATCH`

## `POST`

## `DELETE`

## `MULTIPART`

## Changelog

See the [releases section](https://github.com/asd-xiv/fetch-node/releases) for details.
