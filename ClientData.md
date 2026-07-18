# Client Data: Hanger Manufacturing Order
> **Client:** Apex Garments Pvt. Ltd.
> **Order:** 10,000 Hangers
> **Batches:** Batch 1 – 3,000 Adult, Batch 2 – 2,000 Child, Batch 3 – 5,000 Heavy Duty
> **Raw Material Calc:** 1 Coil = 500 kg | 1 Hanger = 50g
> - Adult: 3000 × 50g = 150 kg = 0.3 coils
> - Child: 2000 × 50g = 100 kg = 0.2 coils
> - Heavy Duty: 5000 × 50g = 250 kg = 0.5 coils
> - **Total Wire: 500 kg = 1 Full Coil**

---

## 1. Workgroup, Work Stations, Tasks, Manage Tasks

### Workgroups
| Name | Description |
|---|---|
| Wire Processing | Wire cutting and straightening operations |
| Metal Forming | Bending and shaping line |
| Surface Finishing | Coating and painting line |
| Quality & Dispatch | QC inspection and packing |

### Work Stations
| Station Code | Name | Workgroup | Machine ID | Machine Type | Capacity/hr |
|---|---|---|---|---|---|
| WS-WC-01 | Wire Cutter Alpha | Wire Processing | MCH-001 | Automatic Wire Cutter | 800 pcs |
| WS-WC-02 | Wire Cutter Beta | Wire Processing | MCH-002 | Semi-Auto Wire Cutter | 500 pcs |
| WS-BD-01 | Bending Press A | Metal Forming | MCH-003 | Hydraulic Bender | 600 pcs |
| WS-BD-02 | Bending Press B | Metal Forming | MCH-004 | Manual Bender | 400 pcs |
| WS-CT-01 | Coating Tank 1 | Surface Finishing | MCH-005 | Electrostatic Spray | 1000 pcs |
| WS-CT-02 | Coating Tank 2 | Surface Finishing | MCH-006 | Dip Coating Machine | 800 pcs |
| WS-QC-01 | QC Station A | Quality & Dispatch | — | Inspection Table | 1200 pcs |
| WS-PK-01 | Packing Station 1 | Quality & Dispatch | — | Manual Packing | 500 pcs |

### Tasks
| Task Code | Task Name | Station | Assigned To | Est. Duration |
|---|---|---|---|---|
| TSK-001 | Cut wire to 380mm for Adult | WS-WC-01 | Raju Kumar | 4 hrs |
| TSK-002 | Cut wire to 320mm for Child | WS-WC-02 | Salim Sheikh | 3 hrs |
| TSK-003 | Cut wire to 420mm for Heavy Duty | WS-WC-01 | Raju Kumar | 6 hrs |
| TSK-004 | Bend Adult Hanger profile | WS-BD-01 | Anil Verma | 5 hrs |
| TSK-005 | Bend Child Hanger profile | WS-BD-02 | Priya Nair | 4 hrs |
| TSK-006 | Bend Heavy Duty profile | WS-BD-01 | Anil Verma | 8 hrs |
| TSK-007 | Coat Adult – Chrome finish | WS-CT-01 | Deepak Rao | 4 hrs |
| TSK-008 | Coat Child – Pastel finish | WS-CT-02 | Sunita Das | 3 hrs |
| TSK-009 | Coat Heavy Duty – Black powder coat | WS-CT-01 | Deepak Rao | 6 hrs |
| TSK-010 | QC Adult Hangers | WS-QC-01 | Meena Pillai | 3 hrs |
| TSK-011 | QC Child & Heavy Duty | WS-QC-01 | Meena Pillai | 4 hrs |
| TSK-012 | Pack & label all batches | WS-PK-01 | Suresh Patil | 5 hrs |

---

## 2. Manage Process

| Process Code | Process Name | Stage | Sequence | Description |
|---|---|---|---|---|
| PROC-01 | Wire Cutting | WIRE_CUTTING | 1 | Cut galvanized steel wire to required lengths |
| PROC-02 | Hook Forming & Bending | BENDING | 2 | Form hook and body of hanger |
| PROC-03 | Surface Coating | COATING | 3 | Apply chrome/ powder coating for finish |
| PROC-04 | Quality Inspection | QC | 4 | Visual and dimensional inspection |
| PROC-05 | Packing & Labelling | PACKING | 5 | Bundle, label, and box for dispatch |

