"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Search, Truck, X } from "lucide-react"
import { useFilter } from "../contexts/FilterContext.js"
import { mockTransfers } from "../data/mockData.js"
import Button from "../components/ui/Button.js"
import Table from "../components/ui/Table.js"
import Card from "../components/ui/Card.js"
import Badge from "../components/ui/Badge.js"
import { transferService, baseService, assetService } from "../services/api.js"

const Transfers: React.FC = () => {
  const { filters } = useFilter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transfers, setTransfers] = useState<any[]>([])
  const [filteredTransfers, setFilteredTransfers] = useState<any[]>([])
  const [bases, setBases] = useState<any[]>([])
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([])
  const [newTransfer, setNewTransfer] = useState({
    source_base_id: "",
    destination_base_id: "",
    type_id: "",
    quantity: 0,
    transfer_date: "",
    transfer_order_number: "",
    created_by: 1,
    approved_by: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const basesData = await baseService.getBases()
        setBases(basesData)

        // Fetch equipment types directly from the API
        const typesData = await assetService.getEquipmentTypes()
        setEquipmentTypes(typesData)
        console.log("Fetched equipment types:", typesData)
      } catch (error) {
        console.error("Error fetching initial data:", error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        console.log("Fetching transfers...")
        const transfersData = await transferService.getTransfers()
        console.log("Transfers data received:", transfersData)
        setTransfers(transfersData || [])
        // Apply initial filtering
        applyFilters(transfersData || [])
      } catch (error) {
        console.error("Error fetching transfers:", error)
        // Use mock data as fallback
        console.log("Using mock data as fallback")
        setTransfers(mockTransfers)
        // Apply initial filtering to mock data
        applyFilters(mockTransfers)
      }
    }
    fetchTransfers()
  }, [])

  // Apply filters whenever transfers data, filters, or search term changes
  useEffect(() => {
    console.log("Filters or search term changed, applying filters")
    applyFilters(transfers)
  }, [filters, searchTerm])

  // Function to apply filters to transfers data
  const applyFilters = (data: any[]) => {
    console.log("Applying filters:", filters)
    console.log("Current search term:", searchTerm)

    let filtered = [...data]

    // Apply date range filter
    if (filters.dateRange && filters.dateRange.startDate && filters.dateRange.endDate) {
      const startDate = new Date(filters.dateRange.startDate)
      const endDate = new Date(filters.dateRange.endDate)

      filtered = filtered.filter((transfer) => {
        const transferDate = new Date(transfer.transfer_date)
        return transferDate >= startDate && transferDate <= endDate
      })
    }

    // Apply base filter (either source or destination)
    if (filters.baseId) {
      filtered = filtered.filter((transfer) => {
        const sourceBaseId = transfer.source_base_id?.toString() || ""
        const destBaseId = transfer.destination_base_id?.toString() || ""
        const filterBaseId = filters.baseId?.toString() || ""

        return sourceBaseId === filterBaseId || destBaseId === filterBaseId
      })
    }

    // Apply asset type filter
    if (filters.assetType) {
      filtered = filtered.filter((transfer) => {
        const transferTypeId = transfer.type_id?.toString() || ""
        const filterAssetType = filters.assetType?.toString() || ""
        return transferTypeId === filterAssetType
      })
    }

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((transfer) => {
        return (
          (transfer.type_name && transfer.type_name.toLowerCase().includes(term)) ||
          (transfer.source_base_name && transfer.source_base_name.toLowerCase().includes(term)) ||
          (transfer.destination_base_name && transfer.destination_base_name.toLowerCase().includes(term)) ||
          (transfer.transfer_order_number && transfer.transfer_order_number.toLowerCase().includes(term))
        )
      })
    }

    console.log(`Filtered transfers: ${filtered.length} of ${data.length}`)
    setFilteredTransfers(filtered)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewTransfer((prevState) => ({
      ...prevState,
      [name]:
        name === "quantity"
          ? Number.parseInt(value, 10)
          : name === "source_base_id" || name === "destination_base_id" || name === "type_id"
            ? Number.parseInt(value, 10)
            : value,
    }))
  }

  const handleAddTransfer = async () => {
    try {
      if (newTransfer.source_base_id === newTransfer.destination_base_id) {
        alert("Source and Destination bases cannot be the same.")
        return
      }
      if (newTransfer.quantity <= 0) {
        alert("Transfer quantity must be positive.")
        return
      }

      // Make sure we're sending the right data types
      const transferData = {
        ...newTransfer,
        source_base_id: Number(newTransfer.source_base_id),
        destination_base_id: Number(newTransfer.destination_base_id),
        type_id: Number(newTransfer.type_id),
        quantity: Number(newTransfer.quantity),
        created_by: Number(newTransfer.created_by),
      }

      console.log("Submitting transfer data:", transferData)
      await transferService.addTransfer(transferData)

      // Reset form
      setNewTransfer({
        source_base_id: "",
        destination_base_id: "",
        type_id: "",
        quantity: 0,
        transfer_date: "",
        transfer_order_number: "",
        created_by: 1,
        approved_by: null,
      })

      // Close modal and refresh the list
      setIsModalOpen(false)

      // Refresh the transfers list
      const transfersData = await transferService.getTransfers()
      setTransfers(transfersData)
      // Apply filters to the new data
      applyFilters(transfersData)

      alert("Transfer added successfully!")
    } catch (error: any) {
      console.error("Error adding transfer:", error)
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
        alert(`Failed to add transfer: ${errorData.message || "Unknown error"}`)
      } else {
        alert("Failed to add transfer. Please check the console for details.")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>
      case "in_transit":
        return <Badge variant="warning">In Transit</Badge>
      case "pending":
        return <Badge variant="info">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Asset Transfers</h1>
          <p className="text-gray-600">Manage asset transfers between military bases</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            New Transfer
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {filteredTransfers.length > 0 ? (
          <Table headers={["Date", "Asset", "Type", "From Base", "To Base", "Quantity", "Status", "Order Number"]}>
            {filteredTransfers.map((transfer) => (
              <tr key={transfer.transfer_id || transfer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transfer.transfer_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-navy-800">{transfer.type_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{transfer.type_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.source_base_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.destination_base_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(transfer.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.transfer_order_number}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="text-center py-12">
            <Truck size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-1">No transfers found</h3>
            <p className="text-gray-400">
              {searchTerm || Object.values(filters).some(Boolean)
                ? "Try adjusting your search or filters"
                : "Create a new transfer using the button above"}
            </p>
          </div>
        )}
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add New Transfer</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddTransfer()
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="source_base_id">
                  Source Base
                </label>
                <select
                  name="source_base_id"
                  id="source_base_id"
                  value={newTransfer.source_base_id}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Source Base</option>
                  {bases.length > 0 ? (
                    bases.map((base) => (
                      <option key={base.base_id} value={base.base_id}>
                        {base.base_name}
                      </option>
                    ))
                  ) : (
                    /* Fallback hardcoded options */
                    <>
                      <option value="1">Alpha Base</option>
                      <option value="2">Beta Base</option>
                      <option value="3">Charlie Base</option>
                    </>
                  )}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destination_base_id">
                  Destination Base
                </label>
                <select
                  name="destination_base_id"
                  id="destination_base_id"
                  value={newTransfer.destination_base_id}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Destination Base</option>
                  {bases.length > 0 ? (
                    bases.map((base) => (
                      <option key={base.base_id} value={base.base_id}>
                        {base.base_name}
                      </option>
                    ))
                  ) : (
                    /* Fallback hardcoded options */
                    <>
                      <option value="1">Alpha Base</option>
                      <option value="2">Beta Base</option>
                      <option value="3">Charlie Base</option>
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
                  value={newTransfer.type_id}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Type</option>
                  {equipmentTypes.length > 0 ? (
                    equipmentTypes.map((type) => (
                      <option key={type.type_id} value={type.type_id}>
                        {type.type_name}
                      </option>
                    ))
                  ) : (
                    /* Fallback hardcoded options */
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
                  value={newTransfer.quantity}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  min="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transfer_date">
                  Transfer Date
                </label>
                <input
                  type="date"
                  name="transfer_date"
                  id="transfer_date"
                  value={newTransfer.transfer_date}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transfer_order_number">
                  Transfer Order #
                </label>
                <input
                  type="text"
                  name="transfer_order_number"
                  id="transfer_order_number"
                  value={newTransfer.transfer_order_number}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex items-center justify-between">
                <Button variant="primary" type="submit">
                  Add Transfer
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

export default Transfers
