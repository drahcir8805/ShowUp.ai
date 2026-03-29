"use client"

import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react"
import { ArrowRight, HelpCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode
  className?: string
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string
  className: string
  background: ReactNode
  Icon: React.ElementType
  description: string
  href: string
  cta: string
  /** Optional explainer shown in a small popup next to the title (e.g. Total Bankroll). */
  info?: ReactNode
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  info,
  ...props
}: BentoCardProps) => {
  const [infoOpen, setInfoOpen] = useState(false)
  return (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between rounded-xl",
      info ? "overflow-visible" : "overflow-hidden",
      // light styles
      "bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      // dark styles
      "dark:bg-background transform-gpu dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:[border:1px_solid_rgba(255,255,255,.1)]",
      className
    )}
    {...props}
  >
    <div>{background}</div>
    <div className="p-4">
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 transition-all duration-300 lg:group-hover:-translate-y-10">
        <Icon className="h-12 w-12 origin-left transform-gpu text-neutral-800 transition-all duration-300 ease-in-out group-hover:scale-75" />
        <div className="flex w-full items-start justify-between gap-2">
          <h3 className="flex-1 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {name}
          </h3>
          {info ? (
            <div className="relative shrink-0 pointer-events-auto">
              <button
                type="button"
                aria-label={`More about ${name}`}
                aria-expanded={infoOpen}
                className="rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-200/80 hover:text-neutral-800 dark:hover:bg-neutral-700/80 dark:hover:text-neutral-100"
                onClick={(e) => {
                  e.stopPropagation()
                  setInfoOpen((o) => !o)
                }}
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              {infoOpen ? (
                <div
                  role="dialog"
                  aria-label={`${name} details`}
                  className="absolute right-0 top-full z-[60] mt-2 w-64 rounded-lg border border-neutral-200 bg-white p-3 text-left text-sm font-normal leading-snug text-neutral-700 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {info}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <p className="max-w-lg text-neutral-600 dark:text-neutral-400">{description}</p>
      </div>

      <div
        className={cn(
          "pointer-events-none flex w-full translate-y-0 transform-gpu flex-row items-center transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:hidden"
        )}
      >
        <Button
          variant="link"
          asChild
          size="sm"
          className="pointer-events-auto p-0"
        >
          <a href={href}>
            {cta}
            <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
          </a>
        </Button>
      </div>
    </div>

    <div
      className={cn(
        "pointer-events-none absolute bottom-0 hidden w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex"
      )}
    >
      <Button
        variant="link"
        asChild
        size="sm"
        className="pointer-events-auto p-0"
      >
        <a href={href}>
          {cta}
          <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
        </a>
      </Button>
    </div>

    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/3 group-hover:dark:bg-neutral-800/10" />
  </div>
  )
}

export { BentoCard, BentoGrid }
