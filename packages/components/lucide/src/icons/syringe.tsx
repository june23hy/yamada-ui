import type { LucideIconProps } from "../lucide-icon"
import { forwardRef } from "@yamada-ui/core"
import { Syringe as SyringeIcon } from "lucide-react"
import { LucideIcon } from "../lucide-icon"

/**
 * `Syringe` is [Lucide](https://lucide.dev) SVG icon component.
 *
 * @see Docs https://yamada-ui.com/components/media-and-icons/lucide
 */
export const Syringe = forwardRef<LucideIconProps, "svg">((props, ref) => (
  <LucideIcon ref={ref} as={SyringeIcon} {...props} />
))
