# ReCircuit — Official Hackathon Submission Package (English)
**Target Events:** Colosseum Crypto World's Fair 2026 & Superteam Brasil Side-Track (Earn)  
**Submission Deadline:** 03:59 AM BRT (October 13, 2026)  
**Submission Status:** READY TO COPY & PASTE

---

## 📋 Section 1: Quick Copy-Paste Fields

### Project Name
`ReCircuit`

### One-Liner / Tagline (Max 80 characters)
`Tinder for salvaged e-waste parts & verifiable safe disposal on Solana.`

### Short Description (Max 280 characters)
`ReCircuit matches informal e-waste collectors with low-income makers and students rebuilding computers from salvaged parts. It provides certified, safe handling pathways for hazardous lithium and toxic components, anchoring proof of circular reuse on Solana Devnet.`

### Track
`DePIN / Climate / Public Goods / Consumer`

### Project Links
* **Live Demo URL:** `https://recircuit.vercel.app` *(or your deployed GitHub Pages / Vercel link)*
* **Local / Test URL:** `http://localhost:8080`
* **GitHub Repository:** `https://github.com/luscaalvespereira/ReCircuit`
* **Demo Video:** `[Paste your 2-3 min YouTube/Loom/Drive link here]`
* **Smart Contract / Explorer (Solana Devnet):** `https://explorer.solana.com/address/MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr?cluster=devnet`
* **Team Leader:** Lucas Alves Pereira (`lucas.alvespereira@ufpe.br`)

---

## 📝 Section 2: Detailed Project Description for Judges (500 Words)

### 1. The Real-World Problem
Every year, the world discards over **62 million metric tons of electronic waste (e-waste)**. In Brazil and across Latin America, less than **2.1%** is processed through formal certified channels. The remaining 97.9% is either dumped in landfills or sold to informal scrap yards that shred high-grade motherboards just to burn and extract low-value copper wires.

Meanwhile, millions of talented, underprivileged young students, tech enthusiasts, and public schools face an acute digital barrier: they cannot afford modern computer hardware. Millions of functional DDR3 RAM sticks, Core i5/i7 CPUs, SATA SSDs, GTX-grade graphics cards, and 450W power supplies end up in garbage piles after corporate office upgrades, while students down the street drop out of computer science courses for lack of a working PC.

Critically, informal waste collectors (*catadores*) who retrieve this e-waste face severe health hazards. Federal Reverse Logistics laws exist (such as Brazil's Law 12,305/2010), but they fail on the ground: collectors receive no training, no clear maps of certified toxic drop-offs, and no incentives to avoid cracking lead-acid batteries open or letting lithium-ion 18650 cells burst into toxic flames.

### 2. The Solution: ReCircuit
**ReCircuit** bridges this gap through a high-engagement, **Tinder-style swipe interface** that turns urban waste picking into a decentralized circular economy:

* **Bidirectional Discovery (Makers & Collectors):**
  - **Makers** swipe right on components recovered by local collectors near them (sorted by distance, category, and tested status).
  - **Collectors** swipe right on specific hardware requests posted by local makers (e.g., *"Looking for DDR3 RAM to revive 10 lab PCs at a public school in Recife"*).
* **Safe Hazard Management Protocols:**
  When a salvage lot includes potentially dangerous components (Lithium-ion cells, CRT glass, high-voltage capacitors, or mercury CCFL lamps), ReCircuit triggers a mandatory safety warning with clear, illustrated *Do's and Don'ts* and directions to the nearest certified drop-off point.
* **On-Chain Cryptographic Proofs (Solana Devnet):**
  Every completed component handover and certified hazardous disposal generates a cryptographic SHA-256 receipt that is permanently anchored on Solana using the native Memo Program. This creates a tamper-proof audit trail of verified circular reuse.

### 3. Technical Moat
1. **Zero-Barrier Web3 Onboarding:** ReCircuit features both Phantom Wallet support and an instantaneous, 1-click in-browser Devnet demo wallet, allowing non-crypto users and hackathon judges to verify on-chain anchors in under 2 seconds without gas anxiety.
2. **Hyper-Efficient Solana Footprint:** By leveraging high-throughput, sub-penny transactions on Solana, ReCircuit can anchor millions of micro-receipts for less than $0.001 each, which is economically impossible on Ethereum or legacy databases.
3. **Hardware & Regulatory Native:** Built with direct compliance mapping for environmental legislation and structured to integrate low-cost RP2040 microcontrollers for automated battery health testing.

---

## ⏱️ Section 3: 60-Second Judge Test Walkthrough

Follow these simple steps to verify the live application:

1. **Open the Application:** Navigate to the live demo or run `http://localhost:8080`.
2. **Experience the Discovery Deck:** In the **Discover** view, drag cards left (Pass) or right (Match), or use the keyboard arrow keys ($\leftarrow$ / $\rightarrow$). Notice the real-time distance, category tags, and hazard alerts.
3. **Trigger a Match:** Swipe right on the **DDR3 SO-DIMM RAM** or **GeForce GTX 750 Ti**. The *"It's a Match!"* modal pops up with distance and safety warnings. Click **View Match**.
4. **Connect Wallet:** Click **Connect Wallet** in the top bar and select **Demo Wallet (Devnet)**. You will see your temporary Solana Devnet public key displayed with live balance detection.
5. **Seal on Solana:** In the **Matches** tab, click **Seal Exchange ⛓**. ReCircuit calculates the transaction payload and writes the cryptographic memo directly to Solana Devnet. Click **Open in Explorer** to inspect the live blockhash!
6. **Generate Safe Disposal Receipt:** Go to **Safe Disposal**, pick **Lithium-ion batteries**, review the handling rules, complete the 3 safety checklist items, and generate your certified disposal receipt. Click **Anchor on Solana** to mint the disposal certificate!
7. **Inspect Verified Impact:** Open the **Impact** tab to observe the aggregate tally of saved components, kilograms kept in circulation, avoided toxic waste, and confirmed Solana transactions.

---

## 💼 Section 4: Business Model & Day-2 Sustainability

**How does ReCircuit survive and scale after the hackathon?**

1. **B2B / Reverse Logistics Compliance Offsets (The Enterprise Engine):**
   Under electronics environmental regulations, large tech manufacturers (Dell, Lenovo, Positivo, HP) are legally required to prove they recycle a minimum percentage of the electronics they sell or face multi-million dollar fines. ReCircuit sells **Verified E-Waste Diversion Credits** backed by on-chain proofs, allowing companies to meet statutory quotas by subsidizing local collectors.
2. **Solana Pay Micro-Tipping:**
   Makers who receive valuable salvaged components can tip collectors directly with USDC/SOL via Solana Pay with zero intermediary banking cuts.
3. **Refurbished Hardware Marketplace:**
   A 3% protocol fee on premium, tested components (GPUs, enterprise servers, testing equipment) traded between repair technicians and home labs.

---

## 👥 Section 5: Team & Credentials

* **Lucas Alves Pereira** (Recife, Brazil)
  * Law Graduate, Faculdade de Direito do Recife (FDR / UFPE)
  * Background in Environmental Law, Geospatial Analysis (LABOGEO/UFPE), Autonomous AI Agents & Full-Stack Web Development.
  * Research in Inter-American Human Rights System (SIDH) and public policy.
