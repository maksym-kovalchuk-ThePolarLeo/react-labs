import { createContext, use, useId, useRef, useState } from 'react'

const TabsContext = createContext(null)

function useTabsContext() {
  const context = use(TabsContext)
  if (!context) {
    throw new Error(
      'Tabs.Tab та Tabs.Panel мають використовуватися всередині <Tabs>',
    )
  }
  return context
}

export default function Tabs({ defaultValue, children }) {
  const [activeTab, setActiveTab] = useState(defaultValue)
  const baseId = useId()
  const tabValuesRef = useRef(new Map())

  function registerTab(value, node) {
    const map = tabValuesRef.current
    if (node) {
      map.set(node, value)
      return () => {
        map.delete(node)
      }
    }
    return undefined
  }

  function getTabValue(node) {
    return tabValuesRef.current.get(node)
  }

  return (
    <TabsContext
      value={{ activeTab, setActiveTab, baseId, registerTab, getTabValue }}
    >
      <div className="tabs">{children}</div>
    </TabsContext>
  )
}

function TabsList({ children, onKeyDown, ...props }) {
  const { setActiveTab, getTabValue } = useTabsContext()
  const listRef = useRef(null)

  function handleKeyDown(event) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    const currentTab = event.target.closest('[role="tab"]')
    if (!currentTab || !listRef.current?.contains(currentTab)) return

    const tabs = Array.from(listRef.current.querySelectorAll('[role="tab"]'))
    const index = tabs.indexOf(currentTab)
    if (index === -1) return

    let nextIndex = null
    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1
    }

    if (nextIndex === null) return

    event.preventDefault()
    const nextTab = tabs[nextIndex]
    nextTab.focus()
    const nextValue = getTabValue(nextTab)
    if (nextValue !== undefined) {
      setActiveTab(nextValue)
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      className="tab-list"
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  )
}

function TabsTab({ value, children }) {
  const { activeTab, setActiveTab, baseId, registerTab } = useTabsContext()
  const isActive = activeTab === value

  return (
    <button
      ref={(node) => registerTab(value, node)}
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

function TabsPanel({ value, children }) {
  const { activeTab, baseId } = useTabsContext()
  const isActive = activeTab === value

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      hidden={!isActive}
    >
      {children}
    </div>
  )
}

Tabs.List = TabsList
Tabs.Tab = TabsTab
Tabs.Panel = TabsPanel
