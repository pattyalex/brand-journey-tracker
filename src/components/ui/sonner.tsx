import { useTheme } from "next-themes"
import { useEffect } from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Force instant toast dismissal on close button click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const closeButton = target.closest('button[data-close-button="true"]')
      if (closeButton) {
        // Small delay to let the click register, then remove
        setTimeout(() => {
          const toast = closeButton.closest('[data-sonner-toast]')
          if (toast) {
            toast.remove()
          }
        }, 50)
      }
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      style={{ overflow: 'visible' }}
      duration={5000}
      toastOptions={{
        style: { overflow: 'visible', position: 'relative' },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "!absolute !-top-2.5 !-right-2.5 !left-auto !bottom-auto !bg-transparent !border-0 !shadow-none !text-gray-500 hover:!text-gray-900 !z-[9999] !opacity-100 !visible !w-6 !h-6 !p-1 !flex !items-center !justify-center [&>svg]:!w-4 [&>svg]:!h-4",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
