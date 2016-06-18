# VivaldiFox
[![Build Status](https://travis-ci.org/nt1m/vivaldi-fox.svg?branch=master)](https://travis-ci.org/nt1m/vivaldi-fox)

A Firefox add-on for Vivaldi style UI colouring.

## Setup
`npm install -g jpm`

## Compiling xpi
`jpm xpi`

## Running add-on
`jpm run [-b firefoxbinary]`

## Running tests
This repository integrates with Travis CI, which runs the add-on automated tests and eslint. Please make sure those pass when contributing a pull request.

- `jpm test` runs the add-on tests
- `eslint ./` runs eslint across the directory 
	- You'll need to install `eslint` and `eslint-plugin-mozilla` globally with:
		- `npm install -g eslint && npm install -g eslint-plugin-mozilla`
