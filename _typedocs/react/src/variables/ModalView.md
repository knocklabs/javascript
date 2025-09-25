[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [react/src](../README.md) / ModalView

# Variable: ModalView

> `const` **ModalView**: `object`

Defined in: [packages/react/src/modules/guide/components/Modal/Modal.tsx:339](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/guide/components/Modal/Modal.tsx#L339)

## Type Declaration

### Default

> **Default**: `FC`\<\{ `content`: `ModalContent`; `colorMode?`: `any`; `onOpenChange?`: (`open`) => `void`; `onDismiss?`: () => `void`; `onButtonClick?`: (`e`, `button`) => `void`; `onImageClick?`: (`e`, `image`) => `void`; \}\>

### Root

> **Root**: \{(`__namedParameters`): `Element`; `displayName`: `string`; \}

#### Parameters

##### \_\_namedParameters

`RootProps`

#### Returns

`Element`

#### Root.displayName

> **displayName**: `string`

### Overlay

> **Overlay**: `ForwardRefExoticComponent`\<`Omit`\<`OverlayProps`, `"ref"`\> & `RefAttributes`\<`HTMLDivElement`\>\>

### Content

> **Content**: `ForwardRefExoticComponent`\<`Omit`\<`ContentProps`, `"ref"`\> & `RefAttributes`\<`HTMLDivElement`\>\>

### Title

> **Title**: \{(`__namedParameters`): `Element`; `displayName`: `string`; \}

#### Parameters

##### \_\_namedParameters

`TitleProps`

#### Returns

`Element`

#### Title.displayName

> **displayName**: `string`

### Body

> **Body**: `FC`\<`object` & `ClassAttributes`\<`HTMLDivElement`\> & `HTMLAttributes`\<`HTMLDivElement`\>\>

### Img

> **Img**: `FC`\<`PropsWithChildren`\<`DetailedHTMLProps`\<`ImgHTMLAttributes`\<`HTMLImageElement`\>, `HTMLImageElement`\>\>\>

### Actions

> **Actions**: `FC`\<`PropsWithChildren`\<`DetailedHTMLProps`\<`HTMLAttributes`\<`HTMLDivElement`\>, `HTMLDivElement`\>\>\>

### PrimaryButton

> **PrimaryButton**: `FC`\<`ButtonContent` & `ClassAttributes`\<`HTMLButtonElement`\> & `ButtonHTMLAttributes`\<`HTMLButtonElement`\>\>

### SecondaryButton

> **SecondaryButton**: `FC`\<`ButtonContent` & `ClassAttributes`\<`HTMLButtonElement`\> & `ButtonHTMLAttributes`\<`HTMLButtonElement`\>\>

### Close

> **Close**: \{(`__namedParameters`): `Element`; `displayName`: `string`; \}

#### Parameters

##### \_\_namedParameters

`CloseProps`

#### Returns

`Element`

#### Close.displayName

> **displayName**: `string`
