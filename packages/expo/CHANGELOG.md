# @knocklabs/expo

## 0.3.16

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

- Updated dependencies [e367c6f]
  - @knocklabs/react-native@0.6.16

## 0.3.15

### Patch Changes

- Updated dependencies [329ee05]
  - @knocklabs/react-core@0.6.9
  - @knocklabs/client@0.14.8
  - @knocklabs/react-native@0.6.15

## 0.3.14

### Patch Changes

- Updated dependencies [efd1005]
  - @knocklabs/client@0.14.7
  - @knocklabs/react-core@0.6.8
  - @knocklabs/react-native@0.6.14

## 0.3.13

### Patch Changes

- Updated dependencies [a5c615e]
  - @knocklabs/client@0.14.6
  - @knocklabs/react-core@0.6.7
  - @knocklabs/react-native@0.6.13

## 0.3.12

### Patch Changes

- Updated dependencies [8f00623]
  - @knocklabs/client@0.14.5
  - @knocklabs/react-core@0.6.6
  - @knocklabs/react-native@0.6.12

## 0.3.11

### Patch Changes

- Updated dependencies [e800896]
  - @knocklabs/react-core@0.6.5
  - @knocklabs/client@0.14.4
  - @knocklabs/react-native@0.6.11

## 0.3.10

### Patch Changes

- Updated dependencies [96d70bc]
  - @knocklabs/react-core@0.6.4
  - @knocklabs/react-native@0.6.10

## 0.3.9

### Patch Changes

- 1fb7094: Allow styling stroke width of the bell icon
- Updated dependencies [1fb7094]
  - @knocklabs/react-native@0.6.9

## 0.3.8

### Patch Changes

- 43f9724: Allow styling bell icon and badge using `styleOverride` prop of `<NotificationIconButton>`
- Updated dependencies [43f9724]
  - @knocklabs/react-native@0.6.8

## 0.3.7

### Patch Changes

- Updated dependencies [c97a1d9]
  - @knocklabs/react-core@0.6.3
  - @knocklabs/client@0.14.3
  - @knocklabs/react-native@0.6.7

## 0.3.6

### Patch Changes

- Updated dependencies [b80a656]
  - @knocklabs/react-native@0.6.6

## 0.3.5

### Patch Changes

- Updated dependencies [00439a2]
  - @knocklabs/client@0.14.2
  - @knocklabs/react-core@0.6.2
  - @knocklabs/react-native@0.6.5

## 0.3.4

### Patch Changes

- Updated dependencies [4c41841]
  - @knocklabs/client@0.14.1
  - @knocklabs/react-core@0.6.1
  - @knocklabs/react-native@0.6.4

## 0.3.3

### Patch Changes

- Updated dependencies [711948c]
  - @knocklabs/react-core@0.6.0
  - @knocklabs/client@0.14.0
  - @knocklabs/react-native@0.6.3

## 0.3.2

### Patch Changes

- Updated dependencies [187abc1]
  - @knocklabs/client@0.13.1
  - @knocklabs/react-core@0.5.2
  - @knocklabs/react-native@0.6.2

## 0.3.1

### Patch Changes

- Updated dependencies [4cd1b1e]
  - @knocklabs/client@0.13.0
  - @knocklabs/react-core@0.5.1
  - @knocklabs/react-native@0.6.1

## 0.3.0

### Minor Changes

- 8ba5dcb: [JS] Support React 19 in React SDKs

### Patch Changes

- Updated dependencies [8ba5dcb]
  - @knocklabs/client@0.12.0
  - @knocklabs/react-core@0.5.0
  - @knocklabs/react-native@0.6.0

## 0.2.12

### Patch Changes

- Updated dependencies [226e319]
  - @knocklabs/react-core@0.4.2
  - @knocklabs/react-native@0.5.12

## 0.2.11

### Patch Changes

- Updated dependencies [1b86a0c]
  - @knocklabs/react-core@0.4.1
  - @knocklabs/react-native@0.5.11

## 0.2.10

### Patch Changes

- Updated dependencies [7904b65]
  - @knocklabs/react-core@0.4.0
  - @knocklabs/react-native@0.5.10

## 0.2.9

### Patch Changes

- Updated dependencies [8ea25f4]
  - @knocklabs/client@0.11.4
  - @knocklabs/react-core@0.3.4
  - @knocklabs/react-native@0.5.9

## 0.2.8

### Patch Changes

- Updated dependencies [12bc993]
- Updated dependencies [4f76cd6]
  - @knocklabs/react-core@0.3.3
  - @knocklabs/client@0.11.3
  - @knocklabs/react-native@0.5.8

## 0.2.7

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
  - @knocklabs/react-native@0.5.7

## 0.2.6

### Patch Changes

- Updated dependencies [b9f6712]
  - @knocklabs/react-core@0.3.1
  - @knocklabs/client@0.11.1
  - @knocklabs/react-native@0.5.6

## 0.2.5

### Patch Changes

- Updated dependencies [013ad8d]
  - @knocklabs/react-core@0.3.0
  - @knocklabs/client@0.11.0
  - @knocklabs/react-native@0.5.5

## 0.2.4

### Patch Changes

- Updated dependencies [26db496]
- Updated dependencies [988aaf9]
  - @knocklabs/client@0.10.17
  - @knocklabs/react-core@0.2.29
  - @knocklabs/react-native@0.5.4

## 0.2.3

### Patch Changes

- Updated dependencies [bc99374]
  - @knocklabs/client@0.10.16
  - @knocklabs/react-core@0.2.28
  - @knocklabs/react-native@0.5.3

## 0.2.2

### Patch Changes

- Updated dependencies [26166e3]
  - @knocklabs/client@0.10.15
  - @knocklabs/react-core@0.2.27
  - @knocklabs/react-native@0.5.2

## 0.2.1

### Patch Changes

- Updated dependencies [7510909]
  - @knocklabs/client@0.10.14
  - @knocklabs/react-core@0.2.26
  - @knocklabs/react-native@0.5.1

## 0.2.0

### Minor Changes

- 4ac1e67: Add KnockPushNotificationProvider

### Patch Changes

- Updated dependencies [4ac1e67]
  - @knocklabs/react-native@0.5.0

## 0.1.0

### Minor Changes

- a82e897: Move KnockExpoPushNotificationProvider to @knocklabs/expo

### Patch Changes

- Updated dependencies [a82e897]
  - @knocklabs/react-native@0.4.0
