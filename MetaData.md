# 🏭 Hanger Production — Master Data Reference

> **Tenant:** `tata100` | **Date:** 2026-02-25
> All data used for setting up and testing the full hanger production workflow.

---

## 1. Work Groups

| Name | Designation | Employees | Hourly Rate |
|---|---|---|---|
| Wire Production | Production Supervisor | 12 | 150.00 |
| Coating & Finishing | Coating Technician | 8 | 180.00 |
| Quality Control | QC Inspector | 4 | 200.00 |
| Packing & Dispatch | Packing Supervisor | 6 | 130.00 |

---

## 2. Work Stations

| Station No | Station Name | Work Group |
|---|---|---|
| WS-001 | WC Line 01 | Wire Production |
| WS-002 | WC Line 02 | Wire Production |
| WS-003 | Coating Tank 01 | Coating & Finishing |
| WS-004 | Coating Tank 02 | Coating & Finishing |
| WS-005 | QC Bay 01 | Quality Control |
| WS-006 | Packing Line 01 | Packing & Dispatch |

---

## 3. Tasks (Operations)

| Task Name | Description |
|---|---|
| Wire Cutting | Cut wire coils to standard lengths |
| Hook Bending | Bend wire to hanger shape and hook |
| Pre-treatment Wash | Chemical degreasing before coating |
| Electroplating | Chrome electroplating of hangers |
| Drying & Curing | Oven drying post-coating |
| QC Inspection | Quality check — load test, dimension check |
| Carton Packing | Bundle and carton packing for dispatch |

---

## 4. Manage Task (Scheduled Maintenance)

| Task | Work Group | Work Station | Frequency | Alert Before (days) |
|---|---|---|---|---|
| Wire Cutting | Wire Production | WC Line 01 | DAILY | 1 |
| Hook Bending | Wire Production | WC Line 01 | DAILY | 1 |
| Electroplating | Coating & Finishing | Coating Tank 01 | WEEKLY | 2 |
| QC Inspection | Quality Control | QC Bay 01 | DAILY | 1 |
| Carton Packing | Packing & Dispatch | Packing Line 01 | DAILY | 1 |

---

## 5. Categories

| Name | Code |
|---|---|
| Finished Goods | FG |
| Raw Materials | RM |
| Wire Materials | WM |
| Packaging Materials | PKG |

---

## 6. Sub-Categories

| Name | Code | Category |
|---|---|---|
| Adult Hangers | FG-ADULT | Finished Goods |
| Child Hangers | FG-CHILD | Finished Goods |
| MS Wire 3.5mm | WM-MS-35 | Wire Materials |
| Coating Chemicals | RM-CHEM | Raw Materials |
| Export Cartons | PKG-CTN | Packaging Materials |
| Poly Bags | PKG-POLY | Packaging Materials |

---

## 7. Units

| Name | Description |
|---|---|
| KG | Kilogram |
| PCS | Pieces |
| CTN | Carton |
| LTR | Litre |
| COIL | Wire Coil |

---

## 8. Raw Materials

| Item Code | Name | Category | Issue Unit | Purchase Unit | Purchase Price | Sales Price | Reorder Limit |
|---|---|---|---|---|---|---|---|
| RM-WIRE-001 | MS Wire Coil 3.5mm | Wire Materials | COIL | COIL | 85.00 | — | 50 COIL |
| RM-CHEM-001 | Chrome Plating Solution | Raw Materials | LTR | LTR | 220.00 | — | 100 LTR |
| RM-PKG-001 | Export Carton Box (100 pcs) | Packaging Materials | PCS | PCS | 28.00 | — | 50 PCS |
| RM-PKG-002 | LDPE Poly Bag | Packaging Materials | PCS | PCS | 0.50 | — | 5000 PCS |

---

## 9. Process

| Process Name | Work Group Sequence |
|---|---|
| Hanger Manufacturing Flow | Wire Production → Coating & Finishing → Quality Control → Packing & Dispatch |

---

## 10. Finished Good

