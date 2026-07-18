import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const IndentMaterial = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [requisition, setRequisition] = useState(null);
    const [items, setItems] = useState([]);
    const [indentHistory, setIndentHistory] = useState([]);
    const [indentDate, setIndentDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedItems, setSelectedItems] = useState({});
    const [indentQtys, setIndentQtys] = useState({});

    // Formatting if needed
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

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

            // 1. Fetch Requisition
            const reqRes = await axios.get(`${API_URL}/materials/requisition/${id}`, authHeaders);
            const reqData = reqRes.data;
            setRequisition(reqData);

            let currentItems = [];

            // 2. Fetch MO & BOM (Robust Logic)
            let moData = null;
            const moId = reqData.manufacturingOrderId || reqData.manufacturingOrder?.id;
            const moNo = reqData.manufacturingOrderNo || reqData.manufacturingOrder?.moNumber;

            if (moId) {
                try {
                    const moRes = await axios.get(`${API_URL}/production/manufacturing-orders/${moId}`, authHeaders);
                    moData = moRes.data;
                } catch (e) { }
            } else if (moNo) {
                try {
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
                } catch (e) { }
            }

            if (moData) {
                let bomData = null;
                const bomId = moData.bomFinishedGoodId || moData.bomId || moData.bom?.id;

                if (bomId) {
                    const endpoint = moData.bomFinishedGoodId || moData.type === 'FINISHED_GOODS'
                        ? `${API_URL}/production/bom-finished-goods/${bomId}`
                        : `${API_URL}/production/bom-semi-finished/${bomId}`;
                    try {
                        const bomRes = await axios.get(endpoint, authHeaders);
                        bomData = bomRes.data;
                    } catch (e) { }
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
                        } catch (e) { }

                        const bomItem = detail.rawMaterial || detail.childSemiFinished || {};
                        const finalItem = itemDetails || bomItem;

                        const qtyPerUnit = detail.quantity || 0;
                        const totalMoQty = moData.quantity || 0;
                        const reqQty = qtyPerUnit * totalMoQty;

                        return {
                            uniqueId: `${finalItem.id || 'temp-' + index}-${detail.process?.id || detail.processId || 'noproc'}`,
                            rawMaterialId: finalItem.id,
                            processId: detail.process?.id || detail.processId || null,
                            processName: detail.process?.name || detail.processName || '-',
                            itemName: finalItem.name || '-',
                            itemCode: finalItem.itemCode || finalItem.code || '-',
                            availableQty: itemDetails ? (itemDetails.stockQuantity || itemDetails.stock || 0) : (finalItem.stockQuantity || finalItem.stock || 0),
                            requisitionQty: reqQty,
                            unit: finalItem.issueUnitName || finalItem.purchaseUnitName || finalItem.unit?.name || 'Units'
                        };
                    });
                    currentItems = await Promise.all(itemPromises);
                }
            } else if (reqData.items && reqData.items.length > 0) {
                currentItems = reqData.items.map((item, idx) => ({
                    uniqueId: `${item.itemId || idx}-${item.processId || 'noproc'}`,
                    rawMaterialId: item.itemId,
                    processId: item.processId,
                    processName: item.processName || '-',
                    itemName: item.itemName,
                    itemCode: item.itemCode,
                    availableQty: item.availableQty || 0,
                    requisitionQty: item.requisitionQty,
                    unit: item.unit || 'Units'
                }));
            }

            // 4. Fetch Auxiliary Data (Issues & Reservations)

            // Issues (Issued Qty)
            const issuesRes = await axios.get(`${API_URL}/material-issues/all?page=0&size=1000`, authHeaders);
            const issues = issuesRes.data.content || [];
            const relevantIssues = issues.filter(i => i.materialRequisitionId === parseInt(id) || i.materialRequisition?.id === parseInt(id));
            const issuedQtyMap = {};

            relevantIssues.forEach(issue => {
                if (issue.details) {
                    issue.details.forEach(d => {
                        const rawId = d.rawMaterialId || d.rawMaterial?.id;
                        const pId = d.processId || d.process?.id || 'noproc';
                        const key = `${rawId}-${pId}`;
                        issuedQtyMap[key] = (issuedQtyMap[key] || 0) + (d.issuedQuantity || 0);
                    });
                }
            });

            // Reservations (Reserved Qty) - Robust Logic
            const resRes = await axios.get(`${API_URL}/material-reservations/all?page=0&size=1000`, authHeaders);
            const reservations = resRes.data.content || [];
            const relevantReservations = reservations.filter(r =>
                (r.materialRequisition && r.materialRequisition.id == id) ||
                (r.materialRequisitionId == id)
            );
            const reservedQtyMap = {};
            relevantReservations.forEach(res => {
                if (res.details) {
                    res.details.forEach(d => {
                        const rawId = d.rawMaterialId || d.rawMaterial?.id;
                        // Use rawMaterialId only if processId is potentially missing/irrelevant from DB View
                        const key = `${rawId}`;
                        reservedQtyMap[key] = (reservedQtyMap[key] || 0) + (d.reservedQuantity || 0);
                    });
                }
            });

            // Indents (Indent History & Qty) -> USING /api/material-indents prefix
            const indentRes = await axios.get(`${API_URL}/material-indents/all?size=1000`, authHeaders);
            const allIndents = indentRes.data.content || [];
            // Filter and SORT to get latest
            const relatedIndents = allIndents
                .filter(ind => ind.materialRequisition?.id == id || ind.materialRequisitionId == id)
                .sort((a, b) => new Date(b.indentDate) - new Date(a.indentDate) || b.id - a.id);

            setIndentHistory(relatedIndents);

            const indentTotals = {};
            relatedIndents.forEach(indent => {
                if (indent.details) {
                    indent.details.forEach(detail => {
                        const rmId = detail.rawMaterialId || detail.rawMaterial?.id;
                        const pId = detail.processId || detail.process?.id || 'noproc';
                        const key = `${rmId}-${pId}`;
                        indentTotals[key] = (indentTotals[key] || 0) + (detail.indentQuantity || 0);
                    });
                }
            });

            // 5. Merge Data
            const finalItems = currentItems.map(item => {
                const pId = item.processId || 'noproc';
                const key = `${item.rawMaterialId}-${pId}`;
                const rawKey = `${item.rawMaterialId}`; // For Reserved Qty mapping

                return {
                    ...item,
                    createdIndentQty: indentTotals[key] || 0, // Previous Indents
                    issuedQty: issuedQtyMap[key] || 0,
                    reservedQty: reservedQtyMap[rawKey] || 0 // Mapped by RawID only
                };
            });

            setItems(finalItems);

        } catch (error) {
            console.error("Error loading data:", error);
            alert("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = (e) => {
        const checked = e.target.checked;
        const newSelected = {};
        if (checked) {
            items.forEach(item => newSelected[item.uniqueId] = true);
        }
        setSelectedItems(newSelected);
    };

    const toggleSelectItem = (id) => {
        setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleQtyChange = (id, value) => {
        setIndentQtys(prev => ({ ...prev, [id]: value }));
    };

    const handleCreateIndent = async () => {
        const selectedKeys = Object.keys(selectedItems).filter(k => selectedItems[k]);
        if (selectedKeys.length === 0) {
            alert("Please select items to indent.");
            return;
        }

        const details = [];
        for (const key of selectedKeys) {
            const item = items.find(i => i.uniqueId === key);
            const qty = parseFloat(indentQtys[key]);

            if (!item || !qty || qty <= 0) {
                alert(`Please enter a valid quantity for ${item?.itemName || 'selected item'}`);
                return;
            }

            details.push({
                rawMaterialId: item.rawMaterialId,
                processId: item.processId,
                indentQuantity: qty
            });
        }

        try {
            const token = localStorage.getItem('token');
            const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

            const existingIndent = indentHistory.length > 0 ? indentHistory[0] : null;

            if (existingIndent) {
                // UPDATE EXISTING INDENT (Merge logic)
                let finalDetails = [];
                if (existingIndent.details) {
                    finalDetails = existingIndent.details.map(d => ({
                        rawMaterialId: d.rawMaterialId || d.rawMaterial?.id,
                        processId: d.processId || d.process?.id,
                        indentQuantity: d.indentQuantity
                    }));
                }

                details.forEach(newDetail => {
                    const existingIndex = finalDetails.findIndex(d =>
                        d.rawMaterialId === newDetail.rawMaterialId &&
                        (d.processId === newDetail.processId || (!d.processId && !newDetail.processId))
                    );

                    if (existingIndex >= 0) {
                        finalDetails[existingIndex].indentQuantity += newDetail.indentQuantity;
                    } else {
                        finalDetails.push(newDetail);
                    }
                });

                const payload = {
                    materialRequisitionId: requisition.id,
                    locationId: requisition.location?.id || 1,
                    indentDate: indentDate,
                    status: 'PENDING',
                    remarks: "Updated via Web UI",
                    details: finalDetails
                };

                await axios.put(`${API_URL}/material-indents/update/${existingIndent.id}`, payload, authHeaders);
                alert("Indent Updated Successfully!");

            } else {
                // CREATE NEW INDENT
                const payload = {
                    materialRequisitionId: requisition.id,
                    locationId: requisition.location?.id || 1,
                    indentDate: indentDate,
                    status: 'PENDING',
                    remarks: "Created via Web UI",
                    details: details
                };

                await axios.post(`${API_URL}/material-indents/create`, payload, authHeaders);
                alert("Indent Created Successfully!");
            }

            // Update Requisition Status to DONE
            await axios.put(`${API_URL}/materials/requisition/${id}/indent-status`, null, {
                ...authHeaders,
                params: { status: 'DONE' }
            });

            // Refresh
            fetchData();
            setSelectedItems({});
            setIndentQtys({});

        } catch (error) {
            console.error("Create/Update Indent Failed:", error);
            alert("Failed to save indent.");
        }
    };

    const handleDeleteIndent = async (indentId) => {
        if (!confirm("Are you sure you want to delete this indent?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/material-indents/${indentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error("Delete Failed:", error);
            alert("Failed to delete indent.");
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="text-sm text-gray-500 mb-2">Home &gt; Raw Material Inventory</div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-3 border-b border-primary/10 bg-primary rounded-t-lg">
                    <h2 className="text-lg font-semibold text-primary-foreground">Create Indent For Raw Material</h2>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div className="flex items-center border-b border-gray-100 pb-2">
                        <span className="w-1/3 font-semibold text-gray-700">Request Date</span>
                        <span className="w-2/3 text-gray-800 font-medium">{requisition?.requestDate ? formatDate(requisition.requestDate) : ''}</span>
                    </div>
                    <div className="flex items-center border-b border-gray-100 pb-2">
                        <span className="w-1/3 font-semibold text-gray-700">Request No</span>
                        <span className="w-2/3 text-primary font-medium bg-primary/5 px-2 py-0.5 rounded">{requisition?.requestNo}</span>
                    </div>
                    {/* <div className="flex items-center border-b border-gray-100 pb-2">
                        <span className="w-1/3 font-semibold text-gray-700">Location</span>
                        <span className="w-2/3 text-gray-800 font-medium">{requisition?.location?.name || requisition?.locationName || 'Head Office'}</span>
                    </div> */}

                    <div className="flex items-center pt-2">
                        <label className="w-1/3 font-semibold text-gray-700">Indent Date</label>
                        <input
                            type="date"
                            className="w-1/3 p-1.5 border border-gray-300 rounded focus:border-purple-500 focus:outline-none"
                            value={indentDate}
                            onChange={(e) => setIndentDate(e.target.value)}
                        />
                    </div>
                </div>

                {indentHistory.length > 0 && (
                    <div className="border-t border-gray-200">
                        {/* <div className="px-6 py-3 bg-gray-50 font-semibold text-gray-700 text-sm">Previous Indents</div> */}
                        <table className="w-full text-left text-xs">
                            <thead className="bg-primary text-primary-foreground font-semibold border-b border-primary/10">
                                <tr>
                                    <th className="px-6 py-2 uppercase text-xs">S.No.</th>
                                    <th className="px-6 py-2 uppercase text-xs">Indent Date</th>
                                    <th className="px-6 py-2 uppercase text-xs">Process Name</th>
                                    <th className="px-6 py-2 uppercase text-xs">Items</th>
                                    <th className="px-6 py-2 uppercase text-xs">Indent Quantity</th>
                                    <th className="px-6 py-2 uppercase text-xs">Operation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {indentHistory.flatMap((indent, i) =>
                                    (indent.details || []).map((detail, j) => (
                                        <tr key={`${indent.id}-${detail.id}`} className="hover:bg-gray-50">
                                            <td className="px-6 py-3">{i + 1}.{j + 1}</td>
                                            <td className="px-6 py-3">{formatDate(indent.indentDate)}</td>
                                            <td className="px-6 py-3">{detail.processName || '-'}</td>
                                            <td className="px-6 py-3">{detail.rawMaterial?.name || detail.rawMaterialName}</td>
                                            <td className="px-6 py-3 font-bold">{detail.indentQuantity} {detail.rawMaterial?.unit?.name}</td>
                                            <td className="px-6 py-3">
                                                <button onClick={() => handleDeleteIndent(indent.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 border-t border-gray-200">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-primary text-primary-foreground font-semibold">
                            <tr>
                                <th className="px-4 py-2 w-10">
                                    <input type="checkbox" onChange={toggleSelectAll} className="accent-gray-600" />
                                </th>
                                <th className="px-4 py-2 uppercase text-xs">Process Name</th>
                                <th className="px-4 py-2 uppercase text-xs">Item Details</th>
                                <th className="px-4 py-2 uppercase text-xs">Item Code</th>
                                <th className="px-4 py-2 text-right uppercase text-xs">Available Qty</th>
                                <th className="px-4 py-2 text-right uppercase text-xs">Requisition Qty</th>
                                <th className="px-4 py-2 text-right uppercase text-xs">Issued Qty</th>
                                <th className="px-4 py-2 text-right uppercase text-xs">Created Indent Qty</th>
                                <th className="px-4 py-2 text-right uppercase text-xs">Reserved Qty</th>
                                <th className="px-4 py-2 w-32 uppercase text-xs">Indent Qty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <tr key={item.uniqueId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedItems[item.uniqueId]}
                                            onChange={() => toggleSelectItem(item.uniqueId)}
                                            className="accent-primary h-4 w-4"
                                        />
                                    </td>
                                    <td className="px-4 py-3">{item.processName}</td>
                                    <td className="px-4 py-3">{item.itemName}</td>
                                    <td className="px-4 py-3">{item.itemCode}</td>
                                    <td className="px-4 py-3 text-right">{item.availableQty} {item.unit}</td>
                                    <td className="px-4 py-3 text-right">{item.requisitionQty} {item.unit}</td>
                                    <td className="px-4 py-3 text-right">{item.issuedQty} {item.unit}</td>
                                    <td className="px-4 py-3 text-right">{item.createdIndentQty} {item.unit}</td>
                                    <td className="px-4 py-3 text-right">{item.reservedQty} {item.unit}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex flex-col items-end">
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-24 p-1 border border-gray-300 rounded text-right text-xs focus:border-primary focus:outline-none"
                                                value={indentQtys[item.uniqueId] || ''}
                                                onChange={(e) => handleQtyChange(item.uniqueId, e.target.value)}
                                            />
                                            <span className="text-[10px] text-gray-500 pt-0.5">{item.unit}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {items.length === 0 && <div className="p-6 text-center text-gray-500">No BOM items found.</div>}
                </div>

                <div className="p-6 bg-gray-50 flex justify-center gap-4 border-t border-gray-200">
                    <button
                        onClick={handleCreateIndent}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 rounded shadow-sm font-medium transition-colors uppercase text-xs"
                    >
                        {indentHistory.length > 0 ? "Update Indent" : "Create Indent"}
                    </button>
                    <button
                        onClick={() => navigate('/material-dashboard/material-requisition')}
                        className="bg-white border border-gray-300 text-gray-600 px-8 py-2 rounded shadow-sm font-medium hover:bg-gray-50 transition-colors uppercase"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default IndentMaterial;
