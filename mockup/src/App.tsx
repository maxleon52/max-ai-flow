import { Background, BackgroundVariant, Controls, Panel, ReactFlow } from '@xyflow/react'
import { motion } from 'motion/react'
import '@xyflow/react/dist/style.css'

export default function App() {
  return (
    <ReactFlow nodes={[]} edges={[]} minZoom={0.2} maxZoom={4}>
      <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="var(--dots)" />
      <Controls showInteractive={false} />
      <Panel position="top-left">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ fontSize: 13, color: 'var(--muted)' }}
        >
          Max AI Flow · mockup
        </motion.div>
      </Panel>
    </ReactFlow>
  )
}
