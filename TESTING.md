# Testing the Mixpanel component

Currently the best way to end-to-end test the component is to run it locally
with webcm and run it against live Mixpanel account.

```
npx webcm src/index.ts
```

Open [http://localhost:1337](http://localhost:1337) in your browser and trigger
an event manually by pasting:

```js
webcm.track('track')
```

into the JS console.

Then, login to your Mixpanel account and check if the event was properly
received.
