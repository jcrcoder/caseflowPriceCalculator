# CaseFlow Price Calculator

A pricing estimation tool for calculating annual subscription costs for cloud storage/compute services. Built with Next.js 14, TypeScript, and shadcn/ui.

## Features

- Estimate annual pricing based on storage capacity (terabytes)
- Support for multiple instances (1-25)
- Contract length options (1, 3, or 5 years) with volume discounts
- Tiered pricing with automatic tier detection
- Real-time price calculation
- Keyword-protected access

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 14.2.16 |
| Language | TypeScript | 5 |
| UI Library | React | 18 |
| Styling | Tailwind CSS | 3.4.17 |
| Components | shadcn/ui + Radix UI | Latest |
| Forms | React Hook Form | 7.54.1 |
| Validation | Zod | 3.24.1 |
| Icons | Lucide React | 0.454.0 |
| Theme | next-themes | 0.4.4 |

## Project Structure

```
caseflowPriceCalculator/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main page (entry point)
│   ├── layout.tsx                # Root layout with metadata
│   └── globals.css               # Global styles & theme variables
│
├── components/                   # React components
│   ├── theme-provider.tsx        # Theme provider wrapper
│   └── ui/                       # shadcn/ui components (49 components)
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.tsx            # Responsive design hook
│   └── use-toast.ts              # Toast notification hook
│
├── lib/                          # Utility functions
│   └── utils.ts                  # Helper utilities
│
├── pricing-estimator.tsx         # Main pricing calculator component
│
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── next.config.mjs               # Next.js configuration
```

## Pricing Model

### Instance Tiers

| Tier | Base Price | Cost per Additional TB |
|------|------------|------------------------|
| 1-14 TBs | $12,100 | $400 |
| 15-29 TBs | $16,500 | $375 |
| 30-74 TBs | $23,100 | $300 |
| 75-149 TBs | $36,300 | $250 |
| 150-300 TBs | $49,500 | $200 |
| 300+ TBs | $82,500 | $150 |

### Contract Discounts

| Contract Length | Discount |
|-----------------|----------|
| 1 Year | 0% |
| 3 Years | 10% |
| 5 Years | 15% |

### Additional Fees

- **Support Cost**: 25% of base software price
- **Additional Instance Fee**: $2,500 per instance (beyond first)

## How It Works

1. **Authentication**: User enters keyword to access the tool
2. **Input Parameters**:
   - Terabytes needed (auto-determines pricing tier)
   - Number of instances (1-25)
   - Contract length (1, 3, or 5 years)
3. **Calculation**: Prices update automatically in real-time
4. **Output**: Detailed breakdown showing base price, support costs, discounts, and total annual cost

### Calculation Formula

```
Base Software Price = Tier Base Price + (Additional TBs × Cost per TB)
Additional Instances Fee = (Total Instances - 1) × $2,500
Total Software Cost = Base Software Price + Additional Instances Fee
Support Costs = Base Software Price × 25%
Subtotal = Total Software Cost + Support Costs
Discount = Subtotal × Discount Rate
Total Annual Cost = Subtotal - Discount
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Key Files

| File | Description |
|------|-------------|
| `pricing-estimator.tsx` | Main component with all pricing logic and UI |
| `app/page.tsx` | Entry point that renders the pricing estimator |
| `app/layout.tsx` | Root layout with metadata and font configuration |
| `components/ui/` | Pre-built accessible UI components |

## State Management

All state is managed locally using React hooks:
- `useState` for component state
- `useEffect` for automatic recalculation when inputs change

No external state management libraries are used.
