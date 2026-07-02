import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

const SAMPLE_OPPORTUNITIES = [
  {
    id: 1,
    title: 'Reading Buddies',
    organization: 'Literacy Org',
    category: 'Education',
    location: 'Portland, OR',
    date: '2026-08-05',
    spotsAvailable: 2,
    description: 'Help kids read.',
  },
  {
    id: 2,
    title: 'Garden Cleanup',
    organization: 'Green Org',
    category: 'Environment',
    location: 'Austin, TX',
    date: '2026-07-19',
    spotsAvailable: 1,
    description: 'Weed the garden.',
  },
  {
    id: 3,
    title: 'Shelter Walk',
    organization: 'Animal Org',
    category: 'Animals',
    location: 'Denver, CO',
    date: '2026-07-12',
    spotsAvailable: 0,
    description: 'Walk dogs.',
  },
]

function mockFetchImplementation(url, options = {}) {
  const method = options.method || 'GET'

  // GET /api/opportunities?category=...
  if (method === 'GET' && url.startsWith('/api/opportunities')) {
    const urlObj = new URL(url, 'http://localhost')
    const category = urlObj.searchParams.get('category')
    const data = category
      ? SAMPLE_OPPORTUNITIES.filter((o) => o.category === category)
      : [...SAMPLE_OPPORTUNITIES]
    return Promise.resolve(jsonResponse(200, data))
  }

  // POST /api/opportunities/:id/apply
  const applyMatch = url.match(/^\/api\/opportunities\/(\d+)\/apply$/)
  if (method === 'POST' && applyMatch) {
    const id = Number(applyMatch[1])
    const opp = SAMPLE_OPPORTUNITIES.find((o) => o.id === id)
    if (!opp) return Promise.resolve(jsonResponse(404, { error: 'Not found' }))
    if (opp.spotsAvailable <= 0) {
      return Promise.resolve(jsonResponse(400, { error: 'No spots available' }))
    }
    opp.spotsAvailable -= 1
    return Promise.resolve(jsonResponse(200, opp))
  }

  // POST /api/opportunities
  if (method === 'POST' && url === '/api/opportunities') {
    const body = JSON.parse(options.body)
    const created = { id: 999, ...body }
    SAMPLE_OPPORTUNITIES.push(created)
    return Promise.resolve(jsonResponse(201, created))
  }

  return Promise.resolve(jsonResponse(404, { error: 'Unhandled request' }))
}

function jsonResponse(status, data) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  }
}

beforeEach(() => {
  // Reset sample data spots/length before each test so tests don't leak state.
  SAMPLE_OPPORTUNITIES.length = 0
  SAMPLE_OPPORTUNITIES.push(
    {
      id: 1,
      title: 'Reading Buddies',
      organization: 'Literacy Org',
      category: 'Education',
      location: 'Portland, OR',
      date: '2026-08-05',
      spotsAvailable: 2,
      description: 'Help kids read.',
    },
    {
      id: 2,
      title: 'Garden Cleanup',
      organization: 'Green Org',
      category: 'Environment',
      location: 'Austin, TX',
      date: '2026-07-19',
      spotsAvailable: 1,
      description: 'Weed the garden.',
    },
    {
      id: 3,
      title: 'Shelter Walk',
      organization: 'Animal Org',
      category: 'Animals',
      location: 'Denver, CO',
      date: '2026-07-12',
      spotsAvailable: 0,
      description: 'Walk dogs.',
    }
  )

  global.fetch = vi.fn(mockFetchImplementation)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('App', () => {
  test('renders all opportunities on initial load', async () => {
    render(<App />)

    expect(await screen.findByText('Reading Buddies')).toBeInTheDocument()
    expect(screen.getByText('Garden Cleanup')).toBeInTheDocument()
    expect(screen.getByText('Shelter Walk')).toBeInTheDocument()
  })

  test('filtering by category hides non-matching cards', async () => {
    const user = userEvent.setup()
    render(<App />)

    await screen.findByText('Reading Buddies')

    const select = screen.getByLabelText(/filter by category/i)
    await user.selectOptions(select, 'Environment')

    expect(await screen.findByText('Garden Cleanup')).toBeInTheDocument()
    expect(screen.queryByText('Reading Buddies')).not.toBeInTheDocument()
    expect(screen.queryByText('Shelter Walk')).not.toBeInTheDocument()
  })

  test('clicking Apply decrements spots and disables the button when full', async () => {
    const user = userEvent.setup()
    render(<App />)

    await screen.findByText('Reading Buddies')
    const card = screen.getByText('Garden Cleanup').closest('li')
    expect(within(card).getByText('1 spot left')).toBeInTheDocument()

    const applyButton = within(card).getByRole('button', { name: /apply/i })
    await user.click(applyButton)

    const fullButton = await within(card).findByRole('button', { name: /full/i })
    expect(fullButton).toBeDisabled()
    expect(within(card).getByText('Full', { selector: 'span' })).toBeInTheDocument()
  })

  test('a card that already has 0 spots shows Full and a disabled button', async () => {
    render(<App />)

    const card = (await screen.findByText('Shelter Walk')).closest('li')
    expect(within(card).getByText('Full', { selector: 'span' })).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: /full/i })).toBeDisabled()
  })

  test('submitting the new opportunity form adds a new card to the list', async () => {
    const user = userEvent.setup()
    render(<App />)

    await screen.findByText('Reading Buddies')

    await user.type(screen.getByLabelText(/title\*/i), 'Food Bank Sorting')
    await user.type(screen.getByLabelText(/organization\*/i), 'City Food Bank')
    await user.selectOptions(screen.getByLabelText(/category\*/i), 'Health')
    await user.type(screen.getByLabelText(/location\*/i), 'Phoenix, AZ')
    await user.type(screen.getByLabelText(/date\*/i), '2026-09-01')
    await user.type(screen.getByLabelText(/spots available/i), '4')
    await user.type(
      screen.getByLabelText(/description/i),
      'Sort and pack donated food.'
    )

    await user.click(screen.getByRole('button', { name: /post opportunity/i }))

    expect(await screen.findByText('Food Bank Sorting')).toBeInTheDocument()
  })

  test('shows a validation error when required fields are missing', async () => {
    const user = userEvent.setup()
    render(<App />)

    await screen.findByText('Reading Buddies')
    await user.click(screen.getByRole('button', { name: /post opportunity/i }))

    expect(
      await screen.findByText(/please fill in all required fields/i)
    ).toBeInTheDocument()
  })
})
