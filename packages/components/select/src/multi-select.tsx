import type { CSSUIObject, HTMLUIProps, ThemeProps } from "@yamada-ui/core"
import {
  ui,
  forwardRef,
  useComponentMultiStyle,
  omitThemeProps,
} from "@yamada-ui/core"
import { Popover, PopoverTrigger } from "@yamada-ui/popover"
import type { PortalProps } from "@yamada-ui/portal"
import { Portal } from "@yamada-ui/portal"
import { cx, getValidChildren, handlerAll, runIfFunc } from "@yamada-ui/utils"
import type {
  CSSProperties,
  FC,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from "react"
import { cloneElement, useMemo } from "react"
import { Option } from "./option"
import { OptionGroup } from "./option-group"
import type { SelectItem } from "./select"
import type { SelectIconProps } from "./select-icon"
import { SelectIcon, SelectClearIcon } from "./select-icon"
import type { SelectListProps } from "./select-list"
import { SelectList } from "./select-list"
import type { UseSelectProps } from "./use-select"
import {
  useSelect,
  SelectDescendantsContextProvider,
  SelectProvider,
  useSelectContext,
} from "./use-select"

interface MultiSelectOptions {
  /**
   * If provided, generate options based on items.
   */
  items?: SelectItem[]
  /**
   * The custom display value to use.
   */
  component?: FC<{
    value: string | number
    label: string
    index: number
    onRemove: MouseEventHandler<HTMLElement>
  }>
  /**
   * The visual separator between each value.
   *
   * @default ','
   */
  separator?: string
  /**
   * If `true`, display the multi select clear icon.
   *
   * @default true
   */
  isClearable?: boolean
  /**
   * The border color when the input is focused.
   */
  focusBorderColor?: string
  /**
   * The border color when the input is invalid.
   */
  errorBorderColor?: string
  /**
   * Props for multi select container element.
   */
  containerProps?: Omit<HTMLUIProps, "children">
  /**
   * Props for multi select list element.
   */
  listProps?: Omit<SelectListProps, "children">
  /**
   * Props for multi select field element.
   */
  fieldProps?: Omit<MultiSelectFieldProps, "children">
  /**
   * Props for multi select icon element.
   */
  iconProps?: SelectIconProps
  /**
   * Props for multi select clear icon element.
   */
  clearIconProps?: SelectIconProps
  /**
   * Props to be forwarded to the portal component.
   *
   * @default '{ isDisabled: true }'
   */
  portalProps?: Omit<PortalProps, "children">
  /**
   * The header of the multi select content element.
   */
  header?: ReactNode | FC<{ value: string[] | undefined; onClose: () => void }>
  /**
   * The footer of the multi select content element.
   */
  footer?: ReactNode | FC<{ value: string[] | undefined; onClose: () => void }>
}

export interface MultiSelectProps
  extends ThemeProps<"MultiSelect">,
    Omit<UseSelectProps<string[]>, "placeholderInOptions" | "isEmpty">,
    MultiSelectOptions {}

/**
 * `MultiSelect` is a component used for allowing users to select multiple values from a list of options.
 *
 * @see Docs https://yamada-ui.com/components/forms/multi-select
 */
export const MultiSelect = forwardRef<MultiSelectProps, "div">((props, ref) => {
  const [styles, mergedProps] = useComponentMultiStyle("MultiSelect", props)
  let {
    className,
    defaultValue = [],
    component,
    separator,
    isClearable = true,
    items = [],
    color,
    h,
    height,
    minH,
    minHeight,
    closeOnSelect = false,
    containerProps,
    listProps,
    fieldProps,
    iconProps,
    clearIconProps,
    portalProps = { isDisabled: true },
    header,
    footer,
    children,
    ...computedProps
  } = omitThemeProps(mergedProps)

  const validChildren = getValidChildren(children)
  let computedChildren: ReactElement[] = []

  if (!validChildren.length && items.length) {
    computedChildren = items
      .map((item, i) => {
        if ("value" in item) {
          const { label, value, ...props } = item

          return (
            <Option key={i} value={value} {...props}>
              {label}
            </Option>
          )
        } else if ("items" in item) {
          const { label, items = [], ...props } = item

          return (
            <OptionGroup
              key={i}
              label={label ?? ""}
              {...(props as HTMLUIProps<"ul">)}
            >
              {items.map(({ label, value, ...props }, i) => (
                <Option key={i} value={value} {...props}>
                  {label}
                </Option>
              ))}
            </OptionGroup>
          )
        }
      })
      .filter(Boolean) as ReactElement[]
  }

  let isEmpty = !validChildren.length && !computedChildren.length

  const {
    value,
    onClose,
    descendants,
    formControlProps,
    getPopoverProps,
    getContainerProps,
    getFieldProps,
    placeholder,
    onClear,
    ...rest
  } = useSelect<string[]>({
    ...computedProps,
    defaultValue,
    placeholderInOptions: false,
    closeOnSelect,
    isEmpty,
  })

  h ??= height
  minH ??= minHeight

  const css: CSSUIObject = {
    w: "100%",
    h: "fit-content",
    color,
    ...styles.container,
  }

  return (
    <SelectDescendantsContextProvider value={descendants}>
      <SelectProvider value={{ ...rest, value, onClose, placeholder, styles }}>
        <Popover {...getPopoverProps()}>
          <ui.div
            className={cx("ui-multi-select", className)}
            __css={css}
            {...getContainerProps(containerProps)}
          >
            <ui.div
              className="ui-multi-select__inner"
              __css={{ position: "relative", ...styles.inner }}
            >
              <PopoverTrigger>
                <MultiSelectField
                  component={component}
                  separator={separator}
                  h={h}
                  minH={minH}
                  {...getFieldProps(fieldProps, ref)}
                />
              </PopoverTrigger>

              {isClearable && value.length ? (
                <SelectClearIcon
                  {...clearIconProps}
                  onClick={handlerAll(clearIconProps?.onClick, onClear)}
                  {...formControlProps}
                />
              ) : (
                <SelectIcon {...iconProps} {...formControlProps} />
              )}
            </ui.div>

            {!isEmpty ? (
              <Portal {...portalProps}>
                <SelectList
                  header={runIfFunc(header, { value, onClose })}
                  footer={runIfFunc(footer, { value, onClose })}
                  {...listProps}
                >
                  {children ?? computedChildren}
                </SelectList>
              </Portal>
            ) : null}
          </ui.div>
        </Popover>
      </SelectProvider>
    </SelectDescendantsContextProvider>
  )
})

interface MultiSelectFieldProps
  extends HTMLUIProps,
    Pick<MultiSelectOptions, "component" | "separator"> {}

const MultiSelectField = forwardRef<MultiSelectFieldProps, "div">(
  (
    {
      className,
      component,
      separator = ",",
      isTruncated,
      lineClamp = 1,
      h,
      minH,
      ...rest
    },
    ref,
  ) => {
    const { value, label, onChange, placeholder, styles } = useSelectContext()

    const cloneChildren = useMemo(() => {
      if (!label?.length)
        return <ui.span lineClamp={lineClamp}>{placeholder}</ui.span>

      if (component) {
        return (
          <ui.span isTruncated={isTruncated} lineClamp={lineClamp}>
            {(label as string[]).map((label, index) => {
              const onRemove: MouseEventHandler<HTMLElement> = (e) => {
                e.stopPropagation()

                onChange(value[index])
              }

              const el = component({
                value: value[index],
                label,
                index,
                onRemove,
              }) as ReactElement

              const style: CSSProperties = {
                marginBlockStart: "0.125rem",
                marginBlockEnd: "0.125rem",
                marginInlineEnd: "0.25rem",
              }

              return el
                ? cloneElement(el as ReactElement, { key: index, style })
                : null
            })}
          </ui.span>
        )
      } else {
        return (
          <ui.span isTruncated={isTruncated} lineClamp={lineClamp}>
            {(label as string[]).map((value, index) => {
              const isLast = label.length === index + 1

              return (
                <ui.span
                  key={index}
                  display="inline-block"
                  me="0.25rem"
                  dangerouslySetInnerHTML={{
                    __html: `${value}${!isLast ? separator : ""}`,
                  }}
                />
              )
            })}
          </ui.span>
        )
      }
    }, [
      label,
      isTruncated,
      lineClamp,
      onChange,
      placeholder,
      separator,
      component,
      value,
    ])

    const css: CSSUIObject = {
      pe: "2rem",
      h,
      minH,
      display: "flex",
      alignItems: "center",
      ...styles.field,
    }

    return (
      <ui.div
        ref={ref}
        className={cx("ui-multi-select__field", className)}
        __css={css}
        py={label?.length && component ? "0.125rem" : undefined}
        {...rest}
      >
        {cloneChildren}
      </ui.div>
    )
  },
)
