# Changelog

## 0.6.43

### Patch Changes

- Updated dependencies [9f0d317]
  - @knocklabs/client@0.18.3
  - @knocklabs/react-core@0.10.3

## 0.6.42

### Patch Changes

- Updated dependencies [1fc802b]
  - @knocklabs/client@0.18.2
  - @knocklabs/react-core@0.10.2

## 0.6.41

### Patch Changes

- Updated dependencies [74366b3]
  - @knocklabs/react-core@0.10.1
  - @knocklabs/client@0.18.1

## 0.6.40

### Patch Changes

- Updated dependencies [5fc0af9]
  - @knocklabs/react-core@0.10.0
  - @knocklabs/client@0.18.0

## 0.6.39

### Patch Changes

- Updated dependencies [23b7057]
- Updated dependencies [1c24f68]
  - @knocklabs/client@0.17.2
  - @knocklabs/react-core@0.9.2

## 0.6.38

### Patch Changes

- Updated dependencies [5b77f18]
  - @knocklabs/client@0.17.1
  - @knocklabs/react-core@0.9.1

## 0.6.37

### Patch Changes

- Updated dependencies [c761e7c]
- Updated dependencies [3558784]
- Updated dependencies [b8b64e4]
  - @knocklabs/client@0.17.0
  - @knocklabs/react-core@0.9.0

## 0.6.36

### Patch Changes

- Updated dependencies [dc84f25]
  - @knocklabs/client@0.16.5
  - @knocklabs/react-core@0.8.5

## 0.6.35

### Patch Changes

- Updated dependencies [49f791b]
  - @knocklabs/client@0.16.4
  - @knocklabs/react-core@0.8.4

## 0.6.34

### Patch Changes

- Updated dependencies [79204f0]
  - @knocklabs/react-core@0.8.3
  - @knocklabs/client@0.16.3

## 0.6.33

### Patch Changes

- Updated dependencies [5a19d82]
  - @knocklabs/client@0.16.2
  - @knocklabs/react-core@0.8.2

## 0.6.32

### Patch Changes

- Updated dependencies [35b5445]
- Updated dependencies [5d758d7]
- Updated dependencies [d2fd092]
  - @knocklabs/client@0.16.1
  - @knocklabs/react-core@0.8.1

## 0.6.31

### Patch Changes

- Updated dependencies [48e9c77]
  - @knocklabs/react-core@0.8.0
  - @knocklabs/client@0.16.0

## 0.6.30

### Patch Changes

- Updated dependencies [fb68ce1]
- Updated dependencies [d7e5371]
  - @knocklabs/client@0.15.2
  - @knocklabs/react-core@0.7.5

## 0.6.29

### Patch Changes

- Updated dependencies [001690a]
  - @knocklabs/react-core@0.7.4

## 0.6.28

### Patch Changes

- Updated dependencies [c3efcf9]
- Updated dependencies [befd7b9]
  - @knocklabs/react-core@0.7.3
  - @knocklabs/client@0.15.1

## 0.6.27

### Patch Changes

- fdc6d82: chore(deps): bump the telegraph-packages group across 1 directory with 9 updates
- Updated dependencies [3703cf6]
- Updated dependencies [fdc6d82]
  - @knocklabs/react-core@0.7.2

## 0.6.26

### Patch Changes

- Updated dependencies [aa16c97]
  - @knocklabs/react-core@0.7.1

## 0.6.25

### Patch Changes

- d0b85b3: fix: make token (un)registration methods in KnockPushNotificationProvider awaitable

## 0.6.24

### Patch Changes

- Updated dependencies [2a0b3e2]
  - @knocklabs/react-core@0.7.0
  - @knocklabs/client@0.15.0

## 0.6.23

### Patch Changes

- Updated dependencies [6539c97]
  - @knocklabs/client@0.14.11
  - @knocklabs/react-core@0.6.15

## 0.6.22

### Patch Changes

- Updated dependencies [e05ad61]
- Updated dependencies [e05ad61]
- Updated dependencies [e05ad61]
  - @knocklabs/react-core@0.6.14
  - @knocklabs/client@0.14.10

## 0.6.22-canary.2

### Patch Changes

- Updated dependencies [e69da7b]
  - @knocklabs/react-core@0.6.14-canary.2
  - @knocklabs/client@0.14.10-canary.2

