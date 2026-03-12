'use client'

import { ReactNode, useState } from 'react'

export interface TabItem {
  key: string
  label: string
  icon?: ReactNode
  disabled?: boolean
  content: ReactNode
}

export interface TabsProps {
  tabs: TabItem[]
  defaultTab?: string
  onChange?: (key: string) => void
  className?: string
}

export function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const [activeKey, setActiveKey] = useState(defaultTab ?? tabs[0]?.key ?? '')

  function handleSelect(key: string) {
    setActiveKey(key)
    onChange?.(key)
  }

  const activeTab = tabs.find((t) => t.key === activeKey)

  return (
    <div className={['flex flex-col', className].filter(Boolean).join(' ')}>
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="タブ"
        className="flex gap-1 p-1 rounded-xl bg-fill-tertiary overflow-x-auto"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              id={`tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.key}`}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && handleSelect(tab.key)}
              className={[
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium',
                'whitespace-nowrap transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive
                  ? 'bg-background-elevated text-foreground'
                  : 'text-foreground-secondary hover:text-foreground',
                tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
              ]
                .filter(Boolean)
                .join(' ')}
              style={
                isActive
                  ? { boxShadow: 'var(--shadow-sm)' }
                  : undefined
              }
            >
              {tab.icon && (
                <span className="shrink-0" aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab panels */}
      {tabs.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`tabpanel-${tab.key}`}
          aria-labelledby={`tab-${tab.key}`}
          hidden={tab.key !== activeKey}
          className="mt-4 text-foreground"
        >
          {tab.key === activeKey && activeTab?.content}
        </div>
      ))}
    </div>
  )
}
