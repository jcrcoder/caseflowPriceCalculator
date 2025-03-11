"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { EyeIcon, EyeOffIcon, ServerIcon, HardDriveIcon, CalendarIcon } from "lucide-react"

// Constants for pricing
const INSTANCE_PRICES = {
  "1-14 TBs": { basePrice: 12100, costPerAdditionalTB: 400 },
  "15-29 TBs": { basePrice: 16500, costPerAdditionalTB: 375 },
  "30-74 TBs": { basePrice: 23100, costPerAdditionalTB: 300 },
  "75-149 TBs": { basePrice: 36300, costPerAdditionalTB: 250 },
  "150-300 TBs": { basePrice: 49500, costPerAdditionalTB: 200 },
  "300+ TBs": { basePrice: 82500, costPerAdditionalTB: 150 }, // Assumed value for 300+ tier
}

const SUPPORT_COST_PERCENTAGE = 0.25 // 25% of total software cost
const ADDITIONAL_INSTANCE_FEE = 2500 // Fee for each additional instance

const CONTRACT_DISCOUNTS = {
  1: 0,
  3: 0.05, // 5% discount for 3 years
  5: 0.1, // 10% discount for 5 years
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

// Helper function to determine instance size category based on TB
const getTierForTerabytes = (tb: number): keyof typeof INSTANCE_PRICES => {
  if (tb <= 14) return "1-14 TBs"
  if (tb <= 29) return "15-29 TBs"
  if (tb <= 74) return "30-74 TBs"
  if (tb <= 149) return "75-149 TBs"
  if (tb <= 300) return "150-300 TBs"
  return "300+ TBs"
}

// Helper function to get the minimum TB value for a tier
const getMinTBForTier = (tier: keyof typeof INSTANCE_PRICES): number => {
  switch(tier) {
    case "1-14 TBs": return 1;
    case "15-29 TBs": return 15;
    case "30-74 TBs": return 30;
    case "75-149 TBs": return 75;
    case "150-300 TBs": return 150;
    case "300+ TBs": return 300;
    default: return 1;
  }
}

type InstanceSize = keyof typeof INSTANCE_PRICES

const PricingEstimator = () => {
  const [instanceSize, setInstanceSize] = useState<InstanceSize>("1-14 TBs")
  const [totalInstances, setTotalInstances] = useState(1)
  const [sliderValue, setSliderValue] = useState(1)
  const [contractLength, setContractLength] = useState("1")
  const [terabytes, setTerabytes] = useState<number | "">("")
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

  // Update instance size when terabytes changes
  useEffect(() => {
    if (terabytes !== "") {
      const tier = getTierForTerabytes(terabytes)
      setInstanceSize(tier)
    }
  }, [terabytes])

  // Handle slider changes to update total instances
  useEffect(() => {
    setTotalInstances(sliderValue);
  }, [sliderValue]);

  // Calculate prices automatically when any input changes
  useEffect(() => {
    calculatePricing();
  }, [terabytes, totalInstances, contractLength, instanceSize]);

  const calculatePricing = () => {
    if (instanceSize in INSTANCE_PRICES && terabytes !== "") {
      // Get tier base price and additional TB cost
      const tierData = INSTANCE_PRICES[instanceSize]
      
      // Calculate additional TB cost based on actual TB value
      const minTBInTier = getMinTBForTier(instanceSize)
      const additionalTBs = Math.max(0, terabytes - minTBInTier)
      const additionalTBCost = additionalTBs * tierData.costPerAdditionalTB
      
      // Calculate total software price
      const baseSoftwarePrice = tierData.basePrice + additionalTBCost
      const additionalInstancesFee = totalInstances > 1 ? (totalInstances - 1) * ADDITIONAL_INSTANCE_FEE : 0

      // Support costs are calculated only on the base software price, not including additional instance fees
      const supportCosts = baseSoftwarePrice * SUPPORT_COST_PERCENTAGE
      
      const totalSoftwareCost = baseSoftwarePrice + additionalInstancesFee
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
      console.error("Invalid instance size selected or TB value empty")
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

  const handleTerabytesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "") {
      setTerabytes("")
    } else {
      const numValue = parseInt(value, 10)
      if (!isNaN(numValue) && numValue > 0) {
        setTerabytes(numValue)
      }
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (open) setIsModalOpen(true)
        }}
      >
        <DialogOverlay className="bg-black/60" />
        <DialogContent className="sm:max-w-[425px] bg-sky-100">
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
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-1 bg-slate-50 border-2 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-blue-700 flex items-center gap-2">
              <HardDriveIcon className="h-5 w-5" /> Input Parameters
            </CardTitle>
            <CardDescription>Adjust your storage requirements below</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <HardDriveIcon className="h-4 w-4" /> Total Terabytes
                </label>
                <Input
                  type="number"
                  placeholder="Enter total TB (e.g., 10)"
                  value={terabytes}
                  onChange={handleTerabytesChange}
                  min="1"
                  className="w-full focus:ring-2 focus:ring-blue-300"
                />
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Instance Size Tier</label>
                <div className="w-full h-10 px-3 py-2 rounded-md border border-input bg-slate-100 flex items-center text-sm font-medium">
                  {instanceSize}
                </div>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  Size tier is automatically determined by TB value
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                  <ServerIcon className="h-4 w-4" /> Total Instances: <span className="ml-2 text-blue-600 font-semibold">{sliderValue}</span>
                </label>
                <Slider
                  value={[sliderValue]}
                  min={1}
                  max={25}
                  step={1}
                  onValueChange={(value) => setSliderValue(value[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>25</span>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" /> Contract Length
                </label>
                <RadioGroup
                  defaultValue="1"
                  onValueChange={(value) => setContractLength(value)}
                  className="flex space-x-2"
                >
                  {[1, 3, 5].map((year) => (
                    <div key={year} className="flex-1">
                      <RadioGroupItem value={year.toString()} id={`contract-${year}`} className="peer sr-only" />
                      <Label
                        htmlFor={`contract-${year}`}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-blue-50 hover:border-blue-200 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 [&:has([data-state=checked])]:border-blue-500 [&:has([data-state=checked])]:bg-blue-50 h-20"
                      >
                        <span className="text-center font-medium">
                          {year} Year{year > 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-center mt-1">
                          {year > 1 ? `(${CONTRACT_DISCOUNTS[year as keyof typeof CONTRACT_DISCOUNTS] * 100}% off)` : "No discount"}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {results ? (
          <Card className="md:col-span-1 bg-blue-50 border-2 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-blue-700">Price Breakdown</CardTitle>
              <CardDescription>Based on your selected parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 bg-white p-5 rounded-lg shadow-sm">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Base Software Price:</span>
                  <span className="text-lg font-semibold">{formatCurrency(results.baseSoftwarePrice)}</span>
                </div>
                <div className="text-sm text-slate-600 ml-4 space-y-1 bg-slate-50 p-3 rounded">
                  <div className="flex justify-between">
                    <span>Tier base price:</span>
                    <span>{formatCurrency(INSTANCE_PRICES[instanceSize].basePrice)}</span>
                  </div>
                  {terabytes !== "" && (
                    <div className="flex justify-between">
                      <span>Additional TB cost ({Math.max(0, terabytes - getMinTBForTier(instanceSize))} TB × {formatCurrency(INSTANCE_PRICES[instanceSize].costPerAdditionalTB)}):</span>
                      <span>{formatCurrency(Math.max(0, terabytes - getMinTBForTier(instanceSize)) * INSTANCE_PRICES[instanceSize].costPerAdditionalTB)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Additional Instances Fee:</span>
                  <span className="text-lg">{formatCurrency(results.additionalInstancesFee)}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Total Software Cost:</span>
                  <span className="text-lg">{formatCurrency(results.totalSoftwareCost)}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Support Costs:</span>
                  <span className="text-lg">{formatCurrency(results.supportCosts)}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Discount:</span>
                  <span className="text-lg text-green-600">-{formatCurrency(results.discount)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 mt-2 bg-blue-100 p-3 rounded-lg">
                  <span className="font-bold text-lg">Total Annual Cost:</span>
                  <span className="font-bold text-2xl text-blue-800">{formatCurrency(results.totalAnnualCost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="md:col-span-1 bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
            <CardContent className="text-center p-8">
              <p className="text-slate-500">Enter your parameters to see pricing details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PricingEstimator