| Field | Value |
|---|---|
| **Item Code** | FG-ADULT-001 |
| **Name** | Adult Chrome Wire Hanger |
| **Category** | Finished Goods |
| **Sub-Category** | Adult Hangers |
| **Issue Unit** | PCS |
| **Purchase Unit** | PCS |
| **Sales Price** | 12.00 |
| **Purchase Price** | 8.50 |
| **Stock Qty** | 0 *(starts empty)* |
| **Process** | Hanger Manufacturing Flow |

### BOM (Bill of Materials)

| # | Raw Material | Qty | Unit | Rate |
|---|---|---|---|---|
| 1 | MS Wire Coil 3.5mm | 0.240 | KG | 85.00 |
| 2 | Chrome Plating Solution | 0.015 | LTR | 220.00 |
| 3 | Export Carton Box (100 pcs) | 0.01 | PCS | 28.00 |
| 4 | LDPE Poly Bag | 1 | PCS | 0.50 |

---

## 11. Hanger Type

| Field | Value |
|---|---|
| **Type Name** | ADULT |
| **Linked Finished Good** | Adult Chrome Wire Hanger (FG-ADULT-001) |
| **Unit Weight (grams)** | 50.0 |
| **Standard Width (cm)** | 42.0 |
| **Standard Hook (cm)** | 4.5 |
| **Tolerance (mm)** | 1.0 |
| **Max Defect %** | 2.0 |
| **Min QC Sample Size** | 300 |
| **Default Bundle Size** | 100 |
| **Min Load Test (kg)** | 3.0 |
| **Standard Wire Gauge (mm)** | 1.6 |
| **Standard Cycle Time (sec)** | 2.5 |
| **Shoulder Width Tolerance (mm)** | 2.0 |
| **Hook Size Tolerance (mm)** | 1.0 |

---

## 12. Purchase Order

| Field | Value |
|---|---|
| **PO Number** | PO-HNG-2026-001 |
| **Order Category** | Domestic |
| **PO Date** | 2026-02-25 |
| **Currency** | INR |
| **Discount Mode** | Without Discount |
| **Status** | Confirmed |
| **Remarks** | Wire coil purchase for hanger batch production — 10,000 pcs order |

### PO Line Items

| Line | Item | Qty | Unit | Rate | Amount |
|---|---|---|---|---|---|
| 1 | MS Wire Coil 3.5mm | 100 | COIL | 85.00 | 8,500.00 |
| 2 | Chrome Plating Solution | 150 | LTR | 220.00 | 33,000.00 |
| 3 | Export Carton Box (100 pcs) | 100 | PCS | 28.00 | 2,800.00 |
| 4 | LDPE Poly Bag | 10,000 | PCS | 0.50 | 5,000.00 |
| | | | | **Total** | **49,300.00** |

---

## 13. GRN (Goods Received Note)

| Field | Value |
|---|---|
| **GRN Date** | 2026-02-25 |
| **PO Reference** | PO-HNG-2026-001 |
| **Remarks** | Received against PO-HNG-2026-001. All items inspected at gate. |

### GRN Line Items

| Line | Item | Is Hanger Coil | Coil No | Heat No | Lot No | Material | Gauge (mm) | Gross Wt (kg) | Tare Wt (kg) | Net Wt (kg) | Rate/KG | Recv Qty | Location |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | MS Wire Coil 3.5mm | ✅ YES | COIL-2026-001 | HT-2026-FEB-01 | LOT-FEB-001 | MS | 3.50 | 2,520 | 20 | 2,500 | 85.00 | 100 COIL | Bay A — Rack 1 |
| 2 | Chrome Plating Solution | ❌ NO | — | — | — | — | — | — | — | — | — | 150 LTR | Chemical Store — Rack 2 |
| 3 | Export Carton Box | ❌ NO | — | — | — | — | — | — | — | — | — | 100 PCS | Packing Store — Shelf 1 |
| 4 | LDPE Poly Bag | ❌ NO | — | — | — | — | — | — | — | — | — | 10,000 PCS | Packing Store — Shelf 2 |

---

## 14. Material Requisition

| Field | Value |
|---|---|
| **MO Reference** | MO-HNG-2026-001 |
| **Requisition Date** | 2026-02-25 |
| **Remarks** | Material requisition for 10,000 adult hanger production |

---

