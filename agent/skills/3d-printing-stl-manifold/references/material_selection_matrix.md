# 3D Printing & Metallurgy Expert Agent — Sub-Part Material Selection Matrix

Every pneumatic airgun assembly (such as the **FX Carbon Bottle Valve & 45° AMP Regulator**, **Texoma Pellet Pen Gun**, and **Evanix REX-P `분해도`**) contains distinct mechanical regimes that require specific materials, heat treatments, or high-temperature engineering filaments:

| Sub-Part Category | Primary Factory Material | 3D-Printable Polymer Alternative | Print Settings (Nozzle / Bed / Walls / Infill) | Engineering Rationale |
|---|---|---|---|---|
| **Bottle Valve Body, Receiver & OTB Shroud (`250 Bar`)** | `7075-T6 Aluminum` (Hard-Anodized) | `PEEK-GF30` or `PA12-CF15 Carbon Nylon` | `405°C / 145°C / 6 Walls / 85% Gyroid` | Must sustain `25.0 MPa` internal pressure with Lamé safety factor `≥ 1.80×`. Print horizontally so filament perimeters align with hoop stress. |
| **Retaining Nut, Regulator Housing & Transfer Bush** | `C36000 Free-Machining Brass` | `PEEK-GF30 Aerospace` | `405°C / 145°C / 6 Walls / 100% Solid` | Prevents thread galling against stainless adapters and provides smooth low-friction lands for green FKM O-rings. |
| **Valve Pin, Hammer, Cocking Link & Rifled Liner** | `316 Stainless` / `4140 Chromoly Steel` (42 HRC) | `PEEK-GF30` (with steel insert core) | `410°C / 150°C / 6 Walls / 95% Gyroid` | High-velocity impact against the striker and hammer requires high compressive yield strength to prevent stem mushrooming. |
| **Valve Seat Bushing (`Valve Seat`)** | `Virgin Unfilled PEEK` / `Delrin POM` | `ULTEM 9085` / `PEEK` | `400°C / 140°C / 6 Walls / 100% Solid` | Pairs with the 95A green urethane valve seal to form a zero-creep, bubble-tight `250 Bar` high-pressure orifice seal. |
| **Main Hammer Spring & 22-Coil Valve Return Spring** | `ASTM A228 Cold-Drawn Music Wire` | `PEEK-GF30 Compliant Wave Spring` | `410°C / 150°C / 5 Walls / 100% Solid` | Delivers shear modulus `G = 79.3 GPa` for repeatable `1.6 ms` valve dwell time without thermal relaxation. |
| **AMP Regulator Disc Stack (`Belleville Washers`)** | `17-7 PH Stainless Spring Steel` | `PEEK-GF30 Conical Disc Stack` | `410°C / 150°C / 6 Walls / 100% Solid` | 12-disc `((())())` stack maintains `145 Bar` plenum setpoint across `250 → 145 Bar` bottle blowdown. |
| **Holder & Green Valve Seal / Dynamic O-Rings** | `FKM Viton 90A` / `PU 95A Green Urethane` | `TPU 95A High-Shore Elastomer` | `228°C / 55°C / 6 Walls / 100% Concentric` | 90 Shore A durometer prevents O-ring extrusion into `0.04 mm` radial clearances at `250 Bar` (`3,625 PSI`). |