---

## 3. Categories & Subcategories

### Categories
| Code | Name | Type |
|---|---|---|
| CAT-RAW | Raw Materials | RAW_MATERIAL |
| CAT-FG | Finished Goods | FINISHED_GOOD |
| CAT-PKG | Packaging Materials | RAW_MATERIAL |
| CAT-CHEM | Chemicals & Coatings | RAW_MATERIAL |

### Subcategories
| Code | Name | Parent Category |
|---|---|---|
| SUB-WIRE | Steel Wire | CAT-RAW |
| SUB-HOOK | Hook Accessories | CAT-RAW |
| SUB-HANG | Hangers | CAT-FG |
| SUB-BOX | Carton Boxes | CAT-PKG |
| SUB-COAT | Coating Chemicals | CAT-CHEM |
| SUB-LUBE | Lubricants | CAT-CHEM |

---

## 4. Raw Materials

| SKU | Name | Category | UOM | Unit Cost | Reorder Qty | Notes |
|---|---|---|---|---|---|---|
| RM-001 | Galvanized Steel Wire 2.5mm | Steel Wire | KG | ₹ 85 | 500 kg | Main body wire |
| RM-002 | Galvanized Steel Wire 3.5mm | Steel Wire | KG | ₹ 90 | 200 kg | Heavy-duty wire |
| RM-003 | Chrome Coating Chemical | Coating Chemicals | LTR | ₹ 450 | 50 ltr | Adult hanger finish |
| RM-004 | Black Powder Coat | Coating Chemicals | KG | ₹ 320 | 30 kg | Heavy duty finish |
| RM-005 | Pastel Lacquer (Pink/Blue mix) | Coating Chemicals | LTR | ₹ 380 | 20 ltr | Child hanger finish |
| RM-006 | Carton Box (50-count) | Carton Boxes | PCS | ₹ 28 | 500 pcs | Final packing |
| RM-007 | Polybag 12×8 inch | Packaging Materials | PCS | ₹ 2 | 5000 pcs | Inner wrap |
| RM-008 | Machine Lubricant | Lubricants | LTR | ₹ 180 | 10 ltr | Machine maintenance |

---

## 5. Finished Goods, Process & BOM

### Finished Goods
| SKU | Name | Category | UOM | Selling Price | Weight |
|---|---|---|---|---|---|
| FG-HNG-A | Adult Wire Hanger – Chrome | Hangers | PCS | ₹ 18 | 50 g |
| FG-HNG-C | Child Wire Hanger – Pastel | Hangers | PCS | ₹ 16 | 50 g |
| FG-HNG-H | Heavy Duty Wire Hanger – Black | Hangers | PCS | ₹ 22 | 50 g |

### BOM – Adult Wire Hanger (FG-HNG-A) per 100 pcs
| Material | Qty | UOM |
|---|---|---|
| Galvanized Steel Wire 2.5mm | 5.0 | KG |
| Chrome Coating Chemical | 0.2 | LTR |
| Polybag 12×8 inch | 100 | PCS |
| Carton Box (50-count) | 2 | PCS |

### BOM – Child Wire Hanger (FG-HNG-C) per 100 pcs
| Material | Qty | UOM |
|---|---|---|
| Galvanized Steel Wire 2.5mm | 5.0 | KG |
| Pastel Lacquer | 0.15 | LTR |
| Polybag 12×8 inch | 100 | PCS |
| Carton Box (50-count) | 2 | PCS |

### BOM – Heavy Duty Hanger (FG-HNG-H) per 100 pcs
| Material | Qty | UOM |
|---|---|---|
| Galvanized Steel Wire 3.5mm | 5.0 | KG |
| Black Powder Coat | 0.25 | KG |
| Polybag 12×8 inch | 100 | PCS |
| Carton Box (50-count) | 2 | PCS |

---

## 6. Purchase Order & GRN