## 15. Material Issue

| Field | Value |
|---|---|
| **Issue No** | MI-HNG-2026-001 |
| **Issue Date** | 2026-02-25 |
| **Material Requisition** | *(linked to MO-HNG-2026-001)* |
| **Remarks** | Material issue for 4-batch hanger production run |

### Issue Detail Lines

| # | Raw Material | Process | Issued Qty | Coil Ref | Issued Weight (kg) |
|---|---|---|---|---|---|
| 1 | MS Wire Coil 3.5mm | Hanger Manufacturing Flow | 100 COIL | COIL-2026-001 | 2,400 kg |
| 2 | Chrome Plating Solution | Hanger Manufacturing Flow | 150 LTR | — | — |
| 3 | Export Carton Box (100 pcs) | Hanger Manufacturing Flow | 100 PCS | — | — |
| 4 | LDPE Poly Bag | Hanger Manufacturing Flow | 10,000 PCS | — | — |

---

## 16. Manufacturing Order (MO)

| Field | Value |
|---|---|
| **MO Number** | MO-HNG-2026-001 |
| **Finished Good** | Adult Chrome Wire Hanger (FG-ADULT-001) |
| **BOM Finished Good** | *(BOM for FG-ADULT-001)* |
| **Hanger Type** | ADULT |
| **Category** | Finished Goods |
| **Sub-Category** | Adult Hangers |
| **Quantity** | 10,000 |
| **Reference No** | PO-REF-2026-001 |
| **Production Date** | 2026-02-25 |
| **Schedule Start** | 2026-02-25 08:00 |
| **Schedule Finish** | 2026-03-10 18:00 |
| **Due Date** | 2026-03-10 |
| **Shift** | MORNING |
| **Start Time** | 08:00 |
| **End Time** | 17:00 |
| **Status** | SCHEDULED |
| **Wire Gauge Required (mm)** | 3.5 |
| **Required Wire (kg)** | 2,400 |
| **Wastage** | 100 |
| **Remarks** | Bulk production order — 10,000 adult chrome hangers. Split into 4 batches. |

---

## 17. Production Batches

| Batch | Planned Qty | Hanger Type | Work Station | Shift | Coil Stock | Color | Remarks |
|---|---|---|---|---|---|---|---|
| Batch 1 | 3,000 | ADULT | WC Line 01 | Day Shift | COIL-2026-001 | Chrome Silver | First batch |
| Batch 2 | 3,000 | ADULT | WC Line 02 | Day Shift | COIL-2026-001 | Chrome Silver | Second batch |
| Batch 3 | 2,000 | ADULT | WC Line 01 | Day Shift | COIL-2026-001 | Chrome Silver | Third batch |
| Batch 4 | 2,000 | ADULT | WC Line 02 | Day Shift | COIL-2026-001 | Chrome Silver | Fourth batch |

---

## 18. Batch 1 — Stage-by-Stage Processing

### Stage 1: Wire Cutting

| Field | Value |
|---|---|
| Work Station | WC Line 01 |
| Operator | Ravi Kumar |
| Shift | Day Shift |
| Cost Center | Wire Production |
| Cutting Length (cm) | 52.00 |
| Planned Qty | 3,000 |
| Produced Qty | 3,000 |
| Scrap Qty | 12 |
| Scrap Type | Non-Returnable |
| Scrap Rate (per kg) | 45.00 |
| Start Time | 2026-02-25 08:00 |
| End Time | 2026-02-25 13:00 |
| Remarks | Wire cutting complete. 12 pcs scrap due to end-of-coil trimming. |

---

### Stage 2: Bending (Job Card)

| Field | Value |
|---|---|
| Work Station | WC Line 01 |
| Tool / Die No | DIE-ADULT-52-01 |
| Operator | Ravi Kumar |
| Shift | Day Shift |
| Target Qty | 3,000 |
| Produced Qty | 2,990 |
| Rejected Qty | 8 |
| Rework Qty | 2 |
| Labor Hours | 5.0 |
| Workstation Run Hours | 5.0 |
| Breakdown Time | 0 |
| Actual Shoulder Width (mm) | 42.1 |
| Actual Hook Size (mm) | 4.6 |
| Start Time | 2026-02-25 13:00 |
| End Time | 2026-02-25 18:00 |
| Remarks | Hook bending complete. 8 pcs rejected (hook angle off-spec). 2 pcs rework. |

