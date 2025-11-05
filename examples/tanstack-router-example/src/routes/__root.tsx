import {
  Banner,
  Card,
  KnockGuideProvider,
  KnockProvider,
  Modal,
} from "@knocklabs/react";
import { KnockGuideLocationSensor } from "@knocklabs/react/tanstack";
import "@knocklabs/react/dist/index.css";
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/">Home</Link>
        <Link to="/books">Books</Link>
      </div>
      <hr />

      <KnockProvider
        apiKey={import.meta.env.VITE_KNOCK_API_KEY!}
        user={{ id: import.meta.env.VITE_KNOCK_USER_ID! }}
        host={import.meta.env.VITE_KNOCK_HOST}
        logLevel="debug"
      >
        <KnockGuideProvider
          channelId={import.meta.env.VITE_KNOCK_GUIDE_CHANNEL_ID}
          readyToTarget={true}
          listenForUpdates={true}
        >
          <div style={{ padding: "1rem 2rem" }}>
            <div style={{ marginTop: "20px" }} />
            <Banner />
            <div style={{ marginTop: "20px" }} />
            <Card />
            <div style={{ marginTop: "20px" }} />
            <Modal />
            <div style={{ marginTop: "20px" }} />
          </div>

          <Outlet />

          <KnockGuideLocationSensor />
        </KnockGuideProvider>
      </KnockProvider>

      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  ),
})
