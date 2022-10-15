# OpenSearch for pub.dev

A [Cloudflare worker](https://workers.cloudflare.com) to provide an OpenSearch-compatible search API for
[pub.dev](https://pub.dev).

This adds package searching, with suggestions, to your browser!

## Usage

### Setup

A pre-configured instance is available [here](https://pubsearch.hacker1024.workers.dev).  
Using this is not recommended, as it has a daily cap of 100,000 requests, and does not have caching enabled as it has no
custom domain.

Instructions for setting up a personal worker instance can be found
[here](https://developers.cloudflare.com/workers/get-started/guide).

### Search types

#### Package search

The package search definition links to pub.dev search pages.

#### Package links

The package link definition links to pub.dev package pages directly.

## Known issues

- Some browsers, such as Google Chrome, only detect the first linked OpenSearch definition document.

## FAQ

### How much does this cost to run?  
  Nothing, assuming you make under 100,000 requests per day!

### How is this different to the official pub.dev OpenSearch functionality? ###  
  This project provides search suggestions.
