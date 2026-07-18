import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const IssueRawMaterial = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasModule } = useTenant();
    const isSpecialTenant = hasModule('HANGER_MANUFACTURING');
    const [loading, setLoading] = useState(true);
    const [requisition, setRequisition] = useState(null);
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState('');
    const [existingIssue, setExistingIssue] = useState(null);
    const [moData, setMoData] = useState(null);
    const [showCoilModal, setShowCoilModal] = useState(false);
    const [eligibleCoils, setEligibleCoils] = useState([]);
    const [activeItemKey, setActiveItemKey] = useState(null);
    const [loadingCoils, setLoadingCoils] = useState(false);
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/warehouse/warehouses`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWarehouses(res.data || []);
            } catch (err) {
                console.error("Failed to fetch warehouses", err);
            }
        };
        fetchWarehouses();
    }, []);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Fetch Requisition Details
            const reqResponse = await axios.get(`${API_URL}/materials/requisition/${id}`, authHeaders);
            const reqData = reqResponse.data;
            setRequisition(reqData);

            let currentItems = [];

            // 2. Fetch Manufacturing Order Details
            let moData = null;
            const moId = reqData.manufacturingOrderId || reqData.manufacturingOrder?.id;
            const moNo = reqData.manufacturingOrderNo || reqData.manufacturingOrder?.moNumber;

            if (moId) {
                const moRes = await axios.get(`${API_URL}/production/manufacturing-orders/${moId}`, authHeaders);
                moData = moRes.data;
            } else if (moNo) {
                const searchRes = await axios.get(`${API_URL}/production/manufacturing-orders`, {
                    ...authHeaders,
                    params: { search: moNo }
                });
                if (searchRes.data.content && searchRes.data.content.length > 0) {
                    moData = searchRes.data.content.find(m => m.moNumber === moNo) || searchRes.data.content[0];
                    if (moData && moData.id) {
                        const fullMoRes = await axios.get(`${API_URL}/production/manufacturing-orders/${moData.id}`, authHeaders);
                        moData = fullMoRes.data;
                    }
                }
            }

            if (moData) {
                setMoData(moData);
                let bomData = null;
                const bomId = moData.bomFinishedGoodId || moData.bomId || moData.bom?.id;

                if (bomId) {
                    const endpoint = moData.bomFinishedGoodId
                        ? `${API_URL}/production/bom-finished-goods/${bomId}`
                        : `${API_URL}/production/bom-semi-finished/${bomId}`;

                    const bomRes = await axios.get(endpoint, authHeaders);
                    bomData = bomRes.data;
                }

                if (bomData && bomData.details) {
                    const itemPromises = bomData.details.map(async (detail, index) => {
                        const rawMaterialId = detail.rawMaterial?.id || detail.rawMaterialId;
                        const semiFinishedId = detail.childSemiFinished?.id || detail.semiFinishedId || detail.semiFinished?.id;
                        let itemDetails = null;

                        try {
                            if (rawMaterialId) {
                                const res = await axios.get(`${API_URL}/production/raw-materials/${rawMaterialId}`, authHeaders);
                                itemDetails = res.data;
                            } else if (semiFinishedId) {
                                const res = await axios.get(`${API_URL}/production/semi-finished/${semiFinishedId}`, authHeaders);
                                itemDetails = res.data;
                            }
                        } catch (e) {
                            console.error(`Failed to fetch item details`, e);
                        }

                        const bomItem = detail.rawMaterial || detail.childSemiFinished || {};
                        const finalItem = itemDetails || bomItem;

                        const qtyPerUnit = detail.quantity || 0;
                        const totalMoQty = moData.quantity || 0;
                        const reqQty = qtyPerUnit * totalMoQty;

                        return {
                            id: finalItem.id || `temp-${index}`,
                            itemId: finalItem.id,
                            processId: detail.process?.id || detail.processId || null,
                            processName: detail.process?.name || detail.processName || '-',
                            itemName: finalItem.name || '-',
                            itemCode: finalItem.itemCode || finalItem.code || '-',
                            availableQty: itemDetails ? (itemDetails.stockQuantity || itemDetails.stock || 0) : (finalItem.stockQuantity || finalItem.stock || 0),
                            requisitionQty: reqQty,
                            reservedQty: 0,
                            prevIssuedQty: 0,
                            remainingQty: reqQty,
                            issueQty: reqQty,
                            unit: finalItem.issueUnitName || finalItem.purchaseUnitName || finalItem.unit?.name || finalItem.uom?.name || 'Units'
                        };
                    });

                    currentItems = await Promise.all(itemPromises);
                }
            } else {
                if (reqData.items && reqData.items.length > 0) {
                    currentItems = reqData.items.map(item => ({
                        ...item,
                        issueQty: item.remainingQty || item.requisitionQty
                    }));
                }
            }

            // 3. Fetch Existing Issue to Support UPDATE
            let issuedQtyMap = {};
            try {
                const issuesRes = await axios.get(`${API_URL}/material-issues/all?page=0&size=1000`, authHeaders);
                const issues = issuesRes.data.content || [];
                const relevantIssues = issues
                    .filter(issue =>
                        issue.materialRequisitionId === parseInt(id) ||
                        (issue.materialRequisition && issue.materialRequisition.id === parseInt(id))
                    )
                    .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)); // Sort Latest First

                if (relevantIssues.length > 0) {
                    const latestIssue = relevantIssues[0];
                    setExistingIssue(latestIssue);
                    setRemarks(latestIssue.remarks || '');
                }

                relevantIssues.forEach(issue => {
                    if (issue.details) {
                        issue.details.forEach(detail => {
                            const rawId = detail.rawMaterialId || (detail.rawMaterial && detail.rawMaterial.id);
                            if (rawId) {
                                // Key needs to be item+process
                                const key = `${rawId}-${detail.processId || detail.process?.id || 'null'}`;
                                issuedQtyMap[key] = (issuedQtyMap[key] || 0) + (detail.issuedQuantity || 0);
                            }
                        });
                    }
                });

            } catch (err) {
                console.error("Error fetching previous issues:", err);
            }

            // Update item quantities based on previous issues
            const updatedItems = currentItems.map(item => {
                const key = `${item.itemId}-${item.processId || 'null'}`;
                const prevIssued = issuedQtyMap[key] || 0;
                const remaining = Math.max(0, item.requisitionQty - prevIssued);

                return {
                    ...item,
                    prevIssuedQty: prevIssued,
                    remainingQty: remaining,
                    issueQty: remaining
                };
            });

            setItems(updatedItems);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleIssueQtyChange = (itemId, processId, value) => {
        setItems(prev => prev.map(item =>
            (item.itemId === itemId && item.processId === processId) ? { ...item, issueQty: parseFloat(value) || 0 } : item
        ));
    };

    const handleWarehouseChange = (itemId, processId, warehouseId) => {
        setItems(prev => prev.map(item =>
            (item.itemId === itemId && item.processId === processId) ? { ...item, warehouseId: parseInt(warehouseId) || null } : item
        ));
    };

    const handleOpenCoilModal = async (item) => {
        const key = `${item.itemId}-${item.processId}`;
        setActiveItemKey(key);
        setLoadingCoils(true);
        setShowCoilModal(true);
        try {
            const token = localStorage.getItem('token');
            const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
            const gauge = moData?.wireGaugeRequired || 0;
            // minWeightRequired = remaining qty to issue (or 0 to show all)
            const minWeight = item.issueQty || item.remainingQty || 0;
            const res = await axios.get(`${API_URL}/hanger/coil-stock/eligible-for-issue`, {
                ...authHeaders,
                params: { wireGaugeMm: gauge, minWeightRequired: minWeight }
            });
            setEligibleCoils(res.data || []);
        } catch (err) {
            console.error("Failed to fetch coils", err);
        } finally {
            setLoadingCoils(false);
        }
    };

    const handleSelectCoil = (coil) => {
        setItems(prev => prev.map(item => {
            const key = `${item.itemId}-${item.processId}`;
            if (key === activeItemKey) {
                return {
                    ...item,
                    coilRefId: coil.id,
                    coilNo: coil.coilNo,
                    remainingWeightKg: coil.remainingWeightKg,
                    issueQty: item.issueQty || 0 // Keep or set default
                };
            }
            return item;
        }));
        setShowCoilModal(false);
    };

    const handleIssue = async () => {
        const token = localStorage.getItem('token');

        // Identify items we are issuing NOW (incremental)
        const incrementalDetails = items
            .filter(item => selectedItems[`${item.itemId}-${item.processId}`] && item.issueQty > 0)
            .map(item => ({
                rawMaterialId: item.itemId,
                processId: item.processId,
                issuedQuantity: parseFloat(item.issueQty),
                warehouseId: item.warehouseId || null,
                // Hanger Phase 3
                coilRefId: item.coilRefId || null,
                issuedWeightKg: item.coilRefId ? parseFloat(item.issueQty) : null
            }));

        if (incrementalDetails.length === 0) {
            alert("Please select items and enter valid quantities to issue.");
            return;
        }

        try {
            if (existingIssue) {
                // UPDATE LOGIC
                // We need to merge incremental details with existing details of the issue record.

                // 1. Start with existing details from the fetched issue record
                // Backend requires strict RawMaterialId and ProcessId matching
                let finalDetails = [];
                if (existingIssue.details) {
                    finalDetails = existingIssue.details.map(d => ({
                        // We do NOT send ID in the detail DTO typically for simple updates unless explicitly required, 
                        // but backend uses ID for finding existing. 
                        // HOWEVER, backend logic: MATCHES by RawMat/Process. 
                        // If we include ID, it might be safer IF the DTO has it.
                        // Given backend: MaterialIssueDetailRequest usually just has data fields.
                        rawMaterialId: d.rawMaterialId || d.rawMaterial?.id,
                        processId: d.processId || d.process?.id,
                        issuedQuantity: d.issuedQuantity,
                        warehouseId: d.warehouseId,
                        coilRefId: d.coilRefId,
                        issuedWeightKg: d.issuedWeightKg
                    }));
                }

                // 2. Merge Incremental
                incrementalDetails.forEach(inc => {
                    const existingIndex = finalDetails.findIndex(d =>
                        d.rawMaterialId === inc.rawMaterialId &&
                        (d.processId === inc.processId || (!d.processId && !inc.processId))
                    );

                    if (existingIndex >= 0) {
                        // Update existing row quantity (Add to it)
                        finalDetails[existingIndex].issuedQuantity = (finalDetails[existingIndex].issuedQuantity || 0) + inc.issuedQuantity;
                    } else {
                        // Add new row
                        finalDetails.push(inc);
                    }
                });

                const payload = {
                    issueDate: issueDate,
                    materialRequisitionId: requisition.id,
                    remarks: remarks,
                    details: finalDetails // Sent Full List with Updated Totals
                };

                await axios.put(`${API_URL}/material-issues/update/${existingIssue.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

            } else {
                // CREATE LOGIC
                const payload = {
                    issueDate: issueDate,
                    materialRequisitionId: requisition.id,
                    remarks: remarks,
                    details: incrementalDetails
                };

                await axios.post(`${API_URL}/material-issues/create`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // STOCK UPDATE handled by Backend automatically now.
            // Redundant manual frontend deduction removed to prevent double-deduction.

            // STATUS UPDATE
            let allFullyIssued = true;
            for (const item of items) {
                const currentInc = selectedItems[`${item.itemId}-${item.processId}`] ? (parseFloat(item.issueQty) || 0) : 0;
                const total = (item.prevIssuedQty || 0) + currentInc;
                if (total < item.requisitionQty) {
                    allFullyIssued = false;
                    break;
                }
            }

            const newStatus = allFullyIssued ? 'ISSUED' : 'PARTIALLY_ISSUED';
            await axios.put(`${API_URL}/materials/requisition/${id}/status`, null, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: newStatus }
            });

            alert(`Issue ${existingIssue ? 'Updated' : 'Created'} Successfully!`);
            navigate('/material-dashboard/material-requisition');

        } catch (error) {
            console.error('Error issuing materials:', error);
            alert('Failed to issue materials');
        }
    };

    const toggleSelectAll = (e) => {
        const checked = e.target.checked;
        const newSelected = {};
        if (checked) {
            items.forEach(item => newSelected[`${item.itemId}-${item.processId}`] = true);
        }
        setSelectedItems(newSelected);
    };

    const toggleSelectItem = (itemId, processId) => {
        const key = `${itemId}-${processId}`;
        setSelectedItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
        </div>
    );

    if (!requisition) return <div className="p-6">Requisition not found</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                <span onClick={() => navigate('/material-dashboard/material-requisition')} className="cursor-pointer hover:text-purple-600">Material Requisition</span>
                <span>/</span>
                <span className="text-gray-900 font-medium">Issue Raw Material</span>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="bg-primary px-6 py-3 border-b border-primary/10">
                    <h1 className="text-xl font-semibold text-primary-foreground">Issue Raw Material</h1>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">Request Date</label>
                            <div className="col-span-2 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                                {requisition.requestDate}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">Request No</label>
                            <div className="col-span-2 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                                {requisition.requestNo}
                            </div>
                        </div>
                        {/* <div className="grid grid-cols-3 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">Request No</label>
                            <div className="col-span-2 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                                {requisition.requestNo}
                            </div>
                        </div> */}
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">Issue Date</label>
                            <input
                                type="date"
                                className="col-span-2 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">Issue No</label>
                            <div className="col-span-2 p-2 bg-gray-50 rounded border border-gray-200 text-sm min-h-[38px] text-gray-700">
                                {existingIssue ? existingIssue.issueNo : <span className="text-gray-500 italic">Auto-generated</span>}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-start">
                            <label className="text-sm font-medium text-gray-600 pt-2">Remarks</label>
                            <textarea
                                className="col-span-2 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500"
                                rows="2"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-primary text-primary-foreground font-semibold">
                            <tr>
                                <th className="px-4 py-2 w-10">
                                    <input type="checkbox" onChange={toggleSelectAll} className="accent-gray-600" />
                                </th>
                                <th className="px-4 py-2 uppercase text-xs">Process Name</th>
                                <th className="px-4 py-2 uppercase text-xs">Item Details</th>
                                <th className="px-4 py-2 uppercase text-xs">Item Code</th>
                                <th className="px-4 py-2 uppercase text-xs">Available Qty</th>
                                <th className="px-4 py-2 uppercase text-xs">Requisition Qty</th>
                                <th className="px-4 py-2 uppercase text-xs">Reserved Qty</th>
                                <th className="px-4 py-2 uppercase text-xs">Issued Qty</th>
                                <th className="px-4 py-2 uppercase text-xs">Remaining Quantity</th>
                                <th className="px-4 py-2 uppercase text-xs">Warehouse</th>
                                <th className="px-4 py-2 w-32 uppercase text-xs">Issue Qty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.length > 0 ? items.map((item, idx) => {
                                const isFullyIssued = (item.prevIssuedQty || 0) >= item.requisitionQty;
                                const hasStock = item.availableQty >= item.requisitionQty;
                                const rowClass = hasStock ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100';

                                return (
                                    <tr key={idx} className={rowClass}>
                                        <td className="px-4 py-2">
                                            <input
                                                type="checkbox"
                                                checked={!!selectedItems[`${item.itemId}-${item.processId}`]}
                                                onChange={() => toggleSelectItem(item.itemId, item.processId)}
                                                className="accent-primary h-4 w-4"
                                                disabled={isFullyIssued}
                                            />
                                        </td>
                                        <td className="px-4 py-2">{item.processName}</td>
                                        <td className="px-4 py-2">{item.itemName}</td>
                                        <td className="px-4 py-2">{item.itemCode}</td>
                                        <td className="px-4 py-2">{item.availableQty} {item.unit}</td>
                                        <td className="px-4 py-2">{item.requisitionQty} {item.unit}</td>
                                        <td className="px-4 py-2">{item.reservedQty}</td>
                                        <td className="px-4 py-2">{item.prevIssuedQty} {item.unit}</td>
                                        <td className="px-4 py-2">{item.remainingQty} {item.unit}</td>
                                        <td className="px-4 py-2">
                                            <select
                                                className="w-full p-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-purple-500"
                                                value={item.warehouseId || ''}
                                                onChange={(e) => handleWarehouseChange(item.itemId, item.processId, e.target.value)}
                                            >
                                                <option value="">Default Warehouse</option>
                                                {warehouses.map(w => (
                                                    <option key={w.id} value={w.id}>{w.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col gap-1">
                                                <input
                                                    type="number"
                                                    className={`w-full p-1 border rounded text-right focus:outline-none text-xs ${isFullyIssued ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:border-primary text-gray-900 bg-white'}`}
                                                    value={item.issueQty}
                                                    onChange={(e) => handleIssueQtyChange(item.itemId, item.processId, e.target.value)}
                                                    disabled={isFullyIssued}
                                                />
                                                {isSpecialTenant && moData?.wireGaugeRequired && (item.itemName.toLowerCase().includes('wire') || item.itemCode.toLowerCase().includes('wire')) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenCoilModal(item)}
                                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${item.coilRefId ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                                    >
                                                        {item.coilRefId ? `Linked: ${item.coilNo}` : 'Link Coil'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="10" className="px-4 py-10 text-center text-gray-500">
                                        No items found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <button
                    onClick={handleIssue}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded shadow-sm font-medium transition-colors uppercase text-xs"
                >
                    Issue
                </button>
                <button
                    onClick={() => navigate('/material-dashboard/material-requisition')}
                    className="bg-white border border-gray-300 text-gray-600 px-6 py-2 rounded shadow-sm font-medium hover:bg-gray-50 transition-colors uppercase text-xs"
                >
                    Cancel
                </button>
            </div>

            {/* Coil Selection Modal - Gated by Tenant Module */}
            {isSpecialTenant && showCoilModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
                            <div>
                                <h3 className="text-lg font-semibold">Select physical Coil</h3>
                                <p className="text-xs text-primary-foreground/80">Requirement: {moData?.wireGaugeRequired}mm Wire</p>
                            </div>
                            <button onClick={() => setShowCoilModal(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                                <Loader2 className="h-5 w-5 transform rotate-45" /> {/* Close icon fallback */}
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {loadingCoils ? (
                                <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                            ) : eligibleCoils.length === 0 ? (
                                <div className="text-center p-10 text-gray-500">No eligible coils found for {moData?.wireGaugeRequired}mm.</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {eligibleCoils.map(coil => (
                                        <div
                                            key={coil.id}
                                            onClick={() => handleSelectCoil(coil)}
                                            className="border rounded-lg p-4 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all flex justify-between items-center group"
                                        >
                                            <div>
                                                <div className="font-bold text-gray-900 group-hover:text-primary">{coil.coilNo}</div>
                                                <div className="text-sm text-gray-500">Gauge: {coil.wireGaugeMm}mm | Supplier: {coil.supplierName}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-primary">{coil.remainingWeightKg} Kg</div>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Remaining</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button onClick={() => setShowCoilModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueRawMaterial;
