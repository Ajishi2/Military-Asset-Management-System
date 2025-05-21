"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Search, Package, X } from "lucide-react"
import { useFilter } from "../contexts/FilterContext.js" // Import FilterContext
import Button from "../components/ui/Button.js"
import Card from "../components/ui/Card.js"
import ErrorBoundary from "../components/ErrorBoundary.js"
import { purchaseService, baseService, assetService } from "../services/api.js"

// Create a fallback UI for the error boundary
const PurchasesFallback = () => (
  <div className="container mx-auto px-4 py-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Asset Purchases</h1>
        <p className="text-gray-600">Record and view purchase history of military assets</p>
      </div>
    </div>

    <Card>
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-red-300 mb-4" />
        <h3 className="text-lg font-medium text-red-500 mb-1">Failed to load purchases</h3>
        <p className="text-gray-400 mb-4">There was an error loading the purchases data.</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </Card>
  </div>
)

const PurchasesContent: React.FC = () => {
  // Use filters from FilterContext
  const { filters } = useFilter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [purchases, setPurchases] = useState<any[]>([]) // State for purchases data
  const [filteredPurchases, setFilteredPurchases] = useState<any[]>([]) // Filtered purchases
  const [bases, setBases] = useState<any[]>([])
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([])
  const [newPurchase, setNewPurchase] = useState({
    base_id: "",
    type_id: "",
    quantity: 0,
    unit_price: 0,
    purchase_date: "",
    vendor_name: "",
    purchase_order_number: "",
    created_by: 1, // TODO: Get actual user ID from auth context
  })
  // We'll track if there's an error during data fetching
  const [hasError, setHasError] = useState(false)

  // Fetch data when component mounts
  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const maxRetries = 3

    const fetchData = async () => {
      if (!isMounted) return

      // Fetch bases data
      try {
        console.log("Fetching bases...")
        const basesData = await baseService.getBases()
        console.log("Fetched bases data:", basesData?.length || 0, "items")
        if (isMounted) {
          setBases(basesData || [])
          // Reset error state if successful
          setHasError(false)
        }
      } catch (error) {
        if (!isMounted) return

        console.error("Error fetching bases data:", error)
        // Set empty array as fallback but don't trigger logout
        if (isMounted) {
          setBases([])
          setHasError(true)
        }
      }

      // Fetch equipment types data
      try {
        console.log("Fetching equipment types...")
        // Fetch equipment types directly from the API
        const typesData = await assetService.getEquipmentTypes()
        console.log("Fetched equipment types:", typesData?.length || 0, "items")
        if (isMounted) {
          setEquipmentTypes(typesData || [])
          // Reset error state if successful
          setHasError(false)
        }
      } catch (error) {
        if (!isMounted) return

        console.error("Error fetching equipment types:", error)
        // Set empty array as fallback but don't trigger logout
        if (isMounted) {
          setEquipmentTypes([])
          setHasError(true)
        }

        // If we failed to fetch data and haven't exceeded max retries, try again
        if (retryCount < maxRetries) {
          retryCount++
          console.log(`Retrying initial data fetch (${retryCount}/${maxRetries})...`)
          setTimeout(() => {
            if (isMounted) fetchData()
          }, 1000 * retryCount) // Exponential backoff
        }
      }
    }

    fetchData()

    // Cleanup function to prevent state updates after unmount
    return () => {
      console.log("Cleaning up initial data fetch...")
      isMounted = false
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewPurchase((prevState) => ({
      ...prevState,
      [name]:
        name === "quantity" || name === "unit_price"
          ? Number.parseFloat(value)
          : name === "base_id" || name === "type_id" || name === "created_by"
            ? Number.parseInt(value, 10)
            : value,
    }))
  }

  const handleAddPurchase = async () => {
    try {
      // Make sure we're sending the right data types
      const purchaseData = {
        ...newPurchase,
        base_id: Number(newPurchase.base_id),
        type_id: Number(newPurchase.type_id),
        quantity: Number(newPurchase.quantity),
        unit_price: Number(newPurchase.unit_price),
        created_by: Number(newPurchase.created_by),
      }

      console.log("Submitting purchase data:", purchaseData)
      await purchaseService.addPurchase(purchaseData)

      // Reset form
      setNewPurchase({
        base_id: "",
        type_id: "",
        quantity: 0,
        unit_price: 0,
        purchase_date: "",
        vendor_name: "",
        purchase_order_number: "",
        created_by: 1,
      })

      // Close modal and refresh the list
      setIsModalOpen(false)

      // Refresh the purchases list
      const purchasesData = await purchaseService.getPurchases()
      setPurchases(purchasesData)
      // Apply filters to the new data
      applyFilters(purchasesData)

      alert("Purchase added successfully!")
    } catch (error: any) {
      console.error("Error adding purchase:", error)
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
      ) {
        const errorData = error.response.data as { message?: string }
        console.error("Server error details:", errorData)
        alert(`Failed to add purchase: ${errorData.message || "Unknown error"}`)
      } else {
        alert("Failed to add purchase. Please check the console for details.")
      }
    }
  }

  // Apply filters whenever purchases data or filters change
  useEffect(() => {
    applyFilters(purchases)
  }, [purchases, filters, searchTerm])

  // Function to apply filters to purchases data
  const applyFilters = (data: any[]) => {
    console.log("Applying filters to purchases:", filters)

    let filtered = [...data]

    // Apply date range filter
    if (filters.dateRange && filters.dateRange.startDate && filters.dateRange.endDate) {
      const startDate = new Date(filters.dateRange.startDate)
      const endDate = new Date(filters.dateRange.endDate)

      filtered = filtered.filter((purchase) => {
        const purchaseDate = new Date(purchase.purchase_date)
        return purchaseDate >= startDate && purchaseDate <= endDate
      })
    }

    // Apply base filter
    if (filters.baseId) {
      filtered = filtered.filter((purchase) => {
        return purchase.base_id.toString() === filters.baseId.toString()
      })
    }

    // Apply equipment type filter
    if (filters.assetType) {
      filtered = filtered.filter((purchase) => {
        return purchase.type_id.toString() === filters.assetType.toString()
      })
    }

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (purchase) =>
          (purchase.vendor_name && purchase.vendor_name.toLowerCase().includes(term)) ||
          (purchase.purchase_order_number && purchase.purchase_order_number.toLowerCase().includes(term)) ||
          (purchase.type_name && purchase.type_name.toLowerCase().includes(term)) ||
          (purchase.base_name && purchase.base_name.toLowerCase().includes(term)),
      )
    }

    console.log(`Filtered purchases: ${filtered.length} of ${data.length}`)
    setFilteredPurchases(filtered)
  }

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        console.log("Fetching purchases data...")
        const purchasesData = await purchaseService.getPurchases()
        console.log("Fetched purchases data:", purchasesData?.length || 0, "items")
        setPurchases(purchasesData || [])
        // Initial filter application happens in the other useEffect
      } catch (error) {
        console.error("Error fetching purchases data:", error)
        setPurchases([])
        setFilteredPurchases([])
        setHasError(true)
      }
    }

    fetchPurchases()
  }, []) // Remove filters dependency

  // Add a debug function to log the current state
  const logFilterState = () => {
    console.log({
      filters,
      searchTerm,
      purchasesCount: purchases.length,
      filteredCount: filteredPurchases.length,
    })
  }

  // Call this when filters change to manually trigger filtering
  useEffect(() => {
    console.log("Filters changed:", filters)
    applyFilters(purchases)
    logFilterState()
  }, [filters, searchTerm])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Asset Purchases</h1>
          <p className="text-gray-600">Record and view purchase history of military assets</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            New Purchase
          </Button>
        </div>
      </div>

      {hasError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                There was an error loading some data. The information shown may be incomplete.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded text-xs"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {filteredPurchases.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-1">No purchases found</h3>
            <p className="text-gray-400">
              {searchTerm || Object.values(filters).some(Boolean)
                ? "Try adjusting your search or filters"
                : "Add a new purchase using the button above"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PO Number
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.map((purchase, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(purchase.purchase_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.type_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.base_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${Number(purchase.unit_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${Number(purchase.total_amount || purchase.quantity * purchase.unit_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.vendor_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {purchase.purchase_order_number}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* New Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add New Purchase</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddPurchase()
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="base_id">
                  Base
                </label>
                <select
                  name="base_id"
                  id="base_id"
                  value={newPurchase.base_id}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Base</option>
                  {/* Render bases from API if available */}
                  {bases.length > 0 ? (
                    bases.map((base) => (
                      <option key={base.base_id} value={base.base_id}>
                        {base.base_name}
                      </option>
                    ))
                  ) : (
                    /* Fallback hardcoded options with correct IDs from seeded database */
                    <>
                      <option value="5">Alpha Base</option>
                      <option value="6">Beta Base</option>
                      <option value="7">Charlie Base</option>
                      <option value="8">Delta Base</option>
                    </>
                  )}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type_id">
                  Equipment Type
                </label>
                <select
                  name="type_id"
                  id="type_id"
                  value={newPurchase.type_id}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Type</option>
                  {/* Render equipment types from API if available */}
                  {equipmentTypes.length > 0 ? (
                    equipmentTypes.map((type) => (
                      <option key={type.type_id} value={type.type_id}>
                        {type.type_name}
                      </option>
                    ))
                  ) : (
                    /* Fallback hardcoded options with correct IDs from seeded database */
                    <>
                      <option value="1">Weapon</option>
                      <option value="2">Vehicle</option>
                      <option value="3">Communication</option>
                      <option value="4">Medical</option>
                      <option value="5">Armor</option>
                    </>
                  )}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  value={newPurchase.quantity}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  min="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="unit_price">
                  Unit Price
                </label>
                <input
                  type="number"
                  name="unit_price"
                  id="unit_price"
                  value={newPurchase.unit_price}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="purchase_date">
                  Purchase Date
                </label>
                <input
                  type="date"
                  name="purchase_date"
                  id="purchase_date"
                  value={newPurchase.purchase_date}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vendor_name">
                  Vendor Name
                </label>
                <input
                  type="text"
                  name="vendor_name"
                  id="vendor_name"
                  value={newPurchase.vendor_name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="purchase_order_number">
                  Purchase Order #
                </label>
                <input
                  type="text"
                  name="purchase_order_number"
                  id="purchase_order_number"
                  value={newPurchase.purchase_order_number}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex items-center justify-between">
                <Button variant="primary" type="submit">
                  Add Purchase
                </Button>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrap the PurchasesContent component with ErrorBoundary
const Purchases: React.FC = () => {
  return (
    <ErrorBoundary fallback={<PurchasesFallback />}>
      <PurchasesContent />
    </ErrorBoundary>
  )
}

export default Purchases