### Purchase Order
| PO No. | Supplier | Date | Item | Qty | Unit | Rate | Total |
|---|---|---|---|---|---|---|---|
| PO-2024-001 | National Steel Traders | 2024-02-01 | Galvanized Wire 2.5mm | 350 kg | KG | ₹ 85 | ₹ 29,750 |
| PO-2024-002 | National Steel Traders | 2024-02-01 | Galvanized Wire 3.5mm | 150 kg | KG | ₹ 90 | ₹ 13,500 |
| PO-2024-003 | Chemco Industries | 2024-02-03 | Chrome Coating Chemical | 10 ltr | LTR | ₹ 450 | ₹ 4,500 |
| PO-2024-004 | Chemco Industries | 2024-02-03 | Black Powder Coat | 15 kg | KG | ₹ 320 | ₹ 4,800 |
| PO-2024-005 | Chemco Industries | 2024-02-03 | Pastel Lacquer | 5 ltr | LTR | ₹ 380 | ₹ 1,900 |
| PO-2024-006 | Packwell Supplies | 2024-02-05 | Carton Box 50-count | 220 pcs | PCS | ₹ 28 | ₹ 6,160 |
| PO-2024-007 | Packwell Supplies | 2024-02-05 | Polybag 12×8 | 11,000 pcs | PCS | ₹ 2 | ₹ 22,000 |

### GRN (Goods Receipt Note)
| GRN No. | PO Ref. | Received Date | Warehouse | Item | Received Qty | Accepted Qty | Rejected Qty |
|---|---|---|---|---|---|---|---|
| GRN-2024-001 | PO-2024-001 | 2024-02-04 | Main Store | Galvanized Wire 2.5mm | 350 kg | 350 kg | 0 |
| GRN-2024-002 | PO-2024-002 | 2024-02-04 | Main Store | Galvanized Wire 3.5mm | 150 kg | 148 kg | 2 kg |
| GRN-2024-003 | PO-2024-003 | 2024-02-06 | Chemical Store | Chrome Coating Chemical | 10 ltr | 10 ltr | 0 |
| GRN-2024-004 | PO-2024-004 | 2024-02-06 | Chemical Store | Black Powder Coat | 15 kg | 15 kg | 0 |
| GRN-2024-005 | PO-2024-005 | 2024-02-06 | Chemical Store | Pastel Lacquer | 5 ltr | 5 ltr | 0 |
| GRN-2024-006 | PO-2024-006 | 2024-02-07 | Packing Store | Carton Box 50-count | 220 pcs | 220 pcs | 0 |
| GRN-2024-007 | PO-2024-007 | 2024-02-07 | Packing Store | Polybag 12×8 | 11,000 pcs | 11,000 pcs | 0 |

---

## 7. Manufacturing Orders (MO)

| MO No. | Date | Finished Good | Qty | Status | Client |
|---|---|---|---|---|---|
| MO-2024-001 | 2024-02-08 | Adult Wire Hanger – Chrome | 3,000 pcs | IN_PROGRESS | Apex Garments |
| MO-2024-002 | 2024-02-08 | Child Wire Hanger – Pastel | 2,000 pcs | IN_PROGRESS | Apex Garments |
| MO-2024-003 | 2024-02-08 | Heavy Duty Hanger – Black | 5,000 pcs | PENDING | Apex Garments |

---

## 8. Hanger Types

| Code | Name | Wire Gauge | Length | Finish | Weight | Standard Qty/Box |
|---|---|---|---|---|---|---|
| HNG-ADULT | Adult Wire Hanger | 2.5 mm | 380 mm | Chrome Silver | 50 g | 50 |
| HNG-CHILD | Child Wire Hanger | 2.5 mm | 320 mm | Pastel (Pink/Blue) | 50 g | 50 |
| HNG-HEAVY | Heavy Duty Hanger | 3.5 mm | 420 mm | Black Powder Coat | 50 g | 50 |

---

## 9. Batches

| Batch No. | MO Ref. | Hanger Type | Coil No. | Planned Qty | Status | Current Stage |
|---|---|---|---|---|---|---|
| BATCH-2024-001 | MO-2024-001 | Adult Wire Hanger | COIL-001 | 3,000 | IN_PROGRESS | COATING |
| BATCH-2024-002 | MO-2024-002 | Child Wire Hanger | COIL-001 | 2,000 | IN_PROGRESS | BENDING |
| BATCH-2024-003 | MO-2024-003 | Heavy Duty Hanger | COIL-001 | 5,000 | PENDING | WIRE_CUTTING |

