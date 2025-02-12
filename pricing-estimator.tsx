"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { EyeIcon, EyeOffIcon } from "lucide-react"

// Constants for pricing
const INSTANCE_PRICES = {
  "1-14 TBs": 12100,
  "15-29 TBs": 16500,
  "30-74 TBs": 23100,
  "75-149 TBs": 36300,
  "150-300 TBs": 49500,
  "300+ TBs": 82500,
}

const SUPPORT_COST_PERCENTAGE = 0.25 // 25% of total software cost
const ADDITIONAL_INSTANCE_FEE = 2500 // Fee for each additional instance

const CONTRACT_DISCOUNTS = {
  1: 0,
  2: 0.05, // 5% discount for 2 years
  3: 0.1, // 10% discount for 3 years
}

// Helper function for currency formatting
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

type InstanceSize = keyof typeof INSTANCE_PRICES

const PricingEstimator = () => {
  const [instanceSize, setInstanceSize] = useState<InstanceSize>("1-14 TBs")
  const [totalInstances, setTotalInstances] = useState(1)
  const [contractLength, setContractLength] = useState("1")
  const [results, setResults] = useState<null | {
    baseSoftwarePrice: number
    additionalInstancesFee: number
    totalSoftwareCost: number
    supportCosts: number
    discount: number
    totalAnnualCost: number
  }>(null)
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [keyword, setKeyword] = useState("")
  const [error, setError] = useState("")
  const [showKeyword, setShowKeyword] = useState(false)

  useEffect(() => {
    //setIsModalOpen(true)
  }, [])

  const calculatePricing = () => {
    if (instanceSize in INSTANCE_PRICES) {
      const baseSoftwarePrice = INSTANCE_PRICES[instanceSize]
      const additionalInstancesFee = totalInstances > 1 ? (totalInstances - 1) * ADDITIONAL_INSTANCE_FEE : 0

      const totalSoftwareCost = baseSoftwarePrice + additionalInstancesFee
      const supportCosts = totalSoftwareCost * SUPPORT_COST_PERCENTAGE
      const subtotal = totalSoftwareCost + supportCosts

      const discountRate = CONTRACT_DISCOUNTS[Number.parseInt(contractLength) as keyof typeof CONTRACT_DISCOUNTS]
      const discount = subtotal * discountRate
      const totalAnnualCost = subtotal - discount

      setResults({
        baseSoftwarePrice,
        additionalInstancesFee,
        totalSoftwareCost,
        supportCosts,
        discount,
        totalAnnualCost,
      })
    } else {
      console.error("Invalid instance size selected")
    }
  }

  const handleKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (keyword === "NSerio") {
      setIsModalOpen(false)
      setError("")
    } else {
      setError("Incorrect keyword. Please try again.")
    }
  }

  const toggleKeywordVisibility = () => {
    setShowKeyword(!showKeyword)
  }

  return (
    <div className="container mx-auto p-4">
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (open) setIsModalOpen(true)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Keyword to Access</DialogTitle>
            <DialogDescription>Please enter the keyword to access the Pricing Estimator.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleKeywordSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="keyword" className="text-right">
                  Keyword
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="keyword"
                    type={showKeyword ? "text" : "password"}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={toggleKeywordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  >
                    {showKeyword ? (
                      <EyeOffIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
            <Button type="submit">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>

      <h1 className="text-2xl font-bold mb-4">Pricing Estimator</h1>
      <Card>
        <CardHeader>
          <CardTitle>Select Your Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instance Size</label>
              <Select onValueChange={(value) => setInstanceSize(value as InstanceSize)} value={instanceSize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select instance size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(INSTANCE_PRICES).map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Instances</label>
              <Select
                onValueChange={(value) => setTotalInstances(Number.parseInt(value))}
                value={totalInstances.toString()}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select total instances" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contract Length</label>
              <RadioGroup
                defaultValue="1"
                onValueChange={(value) => setContractLength(value)}
                className="flex space-x-2"
              >
                {[1, 2, 3].map((year) => (
                  <div key={year}>
                    <RadioGroupItem value={year.toString()} id={`contract-${year}`} className="peer sr-only" />
                    <Label
                      htmlFor={`contract-${year}`}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-green-100 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-green-100 h-20"
                    >
                      <span className="text-center">
                        {year} Year{year > 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-center">
                        {year > 1 ? `(${CONTRACT_DISCOUNTS[year as keyof typeof CONTRACT_DISCOUNTS] * 100}% off)` : ""}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <Button onClick={calculatePricing} className="w-full">
              Calculate
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Price Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Base Software Price: {formatCurrency(results.baseSoftwarePrice)}</p>
              <p>Additional Instances Fee: {formatCurrency(results.additionalInstancesFee)}</p>
              <p>Total Software Cost: {formatCurrency(results.totalSoftwareCost)}</p>
              <p>Support Costs: {formatCurrency(results.supportCosts)}</p>
              <p>
                Discount {/*(
                {Number.parseInt(contractLength) > 1 ? (Number.parseInt(contractLength) === 2 ? "5%" : "10%") : "0%"})*/}:
                ({formatCurrency(results.discount)})
              </p>
              <div className="border-t pt-2 mt-2">
                <p className="font-bold">Total Annual Cost: {formatCurrency(results.totalAnnualCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PricingEstimator

