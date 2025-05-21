"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Search, Users, X } from "lucide-react"
import { useFilter } from "../contexts/FilterContext.js"
import { mockAssignments } from "../data/mockData.js" // Will replace with API call
import Button from "../components/ui/Button.js"
import Table from "../components/ui/Table.js"
import Card from "../components/ui/Card.js"
import Badge from "../components/ui/Badge.js"
import { assignmentService, baseService, assetService } from "../services/api.js" // Import necessary services
import personnelService from "../services/personnelService.js"

const Assignments: React.FC = () => {
  const { filters } = useFilter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [assignments, setAssignments] = useState<any[]>([]) // State for assignments data
  const [bases, setBases] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([]) // All assets
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]) // Filtered assets based on type
  const [personnel, setPersonnel] = useState<any[]>([]) // To select who to assign to
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([])
  const [newAssignment, setNewAssignment] = useState({
    asset_id: "",
    assigned_to: "",
    assigned_by: 1, // TODO: Get actual user ID from auth context
    base_id: "",
    assignment_date: "",
    return_date: "",
    status: "Active", // Default status
    notes: "",
  })

  // Fetch initial data (bases, assets, personnel, equipment types)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const basesData = await baseService.getBases()
        setBases(basesData)

        // Fetch assets for assignment
        const assetsData = await assetService.getAssets()
        setAssets(assetsData)

        // Fetch equipment types for dropdowns
        const typesData = await assetService.getEquipmentTypes()
        setEquipmentTypes(typesData)

        // Fetch personnel for assignment
        const personnelData = await personnelService.getPersonnel()
        setPersonnel(personnelData)
      } catch (error) {
        console.error("Error fetching initial data:", error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        console.log("Fetching assignments...")
        const assignmentsData = await assignmentService.getAssignments() // Fetch all assignments for now
        console.log("Assignments data received:", assignmentsData)
        setAssignments(assignmentsData || [])
      } catch (error) {
        console.error("Error fetching assignments:", error)
        // Use mock data as fallback
        console.log("Using mock data as fallback")
        setAssignments(mockAssignments)
      }
    }
    fetchAssignments()
  }, []) // Fetch on component mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewAssignment((prevState) => ({
      ...prevState,
      [name]: name === "asset_id" || name === "assigned_by" || name === "base_id" ? Number.parseInt(value, 10) : value,
    }))
  }

  const handleAddAssignment = async () => {
    try {
      // Basic validation
      if (
        !newAssignment.asset_id ||
        !newAssignment.assigned_to ||
        !newAssignment.base_id ||
        !newAssignment.assignment_date ||
        !newAssignment.status
      ) {
        alert("Please fill in all required fields.")
        return
      }

      // Make sure we're sending the right data types
      const assignmentData = {
        ...newAssignment,
        asset_id: Number(newAssignment.asset_id),
        assigned_by: Number(newAssignment.assigned_by),
        base_id: Number(newAssignment.base_id),
      }

      console.log("Submitting assignment data:", assignmentData)
      await assignmentService.addAssignment(assignmentData)

      // Reset form
      setNewAssignment({
        asset_id: "",
        assigned_to: "",
        assigned_by: 1,
        base_id: "",
        assignment_date: "",
        return_date: "",
        status: "Active",
        notes: "",
      })

      // Close modal and refresh the list
      setIsModalOpen(false)

      // Refresh the assignments list
      const assignmentsData = await assignmentService.getAssignments()
      setAssignments(assignmentsData)

      alert("Assignment added successfully!")
    } catch (error: any) {
      console.error("Error adding assignment:", error)
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
        alert(`Failed to add assignment: ${errorData.message || "Unknown error"}`)
      } else {
        alert("Failed to add assignment. Please check the console for details.")
      }
    }
  }

  // Add this function after the handleAddAssignment function
  const getFilteredAssignments = () => {
    return assignments.filter((assignment) => {
      // Apply date filter
      if (filters.dateRange && filters.dateRange.startDate && filters.dateRange.endDate) {
        const assignmentDate = new Date(assignment.assignment_date)
        const startDate = new Date(filters.dateRange.startDate)
        const endDate = new Date(filters.dateRange.endDate)

        if (assignmentDate < startDate || assignmentDate > endDate) {
          return false
        }
      }

      // Apply base filter
      if (filters.baseId && assignment.base_id !== Number.parseInt(filters.baseId, 10)) {
        return false
      }

      // Apply asset type filter
      if (filters.assetType && assignment.type_id !== Number.parseInt(filters.assetType, 10)) {
        return false
      }

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const assetNameMatch = assignment.asset_name && assignment.asset_name.toLowerCase().includes(searchLower)
        const assigneeMatch =
          assignment.assigned_to_name && assignment.assigned_to_name.toLowerCase().includes(searchLower)
        const serialMatch = assignment.serial_number && assignment.serial_number.toLowerCase().includes(searchLower)

        if (!assetNameMatch && !assigneeMatch && !serialMatch) {
          return false
        }
      }

      return true
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="success">Active</Badge>
      case "returned":
        return <Badge variant="info">Returned</Badge>
      case "expended":
        return <Badge variant="danger">Expended</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Assignments & Expenditures</h1>
          <p className="text-gray-600">Track asset assignments to personnel and record expenditures</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            New Assignment
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search assignments or personnel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Replace the assignments.length check and Table rendering with this */}
        {assignments.length > 0 ? (
          <Table headers={["Date", "Asset Type", "Assigned To", "Base", "Status", "Notes"]}>
            {getFilteredAssignments().map((assignment) => (
              <tr key={assignment.assignment_id || assignment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(assignment.assignment_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-navy-800">
                  {assignment.type_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.assigned_to_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.base_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(assignment.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.notes}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-1">No assignments found</h3>
            <p className="text-gray-400">
              {searchTerm ? "Try adjusting your search or filters" : "Create a new assignment using the button above"}
            </p>
          </div>
        )}
      </Card>

      {/* New Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add New Assignment</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddAssignment()
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type_id">
                  Equipment Type
                </label>
                <select
                  name="type_id"
                  id="type_id"
                  onChange={(e) => {
                    // Filter assets by the selected equipment type
                    const typeId = e.target.value
                    if (typeId) {
                      const filtered = assets.filter((asset) => asset.type_id === typeId)
                      setFilteredAssets(filtered)
                      console.log("Filtered assets by type:", filtered)
                    } else {
                      // If no type is selected, show all assets
                      setFilteredAssets(assets)
                    }
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Select Equipment Type</option>
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
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="asset_id">
                  Asset
                </label>
                <select
                  name="asset_id"
                  id="asset_id"
                  value={newAssignment.asset_id}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Asset</option>
                  {filteredAssets.length > 0 || assets.length > 0 ? (
                    (filteredAssets.length > 0 ? filteredAssets : assets).map((asset) => (
                      <option key={asset.asset_id} value={asset.asset_id}>
                        {asset.asset_name || `${asset.type_name} (${asset.serial_number || "N/A"})`}
                      </option>
                    ))
                  ) : (
                    /* Fallback hardcoded options */
                    <>
                      <option value="101">Assault Rifle M4 #A12345</option>
                      <option value="102">Humvee #V54321</option>
                      <option value="103">Radio Set #C98765</option>
                      <option value="104">Medical Kit #M24680</option>
                      <option value="105">Body Armor #A13579</option>
                    </>
                  )}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assigned_to">
                  Assigned To
                </label>
                <select
                  name="assigned_to"
                  id="assigned_to"
                  value={newAssignment.assigned_to}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Personnel</option>
                  {personnel.length > 0 ? (
                    personnel.map((person) => (
                      <option key={person.user_id} value={person.user_id}>
                        {person.full_name} ({person.username})
                      </option>
                    ))
                  ) : (
                    /* Fallback hardcoded options */
                    <>
                      <option value="1">John Smith (jsmith)</option>
                      <option value="2">Sarah Johnson (sjohnson)</option>
                      <option value="3">Michael Brown (mbrown)</option>
                      <option value="4">Jessica Davis (jdavis)</option>
                      <option value="5">David Wilson (dwilson)</option>
                    </>
                  )}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="base_id">
                  Base
                </label>
                <select
                  name="base_id"
                  id="base_id"
                  value={newAssignment.base_id}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Base</option>
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
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assignment_date">
                  Assignment Date
                </label>
                <input
                  type="date"
                  name="assignment_date"
                  id="assignment_date"
                  value={newAssignment.assignment_date}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="return_date">
                  Return Date (Optional)
                </label>
                <input
                  type="date"
                  name="return_date"
                  id="return_date"
                  value={newAssignment.return_date}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={newAssignment.status}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Returned">Returned</option>
                  <option value="Expended">Expended</option>
                  {/* Add other relevant statuses as needed */}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  value={newAssignment.notes}
                  onChange={(e) => handleInputChange(e as any)} // Cast needed for textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                ></textarea>
              </div>
              {/* TODO: Add field for assigned_by */}
              <div className="flex items-center justify-between">
                <Button variant="primary" type="submit">
                  Add Assignment
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

export default Assignments