---

## 10. Wire Cutting

### Production Operations
| Batch | Operator | Station | Wire Length | Start Time | End Time | Planned Qty | Produced Qty | Rejected Qty |
|---|---|---|---|---|---|---|---|---|
| BATCH-2024-001 | Raju Kumar | WS-WC-01 | 380 mm | 08:00 | 12:30 | 3,000 | 2,980 | 20 |
| BATCH-2024-002 | Salim Sheikh | WS-WC-02 | 320 mm | 08:00 | 11:00 | 2,000 | 2,000 | 0 |
| BATCH-2024-003 | Raju Kumar | WS-WC-01 | 420 mm | 13:00 | — | 5,000 | 0 | 0 |

### Rework History
| Rework No. | Batch | Qty | Source Stage | Target Stage | Reason | Status |
|---|---|---|---|---|---|---|
| RWK-001 | BATCH-2024-001 | 20 | WIRE_CUTTING | WIRE_CUTTING | Wire cut too short (≤375mm) | COMPLETED |

### Machine Downtime
| Log No. | Batch | Station | Start | End | Duration | Category | Notes |
|---|---|---|---|---|---|---|---|
| DT-001 | BATCH-2024-001 | WS-WC-01 | 10:15 | 10:45 | 30 min | MECHANICAL | Blade replacement |

### Event Timeline
| Time | Event | Description |
|---|---|---|
| 08:00 | Stage Started | Wire cutting started for BATCH-2024-001 |
| 10:15 | Downtime Start | Blade replacement – WS-WC-01 |
| 10:45 | Downtime End | Machine resumed |
| 12:30 | Stage Completed | 2,980 pcs passed, 20 reworked |

---

## 11. Bending

### Production Operations
| Batch | Operator | Station | Start | End | Planned | Produced | Rejected |
|---|---|---|---|---|---|---|---|
| BATCH-2024-001 | Anil Verma | WS-BD-01 | 13:00 | 17:30 | 2,980 | 2,960 | 20 |
| BATCH-2024-002 | Priya Nair | WS-BD-02 | 11:30 | 14:30 | 2,000 | 1,995 | 5 |

### Rework History
| Rework No. | Batch | Qty | Source Stage | Target Stage | Reason | Status |
|---|---|---|---|---|---|---|
| RWK-002 | BATCH-2024-001 | 20 | BENDING | BENDING | Hook angle off by > 5° | COMPLETED |
| RWK-003 | BATCH-2024-002 | 5 | BENDING | BENDING | Collar bend incomplete | COMPLETED |

### Machine Downtime
| Log No. | Batch | Station | Start | End | Duration | Category | Notes |
|---|---|---|---|---|---|---|---|
| DT-002 | BATCH-2024-001 | WS-BD-01 | 15:00 | 15:20 | 20 min | ELECTRICAL | Hydraulic pump restart |

### Event Timeline
| Time | Event | Description |
|---|---|---|
| 13:00 | Stage Started | Bending started – BATCH-2024-001 |
| 15:00 | Downtime Start | Hydraulic pump fault |
| 15:20 | Downtime End | Pump restarted |
| 17:30 | Stage Completed | 2,960 pcs passed, 20 reworked |

---

## 12. Coating

### Production Operations
| Batch | Operator | Station | Coating Type | Start | End | Planned | Produced | Rejected |
|---|---|---|---|---|---|---|---|---|
| BATCH-2024-001 | Deepak Rao | WS-CT-01 | Chrome | 08:00 | 11:00 | 2,960 | 2,950 | 10 |
| BATCH-2024-002 | Sunita Das | WS-CT-02 | Pastel Pink | 15:00 | 17:30 | 1,995 | 1,990 | 5 |

### Rework History
| Rework No. | Batch | Qty | Source Stage | Target Stage | Reason | Status |
|---|---|---|---|---|---|---|
| RWK-004 | BATCH-2024-001 | 10 | COATING | COATING | Uneven chrome patch | COMPLETED |

