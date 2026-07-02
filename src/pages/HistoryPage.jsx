import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, History as HistoryIcon } from 'lucide-react'
import { Topbar } from '../components/layout/Topbar'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'
import { api } from '../api/client'

const STATUS_TONE = {
  draft: 'slate',
  scheduled: 'amber',
  running: 'brand',
  paused: 'amber',
  completed: 'emerald',
  cancelled: 'rose',
}

export function HistoryPage() {
  const [campaigns, setCampaigns] = useState(null)

  useEffect(() => {
    api.get('/campaigns').then(setCampaigns)
  }, [])

  return (
    <div>
      <Topbar title="History" subtitle="Every campaign you've sent or scheduled" />
      <div className="p-4 md:p-8 animate-fade-in">
        <Card>
          {campaigns === null ? (
            <TableSkeleton rows={4} />
          ) : campaigns.length === 0 ? (
            <EmptyState icon={HistoryIcon} title="No campaigns yet" description="Once you send or schedule a campaign, it will show up here." />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {campaigns.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.03 }}
                >
                  <Link
                    to={`/send/${c.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(c.created_at.replace(' ', 'T') + 'Z').toLocaleString()} · {c.stats.total} recipients
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        {c.stats.sent} sent · {c.stats.failed} failed
                      </span>
                      <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault()
                          window.open(`/api/campaigns/${c.id}/export`, '_blank')
                        }}
                      >
                        <Download size={14} />
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
