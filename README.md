# Mixpanel Managed Component

## Documentation

Managed Components docs are published at **https://managedcomponents.dev** .

Find out more about Managed Components [here](https://blog.cloudflare.com/zaraz-open-source-managed-components-and-webcm/) for inspiration and motivation details.

[![Released under the Apache license.](https://img.shields.io/badge/license-apache-blue.svg)](./LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/github/all-contributors/managed-components/snapchat?color=ee8449&style=flat-square)](#contributors)

## 🚀 Quickstart local dev environment

1. Make sure you're running node version >=18.
2. Install dependencies with `npm i`
3. Run unit test watcher with `npm run test:dev`

## ⚙️ Tool Settings

> Settings are used to configure the tool in a Component Manager config file

### Mixpanel Project Token `string`

The Mixpanel Project Token is the unique identifier of your Mixpanel account. [Learn more](https://help.mixpanel.com/hc/en-us/articles/115004502806-Find-Project-Token-)

### Is EU region `string`

Set it ON if you are enrolled in EU Data Residency. [Learn more](https://help.mixpanel.com/hc/en-us/articles/360039135652-Data-Residency-in-EU)

## 🧱 Fields Description

> Fields are properties that can/must be sent with certain events

### Track
Track an event. Use custom fields to add tracked properties. [Learn more](https://developer.mixpanel.com/reference/track-event)


### Create alias
Creates an alias which Mixpanel will use to remap one id to another. [Learn more](https://developer.mixpanel.com/reference/identity-create-alias)


### Identify
Identify a user with a unique ID to track user activity across devices, tie a user to their events, and create a user profile. [Learn more](https://developer.mixpanel.com/reference/create-identity)


### Update user properties
Update a user record or its properties. Use custom fields to add properties. For Union action provide values comma separated, if it is a list. [Learn more](https://developer.mixpanel.com/reference/profile-set)


### Update group properties
Update a group record or its properties. Use custom fields to add properties. For Union action provide values comma separated, if it is a list. [Learn more](https://developer.mixpanel.com/reference/group-set-property)


### Delete user properties
Delete a property and its value from a user profile. [Learn more](https://developer.mixpanel.com/reference/profile-delete-property)


### Delete group properties
Delete a property and its value from a group profile. [Learn more](https://developer.mixpanel.com/reference/group-delete-property)


### Delete user profile
Delete the current user profile with all of its properties. [Learn more](https://developer.mixpanel.com/reference/delete-profile)


### Delete group profile
Delete a group profile with all of its properties. [Learn more](https://developer.mixpanel.com/reference/delete-group)

## 📝 License

Licensed under the [Apache License](./LICENSE).

## 💜 Thanks

Thanks to everyone contributing in any manner for this repo and to everyone working on Open Source in general.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
