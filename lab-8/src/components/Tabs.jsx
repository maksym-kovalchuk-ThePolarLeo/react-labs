import { createContext, use, useState } from 'react'

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

  return (
    <TabsContext value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext>
  )
}

function TabsList({ children, ...props }) {
  return (
    <div className="tab-list" {...props}>
      {children}
    </div>
  )
}

function TabsTab({ value, children }) {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === value

  return (
    <button
      type="button"
      className={isActive ? 'active' : undefined}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

function TabsPanel({ value, children }) {
  const { activeTab } = useTabsContext()
  const isActive = activeTab === value

  return <div hidden={!isActive}>{children}</div>
}

Tabs.List = TabsList
Tabs.Tab = TabsTab
Tabs.Panel = TabsPanel
