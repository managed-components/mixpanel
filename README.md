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

### Is EU region `boolean`

Set it ON if you are enrolled in EU Data Residency. [Learn more](https://help.mixpanel.com/hc/en-us/articles/360039135652-Data-Residency-in-EU)

## 🧱 Fields Description

> Fields are properties that can/must be sent with certain events

### Track event name `string`

`event` is the event name that will be sent with a Track event. [Learn more](https://developer.mixpanel.com/reference/track-event)

### Identified ID `string`

`$identified_id` is a unique user ID that will be connected to the anonymous distinct_id of the user. It must be provided with Identify event. [Learn more](https://help.mixpanel.com/hc/en-us/articles/3600410397711#user-identification)

### Alias `string`

`alias` which Mixpanel will use to remap one id to another. Multiple aliases can point to the same identifier. It must be provided with Create alias event. [Learn more](https://help.mixpanel.com/hc/en-us/articles/360041039771#user-identification)

### Group key `string`

`$group_key` is a unique key for a group of user profiles. It must be provided with Update group properties, Delete group properties or Delete group profile events. [Learn more](https://help.mixpanel.com/hc/en-us/articles/360025333632)

### Group ID `string`

`$group_id` is the ID for a group of user profiles. It must be provided with Update group properties, Delete group properties or Delete group profile events. [Learn more](https://help.mixpanel.com/hc/en-us/articles/360025333632)

### List of properties to delete `string`

`unsetList` is a comma separated list of properties to delete. It must be provided with Delete user properties or Delete group properties events. [Learn more](https://developer.mixpanel.com/reference/group-set-property)

### Ignore alias `boolean`

`$ignore_alias` is used to ignore alias when deleting a profile. It must be provided with Delete user profile event. [Learn more](https://developer.mixpanel.com/reference/delete-profile)

### User profile action `string`

`user-set-action` specifies the action to be applied to a user profile. It must be provided with Update user properties event. [Learn more](https://developer.mixpanel.com/reference/profile-set)

### Group profile action `string`

`group-set-action` specifies the action to be applied to a group profile. It must be provided with Update group properties event. [Learn more](https://developer.mixpanel.com/reference/group-set-property)

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