## 0.6.22-canary.1

### Patch Changes

- Updated dependencies [c76b2d9]
  - @knocklabs/react-core@0.6.14-canary.1
  - @knocklabs/client@0.14.10-canary.1

## 0.6.22-canary.0

### Patch Changes

- Updated dependencies [86a72cc]
  - @knocklabs/react-core@0.6.14-canary.0
  - @knocklabs/client@0.14.10-canary.0

## 0.6.21

### Patch Changes

- Updated dependencies [bea5604]
  - @knocklabs/react-core@0.6.13

## 0.6.20

### Patch Changes

- b317a4e: bump @types/react-native-htmlview from 0.16.5 to 0.16.6

## 0.6.19

### Patch Changes

- Updated dependencies [4e73f12]
  - @knocklabs/client@0.14.9
  - @knocklabs/react-core@0.6.12

## 0.6.18

### Patch Changes

- Updated dependencies [dbbbaf7]
  - @knocklabs/react-core@0.6.11

## 0.6.17

### Patch Changes

- Updated dependencies [337bade]
  - @knocklabs/react-core@0.6.10

## 0.6.16

### Patch Changes

- e367c6f: Fix `ReferenceError` raised on feed initialization

  @knocklabs/react-native@0.6.13 and @knocklabs/expo@0.3.13 contained a bug in which the error
  `ReferenceError: Property 'crypto' doesn't exist` would occur when initializing a feed via any of
  the following methods:

  - The `KnockFeedProvider` context provider
  - The `useNotifications` hook
  - A call to `knock.feeds.initialize()`

  This has been fixed by adding
  [react-native-get-random-values](https://github.com/LinusU/react-native-get-random-values) as a
  dependency of our React Native and Expo SDKs.

## 0.6.15

### Patch Changes

- Updated dependencies [329ee05]
  - @knocklabs/react-core@0.6.9
  - @knocklabs/client@0.14.8

## 0.6.14

### Patch Changes

- Updated dependencies [efd1005]
  - @knocklabs/client@0.14.7
  - @knocklabs/react-core@0.6.8

## 0.6.13

### Patch Changes

- Updated dependencies [a5c615e]
  - @knocklabs/client@0.14.6
  - @knocklabs/react-core@0.6.7

## 0.6.12

### Patch Changes

- Updated dependencies [8f00623]
  - @knocklabs/client@0.14.5
  - @knocklabs/react-core@0.6.6

## 0.6.11

### Patch Changes

- Updated dependencies [e800896]
  - @knocklabs/react-core@0.6.5
  - @knocklabs/client@0.14.4

## 0.6.10

### Patch Changes

- Updated dependencies [96d70bc]
  - @knocklabs/react-core@0.6.4

## 0.6.9

### Patch Changes

- 1fb7094: Allow styling stroke width of the bell icon

## 0.6.8

### Patch Changes

- 43f9724: Allow styling bell icon and badge using `styleOverride` prop of `<NotificationIconButton>`

## 0.6.7

### Patch Changes

- Updated dependencies [c97a1d9]
  - @knocklabs/react-core@0.6.3
  - @knocklabs/client@0.14.3

## 0.6.6

### Patch Changes

- b80a656: Add `containerStyle` prop to the `NotificationFeed` component

## 0.6.5

### Patch Changes

- Updated dependencies [00439a2]
  - @knocklabs/client@0.14.2
  - @knocklabs/react-core@0.6.2

## 0.6.4

### Patch Changes

- Updated dependencies [4c41841]
  - @knocklabs/client@0.14.1
  - @knocklabs/react-core@0.6.1

## 0.6.3

### Patch Changes

- Updated dependencies [711948c]
  - @knocklabs/react-core@0.6.0
  - @knocklabs/client@0.14.0

## 0.6.2

### Patch Changes

- Updated dependencies [187abc1]
  - @knocklabs/client@0.13.1
  - @knocklabs/react-core@0.5.2

## 0.6.1

### Patch Changes

- Updated dependencies [4cd1b1e]
  - @knocklabs/client@0.13.0
  - @knocklabs/react-core@0.5.1

## 0.6.0

### Minor Changes

- 8ba5dcb: [JS] Support React 19 in React SDKs

### Patch Changes

- Updated dependencies [8ba5dcb]
  - @knocklabs/client@0.12.0
  - @knocklabs/react-core@0.5.0

## 0.5.12

### Patch Changes

- Updated dependencies [226e319]
  - @knocklabs/react-core@0.4.2

## 0.5.11

### Patch Changes

- Updated dependencies [1b86a0c]
  - @knocklabs/react-core@0.4.1

## 0.5.10

### Patch Changes

- Updated dependencies [7904b65]
  - @knocklabs/react-core@0.4.0

## 0.5.9

### Patch Changes

- Updated dependencies [8ea25f4]
  - @knocklabs/client@0.11.4
  - @knocklabs/react-core@0.3.4

## 0.5.8

### Patch Changes

- Updated dependencies [12bc993]
- Updated dependencies [4f76cd6]
  - @knocklabs/react-core@0.3.3
  - @knocklabs/client@0.11.3

## 0.5.7

### Patch Changes

- Updated dependencies [85418a0]
- Updated dependencies [2161d3f]
- Updated dependencies [8cc9338]
- Updated dependencies [da84a75]
- Updated dependencies [2161d3f]
- Updated dependencies [2161d3f]
- Updated dependencies [1ba1393]
- Updated dependencies [b4b5c02]
  - @knocklabs/react-core@0.3.2
  - @knocklabs/client@0.11.2

## 0.5.6

### Patch Changes

- Updated dependencies [b9f6712]
  - @knocklabs/react-core@0.3.1
  - @knocklabs/client@0.11.1

## 0.5.5

### Patch Changes

- Updated dependencies [013ad8d]
  - @knocklabs/react-core@0.3.0
  - @knocklabs/client@0.11.0

## 0.5.4

### Patch Changes

- Updated dependencies [26db496]
- Updated dependencies [988aaf9]
  - @knocklabs/client@0.10.17
  - @knocklabs/react-core@0.2.29

## 0.5.3

### Patch Changes

- Updated dependencies [bc99374]
  - @knocklabs/client@0.10.16
  - @knocklabs/react-core@0.2.28

## 0.5.2

### Patch Changes

- Updated dependencies [26166e3]
  - @knocklabs/client@0.10.15
  - @knocklabs/react-core@0.2.27

## 0.5.1

### Patch Changes

- Updated dependencies [7510909]
  - @knocklabs/client@0.10.14
  - @knocklabs/react-core@0.2.26

## 0.5.0

### Minor Changes

- 4ac1e67: Add KnockPushNotificationProvider

## 0.4.0

### Minor Changes

- a82e897: Move KnockExpoPushNotificationProvider to @knocklabs/expo

## 0.3.1

### Patch Changes

- Updated dependencies [47a88da]
  - @knocklabs/react-core@0.2.25

## 0.3.0

### Minor Changes

- 1d440f7: feat: add prebuilt In App Feed Components for React Native

### Patch Changes

- Updated dependencies [1d440f7]
  - @knocklabs/client@0.10.13
  - @knocklabs/react-core@0.2.24

## 0.2.12

### Patch Changes

- Updated dependencies [5545f9e]
  - @knocklabs/client@0.10.12
  - @knocklabs/react-core@0.2.23

## 0.2.11

### Patch Changes

- 671c510: Adding a prop to our KnockExpoPushNotificationProvider to allow users to opt out of our auto registration

## 0.2.10

### Patch Changes

- 57f0c34: Updating React Native and Expo peer dependencies

## 0.2.9

### Patch Changes

- b11aed5: Fixed an issue in KnockExpoPushNotificationProvider that prevented auto device token registration from working

## 0.2.8

### Patch Changes

- 10e7199: Updating expo dependencies

## 0.2.7

### Patch Changes

- Updated dependencies [395f0ca]
  - @knocklabs/client@0.10.11
  - @knocklabs/react-core@0.2.22

## 0.2.6

### Patch Changes

- a4d520c: chore: update generic types
- Updated dependencies [a4d520c]
  - @knocklabs/react-core@0.2.21
  - @knocklabs/client@0.10.10

## 0.2.5

### Patch Changes

- Updated dependencies [d0adb14]
  - @knocklabs/client@0.10.9
  - @knocklabs/react-core@0.2.20

## 0.2.4

### Patch Changes

- Updated dependencies [1e60c19]
  - @knocklabs/react-core@0.2.19

## 0.2.3

### Patch Changes

- Updated dependencies [29e3942]
  - @knocklabs/react-core@0.2.18
  - @knocklabs/client@0.10.8

## 0.2.2

### Patch Changes

- Updated dependencies [f25b112]
  - @knocklabs/react-core@0.2.17
  - @knocklabs/client@0.10.7

## 0.2.1

### Patch Changes

- Updated dependencies [5d2ddab]
  - @knocklabs/react-core@0.2.16

## 0.2.0

### Minor Changes

- b29a47a: Add KnockExpoPushNotificationProvider to react-native sdk

### Patch Changes

- Updated dependencies [b29a47a]
  - @knocklabs/react-core@0.2.15
  - @knocklabs/client@0.10.6

## 0.1.20

### Patch Changes

- Updated dependencies [5fe3063]
  - @knocklabs/react-core@0.2.14

## 0.1.19

### Patch Changes

- Updated dependencies [044eb0f]
  - @knocklabs/client@0.10.5
  - @knocklabs/react-core@0.2.13

## 0.1.18

### Patch Changes

- Updated dependencies [5a7c56e]
  - @knocklabs/client@0.10.4
  - @knocklabs/react-core@0.2.12

## 0.1.17

### Patch Changes

- Updated dependencies [a71ce51]
  - @knocklabs/client@0.10.3
  - @knocklabs/react-core@0.2.11

## 0.1.16

### Patch Changes

- b8b3fc9: fix: don't use propswithchildren w/o props

## 0.1.15

### Patch Changes

- Updated dependencies [42ba22c]
  - @knocklabs/react-core@0.2.10
  - @knocklabs/client@0.10.2

## 0.1.14

### Patch Changes

- Updated dependencies [354dd1a]
  - @knocklabs/react-core@0.2.9

## 0.1.13

### Patch Changes

- Updated dependencies [3c277cb]
- Updated dependencies [567e24f]
  - @knocklabs/react-core@0.2.8
  - @knocklabs/client@0.10.1

## 0.1.12

### Patch Changes

- Updated dependencies [8bdc75b]
  - @knocklabs/client@0.10.0
  - @knocklabs/react-core@0.2.7

## 0.1.11

### Patch Changes

- Updated dependencies [f58371c]
  - @knocklabs/client@0.9.4
  - @knocklabs/react-core@0.2.6

## 0.1.10

### Patch Changes

- Updated dependencies [10b5646]
  - @knocklabs/react-core@0.2.5

## 0.1.9

### Patch Changes

- bc69618: Add react-native to package.json files to fix a bug in our React Native SDK
- Updated dependencies [bc69618]
  - @knocklabs/react-core@0.2.4
  - @knocklabs/client@0.9.3

## 0.1.8

### Patch Changes

- Updated dependencies [fed0f8c]
  - @knocklabs/client@0.9.2
  - @knocklabs/react-core@0.2.3

## 0.1.7

### Patch Changes

- Updated dependencies [282d005]
  - @knocklabs/react-core@0.2.2

## 0.1.6

### Patch Changes

- Updated dependencies [f37d680]
  - @knocklabs/client@0.9.1
  - @knocklabs/react-core@0.2.1

## 0.1.5

### Patch Changes

- Updated dependencies [e076109]
- Updated dependencies [627e643]
  - @knocklabs/react-core@0.2.0
  - @knocklabs/client@0.9.0

## 0.1.4

### Patch Changes

- Updated dependencies [c9faba5]
  - @knocklabs/react-core@0.1.6
  - @knocklabs/client@0.8.21

## 0.1.3

### Patch Changes

- Re-releasing packages
- Updated dependencies
  - @knocklabs/client@0.8.20
  - @knocklabs/react-core@0.1.5

## 0.1.2

### Patch Changes

- 7786ec5: chore: upgrade to yarn modern and update local package references
- Updated dependencies [7786ec5]
- Updated dependencies [9dd0d15]
  - @knocklabs/react-core@0.1.4
  - @knocklabs/client@0.8.19

## 0.1.1

### Patch Changes

- 764a58a: Feat: use KnockProvider and KnockFeedProvider in React Native package