---

### Stage 3: Coating

| Field | Value |
|---|---|
| Coating Type | ELECTROPLATE |
| Color Code | CHR-SLV-01 |
| Work Station | Coating Tank 01 |
| Operator | Suresh Patel |
| Shift | Day Shift |
| Input Qty | 2,990 |
| Produced Qty | 2,968 |
| Rejected Qty | 15 |
| Rework Qty | 7 |
| Chemical Consumed (kg) | 4.500 |
| Chemical Batch | CHM-FEB-2026-01 |
| Temperature (°C) | 52.0 |
| Coating Thickness (mm) | 0.012 |
| Duration (min) | 45.0 |
| Color Pass | ✅ Yes |
| Start Time | 2026-02-25 18:30 |
| End Time | 2026-02-25 20:30 |
| Remarks | Chrome electroplating complete. 15 rejected (uneven chrome layer). 7 pcs rework. |

---

### Rework Entry (Coating)

| Field | Value |
|---|---|
| Source Stage | COATING |
| Target Stage | COATING |
| Rework Qty | 7 |
| Reason | Uneven chrome layer — needs re-dip |
| Remarks | 7 pcs returned to coating tank for re-plating |

---

### Stage 4: QC Inspection

| Field | Value |
|---|---|
| Inspector | Anita Shah |
| Sample Size | 300 |
| Inspected Qty | 300 |
| Passed Qty | 294 |
| Rejected Qty | 4 *(auto-calculated)* |
| Rework Qty | 2 |
| Defect Type | Minor hook misalignment |
| QC Result | CONDITIONAL_PASS *(1.33% defect — within 2% limit)* |
| Load Test Passed | ✅ Yes |
| Remarks | 300 sample inspected. 4 rejected. 2 rework. Batch passes within 2% threshold. |

---

### Stage 5: Packing

| Field | Value |
|---|---|
| Operator | Mohan Das |
| Bundle Size | 100 |
| Total Bundles | 29 |
| Packed Qty | 2,900 *(29 × 100)* |
| Remainder Disposition | HOLD |
| Gross Weight (kg) | 742.500 |
| Net Weight (kg) | 706.800 |
| Carton Size | 60×40×40 cm |
| Remarks | Batch 1 packing complete. 29 cartons × 100 pcs. Remainder HOLD for consolidation. |

#### Carton Lines (sample)

| Carton No | Bundles | Qty | Gross Wt (kg) | Seal Status |
|---|---|---|---|---|
| CTN-B1-001 | 1 | 100 | 25.500 | SEALED |
| CTN-B1-002 | 1 | 100 | 25.500 | SEALED |
| CTN-B1-003 | 1 | 100 | 25.500 | SEALED |
| CTN-B1-004 | 1 | 100 | 25.500 | SEALED |
| CTN-B1-005 | 1 | 100 | 25.500 | SEALED |
| *(... up to CTN-B1-029)* | 1 | 100 | 25.500 | SEALED |

---

## 19. Batch 1 — Summary

| Metric | Value |
|---|---|
| Planned Qty | 3,000 |
| After Wire Cutting | 3,000 (12 scrap) |
| After Bending | 2,990 (8 rejected, 2 rework) |
| After Coating | 2,968 (15 rejected, 7 rework) |
| After QC | ~2,946 passed |
| Packed & Ready | **2,900 pcs in 29 cartons** |
| Total Loss | ~100 pcs (3.3%) |

---

## 20. Batches 2, 3, 4 — To Process

> Same data pattern as Batch 1 with the following adjustments:

| Batch | Station | Planned Qty | Status |
|---|---|---|---|
| Batch 2 | WC Line 02 | 3,000 | ⏳ Pending |
| Batch 3 | WC Line 01 | 2,000 | ⏳ Pending |
| Batch 4 | WC Line 02 | 2,000 | ⏳ Pending |

---

*Last updated: 2026-02-25 | Tenant: tata100*