### Machine Downtime
| Log No. | Batch | Station | Start | End | Duration | Category | Notes |
|---|---|---|---|---|---|---|---|
| DT-003 | BATCH-2024-002 | WS-CT-02 | 16:10 | 16:30 | 20 min | PROCESS | Lacquer clog in nozzle |

### Event Timeline
| Time | Event | Description |
|---|---|---|
| 08:00 | Stage Started | Chrome coating – BATCH-2024-001 |
| 11:00 | Stage Completed | 2,950 pcs passed, 10 reworked |
| 15:00 | Stage Started | Pastel coating – BATCH-2024-002 |
| 16:10 | Downtime Start | Nozzle clog – WS-CT-02 |
| 16:30 | Downtime End | Nozzle cleared |
| 17:30 | Stage Completed | 1,990 pcs passed |

---

## 13. Quality Control (QC)

### Production Operations
| Batch | Inspector | Station | Start | End | Inspected | Passed | Rejected | Pass Rate |
|---|---|---|---|---|---|---|---|---|
| BATCH-2024-001 | Meena Pillai | WS-QC-01 | 11:30 | 13:30 | 2,950 | 2,920 | 30 | 98.98% |
| BATCH-2024-002 | Meena Pillai | WS-QC-01 | 18:00 | 19:30 | 1,990 | 1,980 | 10 | 99.50% |

### Rework History
| Rework No. | Batch | Qty | Source Stage | Target Stage | Reason | Status |
|---|---|---|---|---|---|---|
| RWK-005 | BATCH-2024-001 | 20 | QC | COATING | Pin-hole voids in chrome | IN_PROGRESS |
| RWK-006 | BATCH-2024-001 | 10 | QC | BENDING | Shoulder symmetry failure | COMPLETED |

### Machine Downtime
*No downtime recorded during QC.*

### Event Timeline
| Time | Event | Description |
|---|---|---|
| 11:30 | Stage Started | QC inspection – BATCH-2024-001 |
| 13:00 | Rework Raised | 30 pcs flagged; 20 coating, 10 bending |
| 13:30 | Stage Completed | 2,920 pcs cleared for packing |
| 18:00 | Stage Started | QC inspection – BATCH-2024-002 |
| 19:30 | Stage Completed | 1,980 pcs cleared for packing |

---

## 14. Packing

### Production Operations
| Batch | Operator | Station | Start | End | Packed Qty | Boxes Used | Label |
|---|---|---|---|---|---|---|---|
| BATCH-2024-001 | Suresh Patil | WS-PK-01 | 14:00 | 16:00 | 2,920 | 58 | Adult Chrome – Apex Garments |
| BATCH-2024-002 | Suresh Patil | WS-PK-01 | 20:00 | 21:00 | 1,980 | 40 | Child Pastel – Apex Garments |

### Rework History
*No packing rework. All packed units are cleared QC stock.*

### Machine Downtime
*No downtime recorded during packing.*

### Event Timeline
| Time | Event | Description |
|---|---|---|
| 14:00 | Stage Started | Packing Adult Hangers – BATCH-2024-001 |
| 14:30 | Milestone | 1,000 pcs packed (20 boxes) |
| 15:30 | Milestone | 2,000 pcs packed (40 boxes) |
| 16:00 | Stage Completed | 2,920 pcs packed in 58 boxes – BATCH-2024-001 DONE |
| 20:00 | Stage Started | Packing Child Hangers – BATCH-2024-002 |
| 21:00 | Stage Completed | 1,980 pcs packed in 40 boxes – BATCH-2024-002 DONE |

---

## Summary

| Batch | Hanger Type | Planned | Final Packed | Total Rejected | Overall Yield |
|---|---|---|---|---|---|
| BATCH-2024-001 | Adult Chrome | 3,000 | 2,920 | 80 | 97.3% |
| BATCH-2024-002 | Child Pastel | 2,000 | 1,980 | 20 | 99.0% |
| BATCH-2024-003 | Heavy Duty Black | 5,000 | — | — | Pending |
| **Total** | | **10,000** | **4,900** | **100** | |
