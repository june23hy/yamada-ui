import type { Meta, StoryFn } from "@storybook/react"
import type { IconNames } from "@yamada-ui/lucide"
import type { IconProps } from "@yamada-ui/react"
import type { FC } from "react"
import { burger } from "@lucide/lab"
import { GhostIcon, icons, LucideIcon } from "@yamada-ui/lucide"
import { HStack } from "@yamada-ui/react"

type Story = StoryFn<typeof GhostIcon>

const meta: Meta<typeof GhostIcon> = {
  component: GhostIcon,
  title: "Components / Media And Icons / Lucide Icon",
}

export default meta

export const basic: Story = () => {
  return (
    <HStack alignItems="flex-end">
      <GhostIcon fontSize="6xl" />

      <GhostIcon fontSize="5xl" />

      <GhostIcon fontSize="4xl" />

      <GhostIcon fontSize="3xl" />

      <GhostIcon fontSize="2xl" />

      <GhostIcon fontSize="xl" />
    </HStack>
  )
}

export const customIcon: Story = () => {
  return <LucideIcon fontSize="4xl" icon={burger} />
}

export const oneGenericIcon: Story = () => {
  const LucideIcon: FC<{ name: IconNames } & IconProps> = ({
    name,
    ...rest
  }) => {
    const Icon = icons[name]

    return <Icon {...rest} />
  }

  return <LucideIcon name="GhostIcon" fontSize="4xl" />
}
